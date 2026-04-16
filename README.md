# 🛒 T-Store - Modern E-Commerce Platform

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

T-Store is an enterprise-grade, full-stack e-commerce solution architected for high performance, premium user experience, and robust store management. Built with a **Laravel 12 API** backend and a **React 19 SPA** frontend, powered by **Supabase** for persistent storage.

🔗 **Live Demo:** [t-store.site](https://t-store.site)

---

## ✨ Key Features & Recent Updates

### 🛍️ Premium Client Storefront
- **Advanced Product Discovery:** Real-time filtering, recursive category tree, and full-text search.
- **Product Variant Support:** Full support for product attributes (e.g., **Size, Color**) with distinct badges in Cart and Checkout.
- **Cloud-Synced Cart:** Persistent cart state synced between local storage and backend database using **Zustand**. Cart items are preserved even across different devices once logged in.
- **Modern Checkout Experience:**
  - **KHQR / ABA PayWay Integration:** Custom-styled, branded KHQR payment container with a **5-minute live expiration timer**.
  - **Stripe Integration:** Secure credit/debit card processing.
  - **Frictionless Flow:** Cart is only cleared upon *successful* payment confirmation, preventing item loss on abandoned transactions.
- **Mobile-First UX:** Ultra-responsive design with a dedicated **Mobile Bottom Navigation** and smooth Framer Motion transitions.

### 🎛️ Administrative Back-Office
- **Real-Time Analytics:** Interactive dashboard for revenue, sales velocity, and inventory health.
- **Intelligent Inventory:** Automated stock ledger (`stock_movements`) tracking every purchase and manual adjustment.
- **Orphaned Image Cleanup:** Automatically deletes images from Supabase Storage when products are removed or updated.
- **Secure Simulation:** Dedicated sandbox environment for testing PayWay transactions without real currency.

### 🛡️ Security & Performance
- **Database Connection Pooling:** Optimized for high concurrency using port `6543`.
- **Stateless Auth:** Laravel Sanctum token-based authentication with Google OAuth integration.
- **Hardened API:** 
  - Ownership verification on all order/payment actions.
  - Webhook signature validation.
  - Intelligent error handling to prevent server internal leakage in production.

---

## 🏗️ Technical Stack

### Frontend
- **React 19 + TypeScript 5**
- **Vite** (Build Tool)
- **TanStack Query v5** (Server State)
- **Zustand** (Store Management)
- **Tailwind CSS v4** (Modern Styling)
- **Framer Motion** (Animations)

### Backend
- **Laravel 12** (PHP 8.2+)
- **Laravel Sanctum** (Auth)
- **Stripe & ABA PayWay SDKs**
- **Spatie Laravel MediaLibrary** (Optional)

### Cloud Infrastructure
- **Supabase PostgreSQL** (Primary DB - Singapore)
- **Supabase Storage** (Media Hosting)
- **Nginx** (Web Server on EC2)

---

## 🚀 Installation & Setup

### 1️⃣ Backend Setup (`/backend`)
```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

### 2️⃣ Frontend Setup (`/frontend`)
```bash
npm install
npm run dev
```

---

## 🔑 Key Environment Variables

| Variable | Mode | Purpose |
| :--- | :--- | :--- |
| `APP_DEBUG` | `true/false` | Toggles detailed errors & payment simulation |
| `PAYWAY_BASE_URL` | URL | Toggles between ABA Sandbox & Production |
| `STRIPE_KEY` | Key | Toggles between Stripe Test & Live modes |

---

## 📡 Core API Endpoints

| Endpoint | Method | Auth | Description |
| :--- | :--- | :--- | :--- |
| `/api/login` | `POST` | Public | Authenticate user |
| `/api/user` | `GET` | Required | Get current user |
| `/api/products` | `GET` | Public | Paginated product list |
| `/api/products/{slug}` | `GET` | Public | Single product detail |
| `/api/categories` | `GET` | Public | Category tree |
| `/api/orders` | `POST` | Required | Create order |
| `/api/payment/stripe/create-intent` | `POST` | Required | Stripe payment |
| `/api/admin/dashboard` | `GET` | Admin | Analytics dashboard |
| `/api/admin/products` | `POST` | Admin | Create product |
| `/api/admin/products/{id}` | `POST` | Admin | Update product (`_method=PUT`) |

---

## 📄 License

Released under the **MIT License**.

Copyright © 2026 T-Store
