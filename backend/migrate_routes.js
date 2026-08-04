const pool = require("./config/db");

async function runMigration() {
    try {
        console.log("Adding waypoints JSONB column to routes table...");
        await pool.query(`
            ALTER TABLE routes 
            ADD COLUMN IF NOT EXISTS waypoints JSONB DEFAULT '[]'::jsonb;
        `);
        console.log("Successfully added waypoints to routes.");

        console.log("Making store_id nullable in orders table...");
        await pool.query(`
            ALTER TABLE orders 
            ALTER COLUMN store_id DROP NOT NULL;
        `);
        console.log("Successfully made store_id nullable.");

        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
}

runMigration();
