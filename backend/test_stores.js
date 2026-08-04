const pool=require('./config/db');pool.query("SELECT store_id, shop_name FROM stores").then(r=>console.log(r.rows)).catch(console.error).finally(()=>process.exit(0))
