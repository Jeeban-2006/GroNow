const storeService = require("../services/storeService");
const { createStoreSchema } = require("../validations/storeValidation");


class StoreController {

    // ==========================
    // CREATE STORE
    // ==========================

    async createStore(req, res) {

        try {
             // Validate Request Body
            const { error } = createStoreSchema.validate(req.body);

            if (error) {

                return res.status(400).json({

                    success: false,

                    message: error.details[0].message

                });

            }

            //Create Store
            const store = await storeService.createStore(
                req.user.user_id,
                req.body
            );

            return res.status(201).json({

                success: true,

                message: "Store created successfully.",

                data: store

            });

        }

        catch (error) {

            return res.status(400).json({

                success: false,

                message: error.message

            });

        }

    }

}

module.exports = new StoreController();