const pool = require('./config/db');
const bcrypt = require('bcrypt');
(async () => {
    try {
        const hash = await bcrypt.hash('password123', 10);
        await pool.query("UPDATE users SET password = $1 WHERE email = 'superstore2@gronow.com'", [hash]);
        console.log("Password reset successfully");
    } catch(e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
})();
