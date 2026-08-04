const { Client } = require('pg');
async function checkDb() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });
    await client.connect();
    try {
        const routes = await client.query("SELECT * FROM routes ORDER BY route_id DESC LIMIT 1");
        console.log("Last Route:", routes.rows[0]);

        const orders = await client.query("SELECT * FROM orders WHERE order_id = $1", [routes.rows[0]?.order_id]);
        console.log("Order:", orders.rows[0]);
    } catch (e) {
        console.error("Error:", e.message);
    }
    await client.end();
}
checkDb();
