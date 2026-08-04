const pool = require("../config/db");

class InventoryController {
    
    // GET inventory for the store
    async getInventory(req, res) {
        try {
            const user_id = req.user.user_id;
            
            // Get store ID
            const storeRes = await pool.query("SELECT store_id FROM stores WHERE owner_id = (SELECT owner_id FROM store_owners WHERE user_id = $1)", [user_id]);
            if (storeRes.rows.length === 0) return res.status(200).json([]);
            const store_id = storeRes.rows[0].store_id;

            // Get all products and their inventory for this store
            const invRes = await pool.query(`
                SELECT i.inventory_id, i.available_quantity, i.stock_status, p.product_id, p.product_name, p.price, p.sku, p.unit
                FROM inventory i
                JOIN products p ON i.product_id = p.product_id
                WHERE p.store_id = $1
                ORDER BY p.product_name ASC
            `, [store_id]);

            res.status(200).json(invRes.rows);
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // PUT update inventory quantity
    async updateInventory(req, res) {
        try {
            const { id } = req.params; // inventory_id
            const { available_quantity } = req.body;
            const user_id = req.user.user_id;

            // Verify ownership
            const storeRes = await pool.query("SELECT store_id FROM stores WHERE owner_id = (SELECT owner_id FROM store_owners WHERE user_id = $1)", [user_id]);
            if (storeRes.rows.length === 0) return res.status(403).json({ success: false, message: "Unauthorized" });
            const store_id = storeRes.rows[0].store_id;

            const checkRes = await pool.query(`
                SELECT p.store_id FROM inventory i
                JOIN products p ON i.product_id = p.product_id
                WHERE i.inventory_id = $1
            `, [id]);
            
            if (checkRes.rows.length === 0 || checkRes.rows[0].store_id !== store_id) {
                return res.status(403).json({ success: false, message: "Unauthorized" });
            }

            // Calculate stock status
            let stock_status = 'IN_STOCK';
            if (available_quantity === 0) stock_status = 'OUT_OF_STOCK';
            else if (available_quantity < 10) stock_status = 'LOW_STOCK'; // 10 is default reorder_level

            const updated = await pool.query(`
                UPDATE inventory 
                SET available_quantity = $1, stock_status = $2, last_updated = CURRENT_TIMESTAMP
                WHERE inventory_id = $3 RETURNING *
            `, [available_quantity, stock_status, id]);

            res.status(200).json({ success: true, inventory: updated.rows[0] });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = new InventoryController();
