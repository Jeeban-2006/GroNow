const pool = require("../config/db");

class AdminController {

    // GET global metrics
    async getMetrics(req, res) {
        try {
            const revenueRes = await pool.query("SELECT SUM(total_amount) as total FROM orders WHERE order_status = 'DELIVERED'");
            const ordersRes = await pool.query("SELECT COUNT(*) as count FROM orders");
            const usersRes = await pool.query("SELECT COUNT(*) as count FROM users WHERE role = 'CUSTOMER'");
            const storesRes = await pool.query("SELECT COUNT(*) as count FROM stores WHERE is_verified = TRUE");

            res.status(200).json({
                success: true,
                revenue: revenueRes.rows[0].total || 0,
                orders: ordersRes.rows[0].count,
                customers: usersRes.rows[0].count,
                active_stores: storesRes.rows[0].count
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // GET unverified stores
    async getPendingStores(req, res) {
        try {
            const pendingRes = await pool.query(`
                SELECT s.store_id, s.shop_name, s.city, o.business_name, o.gst_number, u.email
                FROM stores s
                JOIN store_owners o ON s.owner_id = o.owner_id
                JOIN users u ON o.user_id = u.user_id
                WHERE s.is_verified = FALSE
                ORDER BY s.created_at ASC
            `);
            res.status(200).json(pendingRes.rows);
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // PUT verify a store
    async verifyStore(req, res) {
        try {
            const { id } = req.params; // store_id
            
            await pool.query("UPDATE stores SET is_verified = TRUE WHERE store_id = $1", [id]);
            
            // Also update the store owner verification status
            await pool.query(`
                UPDATE store_owners SET verification_status = 'APPROVED' 
                WHERE owner_id = (SELECT owner_id FROM stores WHERE store_id = $1)
            `, [id]);
            
            res.status(200).json({ success: true, message: "Store verified successfully" });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // PUT reject a store
    async rejectStore(req, res) {
        try {
            const { id } = req.params; // store_id
            
            // Delete the store (it's pending)
            await pool.query("DELETE FROM stores WHERE store_id = $1", [id]);
            
            // Optionally, we could update store_owner verification_status to 'REJECTED' if we have owner_id, 
            // but CASCADE or just leaving them as PENDING to try again is fine.
            
            res.status(200).json({ success: true, message: "Store rejected successfully" });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // GET fleet (delivery partners and tracking)
    async getFleet(req, res) {
        try {
            const fleetRes = await pool.query(`
                SELECT p.partner_id, p.vehicle_type, p.vehicle_number, p.availability_status,
                       u.first_name, u.last_name, u.phone,
                       t.latitude, t.longitude, t.tracking_status, t.tracked_at,
                       r.order_id, r.route_status
                FROM delivery_partners p
                JOIN users u ON p.user_id = u.user_id
                LEFT JOIN (
                    SELECT partner_id, latitude, longitude, tracking_status, tracked_at
                    FROM delivery_tracking
                    WHERE (partner_id, tracked_at) IN (
                        SELECT partner_id, MAX(tracked_at) 
                        FROM delivery_tracking GROUP BY partner_id
                    )
                ) t ON p.partner_id = t.partner_id
                LEFT JOIN routes r ON p.partner_id = r.partner_id AND r.route_status NOT IN ('DELIVERED', 'CANCELLED')
                ORDER BY p.partner_id ASC
            `);
            res.status(200).json(fleetRes.rows);
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
    // GET all orders
    async getOrders(req, res) {
        try {
            const ordersRes = await pool.query(`
                SELECT o.order_id, o.order_number, o.total_amount, o.order_status, o.ordered_at as created_at,
                       u.first_name as customer_name, u.email as customer_email,
                       s.shop_name as store_name,
                       p.payment_status, p.payment_method
                FROM orders o
                JOIN customers c ON o.customer_id = c.customer_id
                JOIN users u ON c.user_id = u.user_id
                JOIN stores s ON o.store_id = s.store_id
                LEFT JOIN payments p ON o.order_id = p.order_id
                ORDER BY o.ordered_at DESC
                LIMIT 100
            `);
            res.status(200).json(ordersRes.rows);
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
    // GET all nodes (stores and drivers)
    async getNodes(req, res) {
        try {
            const storesRes = await pool.query(`
                SELECT s.store_id as id, 'STORE' as type, s.shop_name as name, s.city as location, u.is_active, u.user_id
                FROM stores s
                JOIN store_owners o ON s.owner_id = o.owner_id
                JOIN users u ON o.user_id = u.user_id
            `);
            const driversRes = await pool.query(`
                SELECT p.partner_id as id, 'DRIVER' as type, u.first_name || ' ' || u.last_name as name, p.vehicle_type as location, u.is_active, u.user_id
                FROM delivery_partners p
                JOIN users u ON p.user_id = u.user_id
            `);
            res.status(200).json([...storesRes.rows, ...driversRes.rows]);
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // PUT toggle node status
    async toggleNodeStatus(req, res) {
        try {
            const { id } = req.params; // this is user_id
            const result = await pool.query("UPDATE users SET is_active = NOT is_active WHERE user_id = $1 RETURNING is_active", [id]);
            
            if (result.rows.length > 0 && !result.rows[0].is_active) {
                // If user was just suspended, force them offline so they disappear from active fleets and don't get assigned new orders
                await pool.query("UPDATE delivery_partners SET availability_status = 'OFFLINE' WHERE user_id = $1", [id]);
            }

            res.status(200).json({ success: true, message: "Node status toggled" });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // GET system config
    async getConfig(req, res) {
        try {
            const configRes = await pool.query("SELECT config_value FROM system_config WHERE config_key = 'pricing'");
            if (configRes.rows.length > 0) {
                res.status(200).json(configRes.rows[0].config_value);
            } else {
                res.status(404).json({ success: false, message: "Config not found" });
            }
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // PUT system config
    async updateConfig(req, res) {
        try {
            const { base_delivery_fee, surge_multiplier, platform_commission_percent } = req.body;
            const newConfig = { base_delivery_fee, surge_multiplier, platform_commission_percent };
            await pool.query("UPDATE system_config SET config_value = $1 WHERE config_key = 'pricing'", [newConfig]);
            res.status(200).json({ success: true, message: "Configuration updated" });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = new AdminController();
