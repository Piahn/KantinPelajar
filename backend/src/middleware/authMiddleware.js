const jwt = require('jsonwebtoken');
const { UserModel } = require('../models/user.model');
const response = require('../utils/response'); // <-- Import Response utility

// Middleware untuk melindungi route yang membutuhkan otentikasi
const protect = async (req, res, next) => {
    let token;

    if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }

    if (!token) {
        // Gunakan Response.unauthorized untuk konsistensi
        return response.unauthorized(res, 'Tidak terotorisasi, harap login terlebih dahulu.');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await UserModel.findById(decoded.id).select('-password');

        if (!req.user) {
            return response.unauthorized(res, 'Pengguna tidak ditemukan.');
        }

        next();
    } catch (error) {
        return response.unauthorized(res, 'Token tidak valid atau sudah kedaluwarsa.');
    }
};

// Middleware untuk otorisasi berdasarkan role
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return response.unauthorized(res, `Akses ditolak. Role '${req.user.role}' tidak diizinkan.`)
        }
        next();
    };
};

module.exports = { protect, authorize };