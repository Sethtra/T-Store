# 🛒 T-Store — Modern E-Commerce Platform

<div align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Laravel-12-FF2D20?style=for-the-badge&logo=laravel&logoColor=white" alt="Laravel" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  <br />
  <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square" alt="License" />
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square" alt="PRs Welcome" />
</div>

<br />

T-Store is a **full-stack e-commerce platform** built for a premium shopping experience. It features a sleek, dark-themed storefront with real-time product filtering, a cloud-synced shopping cart, multi-gateway payments (Stripe & ABA PayWay KHQR), and a full admin dashboard for managing products, orders, inventory, and analytics.

🔗 **Live Demo:** [https://t-store.site](https://t-store.site)  
🔗 **API Endpoint:** [https://api.t-store.site](https://api.t-store.site)

---

## 🧪 Demo Accounts

You can use these accounts to explore the platform without signing up:

| Role | Email | Password | Access |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@tstore.com` | `password` | Full admin dashboard + storefront |
| **Customer** | `john@example.com` | `password` | Storefront, cart, orders |

> **💡 Tip:** You can also sign up with your own email or use **Google Sign-In** for a quick start.

---

## 📖 How to Use the Website

### 🛍️ Shopping (Customer)

1. **Browse Products** — Visit the homepage to see featured products, or go to `/products` to browse by category, price range, or search by name.
2. **Product Details** — Click any product to see full images, description, and available variants (Size, Color, etc.).
3. **Add to Cart** — Select your preferred variant and click "Add to Cart". The cart drawer will slide open from the right.
4. **Review Cart** — Click the Cart icon (bottom nav on mobile, top nav on desktop) to review items. Each item shows its selected attributes (e.g., Size: L, Color: Black).
5. **Checkout** — Click "Proceed to Checkout", fill in your shipping details, and choose a payment method:
   - **Stripe** — Pay with Credit/Debit Card (test mode, use card `4242 4242 4242 4242`).
   - **ABA PayWay** — Generates a KHQR code that expires in 5 minutes.
6. **Track Orders** — After payment, visit `/orders` to track your order status (Pending → Processing → Shipped).

### 🎛️ Admin Dashboard

1. **Login** with the admin account above.
2. Navigate to `/admin` or click "Admin Dashboard" in the menu.
3. From here you can:
   - 📊 **Dashboard** — View revenue, total orders, visitors, and top-selling products.
   - 📦 **Products** — Create, edit, delete products with multi-image uploads and category assignment.
   - 🗂️ **Categories** — Manage parent/child category trees.
   - 📋 **Orders** — View all orders, update statuses (Processing, Shipped), and see payment details.
   - 📈 **Inventory** — Track stock movements for every product with full audit logs.
   - 🏷️ **Landing Sections** — Configure the hero banners and featured sections on the homepage.
   - 👥 **Users** — Manage customer accounts and roles.
   - 📤 **Reports** — Export Orders, Products, or Users as CSV files.

---

## ⚠️ Known Quirks & Notes

| Issue | Explanation |
| :--- | :--- |
| **Featured products sometimes don't load on first visit** | The backend runs on a free-tier cloud instance that may cold-start. Refresh the page once and it will load. |
| **Login occasionally requires two attempts** | The first login request wakes up the API server from its idle state. The second attempt succeeds instantly. This only happens if the server has been idle for a while. |
| **Payment is in test/sandbox mode** | Stripe uses test keys — no real money is charged. ABA PayWay uses the sandbox environment. |

---

## ✨ Key Features

### Storefront
- 🔍 **Smart Search & Filtering** — Filter by category, price range, and sort order with instant results.
- 🛒 **Cloud-Synced Cart** — Cart persists across sessions and syncs between devices when logged in. Supports product variants (Size, Color).
- 💳 **Dual Payment Gateways** — Stripe (Credit/Debit Card) and ABA PayWay (KHQR) with a branded 5-minute expiry timer.
- 📱 **Mobile-First Design** — Dedicated bottom navigation bar, swipe-friendly layouts, and responsive breakpoints.
- 🌙 **Dark/Light Theme** — Toggle between dark and light modes.
- 🔔 **Order Notifications** — Real-time notification bell for order status updates.
- 🔐 **Secure Auth** — Email/password login, Google OAuth, and "Remember Me" support.

### Admin Dashboard
- 📊 **Analytics Dashboard** — Revenue charts, sales velocity, top SKUs, and visitor counts.
- 📦 **Full Product CRUD** — Multi-image gallery, drag-and-drop ordering, automatic orphaned image cleanup.
- 📋 **Order Management** — Status workflow (Pending → Processing → Shipped) with inventory auto-adjustment.
- 📈 **Inventory Ledger** — Full audit trail of every stock movement (sales, adjustments, restocks).
- 📤 **CSV Export** — One-click export for Orders, Products, and Users.

### Security
- 🛡️ **Token-Based Auth** — Laravel Sanctum with automatic session expiry.
- 🔒 **Admin Route Protection** — All admin endpoints are middleware-protected; non-admins cannot access.
- ✅ **Payment Verification** — Stripe webhooks with signature validation, PayWay callbacks with HMAC-SHA512.
- 🚫 **Error Hardening** — No internal server details leak to the client in production.

---

## 🏗️ Tech Stack

### Frontend
| Technology | Purpose |
| :--- | :--- |
| **React 19** + TypeScript 5 | Core SPA framework |
| **Vite** | Build tool & dev server |
| **TanStack Query v5** | Server-state management & caching |
| **Zustand** | Client-side store (auth, cart, theme) |
| **Tailwind CSS v4** | Utility-first styling |
| **Framer Motion** | Page transitions & micro-animations |
| **React Router v6** | Client-side routing |

### Backend
| Technology | Purpose |
| :--- | :--- |
| **Laravel 12** (PHP 8.2+) | RESTful API framework |
| **Laravel Sanctum** | Stateless token authentication |
| **Eloquent ORM** | Database queries & relationships |
| **Stripe PHP SDK** | Credit/debit card processing |
| **ABA PayWay API** | KHQR mobile payments |
| **Laravel Socialite** | Google OAuth integration |

### Infrastructure
| Service | Purpose |
| :--- | :--- |
| **AWS EC2** (Ubuntu + Nginx) | Backend hosting |
| **Vercel** | Frontend hosting & CDN |
| **Supabase PostgreSQL** | Primary database (Singapore region) |
| **Supabase Storage** | Product image hosting |

---

## 🚀 Architecture

```
┌──────────────┐     HTTPS/JSON    ┌──────────────┐     SQL (6543)  ┌──────────────┐
│   Frontend   │ ────────────────► │   Backend    │ ──────────────► │   Supabase   │
│   (Vercel)   │                   │  (AWS EC2)   │                 │  PostgreSQL  │
│  React SPA   │ ◄──────────────── │  Laravel API │ ──────────────► │   Storage    │
└──────────────┘     JSON Response └──────────────┘   Image Upload  └──────────────┘
```

---

## 🔧 Local Development Setup

### Prerequisites
- **Node.js** `v18.0+`
- **PHP** `v8.2+`
- **Composer** `v2.x`
- **PostgreSQL** (or a Supabase project)

### 1️⃣ Backend

```bash
cd backend
composer install
cp .env.example .env    # Then fill in your DB, Stripe, PayWay, and Supabase credentials
php artisan key:generate
php artisan migrate
php artisan serve        # Starts at http://localhost:8000
```

### 2️⃣ Frontend

```bash
cd frontend
npm install
cp .env.example .env    # Set VITE_API_URL=http://localhost:8000/api
npm run dev             # Starts at http://localhost:5173
```

### Environment Variables Required

The following environment variables must be configured in `backend/.env`:

| Variable | Description |
| :--- | :--- |
| `APP_ENV` | `local` for dev, `production` for live |
| `APP_DEBUG` | `true` for dev (shows errors), `false` for production |
| `DB_*` | PostgreSQL connection details |
| `FRONTEND_URL` | Your frontend URL (for CORS) |
| `GOOGLE_CLIENT_ID` / `SECRET` | Google OAuth credentials |
| `STRIPE_KEY` / `SECRET` | Stripe publishable & secret keys |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `PAYWAY_MERCHANT_ID` / `API_KEY` | ABA PayWay credentials |
| `PAYWAY_BASE_URL` | `https://checkout-sandbox.payway.com.kh` (sandbox) or `https://checkout.payway.com.kh` (live) |
| `SUPABASE_URL` / `KEY` | Supabase project URL & service key |

> **⚠️ Never commit your `.env` file.** It is already in `.gitignore`.

---

## 📡 API Endpoints

### Public
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/products` | Paginated product list with filters |
| `GET` | `/api/products/{slug}` | Single product details |
| `GET` | `/api/products/featured` | Featured products for homepage |
| `GET` | `/api/categories` | Category tree |
| `GET` | `/api/category-displays` | Homepage category display sections |
| `GET` | `/api/landing-sections` | Hero banner configuration |
| `POST` | `/api/login` | User login |
| `POST` | `/api/register` | User registration |

### Authenticated (Requires Bearer Token)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/user` | Current user profile |
| `POST` | `/api/orders` | Create a new order |
| `GET` | `/api/orders` | List user's orders |
| `POST` | `/api/payment/stripe/create-intent` | Create Stripe PaymentIntent |
| `POST` | `/api/payment/payway/create-transaction` | Create PayWay KHQR transaction |
| `GET` | `/api/cart` | Get user's cloud cart |
| `POST` | `/api/cart/sync` | Sync guest cart to user cart |

### Admin Only (Requires Admin Role)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/admin/dashboard` | Analytics data |
| `POST` | `/api/admin/products` | Create product |
| `POST` | `/api/admin/products/{id}` | Update product (`_method=PUT`) |
| `DELETE` | `/api/admin/products/{id}` | Delete product |
| `PUT` | `/api/admin/orders/{id}/status` | Update order status |
| `GET` | `/api/admin/inventory` | Inventory & stock movements |

---

## 📄 License

Released under the **MIT License**.

Copyright © 2026 T-Store
