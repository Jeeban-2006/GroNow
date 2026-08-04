const { Client } = require('pg');
async function check() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });
    await client.connect();
    const res = await client.query("SELECT * FROM users WHERE email = 'jeebankrushnasahu@gmail.com'");
    console.log(res.rows);
    await client.end();
}
check().catch(console.error);
