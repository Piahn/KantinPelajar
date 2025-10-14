const multer = require('multer');
const path = require('path');
const response = require('../utils/response');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = file.fieldname + '-' + Date.now() + path.extname(file.originalname);
        cb(null, uniqueSuffix);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Hanya file gambar (JPEG, JPG, PNG) yang diizinkan!'));
        }
    }
});

const uploadMiddleware = (fieldName) => (req, res, next) => {
    const uploader = upload.single(fieldName);

    uploader(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return response.badRequest(res, 'Ukuran file terlalu besar. Maksimal 2MB.');
            }
            return response.badRequest(res, err.message);
        } else if (err) {
            return response.badRequest(res, err.message);
        }
        next();
    });
};

module.exports = uploadMiddleware;