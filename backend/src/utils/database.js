const mongoose = require("mongoose");
require('dotenv').config();

const connect = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URL, {
            dbName: "db-kantin",
        });

        return Promise.resolve("Database Berhasil");
    } catch (error) {
        return Promise.reject(error);
    }
};

module.exports = connect;