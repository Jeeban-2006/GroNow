const pool = require("../config/db");

function haversineDistance(lat1, lon1, lat2, lon2) {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371; // km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

class OrderController {

    // CREATE ORDER
    async createOrder(req, res) {
        try {
            const { items } = req.body;
            const user_id = req.user.user_id;

            if (!items || items.length === 0) {
                return res.status(400).json({ success: false, message: "Cart is empty" });
            }

            // 1. Get customer ID
            let customerRes = await pool.query("SELECT customer_id FROM customers WHERE user_id = $1", [user_id]);
            let customer_id;
            
            if (customerRes.rows.length === 0) {
                // Auto-create customer profile for older accounts
                const insertRes = await pool.query(
                    `INSERT INTO customers(user_id, address, city, state, pincode)
                    VALUES($1, 'Please update address', 'Update City', 'Update State', '000000') RETURNING customer_id`,
                    [user_id]
                );
                customer_id = insertRes.rows[0].customer_id;
            } else {
                customer_id = customerRes.rows[0].customer_id;
            }

            // 2. Calculate Total & Create Order
            let totalAmount = 0;
            items.forEach(item => {
                totalAmount += (item.price * item.quantity);
            });

            // We get the store_id from the first item in the cart to satisfy the NOT NULL constraint
            const firstItemProdRes = await pool.query("SELECT store_id FROM products WHERE product_id = $1", [items[0].productId]);
            const store_id = firstItemProdRes.rows.length > 0 ? firstItemProdRes.rows[0].store_id : 1; // fallback to 1

            const order_number = `ORD-${Date.now()}`;
            const orderRes = await pool.query(
                `INSERT INTO orders (order_number, customer_id, store_id, subtotal, total_amount, order_status, delivery_address)
                 VALUES ($1, $2, $3, $4, $5, 'PLACED', 'Default Delivery Address') RETURNING *`,
                [order_number, customer_id, store_id, totalAmount, totalAmount]
            );
            const order_id = orderRes.rows[0].order_id;

            // 3. Insert Order Items, Decrement Inventory, and collect unique stores
            const uniqueStoreIds = new Set();
            for (const item of items) {
                const subtotal = item.price * item.quantity;
                
                // Fetch product's store_id
                const prodRes = await pool.query("SELECT store_id FROM products WHERE product_id = $1", [item.productId]);
                if (prodRes.rows.length > 0) {
                    uniqueStoreIds.add(prodRes.rows[0].store_id);
                }

                await pool.query(
                    `INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal)
                     VALUES ($1, $2, $3, $4, $5)`,
                    [order_id, item.productId, item.quantity, item.price, subtotal]
                );
                
                // Decrement inventory (ensure it doesn't go below 0 if possible, but for demo we just subtract)
                await pool.query(
                    `UPDATE inventory 
                     SET available_quantity = GREATEST(available_quantity - $1, 0)
                     WHERE product_id = $2`,
                    [item.quantity, item.productId]
                );
            }

            // 4. Create Payment (Mock)
            await pool.query(
                `INSERT INTO payments (order_id, amount_paid, payment_method, payment_status, transaction_id)
                 VALUES ($1, $2, 'UPI', 'SUCCESS', 'TXN_MOCK_${Date.now()}')`,
                [order_id, totalAmount]
            );

            // 5. Driver assignment is now handled by the store when they start packing.

            res.status(201).json({ success: true, order: { order_id, order_number, total_amount: totalAmount, status: 'PLACED' } });

        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getOrders(req, res) {
        try {
            const user_id = req.user.user_id;
            
            const customerRes = await pool.query("SELECT customer_id FROM customers WHERE user_id = $1", [user_id]);
            if (customerRes.rows.length === 0) return res.status(200).json([]);
            
            const customer_id = customerRes.rows[0].customer_id;
            
            const ordersRes = await pool.query(`
                SELECT o.order_id, o.order_number, o.order_status, o.total_amount, o.ordered_at, o.delivery_address,
                       t.latitude, t.longitude, t.tracking_status, t.tracked_at, r.waypoints as route_waypoints
                FROM orders o
                LEFT JOIN delivery_tracking t ON o.order_id = t.order_id
                LEFT JOIN routes r ON o.order_id = r.order_id
                WHERE o.customer_id = $1
                ORDER BY o.ordered_at DESC
            `, [customer_id]);
            
            res.status(200).json(ordersRes.rows);
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // CANCEL ORDER
    async cancelOrder(req, res) {
        try {
            const { id } = req.params;
            const user_id = req.user.user_id;

            // Verify order belongs to customer
            const orderRes = await pool.query(`
                SELECT o.order_id, o.order_status
                FROM orders o
                JOIN customers c ON o.customer_id = c.customer_id
                WHERE o.order_id = $1 AND c.user_id = $2
            `, [id, user_id]);

            if (orderRes.rows.length === 0) {
                return res.status(404).json({ success: false, message: "Order not found" });
            }

            if (orderRes.rows[0].order_status !== 'PLACED') {
                return res.status(400).json({ success: false, message: "Cannot cancel order at this stage" });
            }

            await pool.query("UPDATE orders SET order_status = 'CANCELLED' WHERE order_id = $1", [id]);
            res.status(200).json({ success: true, message: "Order cancelled successfully" });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = new OrderController();
