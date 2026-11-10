#!/bin/sh
# Boot preparation for the Docker image: keys, storage, database migrations.
# Everything it writes lives on the mounted storage volume, so a restart (or a
# re-created container) keeps uploads, videos and the generated APP_KEY.
set -e

cd /var/www/html

KEY_FILE="storage/app/.app-key"
INSTALL_MARKER="storage/app/.installed"

mkdir -p \
    storage/app/private \
    storage/app/public \
    storage/framework/cache/data \
    storage/framework/sessions \
    storage/framework/views \
    storage/logs \
    bootstrap/cache

# APP_KEY: reuse the one generated on the first boot unless it is provided.
if [ -z "${APP_KEY:-}" ]; then
    if [ -f "$KEY_FILE" ]; then
        APP_KEY="$(cat "$KEY_FILE")"
    else
        APP_KEY="base64:$(openssl rand -base64 32)"
        printf '%s' "$APP_KEY" > "$KEY_FILE"
        echo "Generated APP_KEY for this installation."
    fi
    export APP_KEY
fi

# public/storage -> storage/app/public (thumbnails, logos, certificates).
if [ ! -e public/storage ] && [ ! -L public/storage ]; then
    ln -s ../storage/app/public public/storage
fi

# The database container may still be starting (or restarting) while this one
# boots. Wait for it instead of letting `artisan migrate` fail and abort the
# container, which would leave the site down until the next manual restart.
wait_for_database() {
    attempts=0
    while [ "$attempts" -lt 60 ]; do
        if php -r '
            $host = getenv("DB_HOST") ?: "127.0.0.1";
            $port = getenv("DB_PORT") ?: "3306";
            $db   = getenv("DB_DATABASE") ?: "lms";
            try {
                new PDO(
                    "mysql:host=$host;port=$port;dbname=$db;charset=utf8mb4",
                    getenv("DB_USERNAME") ?: "root",
                    getenv("DB_PASSWORD") ?: "",
                    [PDO::ATTR_TIMEOUT => 3]
                );
            } catch (Throwable $e) {
                exit(1);
            }
        ' 2>/dev/null; then
            return 0
        fi
        attempts=$((attempts + 1))
        sleep 2
    done

    echo "Database at ${DB_HOST}:${DB_PORT} did not become available in time." >&2
    exit 1
}

echo "Waiting for the database..."
wait_for_database

# Migrations on every boot: a new image may carry new migrations, and existing
# installations must get them too. The command is idempotent, so this is a
# no-op when there is nothing to apply.
echo "Running migrations..."
php artisan migrate --force

# Seeding happens once: it creates the administrator and the default site
# content, and would overwrite the owner's edits if it ran on every boot.
if [ ! -f "$INSTALL_MARKER" ]; then
    # No wizard, no generated password: the first administrator is exactly the
    # account the owner wrote into .env. Stop here rather than seeding a panel
    # nobody can sign in to.
    if [ -z "${ADMIN_EMAIL:-}" ] || [ -z "${ADMIN_PASSWORD:-}" ]; then
        echo "" >&2
        echo "ERROR: ADMIN_EMAIL and ADMIN_PASSWORD are required for the first boot." >&2
        echo "" >&2
        echo "  cp .env.docker.example .env" >&2
        echo "  # then set both values in .env and start the stack again" >&2
        echo "" >&2
        echo "'.env.docker.example' is only a template: docker compose reads '.env'" >&2
        echo "and nothing else, so the values in the template are not used until" >&2
        echo "you copy it." >&2
        exit 1
    fi

    echo "First boot: seeding the database..."
    php artisan db:seed --force
    echo "Administrator account for /admin: ${ADMIN_EMAIL}"

    touch "$INSTALL_MARKER"
fi

php artisan config:cache >/dev/null

# Migrations run here as root, so ownership is fixed afterwards: php-fpm
# (www-data) must be able to write the log/cache/session folders.
chown -R www-data:www-data storage bootstrap/cache
find storage -type d -exec chmod 755 {} +
find storage -type f -exec chmod 644 {} +

exec supervisord -c /etc/supervisord.conf
