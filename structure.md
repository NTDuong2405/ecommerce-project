# Project Structure - VibeCart E-commerce

## 1. Frontend (React + Vite + Tailwind)
Location: `/ecommerce-fe`

- `src/`
  - `components/`: Reusable UI components (Navbar, Footer, Modal, etc.)
  - `context/`: State management (Cart, Socket, Currency, Auth)
  - `layouts/`: Page wrappers (ShopLayout, AdminLayout)
  - `locales/`: i18n translation files (en.json, vi.json)
  - `pages/`
    - `shop/`: Customer-facing pages (Home, Products, ProductDetail, Cart, Checkout, Profile, Tracking)
    - `admin/`: Admin dashboard pages (Dashboard, Products, Orders, Customers, Inventory, Analytics)
    - `auth/`: Authentication pages (Login, Register)
  - `utils/`: Helper functions (api.js, format.js, exchangeRate.js)
  - `App.jsx`: Main routing and global initialization
  - `main.jsx`: Application entry point

## 2. Backend (Node.js + Express)
Location: `/ecommerce-be` (Assumed based on project nature)

- `controllers/`: Request handling logic
- `models/`: Database schemas (User, Product, Order, Category)
- `routes/`: API endpoint definitions
- `middlewares/`: Auth check, validation, upload
- `utils/`: Socket.io config, payment integration (VNPAY/Stripe)
- `server.js`: Server entry point

## 3. Database (PostgreSQL / MySQL / MongoDB)
*Current Implementation uses Prisma/Sequelize for relational data*

- `Tables`:
  - `Users`: id, email, password, role (ADMIN, STAFF, CUSTOMER)
  - `Products`: id, name, price, stock, description, images
  - `Orders`: id, userId, totalPrice, status (PENDING, CONFIRMED, SHIPPING, DELIVERED, CANCELLED)
  - `OrderItems`: id, orderId, productId, quantity, price
  - `Notifications`: id, userId, message, isRead

---
*Last updated: 2026-03-23*
