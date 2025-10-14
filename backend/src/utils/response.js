const mongoose = require('mongoose');
const yup = require('yup');
const { generateToken } = require('./jwt');

module.exports = {
    /**
     * Mengirim respons sukses (200 OK)
     * @param {object} res - Objek respons Express
     * @param {any} data - Data yang akan dikirim
     * @param {string} message - Pesan sukses
     */
    success(res, data, message) {
        res.status(200).json({
            meta: {
                status: 200,
                message: message || 'Success',
            },
            data,
        });
    },

    /**
     * Mengirim respons sukses untuk otentikasi 
     * @param {object} res - Objek respons Express
     * @param {any} data - Data yang akan dikirim
     * @param {string} message - Pesan sukses
     */
    authSuccess(res, user, message) {
        const token = generateToken(user);

        const options = {
            expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
            httpOnly: true,
        };

        if (process.env.NODE_ENV === 'production') {
            options.secure = true;
        }

        // Hapus password dari data user sebelum dikirim
        const userData = user.toObject();
        delete userData.password;

        res.cookie('token', token, options);

        // Panggil method success standar untuk mengirim respons
        this.success(res, userData, message);
    },


    /**
     * Mengirim respons error (500, 400, dll.)
     * @param {object} res - Objek respons Express
     * @param {Error} error - Objek error yang ditangkap
     * @param {string} [message] - Pesan error kustom
     */
    error(res, error, message) {
        // Handle Yup Validation Error
        if (error instanceof yup.ValidationError) {
            return res.status(400).json({
                meta: {
                    status: 400,
                    message: message || 'Data tidak valid',
                },
                // Mengambil path field yang error dan pesannya
                errors: {
                    [`${error.path}`]: error.errors[0],
                },
            });
        }

        // Handle Mongoose Error
        if (error instanceof mongoose.Error) {
            return res.status(500).json({
                meta: {
                    status: 500,
                    message: message || error.message,
                },
                error: error.name,
            });
        }

        // Handle Mongoose Duplicate Key Error (kode 11000)
        if (error?.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            const msg = `Nilai untuk field '${field}' sudah ada. Harap gunakan nilai lain.`;
            return res.status(400).json({
                meta: {
                    status: 400,
                    message: msg
                },
            });
        }

        // Handle error umum
        res.status(500).json({
            meta: {
                status: 500,
                message: message || 'Terjadi kesalahan pada server',
            },
            error: error.message,
        });
    },

    /**
     * Mengirim respons Bad Request (400) untuk error validasi atau input
     * @param {object} res - Objek respons Express
     * @param {string} message - Pesan error
     */
    badRequest(res, message) {
        res.status(400).json({
            meta: {
                status: 400,
                message: message || 'Bad Request',
            },
        });
    },


    /**
     * Mengirim respons Not Found (404)
     * @param {object} res - Objek respons Express
     * @param {string} [message] - Pesan
     */
    notFound(res, message) {
        res.status(404).json({
            meta: {
                status: 404,
                message: message || 'Not Found',
            },
            data: null,
        });
    },

    /**
     * Mengirim respons Unauthorized (401)
     * @param {object} res - Objek respons Express
     * @param {string} [message] - Pesan
     */
    unauthorized(res, message) {
        res.status(403).json({
            meta: {
                status: 403,
                message: message || 'Unauthorized Access',
            },
            data: null,
        });
    },

    /**
     * Mengirim respons yang terpaginasi (200 OK)
     * @param {object} res - Objek respons Express
     * @param {Array} data - Array data untuk halaman saat ini
     * @param {object} pagination - Informasi paginasi
     * @param {string} message - Pesan sukses
     */
    pagination(res, data, pagination, message) {
        res.status(200).json({
            meta: {
                status: 200,
                message,
            },
            data,
            pagination,
        });
    },
};