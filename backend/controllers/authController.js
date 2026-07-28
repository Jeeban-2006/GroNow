const authService = require("../services/authService");
const { registerSchema, loginSchema } = require("../validations/authValidation");

class AuthController {

    // ==========================
    // REGISTER
    // ==========================

    async register(req, res) {

        try {

            // Validate Request
            const { error } = registerSchema.validate(req.body);

            if (error) {
                return res.status(400).json({
                    success: false,
                    message: error.details[0].message
                });
            }

            const result = await authService.register(req.body);

            return res.status(201).json({
                success: true,
                message: "User Registered Successfully",
                token: result.token,
                user: result.user
            });

        } catch (error) {

            return res.status(400).json({
                success: false,
                message: error.message
            });

        }

    }

    // ==========================
    // LOGIN
    // ==========================

    async login(req, res) {

        try {

            // Validate Request
            const { error } = loginSchema.validate(req.body);

            if (error) {
                return res.status(400).json({
                    success: false,
                    message: error.details[0].message
                });
            }

            const { email, password } = req.body;

            const result = await authService.login(email, password);

            return res.status(200).json({
                success: true,
                message: "Login Successful",
                token: result.token,
                user: result.user
            });

        } catch (error) {

            return res.status(401).json({
                success: false,
                message: error.message
            });

        }

    }

}

module.exports = new AuthController();