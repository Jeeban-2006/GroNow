const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'bbsr_grocery',
  password: 'qwertyui',
  port: 5432,
});

async function run() {
  try {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS system_config (
            config_id SERIAL PRIMARY KEY,
            config_key VARCHAR(50) UNIQUE NOT NULL,
            config_value JSONB NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
    
    // Check if exists
    const res = await pool.query(`SELECT * FROM system_config WHERE config_key = 'pricing'`);
    if (res.rows.length === 0) {
        await pool.query(`
            INSERT INTO system_config (config_key, config_value) VALUES 
            ('pricing', '{"base_delivery_fee": 15.00, "surge_multiplier": 1.0, "platform_commission_percent": 5.0}');
        `);
    }
    console.log("Migration successful");
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}

run();
