const pool = require("../config/db");

class DeliveryController {

    // GET driver assignments
    async getAssignments(req, res) {
        try {
            const user_id = req.user.user_id;

            // Get partner ID
            const partnerRes = await pool.query("SELECT partner_id FROM delivery_partners WHERE user_id = $1", [user_id]);
            if (partnerRes.rows.length === 0) return res.status(200).json([]);
            const partner_id = partnerRes.rows[0].partner_id;

            const assignmentsRes = await pool.query(`
                SELECT r.route_id, r.route_status, r.pickup_latitude, r.pickup_longitude, r.delivery_latitude, r.delivery_longitude, r.waypoints,
                       o.order_id, o.order_number, o.total_amount, o.order_status,
                       c.address as customer_address, c.city as customer_city, u.first_name as customer_name
                FROM routes r
                JOIN orders o ON r.order_id = o.order_id
                JOIN customers c ON o.customer_id = c.customer_id
                JOIN users u ON c.user_id = u.user_id
                WHERE r.partner_id = $1 AND r.route_status NOT IN ('DELIVERED', 'CANCELLED')
            `, [partner_id]);

            res.status(200).json(assignmentsRes.rows);
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // PUT update delivery status
    async updateStatus(req, res) {
        try {
            const user_id = req.user.user_id;
            const { order_id, status } = req.body;
            
            const partnerRes = await pool.query("SELECT partner_id FROM delivery_partners WHERE user_id = $1", [user_id]);
            if (partnerRes.rows.length === 0) return res.status(403).json({ success: false, message: "Unauthorized" });
            const partner_id = partnerRes.rows[0].partner_id;

            // Validate status transition
            const validRouteStatuses = ['ASSIGNED', 'PICKED_UP', 'ON_THE_WAY', 'DELIVERED'];
            const orderStatusMap = {
                'PICKED_UP': 'PACKING',
                'ON_THE_WAY': 'OUT_FOR_DELIVERY',
                'DELIVERED': 'DELIVERED'
            };

            if (!validRouteStatuses.includes(status)) {
                return res.status(400).json({ success: false, message: "Invalid status" });
            }

            await pool.query(`
                UPDATE routes SET route_status = $1 WHERE order_id = $2 AND partner_id = $3
            `, [status, order_id, partner_id]);

            if (orderStatusMap[status]) {
                await pool.query(`
                    UPDATE orders SET order_status = $1 WHERE order_id = $2
                `, [orderStatusMap[status], order_id]);
            }

            res.status(200).json({ success: true, message: "Status updated" });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // POST delivery tracking telemetry
    async postTracking(req, res) {
        try {
            const user_id = req.user.user_id;
            const { order_id, latitude, longitude, tracking_status } = req.body;

            const partnerRes = await pool.query("SELECT partner_id FROM delivery_partners WHERE user_id = $1", [user_id]);
            if (partnerRes.rows.length === 0) return res.status(403).json({ success: false, message: "Unauthorized" });
            const partner_id = partnerRes.rows[0].partner_id;

            const updateRes = await pool.query(`
                UPDATE delivery_tracking 
                SET latitude = $1, longitude = $2, tracking_status = $3, tracked_at = CURRENT_TIMESTAMP
                WHERE order_id = $4 AND partner_id = $5
                RETURNING tracking_id
            `, [latitude, longitude, tracking_status || 'ON_THE_WAY', order_id, partner_id]);

            if (updateRes.rows.length === 0) {
                await pool.query(`
                    INSERT INTO delivery_tracking (order_id, partner_id, latitude, longitude, tracking_status, tracked_at)
                    VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
                `, [order_id, partner_id, latitude, longitude, tracking_status || 'ON_THE_WAY']);
            }

            res.status(201).json({ success: true });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // GET driver stats - today, weekly, total
    async getStats(req, res) {
        try {
            const user_id = req.user.user_id;

            const partnerRes = await pool.query("SELECT partner_id, rating, total_deliveries FROM delivery_partners WHERE user_id = $1", [user_id]);
            if (partnerRes.rows.length === 0) return res.status(200).json({ today: { trips: 0, earnings: 0 }, week: { trips: 0, earnings: 0 }, total: { trips: 0, earnings: 0 }, rating: 0, trips: 0, earnings: 0 });
            const partner_id = partnerRes.rows[0].partner_id;
            const rating = parseFloat(partnerRes.rows[0].rating) || 4.8;

            const todayRes = await pool.query(`
                SELECT COUNT(*) as trips, COALESCE(SUM(o.total_amount * 0.1), 0) as earnings 
                FROM routes r 
                JOIN orders o ON r.order_id = o.order_id 
                WHERE r.partner_id = $1 AND r.route_status = 'DELIVERED'
                AND o.ordered_at >= CURRENT_DATE
            `, [partner_id]);

            const weekRes = await pool.query(`
                SELECT COUNT(*) as trips, COALESCE(SUM(o.total_amount * 0.1), 0) as earnings 
                FROM routes r 
                JOIN orders o ON r.order_id = o.order_id 
                WHERE r.partner_id = $1 AND r.route_status = 'DELIVERED'
                AND o.ordered_at >= CURRENT_DATE - INTERVAL '7 days'
            `, [partner_id]);

            const totalRes = await pool.query(`
                SELECT COUNT(*) as trips, COALESCE(SUM(o.total_amount * 0.1), 0) as earnings 
                FROM routes r 
                JOIN orders o ON r.order_id = o.order_id 
                WHERE r.partner_id = $1 AND r.route_status = 'DELIVERED'
            `, [partner_id]);

            const today = { trips: parseInt(todayRes.rows[0].trips) || 0, earnings: parseFloat(todayRes.rows[0].earnings) || 0 };
            const week = { trips: parseInt(weekRes.rows[0].trips) || 0, earnings: parseFloat(weekRes.rows[0].earnings) || 0 };
            const total = { trips: parseInt(totalRes.rows[0].trips) || 0, earnings: parseFloat(totalRes.rows[0].earnings) || 0 };
            
            // Keep backward-compat fields
            res.status(200).json({ today, week, total, rating, trips: today.trips, earnings: today.earnings });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // PUT driver availability
    async updateAvailability(req, res) {
        try {
            const user_id = req.user.user_id;
            const { availability_status } = req.body;

            const partnerRes = await pool.query("SELECT partner_id FROM delivery_partners WHERE user_id = $1", [user_id]);
            if (partnerRes.rows.length === 0) return res.status(403).json({ success: false, message: "Unauthorized" });
            const partner_id = partnerRes.rows[0].partner_id;

            await pool.query(`UPDATE delivery_partners SET availability_status = $1 WHERE partner_id = $2`, [availability_status, partner_id]);

            res.status(200).json({ success: true, message: "Availability updated" });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = new DeliveryController();
