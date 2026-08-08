const { verifyToken } = require("../utils/jwt");
const pool = require("../config/db");

const authMiddleware = async (req, res, next) => {

    try {

        const authHeader = req.headers.authorization;

        if (!authHeader) {

            return res.status(401).json({
                success: false,
                message: "Access Denied. No Token Provided."
            });

        }

        const token = authHeader.split(" ")[1];

        if (!token) {

            return res.status(401).json({
                success: false,
                message: "Invalid Token Format."
            });

        }

        const decoded = verifyToken(token);

        // Check if user is still active in the database
        const userCheck = await pool.query("SELECT is_active FROM users WHERE user_id = $1", [decoded.user_id]);
        
        if (userCheck.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: "User not found."
            });
        }
        
        if (userCheck.rows[0].is_active === false) {
            return res.status(403).json({
                success: false,
                message: "Your account has been suspended by the administrator."
            });
        }

        req.user = decoded;

        next();

    } catch (error) {

        return res.status(401).json({
            success: false,
            message: "Invalid or Expired Token."
        });

    }

};

module.exports = authMiddleware;