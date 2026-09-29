# 📦 Inventory Management System — API Documentation

Base URL: `http://localhost:3000`  
Content-Type: `application/json`

---

## Response Format

ทุก endpoint ตอบกลับในรูปแบบ:

```json
{ "success": true,  "data": { ... } }
{ "success": false, "error": "Error message" }
```

---

## 1. Products

### `POST /api/products`
สร้างสินค้าใหม่

**Request Body:**
```json
{
  "name": "Notebook Dell Inspiron 15",
  "sku": "DELL-INS-15-001",
  "costPrice": 18500,
  "stockQuantity": 10,
  "categoryId": 1
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | ✅ | ชื่อสินค้า |
| sku | string | ✅ | รหัสสินค้า (ต้องไม่ซ้ำ) |
| costPrice | number | ✅ | ราคาทุน (≥ 0) |
| stockQuantity | number | ❌ | จำนวนเริ่มต้น (default: 0) |
| categoryId | number | ✅ | ID ของหมวดหมู่ |

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Notebook Dell Inspiron 15",
    "sku": "DELL-INS-15-001",
    "costPrice": 18500,
    "stockQuantity": 10,
    "categoryId": 1,
    "category": { "id": 1, "name": "IT Equipment" },
    "createdAt": "2026-09-29T10:00:00.000Z",
    "updatedAt": "2026-09-29T10:00:00.000Z"
  }
}
```

**Error Responses:**
| Code | Reason |
|------|--------|
| 400 | Missing required fields |
| 409 | SKU already exists |
| 404 | Category not found |

---

### `GET /api/products`
ดึงรายการสินค้าทั้งหมด

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| search | string | ค้นหาจากชื่อหรือ SKU |
| categoryId | number | กรองตามหมวดหมู่ |

**Example:** `GET /api/products?search=Dell&categoryId=1`

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Notebook Dell Inspiron 15",
      "sku": "DELL-INS-15-001",
      "costPrice": 18500,
      "stockQuantity": 10,
      "category": { "id": 1, "name": "IT Equipment" }
    }
  ]
}
```

---

### `GET /api/products/:id`
ดึงข้อมูลสินค้ารายตัว พร้อมประวัติ transaction 20 รายการล่าสุด

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Notebook Dell Inspiron 15",
    "sku": "DELL-INS-15-001",
    "costPrice": 18500,
    "stockQuantity": 10,
    "category": { "id": 1, "name": "IT Equipment" },
    "transactions": [
      { "id": 1, "type": "IN", "quantity": 10, "reason": "Initial stock", "createdAt": "..." }
    ]
  }
}
```

---

### `PATCH /api/products/:id`
อัปเดตข้อมูลสินค้า (ไม่รวมสต็อก — ใช้ `/api/stock/adjust`)

**Request Body:** (ส่งเฉพาะ field ที่ต้องการเปลี่ยน)
```json
{
  "name": "New Product Name",
  "costPrice": 20000,
  "categoryId": 2
}
```

---

### `DELETE /api/products/:id`
ลบสินค้าและประวัติ transaction ทั้งหมด

**Response 200:**
```json
{ "success": true, "message": "Product deleted successfully" }
```

---

### `GET /api/products/low-stock`
⚠️ ดึงรายการสินค้าที่มีสต็อกน้อยกว่า 5 ชิ้น

**Response 200:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    { "id": 3, "name": "Keyboard Mechanical AKKO", "stockQuantity": 2, "category": { "name": "IT Equipment" } }
  ]
}
```

---

## 2. Stock

### `PATCH /api/stock/adjust`
ปรับจำนวนสต็อก — บันทึก Transaction อัตโนมัติ

> **⚠️ Important Logic:**
> - ถ้า `adjustment` เป็นบวก → บันทึกเป็น **IN**
> - ถ้า `adjustment` เป็นลบ → บันทึกเป็น **OUT**
> - ระบบจะ**ปฏิเสธ**ถ้าผลลัพธ์ติดลบ

**Request Body:**
```json
{
  "productId": 1,
  "adjustment": -5,
  "reason": "ขายให้ลูกค้า Order #1234"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| productId | number | ✅ | ID สินค้า |
| adjustment | integer | ✅ | จำนวนที่ปรับ (+/−, ≠ 0) |
| reason | string | ❌ | เหตุผล |

**Response 200:**
```json
{
  "success": true,
  "data": {
    "product": { "id": 1, "name": "...", "stockQuantity": 5 },
    "transaction": { "id": 11, "type": "OUT", "quantity": 5, "reason": "ขายให้ลูกค้า" },
    "previousStock": 10,
    "newStock": 5,
    "adjustment": -5
  }
}
```

**Error 422 (Insufficient stock):**
```json
{
  "success": false,
  "error": "Insufficient stock. Current: 3, Requested: -5",
  "currentStock": 3
}
```

---

### `GET /api/stock/transactions`
ดึงประวัติการรับ-จ่ายสินค้าทั้งหมด พร้อม pagination

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| productId | number | กรองตาม product |
| type | string | `IN` หรือ `OUT` |
| page | number | หน้า (default: 1) |
| limit | number | จำนวนต่อหน้า (default: 50) |

**Response 200:**
```json
{
  "success": true,
  "data": [...],
  "pagination": { "total": 100, "page": 1, "limit": 50, "totalPages": 2 }
}
```

---

## 3. Categories

### `GET /api/categories`
ดึงหมวดหมู่ทั้งหมด พร้อมจำนวนสินค้า

**Response 200:**
```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "IT Equipment", "description": "...", "_count": { "products": 5 } }
  ]
}
```

---

### `POST /api/categories`
สร้างหมวดหมู่ใหม่

**Request Body:**
```json
{
  "name": "IT Equipment",
  "description": "อุปกรณ์คอมพิวเตอร์และเทคโนโลยี"
}
```

| Code | Reason |
|------|--------|
| 201 | Created |
| 400 | name is required |
| 409 | Category name already exists |

---

## 4. Dashboard

### `GET /api/dashboard/summary`
ดึงข้อมูลสรุปภาพรวมสำหรับ Dashboard

**Response 200:**
```json
{
  "success": true,
  "data": {
    "totalProducts": 10,
    "totalCategories": 4,
    "lowStockCount": 3,
    "inventoryValue": 285000,
    "recentTransactions": [...]
  }
}
```

---

## Error Codes Summary

| HTTP Code | Meaning |
|-----------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request — ข้อมูลไม่ครบหรือไม่ถูกต้อง |
| 404 | Not Found — ไม่พบ resource |
| 409 | Conflict — ข้อมูลซ้ำ (เช่น SKU ซ้ำ) |
| 422 | Unprocessable Entity — สต็อกไม่พอ |
| 500 | Internal Server Error |
