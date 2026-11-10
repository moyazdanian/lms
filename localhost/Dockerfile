# Laravel API + Filament admin panel.
#
# One container runs nginx (port 80) and php-fpm; supervisord keeps both alive.
# No Node build step is needed here: the Vite bundle is not used by any Blade
# view and the Filament assets are committed under public/.
FROM php:8.4-fpm-alpine

# Runtime libraries stay installed: the -dev packages below are removed after
# compiling, and apk would otherwise take libicu/libpng/libzip with them,
# leaving the extensions unable to load.
RUN apk add --no-cache \
        nginx \
        supervisor \
        openssl \
        freetype \
        icu-libs \
        libjpeg-turbo \
        libpng \
        libzip \
    && apk add --no-cache --virtual .build-deps \
        autoconf \
        automake \
        g++ \
        gcc \
        libtool \
        make \
        pkgconfig \
        freetype-dev \
        icu-dev \
        libjpeg-turbo-dev \
        libpng-dev \
        libzip-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j"$(nproc)" \
        bcmath \
        exif \
        gd \
        intl \
        opcache \
        pdo_mysql \
        zip \
    && apk del .build-deps \
    && rm -rf /tmp/* /var/cache/apk/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Dependencies first so source edits do not invalidate this layer.
COPY composer.json composer.lock ./
RUN composer install \
        --no-dev \
        --no-interaction \
        --no-scripts \
        --prefer-dist \
        --optimize-autoloader

COPY . .

# Entrypoints checked out on Windows arrive with CRLF; strip it or the
# shebang fails with a confusing "not found" on Linux. Alpine's supervisor
# package does not create /etc/supervisor.d, the include directory that
# /etc/supervisord.conf points at, so it is made before the config is copied.
RUN composer dump-autoload --no-dev --optimize --classmap-authoritative \
    && sed -i 's/\r$//' docker/entrypoint.sh \
    && chmod +x docker/entrypoint.sh \
    && cp docker/nginx.conf /etc/nginx/http.d/default.conf \
    && cp docker/php.ini /usr/local/etc/php/conf.d/zz-lms.ini \
    && mkdir -p /etc/supervisor.d \
    && cp docker/supervisord.conf /etc/supervisor.d/lms.ini \
    && rm -f .env \
    && php artisan package:discover --ansi

EXPOSE 80

ENTRYPOINT ["/var/www/html/docker/entrypoint.sh"]
