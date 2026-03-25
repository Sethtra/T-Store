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

# 5. Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# 6. Set the working directory
WORKDIR /var/www/html

# 7. Copy your backend code into the container
COPY . .

# 8. Install Laravel dependencies securely
ENV COMPOSER_ALLOW_SUPERUSER=1
RUN composer install --no-dev --optimize-autoloader

# 9. Give Laravel permission to write to storage
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# 10. Start the server
EXPOSE 80
CMD ["apache2-foreground"]