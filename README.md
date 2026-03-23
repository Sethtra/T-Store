# 🛒 T-Store - Modern E-Commerce Platform

Welcome to **T-Store**! This is a complete, ready-to-use premium online store platform. It is designed to provide a smooth, beautiful shopping experience for customers while giving store owners a powerful and easy-to-use dashboard to manage their business.

![License](https://img.shields.io/badge/license-MIT-blue.svg)

---

## 🌟 What is T-Store?

T-Store is a modern online shopping website, similar to Shopify or Amazon, but built from scratch using the latest web technologies. It is divided into two main parts:

### 👤 1. The Customer Storefront (What shoppers see)
This is where your customers can:
- **Browse Products:** Search for items, filter by categories (like Phones, Laptops), and view detailed product pages with image galleries.
- **Add to Cart:** Customers can add items to their shopping cart and see real-time price totals.
- **Secure Checkout:** Customers can securely pay using their Credit/Debit Cards (via Stripe) or PayPal.
- **User Accounts:** Shoppers can create accounts, log in with Google, track their order status, and view their purchase history.

### 👩‍💼 2. The Admin Dashboard (What store owners see)
This is a secure, hidden area of the website where you manage your business:
- **Dashboard & Analytics:** View your total revenue, recent orders, and see visual charts showing how your business is performing over time.
- **Manage Products & Categories:** Easily add new products, upload images, set prices, and organize your store into categories (e.g., Electronic > Phone).
- **Manage Inventory:** See exactly how much stock you have left. The system automatically updates stock when customers buy things and alerts you when items are running low.
- **Manage Orders & Customers:** See who bought what, update order statuses (Pending -> Processing -> Shipped), and manage your customer list.
- **Export Data:** Download your business data (Orders, Products, Users) as Excel/CSV files for your accountant.

---

## ✨ Key Features For Store Owners

- **Master-Detail Category Management:** A beautiful, easy-to-use side panel for organizing your store's categories.
- **Robust Image Uploads:** Drag and drop product images seamlessly.
- **Automated Stock Tracking:** Never accidentally sell an item you don't have.
- **Dual Payment Gateways:** Accept both modern cards (Stripe) and classic PayPal to maximize your sales.
- **Dark/Light Mode:** A gorgeous interface that adapts to your preference.

---

## 🔑 Default Login Credentials

Want to test it out? You can log into the system using these pre-made accounts:

| Role | Email | Password | What they can do |
| :--- | :--- | :--- | :--- |
| **Admin** | admin@tstore.com | password | Can access the Admin Dashboard, manage products, view all orders. |
| **Customer** | john@example.com | password | Can browse products, add to cart, and checkout. |

---

## 🛠️ Technical Details (For Developers)

T-Store is a full-stack application built with **React** (frontend) and **Laravel** (backend).

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19 + TypeScript + Vite |
| **Styling** | Tailwind CSS v4 |
| **State Management** | TanStack Query + Zustand |
| **Backend API** | Laravel 12 (PHP) |
| **Authentication** | Laravel Sanctum + Socialite (Google OAuth) |
| **Database** | SQLite (for easy setup) / MySQL (for production) |

### 🚀 Quick Start Guide

**Prerequisites:** Node.js 18+, PHP 8.2+, and Composer.

#### 1️⃣ Backend Setup
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate:fresh --seed
php artisan storage:link
php artisan serve
```
*The backend API will run on `http://localhost:8000`*

#### 2️⃣ Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*The frontend website will run on `http://localhost:3000`*

### 📡 Important Configuration
To make payments work, you need to add your Stripe and PayPal API keys to the `backend/.env` file:
- `STRIPE_KEY` and `STRIPE_SECRET`
- `PAYPAL_CLIENT_ID` and `PAYPAL_SECRET`

---

## 🐛 Troubleshooting

- **Images not showing?** Make sure you ran `php artisan storage:link` in the backend folder.
- **Upload errors?** Ensure your PHP `upload_max_filesize` and `post_max_size` are configured correctly in your `php.ini`.
- **Login issues?** Try clearing your browser cookies or running `php artisan migrate:fresh --seed` to reset the database.

---

## 📄 License
MIT License - Free for personal and commercial use.

**Made with ❤️ by the T-Store Team**
