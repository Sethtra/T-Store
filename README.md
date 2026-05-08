# T-Store

Modern full-stack e-commerce platform built with React, TypeScript, Vite, Laravel, Sanctum, Stripe, ABA PayWay, and Supabase.

Repository: https://github.com/Sethtra/T-Store<br>
Live site: https://t-store.site<br>
API: https://api.t-store.site

## Overview

T-Store provides a customer storefront, cloud-synced cart, checkout, order tracking, and a full admin dashboard for managing products, categories, orders, inventory, users, reports, landing sections, site branding, and homepage messaging.

The frontend is a React SPA hosted separately from the Laravel API. The backend exposes JSON API endpoints, handles authentication with Laravel Sanctum, stores uploaded assets through Supabase/local storage configuration, and processes payments through Stripe and ABA PayWay.

## Demo Accounts

| Role | Email | Password | Access |
| --- | --- | --- | --- |
| Admin | `admin@tstore.com` | `password` | Admin dashboard and storefront |
| Customer | `john@example.com` | `password` | Storefront, cart, checkout, orders |

## Main Features

### Storefront

- Product listing with search, category filtering, price filtering, sorting, and pagination.
- Product detail pages with multi-image galleries, variants, related products, and lightbox view.
- Cloud-synced cart for authenticated users.
- Checkout with Stripe card payments and ABA PayWay KHQR flow.
- Customer order history, invoice view, payment retry, and order status tracking.
- English and Khmer localization with theme support.
- Mobile-focused navigation and responsive storefront pages.

### Admin

- Dashboard with revenue, order, visitor, and product metrics.
- Product CRUD with multiple images, category assignment, stock, attributes, and localization fields.
- Category and category-display management.
- Landing section management for hero/product showcase and curated homepage sections.
- Site settings for logo, favicon, site name, and hero messaging.
- Order management with status updates.
- Inventory ledger with stock adjustments and movement history.
- User management with role and account-status controls.
- CSV exports for orders, products, and users.

### Security And Account Behavior

- Laravel Sanctum bearer-token authentication.
- Admin API routes protected by role middleware.
- Suspended users are blocked from login and protected API access.
- Suspending a user revokes existing access tokens.
- Customer order endpoints are scoped to the authenticated user.
- Stripe webhooks verify Stripe signatures.
- ABA PayWay callbacks verify HMAC signatures.

## Tech Stack

### Frontend

| Technology | Purpose |
| --- | --- |
| React 19 | SPA UI framework |
| TypeScript 5 | Static typing |
| Vite / rolldown-vite | Build and dev server |
| React Router 7 | Client-side routing |
| TanStack Query 5 | Server-state cache and API synchronization |
| Zustand 5 | Auth, cart, and theme state |
| Tailwind CSS 4 | Styling |
| Framer Motion | UI animation |
| i18next | Localization |
| Recharts | Admin charts |
| Stripe React SDK | Stripe checkout UI |

### Backend

| Technology | Purpose |
| --- | --- |
| PHP 8.2+ | Runtime |
| Laravel 12 | API framework |
| Laravel Sanctum | Token authentication |
| Laravel Socialite | Google OAuth |
| Eloquent ORM | Database access |
| Stripe PHP SDK | Stripe payments |
| PHPUnit | Backend tests |
| Laravel Pint | Backend formatting |

### Infrastructure

| Service | Purpose |
| --- | --- |
| Vercel | Frontend hosting |
| AWS EC2 / Nginx | Backend hosting |
| Supabase PostgreSQL | Production database |
| Supabase Storage | Product and branding assets |

## Project Structure

```text
T-Store/
  backend/              Laravel API
    app/
    config/
    database/
    routes/
    tests/
  frontend/             React SPA
    public/
    src/
      components/
      hooks/
      pages/
      stores/
      types/
```

## Local Development

### Prerequisites

- Node.js 18+
- PHP 8.2+
- Composer 2+
- PostgreSQL or a Supabase database

### Backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

The backend runs at:

```text
http://localhost:8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend dev server runs at:

```text
http://localhost:3000
```

On Windows PowerShell, if `npm` is blocked by execution policy, use:

```powershell
npm.cmd run dev
npm.cmd run build
npm.cmd run lint
```

## Environment Variables

The backend requires a configured `backend/.env`.

Important variables:

| Variable | Purpose |
| --- | --- |
| `APP_ENV` | Application environment |
| `APP_DEBUG` | Debug mode |
| `APP_URL` | Backend base URL |
| `FRONTEND_URL` | Frontend origin for redirects and CORS |
| `DB_*` | Database connection |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret |
| `STRIPE_KEY` | Stripe publishable key |
| `STRIPE_SECRET` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `PAYWAY_MERCHANT_ID` | ABA PayWay merchant ID |
| `PAYWAY_API_KEY` | ABA PayWay API key |
| `PAYWAY_BASE_URL` | ABA PayWay sandbox or live URL |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_KEY` | Supabase service key |
| `SUPABASE_STORAGE_BUCKET` | Storage bucket name |

The frontend commonly uses:

| Variable | Purpose |
| --- | --- |
| `VITE_API_URL` | API base URL, for example `http://localhost:8000/api` |
| `VITE_STRIPE_PUBLIC_KEY` | Stripe publishable key |

Do not commit real `.env` files.

## Useful Commands

### Frontend

```bash
cd frontend
npm run dev
npm run build
npm run lint
npm run preview
```

### Backend

```bash
cd backend
php artisan serve
php artisan test
vendor/bin/pint --test
```

## API Summary

### Public

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/products` | Paginated product listing |
| `GET` | `/api/products/featured` | Featured products |
| `GET` | `/api/products/{slug}` | Product detail and related products |
| `GET` | `/api/categories` | Category tree |
| `GET` | `/api/app-bootstrap` | Shared app bootstrap data |
| `GET` | `/api/landing-data` | Homepage content data |
| `GET` | `/api/site-settings` | Public logo, favicon, site name, and hero text |
| `POST` | `/api/register` | Register customer |
| `POST` | `/api/login` | Login |
| `GET` | `/api/auth/google` | Start Google OAuth |
| `GET` | `/api/auth/google/callback` | Google OAuth callback |
| `POST` | `/api/webhooks/stripe` | Stripe webhook |
| `POST` | `/api/payment/payway/callback` | ABA PayWay callback |

### Authenticated Customer

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/user` | Current user |
| `POST` | `/api/logout` | Logout and revoke current token |
| `GET` | `/api/cart` | Get cloud cart |
| `POST` | `/api/cart/sync` | Sync guest cart |
| `POST` | `/api/cart/items` | Add cart item |
| `PUT` | `/api/cart/items/{id}` | Update cart item quantity |
| `DELETE` | `/api/cart/items/{id}` | Remove cart item |
| `DELETE` | `/api/cart` | Clear cart |
| `GET` | `/api/orders` | Current user's orders |
| `GET` | `/api/orders/{id}` | Current user's single order |
| `POST` | `/api/orders` | Create order |
| `POST` | `/api/orders/{id}/retry-payment` | Retry payment |
| `POST` | `/api/payment/stripe/create-intent` | Create Stripe PaymentIntent |
| `POST` | `/api/payment/payway/create` | Create ABA PayWay transaction |
| `GET` | `/api/payment/payway/status` | Check ABA PayWay status |

### Admin

Admin routes require a valid token and admin role.

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/admin/dashboard` | Dashboard summary |
| `GET` | `/api/admin/dashboard-data` | Dashboard data |
| `GET` | `/api/admin/products` | Product list |
| `POST` | `/api/admin/products` | Create product |
| `PUT` | `/api/admin/products/{id}` | Update product |
| `POST` | `/api/admin/products/{id}` | Update product with multipart form data |
| `DELETE` | `/api/admin/products/{id}` | Delete product |
| `GET` | `/api/admin/categories` | Category list |
| `POST` | `/api/admin/categories` | Create category |
| `PUT` | `/api/admin/categories/{category}` | Update category |
| `DELETE` | `/api/admin/categories/{category}` | Delete category |
| `GET` | `/api/admin/orders` | Admin order list |
| `GET` | `/api/admin/orders/{id}` | Admin order detail |
| `PATCH` | `/api/admin/orders/{id}/status` | Update order status |
| `GET` | `/api/admin/users` | User list |
| `GET` | `/api/admin/users/{id}` | User detail |
| `PUT` | `/api/admin/users/{id}` | Update user role or status |
| `GET` | `/api/admin/inventory` | Inventory list |
| `POST` | `/api/admin/inventory/adjust` | Adjust stock |
| `POST` | `/api/admin/inventory/bulk-adjust` | Bulk adjust stock |
| `GET` | `/api/admin/reports/summary` | Sales summary |
| `GET` | `/api/admin/reports/revenue` | Revenue chart |
| `GET` | `/api/admin/reports/top-products` | Top products |
| `GET` | `/api/admin/export/orders` | Export orders CSV |
| `GET` | `/api/admin/export/products` | Export products CSV |
| `GET` | `/api/admin/export/users` | Export users CSV |
| `PUT` | `/api/admin/site-settings/name` | Update site name |
| `PUT` | `/api/admin/site-settings/hero` | Update hero text |
| `POST` | `/api/admin/site-settings/logo` | Upload logo |
| `DELETE` | `/api/admin/site-settings/logo` | Delete logo |
| `POST` | `/api/admin/site-settings/favicon` | Upload favicon |
| `DELETE` | `/api/admin/site-settings/favicon` | Delete favicon |

## Development Notes

- The storefront uses user-scoped query keys for customer orders to avoid leaking cached order data between accounts in the same browser.
- Admin user suspension is enforced by backend login checks, protected-route middleware, and token revocation.
- Hero text is stored in site settings so it syncs across devices.
- `frontend/dist` is generated output and should be rebuilt after frontend source changes.
- The production API may cold start if hosted on low-cost infrastructure.

## License

MIT License. Copyright 2026 T-Store.
