import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();

export const pool = new Pool({
  host: process.env.DB_HOST,       
  port: Number(process.env.DB_PORT) || 5432, 
  user: process.env.DB_USERNAME,       
  password: process.env.DB_PASSWORD, 
  database: process.env.DB_NAME,   
})
