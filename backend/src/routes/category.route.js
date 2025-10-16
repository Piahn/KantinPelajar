const express = require('express');
const categoryController = require('../controller/category.controller');
const uploadMiddleware = require('../middleware/uploadMiddleware');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Rute Publik
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);

// Rute Khusus Admin
router.post(
    '/',
    protect,
    authorize('admin'),
    uploadMiddleware('icon'),
    categoryController.createCategory
);

router.put(
    '/:id',
    protect,
    authorize('admin'),
    uploadMiddleware('icon'),
    categoryController.updateCategory
);

router.delete(
    '/:id',
    protect,
    authorize('admin'),
    categoryController.deleteCategory
);

module.exports = router;