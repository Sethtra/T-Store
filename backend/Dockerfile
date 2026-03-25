FROM php:8.4-apache

# 1. Install Linux tools and PostgreSQL drivers for Supabase
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libpq-dev \
    libzip-dev \
    && rm -rf /var/lib/apt/lists/*

# 2. Enable Apache mod_rewrite so Laravel routes work
RUN a2enmod rewrite

# 3. Install PHP extensions
RUN docker-php-ext-install pdo pdo_pgsql zip

# 4. Point the web server to Laravel's public folder
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# 5. Enable AllowOverride so .htaccess works for Laravel routing
RUN sed -ri -e 's/AllowOverride None/AllowOverride All/g' /etc/apache2/apache2.conf

# 6. Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# 7. Set the working directory
WORKDIR /var/www/html

# 8. Copy your backend code into the container
COPY . .

# 9. Install Laravel dependencies securely
ENV COMPOSER_ALLOW_SUPERUSER=1
RUN composer install --no-dev --optimize-autoloader

# 10. Give Laravel permission to write to storage
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# 11. Copy and enable the startup script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# 12. Start the server
EXPOSE 80
CMD ["docker-entrypoint.sh"]