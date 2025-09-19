# 📦 Inventory Management API

Sistem REST API untuk mengelola produk, transaksi, laporan stok, customer, dan supplier. Dibangun **tanpa framework** (tanpa Express), hanya menggunakan **Node.js native HTTP module**, dan **postgresql**.

## 📂 Struktur Project

node/modules/
src/
├─ database/ # koneksi database
├─ routes # route
└─ inventoryManager.js # Class InventoryManage yang mengimplementasi method-method inventory manajement
.env
Script Database
server.js

---

## 🚀 Cara Menjalankan

**Clone repo & masuk ke folder**

```bash
 git clone https://github.com/yudha-Dlesmana/inventory_manajement_FE.git
 cd inventory_manajement_FE
```

**Install dependensi**

```
npm install
```

**Konfigurasi database**  
 buat file .env sesuaikan untuk dengan database server postgres sudah disiapkan

```bash
DB_HOST=...
DB_PORT=...
DB_USERNAME=...
DB_PASSWORD=...
DB_NAME=...

SERVER_PORT=...
```

**Jalankan server**

```bash
node server.js
```

Server akan berjalan di: [http://localhost:3000]

---
