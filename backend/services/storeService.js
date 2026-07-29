const pool = require("../config/db");

class StoreService {

    // ==========================
    // CREATE STORE
    // ==========================

    async createStore(userId, storeData) {

        // Find owner_id from logged-in user
        const ownerResult = await pool.query(
            `SELECT owner_id
             FROM store_owners
             WHERE user_id = $1`,
            [userId]
        );

        if (ownerResult.rows.length === 0) {
            throw new Error("Store owner not found.");
        }

        const ownerId = ownerResult.rows[0].owner_id;

        // Check if owner already has a store
        const existingStore = await pool.query(
            `SELECT *
             FROM stores
             WHERE owner_id = $1`,
            [ownerId]
        );

        if (existingStore.rows.length > 0) {
            throw new Error("You have already registered a store.");
        }

        // Insert new store
        const result = await pool.query(
            `INSERT INTO stores
            (
                owner_id,
                shop_name,
                description,
                address,
                city,
                state,
                pincode,
                latitude,
                longitude,
                opening_time,
                closing_time,
                contact_number
            )
            VALUES
            (
                $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12
            )
            RETURNING *`,
            [
                ownerId,
                storeData.shop_name,
                storeData.description,
                storeData.address,
                storeData.city,
                storeData.state,
                storeData.pincode,
                storeData.latitude,
                storeData.longitude,
                storeData.opening_time,
                storeData.closing_time,
                storeData.contact_number
            ]
        );

        return result.rows[0];
    }

}

module.exports = new StoreService();