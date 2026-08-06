const pool = require("../config/db");

class CatalogController {
    
    // GET all active categories
    async getCategories(req, res) {
        try {
            const result = await pool.query(
                "SELECT category_id AS id, category_name AS name FROM categories WHERE is_active = TRUE ORDER BY category_name"
            );
            const formatted = result.rows.map(row => ({
                id: row.id.toString(),
                name: row.name
            }));
            res.status(200).json(formatted);
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // GET all active products
    async getProducts(req, res) {
        try {
            // Join with categories to get category_name
            const result = await pool.query(`
                SELECT 
                    p.product_id AS id,
                    p.product_name AS name,
                    p.description,
                    p.brand,
                    p.price,
                    p.price AS mrp,
                    p.image_url,
                    p.unit,
                    p.discount_percentage,
                    p.expiry_date,
                    p.category_id AS "categoryId",
                    c.category_name AS "categoryName"
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.category_id
                JOIN inventory i ON i.product_id = p.product_id
                WHERE p.is_available = true AND i.available_quantity > 0
            `);
            
            // Format to match what frontend expects
            const formattedProducts = result.rows.map(row => ({
                id: row.id.toString(),
                name: row.name,
                description: row.description,
                brand: row.brand,
                price: parseFloat(row.price),
                mrp: parseFloat(row.mrp),
                image_url: row.image_url,
                unit: row.unit,
                discount_percentage: parseFloat(row.discount_percentage) || 0,
                expiry_date: row.expiry_date,
                categoryId: row.categoryId?.toString(),
                category: {
                    id: row.categoryId?.toString(),
                    name: row.categoryName
                }
            }));

            res.status(200).json(formattedProducts);
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = new CatalogController();
