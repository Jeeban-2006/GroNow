const { Client } = require('pg');
const bcrypt = require('bcrypt');

async function updatePass() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });
    await client.connect();
    
    const hash = await bcrypt.hash('password123', 10);
    await client.query('UPDATE users SET password = $1', [hash]);
    
    console.log('All passwords reset to password123');
    await client.end();
}

updatePass().catch(console.error);
