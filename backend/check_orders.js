const { Client } = require('pg');
async function checkOrders() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });
    await client.connect();
    try {
        const customer_id = 1;
        const ordersRes = await client.query(`
                SELECT o.order_id, o.order_number, o.order_status, o.total_amount, o.ordered_at, o.delivery_address,
                       t.latitude, t.longitude, t.tracking_status, t.tracked_at, r.waypoints as route_waypoints,
                       (
                           SELECT json_agg(
                               json_build_object(
                                   'product_name', p.product_name,
                                   'quantity', oi.quantity,
                                   'price', oi.price
                               )
                           )
                           FROM order_items oi
                           JOIN products p ON oi.product_id = p.product_id
                           WHERE oi.order_id = o.order_id
                       ) as items
                FROM orders o
                LEFT JOIN (
                    SELECT order_id, latitude, longitude, tracking_status, tracked_at
                    FROM delivery_tracking
                    WHERE tracking_id IN (
                        SELECT MAX(tracking_id) FROM delivery_tracking GROUP BY order_id
                    )
                ) t ON o.order_id = t.order_id
                LEFT JOIN routes r ON o.order_id = r.order_id
                WHERE o.customer_id = $1
                ORDER BY o.ordered_at DESC
        `, [customer_id]);
        console.log("Orders:", ordersRes.rows);
    } catch (e) {
        console.error("Error:", e.message);
    }
    await client.end();
}
checkOrders();
