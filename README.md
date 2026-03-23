# 🛒 T-Store - Modern E-Commerce Platform

<div align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Laravel-12-FF2D20?style=for-the-badge&logo=laravel&logoColor=white" alt="Laravel" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <br />
  <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square" alt="License" />
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square" alt="PRs Welcome" />
</div>

<br />

T-Store is an enterprise-grade, full-stack e-commerce solution architected for high performance, seamless user experience, and comprehensive store management. Built on the robust **Laravel API** foundation and a dynamic **React SPA** frontend, T-Store offers a complete out-of-the-box digital storefront and administrative back-office.

---

## ✨ System Features

### 🛍️ Client Storefront
- **Advanced Product Discovery:** Real-time filtering by category, price range, and full-text search.
- **Persistent Cart Management:** Seamless cart state preservation across sessions using Zustand.
- **Frictionless Checkout:** Multi-gateway payment processing supporting both **Stripe** (Credit/Debit) and **PayPal** SDKs.
- **User Authentication:** Secure JWT-based authentication via Laravel Sanctum, featuring Google OAuth (Socialite) integration.
- **Responsive UI/UX:** Mobile-first design implemented with Tailwind CSS v4 and Framer Motion micro-interactions.

### 🎛️ Administrative Back-Office
- **Comprehensive Analytics:** Real-time BI dashboard visualizing revenue streams, sales velocity, and top-performing SKUs.
- **Master-Detail Product Management:** Robust CRUD workflows including complex multi-part form data handling for asynchronous image uploads and gallery management.
- **Algorithmic Inventory Tracking:** Automated stock ledger (`stock_movements`) ensuring pinpoint accuracy through order lifecycle transitions.
- **Order Pipeline Orchestration:** Status-driven workflow management (Pending → Processing → Shipped) with integrated notification dispatch.
- **Data Portability:** On-the-fly CSV report generation for Orders, Products, and User telemetry via Laravel `StreamedResponse`.

---

## 🏗️ System Architecture & Tech Stack

The application strictly adheres to the REST architectural pattern, executing total decoupling between the client SPA and the server API.

### Frontend Application Layer
- **Core Framework:** React 19 (Strict Mode enabled) + TypeScript (strict typing).
- **Build Tool:** Vite (optimized module bundling & HMR).
- **State Management:** TanStack Query v5 (server-state & caching) + Zustand (client-state).
- **Styling Pipeline:** Tailwind CSS v4.
- **Routing:** React Router v6.

### Backend Services Layer
- **Core Framework:** Laravel 12.x (PHP 8.2+).
- **Authentication:** Laravel Sanctum (SPA Cookie-based Web Auth) + Laravel Socialite.
- **ORM & DB:** Eloquent ORM interface over SQLite (dev) / MySQL 8.0+ (prod).
- **Payment Processing:** Official Stripe PHP SDK + PayPal Checkout API HTTP integrations.
- **Storage:** Laravel Local Storage (Local disks mapped to public symlinks).

---

## 🚀 Environment Setup & Deployment

### Dependencies
Ensure the following runtimes are installed on your host machine:
- **Node.js**: `v18.0.0` or higher
- **PHP**: `v8.2.0` or higher
- **Composer**: `v2.x`
- **Database**: SQLite (default configuration) or MySQL/PostgreSQL.

### 1️⃣ Backend Initialization

```bash
# Navigate to the API directory
cd backend

# Install PHP dependencies
composer install --no-interaction --optimize-autoloader

# Bootstrap environment configuration
cp .env.example .env
php artisan key:generate

# Execute database schema migrations and inject seed data
php artisan migrate:fresh --seed

# Generate primary public storage symlink for image resolution
php artisan storage:link

# Spin up the local development server
php artisan serve
```
*The API interface initializes on: `http://localhost:8000`*

### 2️⃣ Frontend Initialization

```bash
# Navigate to the SPA directory
cd frontend

# Install Node dependencies
npm install

# Initiate the Vite hot-module-replacement server
npm run dev
```
*The client interfaces initializes on: `http://localhost:3000`*

> **Proxy Note:** The Vite configuration automatically proxies `/api` and `/sanctum` traffic to the Laravel backend running on port `8000` to prevent CORS preflight during local development.

---

## 🔑 Authentication Access matrix

Seeders automatically provision the following functional accounts for QA and exploration:

| Access Tier | Identity | Credential | Capabilities |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@tstore.com` | `password` | Complete RBAC authority, full back-office access. |
| **Standard User** | `john@example.com` | `password` | Standard storefront operations, cart management, checkout. |

---

## 📡 Core API Specification

| Endpoint | Method | Authentication | Payload | Description |
| :--- | :--- | :--- | :--- | :--- |
| `/api/login` | `POST` | Public | `email`, `password` | Initialize Sanctum SPA session. |
| `/api/user` | `GET` | Required | None | Retrieve authenticated user profile. |
| `/api/products` | `GET` | Public | Optional filters | Paginated product index. |
| `/api/orders` | `POST` | Required | `items[]`, `payment_method`| Initialize transactional order process. |
| `/api/admin/products/{id}`| `POST` | Admin Only | `multipart/form-data` | Update product ledger & media assets. (Method spoofed `_method=PUT`) |
| `/api/admin/dashboard` | `GET` | Admin Only | None | Aggregate statistical BI payload. |

---

## 💳 Payment Gateway Configuration

To activate live checkout functionality, populate your `backend/.env` with respective processor keys:

```env
# Stripe Configuration
STRIPE_KEY=pk_test_...
STRIPE_SECRET=sk_test_...

# PayPal Configuration
PAYPAL_CLIENT_ID=ATc...
PAYPAL_SECRET=EJi...
```

---

## 📄 License & Attribution

This software is released under the standard **MIT License**. Permission is hereby granted, free of charge, to any person obtaining a copy of this software.

Copyright © 2026 T-Store Software Architecture Team

