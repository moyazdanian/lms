# Upgrading LMS

This guide is for an existing Docker installation. Every release is shipped as a
complete package; there is no in-app auto-updater and no license server.

> **Always take a backup first.** The update replaces application code; your
> database, `.env` and uploaded files must survive.

## 1. Check the release notes

Read `CHANGELOG.md` in the new package. It lists:

- the new version and date,
- changed behaviour,
- files or settings that need attention,
- any manual migration step.

If a release contains a migration, it runs automatically on boot (see step 5).
For a large data migration, the release notes may ask you to run a command
manually.

## 2. Back up

Run these from the directory that contains your current `docker-compose.yml`:

```bash
# Database
docker compose exec -T mysql sh -c \
  'exec mysqldump -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE"' \
  > backup-$(date +%F-%H%M).sql

# Environment file and compose file
cp .env .env.backup
cp docker-compose.yml docker-compose.yml.backup
```

If `FILESYSTEM_DISK=local`, archive the named storage volume:

```bash
docker run --rm -v lms-storage:/data -v "$PWD":/backup alpine \
  tar czf /backup/storage-backup.tgz -C /data .
```

With S3-compatible storage, videos and attachments are already outside the
server; skip the storage archive.

## 3. Unpack the new version

Download the new package from the marketplace account that purchased it and
unpack it into a new directory (do not unpack over the running installation):

```bash
unzip lms-1.0.1.zip
cd lms-1.0.1
```

## 4. Bring your settings across

Copy the existing environment file into the new directory:

```bash
cp /path/to/old/.env .env
```

If you use local storage, restore the archive into the same named volume
(before starting the new stack):

```bash
docker run --rm -v lms-storage:/data -v /path/to/old:/backup alpine \
  tar xzf /backup/storage-backup.tgz -C /data
```

If you customised files, compare them with the new package before starting.
The changelog lists the files that changed; keep your customisations and merge
them deliberately rather than overwriting the whole directory.

## 5. Stop the old stack and start the new one

Named Docker volumes (database, storage) are preserved by `down`:

```bash
cd /path/to/old
docker compose down

cd /path/to/new
docker compose up -d --build
```

The API entrypoint waits for MySQL, runs `php artisan migrate --force`, rebuilds
the config cache and starts the queue worker. Watch the first boot:

```bash
docker compose logs -f api
```

## 6. Verify

- `https://your-domain.com/up` returns a healthy response.
- The storefront home page loads and course pages render.
- Admin sign-in works at `https://api.your-domain.com/admin`.
- One lesson video plays and one attachment downloads.
- A test checkout reaches the payment gateway (use test keys first).
- The queue worker is running: `docker compose ps`.

If something is wrong, do not keep retrying migrations on the same database.
Restore the backup and the previous directory first, then report the error with
the `api` logs.

## 7. Roll back

```bash
cd /path/to/new
docker compose down

cd /path/to/old
docker compose up -d
```

If the failed release already ran a migration that changed data, restore the
database backup before the old API starts serving traffic:

```bash
cd /path/to/old
docker compose down
docker compose up -d mysql
docker compose exec -T mysql sh -c \
  'exec mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE"' \
  < backup-YYYY-MM-DD-HHMM.sql
docker compose up -d
```

Then confirm the site is healthy.

## Notes

- `.env` is never overwritten by an update. Keep `APP_KEY`, database credentials,
  mail settings, payment keys and storage settings.
- Never copy an old `storage/app/.app-key` over a database that was created with
  a different key.
- The Docker project name is `lms`; keep it unchanged so the existing named
  volumes are reused. If you run a second installation on the same host, give it
  a different project name and separate volumes.
- For customised installations, a full package is still the source of truth.
  The changelog identifies what changed; there is no automatic file patcher.
