const { Client } = require('pg');
async function fixRoutes() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });
    await client.connect();
    try {
        await client.query("ALTER TABLE routes ADD COLUMN IF NOT EXISTS waypoints JSONB;");
        console.log("Added waypoints column to routes table successfully!");
    } catch (e) {
        console.error("Error:", e.message);
    }
    await client.end();
}
fixRoutes();
