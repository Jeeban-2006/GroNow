const pool = require("../config/db");
const { hashPassword, comparePassword } = require("../utils/passwordHasher");
const { generateToken } = require("../utils/jwt");

class AuthService {

    // ==========================
    // REGISTER USER
    // ==========================
    async register(userData) {

        const {
            name,
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
            (name,email,phone,password,role)
            VALUES($1,$2,$3,$4,$5)
            RETURNING *`,

            [
                name,
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
                `INSERT INTO customers(user_id)
                VALUES($1)`,
                [user.user_id]
            );

        }

        else if (role === "STORE_OWNER"){

            await pool.query(
                `INSERT INTO store_owners(user_id)
                VALUES($1)`,
                [user.user_id]
            );

        }

        else if (role === "DELIVERY_PARTNER"){

            await pool.query(

                `INSERT INTO delivery_partners
                (user_id,availability)
                VALUES($1,true)`,

                [user.user_id]
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