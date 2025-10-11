const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Routing
const database = require('./src/utils/database')

async function init() {
    try {
        const result = await database()

        const app = express();
        app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
        app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
        app.use(express.json());
        app.use(cookieParser());
        app.use('/public', express.static('public'));

        // Route
        app.get("/", (req, res) => {
            res.status(200).json({
                message: "Server Is Running",
                data: null,
            });
        });

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