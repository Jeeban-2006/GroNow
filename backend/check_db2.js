const { Client } = require('pg');
async function checkDb() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });
    await client.connect();
    try {
        const orders = await client.query("SELECT * FROM orders WHERE order_number = 'ORD-1785818669507'");
        console.log("Order:", orders.rows[0]);
    } catch (e) {
        console.error("Error:", e.message);
    }
    await client.end();
}
checkDb();
