const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// Routing
const database = require('./src/utils/database')
const router = require('./src/routes/index')

async function init() {
    try {
        const result = await database()

        const app = express();
        app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
        app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
        app.use(express.json());
        app.use(cookieParser());
        app.use(express.static('public'));

        // Route
        app.get("/", (req, res) => {
            res.status(200).json({
                success: true,
                message: "Kantin Pelajar API Server is Running",
                version: "1.0.0",
                endpoints: {
                    auth: {
                        register: "POST /api/auth/register",
                        login: "POST /api/auth/login",
                        me: "GET /api/auth/me",
                        logout: "GET /api/auth/logout",
                        updateProfile: "PUT /api/auth/update-profile",
                        changePassword: "PUT /api/auth/change-password",
                        uploadAvatar: "POST /api/auth/upload-avatar"
                    },
                    users: {
                        getAll: "GET /api/users",
                        getById: "GET /api/users/:id",
                        update: "PUT /api/users/:id",
                        delete: "DELETE /api/users/:id",
                        stats: "GET /api/users/stats"
                    }
                },
                data: null,
            });
        });

        app.use("/api", router);

        const PORT = process.env.PORT || 9495
        app.listen(PORT, () => {
            console.log(`Server is Running on http://localhost:${PORT}`);
            console.log("database status: ", result);
        });
    } catch (error) {
        console.log(error)
    }
}

init()