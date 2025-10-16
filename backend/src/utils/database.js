const mongoose = require("mongoose");
require('dotenv').config();

const connect = async () => {
    try {
        const isProduction = process.env.NODE_ENV === 'production';

        const connectionString = isProduction
            ? process.env.DATABASE_URL_SRV   // Jika production, pakai SRV
            : process.env.DATABASE_URL_STD;  // Jika development, pakai Standar

        if (!connectionString) {
            console.error("Kesalahan: URL Database tidak disetel untuk mode saat ini.");
            throw new Error("URL Database tidak ditemukan di file .env");
        }

        console.log(`Menjalankan dalam mode: ${isProduction ? 'Production' : 'Development'}`);
        console.log("Mencoba terhubung ke database...");

        await mongoose.connect(connectionString, {
            dbName: "db-kantin",
        });

        console.log("Database berhasil terhubung!");
        return Promise.resolve("Database Berhasil");

    } catch (error) {
        console.error("Koneksi database gagal:", error.message);
        return Promise.reject(error);
    }
};

module.exports = connect;