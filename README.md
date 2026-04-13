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

T-Store is an enterprise-grade, full-stack e-commerce solution architected for high performance, seamless user experience, and comprehensive store management. Built on a robust **Laravel API** backend and a dynamic **React SPA** frontend, with **Supabase** powering both database and image storage.

🔗 **Live Demo:** [t-store-rosy.vercel.app](https://t-store-rosy.vercel.app)

---

## ✨ System Features

### 🛍️ Client Storefront
- **Product Discovery & Associations:** Real-time filtering by category, full-text search, and an intelligent "Related Products" recommendation system.
- **Dynamic Homepage:** Live-preview Hero section configuration directly tied to client-side storage for instant visual feedback.
- **Persistent Cart Management:** Seamless cart state preservation across sessions using Zustand.
- **Frictionless Checkout:** Multi-gateway payment processing supporting both **Stripe** (Credit/Debit) and **PayPal** SDKs.
- **User Authentication:** Secure token-based authentication via Laravel Sanctum, featuring Google OAuth (Socialite) integration.
- **Responsive UI/UX:** Mobile-first design implemented with Tailwind CSS v4 and Framer Motion micro-interactions.

### 🎛️ Administrative Back-Office
- **Comprehensive Analytics:** Real-time BI dashboard visualizing revenue streams, sales velocity, and top-performing SKUs.
- **Product Management:** Robust CRUD workflows featuring multi-image gallery uploads and intelligent orphaned image cleanup via Supabase Storage REST APIs.
- **Inventory Tracking:** Automated stock ledger (`stock_movements`) with order lifecycle transitions.
- **Order Pipeline:** Status-driven workflow management (Pending → Processing → Shipped) with notification dispatch.
- **Data Export:** On-the-fly CSV report generation for Orders, Products, and User data.

---

## 🏗️ System Architecture & Tech Stack

The application adheres to the REST architectural pattern with total decoupling between the client SPA and the server API.

### Frontend (Vercel)
| Technology | Purpose |
| :--- | :--- |
| React 19 + TypeScript | Core SPA framework |
| Vite | Build tool & HMR |
| TanStack Query v5 | Server-state & caching |
| Zustand | Client-side state management |
| Tailwind CSS v4 | Styling pipeline |
| React Router v6 | Client-side routing |

### Backend (Render)
| Technology | Purpose |
| :--- | :--- |
| Laravel 12 (PHP 8.2+) | API framework |
| Laravel Sanctum | Stateless token authentication |
| Eloquent ORM | Database abstraction layer |
| Stripe PHP SDK | Payment processing |
| PayPal REST API | Alternative payment gateway |

### Cloud Services (Supabase)
| Service | Purpose |
| :--- | :--- |
| PostgreSQL (Supabase) | Primary database (Singapore region) |
| Supabase Storage | Persistent image storage (product images, banners, etc.) |
| Connection Pooler | Database connection management (port 6543) |

---

## 🚀 Deployment Architecture

```
┌──────────────┐     API calls     ┌──────────────┐     SQL      ┌──────────────┐
│   Frontend   │ ───────────────── │   Backend    │ ──────────── │   Supabase   │
│   (Vercel)   │                   │   (Render)   │              │  PostgreSQL  │
│  React SPA   │                   │  Laravel API │ ──────────── │   Storage    │
└──────────────┘                   └──────────────┘   Images     └──────────────┘
```

### Production URLs
- **Frontend:** `https://t-store-rosy.vercel.app`
- **Backend API:** `https://t-store-yl92.onrender.com`
- **Database:** Supabase PostgreSQL (Singapore `ap-southeast-1`)

### ⏱️ Server Keep-Alive (Free Tier)
Render's free web services spin down after 15 minutes of inactivity. To keep the API responsive and prevent cold starts:
1. Register for a free monitor on [cron-job.org](https://cron-job.org/) or [UptimeRobot](https://uptimerobot.com/).
2. Setup an HTTP(S) monitor to `GET` the following health-check endpoint every **10 minutes**:
   👉 `https://t-store-yl92.onrender.com/api/ping`

---

## 🔧 Environment Setup

### Dependencies
- **Node.js**: `v18.0.0+`
- **PHP**: `v8.2.0+`
- **Composer**: `v2.x`

### 1️⃣ Backend Setup

```bash
cd backend
composer install --no-interaction --optimize-autoloader
cp .env.example .env
php artisan key:generate
php artisan migrate --force
php artisan serve
```
*API runs on: `http://localhost:8000`*

### 2️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```
*Client runs on: `http://localhost:3000`*

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

```env
# Application
APP_ENV=production
APP_URL=https://t-store-yl92.onrender.com

# Database (Supabase PostgreSQL - Connection Pooler)
DB_CONNECTION=pgsql
DB_HOST=aws-1-ap-southeast-1.pooler.supabase.com
DB_PORT=6543
DB_DATABASE=postgres
DB_USERNAME=postgres.YOUR_PROJECT_REF
DB_PASSWORD="YOUR_DB_PASSWORD"

# Frontend
FRONTEND_URL=https://t-store-rosy.vercel.app

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=https://your-backend-url/api/auth/google/callback

# Stripe
STRIPE_KEY=pk_test_...
STRIPE_SECRET=sk_test_...

# PayPal
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_SECRET=your_paypal_secret

# Supabase Storage
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_KEY=sb_secret_YOUR_SECRET_KEY
SUPABASE_STORAGE_BUCKET=images
```

---

## 🔐 Default Accounts

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@tstore.com` | `password` |
| **User** | `john@example.com` | `password` |

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
