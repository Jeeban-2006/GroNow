const storeService = require("../services/storeService");
const { createStoreSchema } = require("../validations/storeValidation");

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

class StoreController {

    // ==========================
    // CREATE STORE
    // ==========================

    async createStore(req, res) {

        try {
             // Validate Request Body
            const { error } = createStoreSchema.validate(req.body);

            if (error) {

                return res.status(400).json({

                    success: false,

                    message: error.details[0].message

                });

            }

            //Create Store
            const store = await storeService.createStore(
                req.user.user_id,
                req.body
            );

            return res.status(201).json({

                success: true,

                message: "Store created successfully.",

                data: store

            });

        }

        catch (error) {

            return res.status(400).json({

                success: false,

                message: error.message

            });

        }

    }

    // GET store profile check
    async getStoreProfile(req, res) {
        try {
            const pool = require("../config/db");
            const user_id = req.user.user_id;

            const storeRes = await pool.query("SELECT * FROM stores WHERE owner_id = (SELECT owner_id FROM store_owners WHERE user_id = $1)", [user_id]);
            if (storeRes.rows.length === 0) {
                return res.status(200).json({ hasStore: false });
            }

            return res.status(200).json({ hasStore: true, store: storeRes.rows[0] });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // PUT store profile update
    async updateStoreProfile(req, res) {
        try {
            const pool = require("../config/db");
            const user_id = req.user.user_id;
            const { shop_name, description, address, city, state, pincode, contact_number, latitude, longitude, opening_time, closing_time } = req.body;

            const storeRes = await pool.query("SELECT store_id FROM stores WHERE owner_id = (SELECT owner_id FROM store_owners WHERE user_id = $1)", [user_id]);
            if (storeRes.rows.length === 0) return res.status(404).json({ success: false, message: "Store not found" });
            const store_id = storeRes.rows[0].store_id;

            await pool.query(
                `UPDATE stores SET 
                 shop_name = $1, description = $2, address = $3, city = $4, state = $5, pincode = $6, 
                 contact_number = $7, latitude = $8, longitude = $9, opening_time = $10, closing_time = $11, updated_at = CURRENT_TIMESTAMP
                 WHERE store_id = $12`,
                [shop_name, description, address, city, state, pincode, contact_number, latitude, longitude, opening_time, closing_time, store_id]
            );

            res.status(200).json({ success: true, message: "Store profile updated successfully" });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // GET active orders for the store
    async getActiveOrders(req, res) {
        try {
            const pool = require("../config/db");
            const user_id = req.user.user_id;

            const storeRes = await pool.query("SELECT store_id FROM stores WHERE owner_id = (SELECT owner_id FROM store_owners WHERE user_id = $1)", [user_id]);
            if (storeRes.rows.length === 0) return res.status(200).json([]);
            const store_id = storeRes.rows[0].store_id;

            const ordersRes = await pool.query(`
                SELECT o.order_id, o.order_number, o.total_amount, o.order_status, o.ordered_at,
                       c.address, c.city, u.first_name, u.last_name,
                       json_agg(
                           json_build_object(
                               'product_name', p.product_name,
                               'quantity', oi.quantity,
                               'price', oi.price
                           )
                       ) as items
                FROM orders o
                JOIN customers c ON o.customer_id = c.customer_id
                JOIN users u ON c.user_id = u.user_id
                JOIN order_items oi ON o.order_id = oi.order_id
                JOIN products p ON oi.product_id = p.product_id
                WHERE p.store_id = $1 AND o.order_status NOT IN ('DELIVERED', 'CANCELLED')
                GROUP BY o.order_id, c.address, c.city, u.first_name, u.last_name
                ORDER BY o.ordered_at DESC
            `, [store_id]);

            res.status(200).json(ordersRes.rows);
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // GET past orders for the store
    async getPastOrders(req, res) {
        try {
            const pool = require("../config/db");
            const user_id = req.user.user_id;

            const storeRes = await pool.query("SELECT store_id FROM stores WHERE owner_id = (SELECT owner_id FROM store_owners WHERE user_id = $1)", [user_id]);
            if (storeRes.rows.length === 0) return res.status(200).json([]);
            const store_id = storeRes.rows[0].store_id;

            const ordersRes = await pool.query(`
                SELECT o.order_id, o.order_number, o.total_amount, o.order_status, o.ordered_at,
                       c.address, c.city, u.first_name, u.last_name,
                       json_agg(
                           json_build_object(
                               'product_name', p.product_name,
                               'quantity', oi.quantity,
                               'price', oi.price
                           )
                       ) as items
                FROM orders o
                JOIN customers c ON o.customer_id = c.customer_id
                JOIN users u ON c.user_id = u.user_id
                JOIN order_items oi ON o.order_id = oi.order_id
                JOIN products p ON oi.product_id = p.product_id
                WHERE p.store_id = $1 AND o.order_status IN ('DELIVERED', 'CANCELLED')
                GROUP BY o.order_id, c.address, c.city, u.first_name, u.last_name
                ORDER BY o.ordered_at DESC
                LIMIT 50
            `, [store_id]);

            res.status(200).json(ordersRes.rows);
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // UPDATE order status
    async updateOrderStatus(req, res) {
        try {
            const pool = require("../config/db");
            const user_id = req.user.user_id;
            const order_id = req.params.id;
            const { status } = req.body;

            const validStatuses = ['PLACED', 'CONFIRMED', 'PACKING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ success: false, message: "Invalid status" });
            }

            // Verify store ownership
            const storeRes = await pool.query("SELECT store_id FROM stores WHERE owner_id = (SELECT owner_id FROM store_owners WHERE user_id = $1)", [user_id]);
            if (storeRes.rows.length === 0) return res.status(403).json({ success: false, message: "Unauthorized" });
            const store_id = storeRes.rows[0].store_id;

            // Update status only if order contains items belonging to store
            const updateRes = await pool.query(`
                UPDATE orders 
                SET order_status = $1 
                WHERE order_id = $2 AND order_id IN (
                    SELECT oi.order_id FROM order_items oi
                    JOIN products p ON oi.product_id = p.product_id
                    WHERE p.store_id = $3
                )
                RETURNING *
            `, [status, order_id, store_id]);

            if (updateRes.rows.length === 0) {
                return res.status(404).json({ success: false, message: "Order not found or not assigned to your store" });
            }

            // If status is PACKING, auto-assign a driver if not already assigned
            if (status === 'PACKING') {
                const routeCheck = await pool.query("SELECT route_id FROM routes WHERE order_id = $1", [order_id]);
                if (routeCheck.rows.length === 0) {
                    const driverRes = await pool.query("SELECT partner_id FROM delivery_partners WHERE availability_status = 'AVAILABLE' LIMIT 1");
                    if (driverRes.rows.length > 0) {
                        const partner_id = driverRes.rows[0].partner_id;
                        
                        // Find all unique stores for this order
                        const oiRes = await pool.query("SELECT DISTINCT p.store_id FROM order_items oi JOIN products p ON oi.product_id = p.product_id WHERE oi.order_id = $1", [order_id]);
                        const storeIdsArray = oiRes.rows.map(r => r.store_id);
                        
                        let unsortedPickups = [];
                        if (storeIdsArray.length > 0) {
                            const placeholders = storeIdsArray.map((_, i) => `$${i + 1}`).join(',');
                            const storeCoords = await pool.query(`SELECT store_id, shop_name, latitude, longitude FROM stores WHERE store_id IN (${placeholders})`, storeIdsArray);
                            unsortedPickups = storeCoords.rows.map(s => {
                                const sLat = parseFloat(s.latitude);
                                const sLng = parseFloat(s.longitude);
                                return {
                                    type: 'pickup',
                                    store_id: s.store_id,
                                    name: s.shop_name,
                                    lat: isNaN(sLat) ? 20.296059 : sLat,
                                    lng: isNaN(sLng) ? 85.824539 : sLng
                                };
                            });
                        }
                        
                        let currentLat = 20.296059;
                        let currentLon = 85.824539;

                        const waypoints = [];
                        while (unsortedPickups.length > 0) {
                            let nearestIdx = 0;
                            let minDistance = Infinity;
                            for (let i = 0; i < unsortedPickups.length; i++) {
                                const dist = haversineDistance(currentLat, currentLon, unsortedPickups[i].lat, unsortedPickups[i].lng);
                                if (dist < minDistance) {
                                    minDistance = dist;
                                    nearestIdx = i;
                                }
                            }
                            const nearestStore = unsortedPickups.splice(nearestIdx, 1)[0];
                            waypoints.push(nearestStore);
                            currentLat = nearestStore.lat;
                            currentLon = nearestStore.lng;
                        }

                        const cLat = currentLat + 0.01;
                        const cLon = currentLon + 0.01;
                        waypoints.push({
                            type: 'dropoff',
                            name: 'Customer Dropoff',
                            lat: isNaN(cLat) ? 20.306059 : cLat,
                            lng: isNaN(cLon) ? 85.834539 : cLon
                        });

                        const sLat = waypoints.length > 0 ? waypoints[0].lat : 20.296059;
                        const sLon = waypoints.length > 0 ? waypoints[0].lng : 85.824539;

                        await pool.query(
                            `INSERT INTO routes (order_id, partner_id, pickup_latitude, pickup_longitude, delivery_latitude, delivery_longitude, route_status, waypoints)
                             VALUES ($1, $2, $3, $4, $5, $6, 'ASSIGNED', $7)`,
                            [order_id, partner_id, sLat, sLon, cLat, cLon, JSON.stringify(waypoints)]
                        );
                        await pool.query(`UPDATE orders SET partner_id = $1 WHERE order_id = $2`, [partner_id, order_id]);
                    }
                }
            }

            res.status(200).json({ success: true, message: "Status updated successfully", order: updateRes.rows[0] });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = new StoreController();