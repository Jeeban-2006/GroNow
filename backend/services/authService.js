const pool = require("../config/db");
const { hashPassword, comparePassword } = require("../utils/passwordHasher");
const { generateToken } = require("../utils/jwt");

class AuthService {

    // ==========================
    // REGISTER USER
    // ==========================
    async register(userData) {

        const {
            first_name,
            last_name,
            email,
            phone,
            password,
            role
        } = userData;

        // Check if email already exists
        const existingUser = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (existingUser.rows.length > 0) {
            throw new Error("Email already exists");
        }

        // Check phone number
        const existingPhone = await pool.query(
            "SELECT * FROM users WHERE phone = $1",
            [phone]
        );

        if (existingPhone.rows.length > 0) {
            throw new Error("Phone number already exists");
        }

        // Encrypt Password
        const hashedPassword = await hashPassword(password);

        // Insert User
        const userResult = await pool.query(

            `INSERT INTO users
            (first_name,last_name,email,phone,password,role)
            VALUES($1,$2,$3,$4,$5,$6)
            RETURNING *`,

            [
                first_name,
                last_name,
                email,
                phone,
                hashedPassword,
                role
            ]
        );

        const user = userResult.rows[0];
        delete user.password;

        // Insert into role table

        if (role === "CUSTOMER") {
            await pool.query(
                `INSERT INTO customers(user_id, address, city, state, pincode)
                VALUES($1, 'Please update address', 'Update City', 'Update State', '000000')`,
                [user.user_id]
            );
        }
        else if (role === "STORE_OWNER"){
            await pool.query(
                `INSERT INTO store_owners(user_id, business_name)
                VALUES($1, 'My Store')`,
                [user.user_id]
            );
        }
        else if (role === "DELIVERY"){
            const randomSuffix = Math.floor(1000 + Math.random() * 9000);
            await pool.query(
                `INSERT INTO delivery_partners
                (user_id, vehicle_type, vehicle_number, driving_license, availability_status)
                VALUES($1, 'BIKE', $2, $3, 'AVAILABLE')`,
                [user.user_id, `XX-00-${randomSuffix}`, `DL-${randomSuffix}`]
            );
        }

        // Generate Token

        const token = generateToken(user);

        return {

            token,

            user

        };

    }

    // ==========================
// LOGIN
// ==========================

async login(email, password) {

    const result = await pool.query(
        `SELECT * FROM users WHERE email = $1`,
        [email]
    );

    if (result.rows.length === 0) {
        throw new Error("Invalid Email or Password");
    }

    const user = result.rows[0];

    const isMatch = await comparePassword(password, user.password);

    if (!isMatch) {
        throw new Error("Invalid Email or Password");
    }

    const token = generateToken(user);

    delete user.password;

    return {
        token,
        user
    };
}
        }


module.exports = new AuthService();