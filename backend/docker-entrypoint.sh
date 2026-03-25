#!/bin/bash
set -e

# Use Render's PORT variable (default: 80)
PORT=${PORT:-80}
sed -i "s/Listen 80/Listen $PORT/" /etc/apache2/ports.conf
sed -i "s/:80/:$PORT/" /etc/apache2/sites-available/*.conf

# Copy secret file if it exists (Render Secret Files)
if [ -f /etc/secrets/.env ]; then
    cat /etc/secrets/.env > /var/www/html/.env
elif [ -f /etc/secrets/env ]; then
    cat /etc/secrets/env > /var/www/html/.env
fi

# Generate APP_KEY if not set
if [ -z "$APP_KEY" ] && [ ! -f .env ]; then
    php artisan key:generate --force
fi

# Create storage symlink
php artisan storage:link --force 2>/dev/null || true

# Run migrations (Important!)
php artisan migrate --force

# Permissions (Fix 500 error caused by root-owned storage/cache)
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Optimize Laravel for production (Optional but recommended)
# We clear old cache first
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Start Apache
exec apache2-foreground
