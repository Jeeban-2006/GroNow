const { Client } = require('pg');

async function mergeCategories() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        await client.query('BEGIN');

        console.log("Merging categories 1 & 2 into 11 (Fruits & Vegetables)");
        await client.query('UPDATE products SET category_id = 11 WHERE category_id IN (1, 2)');
        
        console.log("Merging categories 7 & 10 into 3 (Dairy & Bakery)");
        await client.query('UPDATE products SET category_id = 3 WHERE category_id IN (7, 10)');

        console.log("Deactivating old categories");
        await client.query('UPDATE categories SET is_active = FALSE WHERE category_id IN (1, 2, 7, 10)');

        await client.query('COMMIT');
        console.log("Migration successful!");
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Migration failed:", err);
    } finally {
        await client.end();
    }
}

mergeCategories();
