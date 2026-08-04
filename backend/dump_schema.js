require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function dumpSchema() {
  const tables = ['users', 'customers', 'delivery_partners', 'orders', 'routes', 'stores'];
  for (const table of tables) {
    const res = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = $1
    `, [table]);
    console.log(`\n--- ${table} ---`);
    res.rows.forEach(r => console.log(`${r.column_name}: ${r.data_type} (Nullable: ${r.is_nullable})`));
  }
  pool.end();
}

dumpSchema();
