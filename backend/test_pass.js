const pool=require('./config/db');pool.query("SELECT password_hash FROM users WHERE email = 'superstore2@gronow.com'").then(r=>console.log(r.rows)).catch(console.error).finally(()=>process.exit(0))
