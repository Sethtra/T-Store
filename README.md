# T-Store - Modern E-Commerce Platform

A premium, full-stack e-commerce platform built with **React** (frontend) and **Laravel** (backend) featuring secure authentication, admin dashboard, and responsive design.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18-61DAFB)
![Laravel](https://img.shields.io/badge/Laravel-11-FF2D20)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6)

---

## ✨ Features

### 🛍️ Customer Features

- Browse products with advanced filtering (category, price range, search)
- Product detail pages with image galleries
- Shopping cart with persistent storage
- Real-time order status notifications
- User authentication (register/login)
- Responsive design (mobile, tablet, desktop)

### 🎛️ Admin Features

- Admin dashboard with revenue analytics
- Product management (CRUD operations)
- Order management with status workflow
- Real-time stock and order notifications
- Secure admin-only routes

### 🔒 Security & Performance

- **Authentication**: Laravel Sanctum (session + CSRF protection)
- **Password Security**: Bcrypt hashing
- **API Protection**: CORS, CSRF tokens, XSS prevention
- **Database**: Optimized queries with eager loading
- **Frontend**: Code splitting, lazy loading, global scroll restoration

---

## 🛠️ Tech Stack

| Layer         | Technology                   |
| ------------- | ---------------------------- |
| **Frontend**  | React 18 + TypeScript + Vite |
| **Styling**   | Tailwind CSS v4              |
| **State**     | TanStack Query + Zustand     |
| **Animation** | Framer Motion                |
| **Backend**   | Laravel 11 (REST API)        |
| **Auth**      | Laravel Sanctum              |
| **Database**  | SQLite (dev) / MySQL (prod)  |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+
- **PHP** 8.2+
- **Composer**
- **SQLite** (or MySQL 8+)

---

### 📦 Installation

#### 1️⃣ Clone Repository

```bash
git clone <your-repo-url>
cd T-Store
```

#### 2️⃣ Backend Setup

```bash
cd backend

# Install dependencies
composer install

# Environment setup
cp .env.example .env
php artisan key:generate

# Configure database (already using SQLite by default)
# Edit .env if you want to use MySQL instead

# Run migrations and seed database
php artisan migrate:fresh --seed

# Start Laravel server
php artisan serve
```

**Default runs on:** `http://localhost:8000`

#### 3️⃣ Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

**Default runs on:** `http://localhost:3000`

---

## 🔑 Default Credentials

| Role      | Email            | Password |
| --------- | ---------------- | -------- |
| **Admin** | admin@tstore.com | password |
| Customer  | john@example.com | password |

---

## 📡 API Endpoints

### Public Routes

- `GET /api/products` - List products (with filters)
- `GET /api/products/featured` - Featured products
- `GET /api/products/{slug}` - Product details
- `GET /api/categories` - All categories

### Authentication

- `POST /api/register` - Register new user
- `POST /api/login` - Login
- `POST /api/logout` - Logout (auth required)
- `GET /api/user` - Current user (auth required)

### Customer Routes (Auth Required)

- `GET /api/orders` - User orders
- `POST /api/orders` - Create order

### Admin Routes (Admin Role Required)

- `GET /api/admin/dashboard` - Dashboard stats
- `GET/POST/PUT/DELETE /api/admin/products` - Product CRUD
- `GET /api/admin/orders` - All orders
- `PATCH /api/admin/orders/{id}/status` - Update order status

---

## 🎨 Project Structure

```
T-Store/
├── backend/                # Laravel API
│   ├── app/
│   │   ├── Http/Controllers/
│   │   │   ├── AuthController.php
│   │   │   ├── ProductController.php
│   │   │   └── Admin/
│   │   ├── Models/
│   │   └── Middleware/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   └── routes/api.php
│
├── frontend/               # React SPA
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # React Query hooks
│   │   ├── stores/         # Zustand stores
│   │   └── lib/            # API client, utilities
│   └── vite.config.ts
│
└── README.md
```

---

## 🔧 Configuration

### Backend Configuration

Edit `backend/.env`:

```env
APP_URL=http://localhost:8000
SESSION_DRIVER=file
SESSION_DOMAIN=

# For MySQL instead of SQLite:
DB_CONNECTION=mysql
DB_DATABASE=tstore
DB_USERNAME=root
DB_PASSWORD=your_password
```

### Frontend Configuration

The frontend proxies API requests via Vite:

- API: `http://localhost:3000/api` → `http://localhost:8000/api`
- Sanctum: `http://localhost:3000/sanctum` → `http://localhost:8000/sanctum`

---

## 🧪 Development

### Running Tests

```bash
# Backend (Laravel)
cd backend
php artisan test

# Frontend (React)
cd frontend
npm run test
```

### Building for Production

```bash
# Frontend build
cd frontend
npm run build

# Output: frontend/dist/
```

---

## 🐛 Troubleshooting

### Login/Logout Issues

1. **Clear browser cookies** (dev tools → Application → Cookies)
2. **Refresh database**: `php artisan migrate:fresh --seed`
3. **Restart servers** (both backend and frontend)

### CORS Errors

- Ensure `backend/config/cors.php` has `allowed_origins => ['http://localhost:3000']`
- Check `withCredentials: true` is set in `frontend/src/lib/api.ts`

### Price Display Errors

- Backend returns strings - frontend converts with `Number(price).toFixed(2)`

---

## 📄 License

MIT License - Free for personal and commercial use.

---

## 🙏 Acknowledgments

Built with modern web technologies:

- [React](https://react.dev)
- [Laravel](https://laravel.com)
- [Tailwind CSS](https://tailwindcss.com)
- [TanStack Query](https://tanstack.com/query)
- [Framer Motion](https://www.framer.com/motion)

---

**Made with ❤️ by T-Store Team**
