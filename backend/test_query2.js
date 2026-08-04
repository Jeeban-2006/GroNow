require('dotenv').config();
const pool = require('./config/db');

async function test() {
    try {
        const res = await pool.query(`
            SELECT DISTINCT o.order_id, o.order_status, c.customer_id, u.user_id
            FROM orders o
            LEFT JOIN customers c ON o.customer_id = c.customer_id
            LEFT JOIN users u ON c.user_id = u.user_id
            JOIN order_items oi ON o.order_id = oi.order_id
            JOIN products p ON oi.product_id = p.product_id
            WHERE p.store_id = 1
            ORDER BY o.order_id DESC
            LIMIT 5
        `);
        console.log("Orders:", res.rows);
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}
test();
