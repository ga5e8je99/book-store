<div align="center">

<!-- Animated Header Wave Banner -->
<img src="https://capsule-render.vercel.app/api?type=waving&color=065F46,059669,10B981,34D399&height=200&section=header&text=BookStore%20%E2%80%A2%20Full-Stack%20Platform&fontSize=38&fontAlignY=38&fontColor=ffffff&desc=Modern%20Online%20Bookstore%2C%20Digital%20Library%20%26%20E-Commerce%20System&descAlignY=58&descAlign=50&descSize=15&animation=twinkling" width="100%" alt="BookStore Banner" />

<!-- Animated Typing SVG -->
<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=19&duration=2500&pause=1000&color=10B981&center=true&vCenter=true&multiline=false&width=620&height=42&lines=%F0%9F%93%9A+Comprehensive+Book+Catalog+%26+Search;%E2%9A%A1+Express.js+RESTful+API+%26+Mongoose;%F0%9F%94%90+JWT+Authentication+%26+Order+Lifecycles;%F0%9F%9B%92+Persistent+Shopping+Cart+Store" alt="BookStore Capabilities" />
</p>

<!-- Tech Stack Badges -->
[![Next.js 16](https://img.shields.io/badge/Next.js-16.4-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.3-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Express.js](https://img.shields.io/badge/Express.js-4.21-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![JWT](https://img.shields.io/badge/JWT-Secure_Auth-D63AFF?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![License](https://img.shields.io/badge/License-MIT-purple?style=for-the-badge)](LICENSE)

<!-- Animated Skill Icons -->
<p align="center">
  <img src="https://skillicons.dev/icons?i=nextjs,react,nodejs,express,mongodb,git&theme=dark" alt="Core Technologies" />
</p>

**[System Architecture](#-system-architecture)** • **[Features](#-key-features)** • **[API Documentation](#-api-endpoints)** • **[Local Setup](#-getting-started)**

</div>

---

## 🏛️ System Architecture

```mermaid
flowchart TD
  subgraph Client ["Client Layer (Next.js 16 & React 19)"]
    direction TB
    CATALOG["Book Catalog & Search / Filter UI"]
    DETAILS["Book Detail View, Ratings & Customer Reviews"]
    CART["Persistent Shopping Cart & Checkout"]
  end

  subgraph API ["Server Layer (Express.js REST API)"]
    direction TB
    AUTH_ROUTER["Auth Controller (JWT Tokens & bcryptjs)"]
    BOOK_ROUTER["Books Controller (CRUD, Search & Categories)"]
    ORDER_ROUTER["Orders Controller (Checkout & Status Updates)"]
  end

  subgraph Persistence ["Database Layer (MongoDB)"]
    direction TB
    BOOKS_COL[("Books & Authors Collection")]
    ORDERS_COL[("Orders & Invoices Collection")]
    USERS_COL[("Users & Admin Roles Collection")]
  end

  Client --> API
  API --> Persistence
```

---

## ✨ Key Features

### 📚 Extensive Book Catalog & Search
- Filter books by genre (Fiction, Science, Technology, History, Self-Help).
- Live search by title, author name, or ISBN.
- Paginated results with sorting by price, popularity, and publication year.

### ⭐ Reviews & Rating System
- Verified customer reviews and 5-star ratings.
- Community feedback displayed on individual book pages.

### 🛒 Shopping Cart & Secure Checkout
- Add and adjust book quantities with instant price recalculation.
- Shipping address management and order confirmation receipts.
- Order history tracking in user profile.

### 🛡️ Secure Backend & Role-Based Access
- Robust **Express.js** REST API with centralized error handling.
- Password hashing with **bcryptjs** and token-based authentication via **JWT**.
- Admin permissions to manage inventory, update pricing, and fulfill orders.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (or 20+)
- MongoDB Atlas connection string or local MongoDB instance

### Installation
```bash
git clone https://github.com/ga5e8je99/book-store.git
cd book-store
npm install
```

### Environment Configuration
Create a `.env` file in the root directory:
```env
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_jwt_secret_key
```

### Development
```bash
# Start backend server
npm run server

# In another terminal, start Next.js frontend
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📄 License
This project is licensed under the MIT License.
