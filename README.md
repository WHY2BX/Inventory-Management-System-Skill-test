# 📦 Inventory Management System

ระบบบริหารจัดการคลังสินค้า สร้างด้วย Next.js 16, Prisma 7, SQLite

## 🚀 Quick Start

```bash
# 1. ติดตั้ง dependencies
npm install

# 2. สร้าง database
npm run db:migrate

# 3. ใส่ข้อมูลตัวอย่าง
npm run db:seed

# 4. เริ่ม dev server
npm run dev
```

เปิด http://localhost:3000

---

## 📐 Database Schema (ER Diagram)

```
┌─────────────────────┐       ┌───────────────────────────┐       ┌──────────────────────────────────┐
│      categories     │       │         products           │       │       stock_transactions         │
├─────────────────────┤       ├───────────────────────────┤       ├──────────────────────────────────┤
│ id          INT  PK │◄─┐    │ id            INT  PK      │◄─┐    │ id          INT  PK              │
│ name        TEXT    │  └─1:M│ name          TEXT         │  └─1:M│ product_id  INT  FK → products   │
│ description TEXT    │       │ sku           TEXT UNIQUE  │       │ type        TEXT  (IN/OUT)        │
│ created_at  DATETIME│       │ cost_price    REAL         │       │ quantity    INT                   │
└─────────────────────┘       │ stock_quantity INT         │       │ reason      TEXT                  │
                               │ category_id   INT  FK     │       │ created_at  DATETIME              │
                               │ created_at    DATETIME    │       └──────────────────────────────────┘
                               │ updated_at    DATETIME    │
                               └───────────────────────────┘
```

**Relationships:**
- `categories` → `products`: **One-to-Many**
- `products` → `stock_transactions`: **One-to-Many**

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/products` | ดึงรายการสินค้าทั้งหมด |
| `POST` | `/api/products` | สร้างสินค้าใหม่ |
| `GET` | `/api/products/:id` | ดึงข้อมูลสินค้ารายตัว |
| `PATCH` | `/api/products/:id` | แก้ไขข้อมูลสินค้า |
| `DELETE` | `/api/products/:id` | ลบสินค้า |
| `GET` | `/api/products/low-stock` | สินค้าที่เหลือน้อยกว่า 5 |
| `PATCH` | `/api/stock/adjust` | ปรับจำนวนสต็อก (+/-) |
| `GET` | `/api/stock/transactions` | ประวัติการรับ-จ่าย |
| `GET` | `/api/categories` | ดึงหมวดหมู่ทั้งหมด |
| `POST` | `/api/categories` | สร้างหมวดหมู่ใหม่ |
| `GET` | `/api/dashboard/summary` | สรุปภาพรวม Dashboard |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| ORM | Prisma 7 |
| Database | SQLite (better-sqlite3) |
| Styling | Tailwind CSS v4 |
| Icons | Lucide React |
