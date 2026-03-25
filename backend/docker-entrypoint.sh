#!/bin/bash
set -e

# Use Render's PORT variable (default: 80)
PORT=${PORT:-80}
sed -i "s/Listen 80/Listen $PORT/" /etc/apache2/ports.conf
sed -i "s/:80/:$PORT/" /etc/apache2/sites-available/*.conf

# Copy secret file .env if it exists (Render Secret Files)
if [ -f /etc/secrets/.env ]; then
    cp /etc/secrets/.env /var/www/html/.env
fi

# Generate APP_KEY if not set
if [ -z "$APP_KEY" ]; then
    php artisan key:generate --force
fi

# Create storage symlink
php artisan storage:link --force 2>/dev/null || true

# Optimize Laravel for production
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Start Apache
exec apache2-foreground
