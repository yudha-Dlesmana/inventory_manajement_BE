import { pool } from "./db.js";

export async function testConnection() {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("Connected server time", res.rows[0]);
  } catch (err) {
    console.error("Connection Error", err);
  }
}
