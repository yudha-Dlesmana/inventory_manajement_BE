import { pool } from "./database/db.js";

export class InventoryManager {
  // Product
    static async addProduct({name, price, stock = 0, category}) {
        if (stock < 0) throw new Error("Stock tidak boleh negatif");
        if (price < 0) throw new Error("Price tidak boleh negatif");
        const query = `
            INSERT INTO products (name, price, stock, category)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        try {
            const res = await pool.query(query, [name, price, stock, category]);
            console.log('Produk berhasil ditambahkan:', res.rows[0]);
            return {
                status:200,
                message: "success",
                data: {...res.rows[0]}
            }
        } catch (err) {
            console.error('Error menambahkan produk:', err);
            throw err;
        }
    }

    static async updateProduct(id, data) {
      const { name, price, stock, category } = data;

      // Validasi
      if (price !== undefined && price < 0) throw new Error("Price tidak boleh negatif");
      if (stock !== undefined && stock < 0) throw new Error("Stock tidak boleh negatif");

      // Ambil produk lama dulu biar bisa merge (kalau ada field yang kosong)
      const existing = await pool.query("SELECT * FROM products WHERE id = $1", [id]);
      if (existing.rowCount === 0) {
        throw new Error("Product not found");
      }

      const oldProduct = existing.rows[0];

      const updatedName = name ?? oldProduct.name;
      const updatedPrice = price ?? oldProduct.price;
      const updatedStock = stock ?? oldProduct.stock;
      const updatedCategory = category ?? oldProduct.category;

      const query = `
        UPDATE products
        SET name = $1, price = $2, stock = $3, category = $4
        WHERE id = $5
        RETURNING *;
      `;

      const res = await pool.query(query, [
        updatedName,
        updatedPrice,
        updatedStock,
        updatedCategory,
        id
      ]);

      return res.rows[0];
    }


  static async updateStock(productId, quantity, transactionType) {
      if (quantity <= 0) {
          throw new Error("Quantity more than 0");
      }
      if (!['buy', 'sell'].includes(transactionType)) {
          throw new Error("Transaction type must 'buy' or 'sell'");
      }
      // Ambil stok saat ini
      const productRes = await pool.query('SELECT stock FROM products WHERE id=$1', [productId]);
      if (productRes.rowCount === 0) {
          throw new Error('Produk tidak ditemukan');
      }
      let newStock = productRes.rows[0].stock;
      if (transactionType === 'buy') {
          newStock += quantity;
      } else if (transactionType === 'sell') {
          newStock -= quantity;
          if (newStock < 0) {
              throw new Error("Stock tidak cukup untuk transaksi");
          }
      }
      // Update stock di database
      const updateRes = await pool.query(
          'UPDATE products SET stock=$1 WHERE id=$2 RETURNING *',
          [newStock, productId]
      );
      
      return updateRes.rows[0];
  }

  static async createTransaction(productId, quantity, type, entityId) {
    if (quantity <= 0) throw new Error("Quantity harus lebih dari 0");
    if (!['buy', 'sell'].includes(type)) throw new Error("Transaction type salah");

    // product
    const productRes = await pool.query('SELECT * FROM products WHERE id = $1', [productId]);
    if (productRes.rowCount === 0) throw new Error("Produk tidak ditemukan");
    const product = productRes.rows[0];

    // entities
    const entityRes = await pool.query('SELECT * FROM entities WHERE id = $1', [entityId]);
    if (entityRes.rowCount === 0) throw new Error("Entity tidak ditemukan");
    const entity = entityRes.rows[0];

    let subtotal = product.price * quantity;
    let discount = 0;

    // diskon
    if (quantity >= 12) {
        discount += subtotal * 0.10; // 10% diskon
    }

    const total = subtotal - discount;

    // Update stok
    await this.updateStock(productId, quantity, type);

    // save transaksi
    const query = `
        INSERT INTO transactions (type, product_id, entity_id, quantity, total)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
    `;
    const res = await pool.query(query, [type, productId, entityId, quantity, total]);

    return {
        ...res.rows[0],
        subtotal,
        discount,
        final_total: total
    };
  }

  
  static async getProductsByCategory(category, page = 1) {
  const limit = 10;
  if (page < 1) page = 1;
  const offset = (page - 1) * limit;

  const query = `
    SELECT id, name, price, stock, category
    FROM products
    WHERE ($1::text IS NULL OR category::text = $1::text)
    ORDER BY name ASC
    LIMIT $2 OFFSET $3;
  `;

  const countQuery = `
    SELECT COUNT(*)
    FROM products
    WHERE ($1::text IS NULL OR category::text = $1::text);
  `;

  const params = [category || null, limit, offset];
  const countParams = [category || null];

  const res = await pool.query(query, params);
  const countRes = await pool.query(countQuery, countParams);
  const totalItems = parseInt(countRes.rows[0].count, 10);

  return {
    status: 200,
    message: "success",
    data: {
      currentPage: page,
      totalItems,
      items: res.rows,
    },
  };
}



  static async getInventoryValue() {
    const query = `
        SELECT SUM(price * stock) AS total_value
        FROM products;
    `;

    const res = await pool.query(query);

    return res.rows[0].total_value || 0;
  }

  static async getProductHistory(productId, page = 1) {
    if (page < 1) page = 1;
    if (limit < 1) limit = 10;

    const offset = (page - 1) * limit;

    const query = `
        SELECT t.id, t.type, t.quantity, t.total, t.transaction_date,
               e.name AS entity_name, e.type AS entity_type
        FROM transactions t
        JOIN entities e ON t.entity_id = e.id
        WHERE t.product_id = $1
        ORDER BY t.transaction_date DESC
        LIMIT $2 OFFSET $3;
    `;

    const res = await pool.query(query, [productId, limit, offset]);
    const countQuery = `SELECT COUNT(*) FROM transactions WHERE product_id = $1;`;
    const countRes = await pool.query(countQuery, [productId]);
    const totalItems = parseInt(countRes.rows[0].count, 10);

    return {
          currentPage: page,
          perPage: limit,
          totalItems,
          totalPages: Math.ceil(totalItems / limit),
          data: res.rows
      };
  }

  // entity (customer/supplier)
  static async addEntity(name, type) {
      if (!['customer', 'supplier'].includes(type)) {
          throw new Error("Entity type harus 'customer' atau 'supplier'");
      }

      const query = `
          INSERT INTO entities (name, type)
          VALUES ($1, $2)
          RETURNING *;
      `;
      const res = await pool.query(query, [name, type]);
      return res.rows[0];
  }

  static async getEntities(type) {
      if (!['customer', 'supplier'].includes(type)) {
          throw new Error("Entity type harus 'customer' atau 'supplier'");
      }

      const query = `SELECT * FROM entities WHERE type = $1 ORDER BY name ASC;`;
      const res = await pool.query(query, [type]);
      return res.rows;
  }

}
