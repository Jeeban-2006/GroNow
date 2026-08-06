const pool = require("../config/db");

class ProductController {

    // GET products for the logged-in store owner
    async getStoreProducts(req, res) {
        try {
            const user_id = req.user.user_id;

            // Get store_id for this user
            const storeRes = await pool.query("SELECT store_id FROM stores WHERE owner_id = (SELECT owner_id FROM store_owners WHERE user_id = $1)", [user_id]);
            
            if (storeRes.rows.length === 0) {
                return res.status(200).json([]); // No store created yet
            }

            const store_id = storeRes.rows[0].store_id;

            const productsRes = await pool.query(`
                SELECT p.*, c.category_name 
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.category_id
                WHERE p.store_id = $1
                ORDER BY p.created_at DESC
            `, [store_id]);

            res.status(200).json(productsRes.rows);
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // POST a new product
    async addProduct(req, res) {
        try {
            const user_id = req.user.user_id;
            const { category_id, product_name, description, unit, price, sku, expiry_date } = req.body;

            const storeRes = await pool.query("SELECT store_id FROM stores WHERE owner_id = (SELECT owner_id FROM store_owners WHERE user_id = $1)", [user_id]);
            if (storeRes.rows.length === 0) return res.status(403).json({ success: false, message: "Create a store profile first." });
            const store_id = storeRes.rows[0].store_id;

            const newProduct = await pool.query(`
                INSERT INTO products (store_id, category_id, product_name, description, unit, price, sku, expiry_date)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
            `, [store_id, category_id, product_name, description, unit, price, sku || null, expiry_date || null]);

            // Auto-insert inventory
            await pool.query("INSERT INTO inventory (product_id, available_quantity) VALUES ($1, 0)", [newProduct.rows[0].product_id]);

            res.status(201).json({ success: true, product: newProduct.rows[0] });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // PUT update a product (price, name, etc)
    async updateProduct(req, res) {
        try {
            const user_id = req.user.user_id;
            const { id } = req.params; // product_id
            const { product_name, price, unit, description, discount_percentage, expiry_date } = req.body;

            // Verify ownership
            const storeRes = await pool.query("SELECT store_id FROM stores WHERE owner_id = (SELECT owner_id FROM store_owners WHERE user_id = $1)", [user_id]);
            if (storeRes.rows.length === 0) return res.status(403).json({ success: false, message: "Unauthorized" });
            const store_id = storeRes.rows[0].store_id;

            const check = await pool.query('SELECT product_id FROM products WHERE product_id = $1 AND store_id = $2', [id, store_id]);
            if (check.rows.length === 0) return res.status(403).json({ success: false, message: "Product not found or unauthorized" });

            const updated = await pool.query(`
                UPDATE products SET
                    product_name = COALESCE($1, product_name),
                    price = COALESCE($2, price),
                    unit = COALESCE($3, unit),
                    description = COALESCE($4, description),
                    discount_percentage = COALESCE($5, discount_percentage),
                    expiry_date = COALESCE($6, expiry_date),
                    updated_at = CURRENT_TIMESTAMP
                WHERE product_id = $7 AND store_id = $8
                RETURNING *
            `, [product_name, price, unit, description, discount_percentage, expiry_date || null, id, store_id]);

            res.status(200).json({ success: true, product: updated.rows[0] });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // DELETE a product
    async deleteProduct(req, res) {
        try {
            const user_id = req.user.user_id;
            const { id } = req.params;
            const storeRes = await pool.query("SELECT store_id FROM stores WHERE owner_id = (SELECT owner_id FROM store_owners WHERE user_id = $1)", [user_id]);
            if (storeRes.rows.length === 0) return res.status(403).json({ success: false, message: "Unauthorized" });
            const store_id = storeRes.rows[0].store_id;
            await pool.query('DELETE FROM inventory WHERE product_id = $1', [id]);
            await pool.query('DELETE FROM products WHERE product_id = $1 AND store_id = $2', [id, store_id]);
            res.status(200).json({ success: true });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = new ProductController();
