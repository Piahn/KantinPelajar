const express = require('express');
const bannerController = require('../controller/banner.controller');
const uploadMiddleware = require('../middleware/uploadMiddleware');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', bannerController.getAllBanners);

router.get('/:id', bannerController.getBannerById);

router.post(
    '/',
    protect,
    authorize('admin'),
    uploadMiddleware,
    bannerController.createBanner
);

// Rute untuk update banner (Admin Only)
router.put(
    '/:id',
    protect,
    authorize('admin'),
    uploadMiddleware,
    bannerController.updateBanner
);

// Rute untuk delete banner (Admin Only)
router.delete(
    '/:id',
    protect,
    authorize('admin'),
    bannerController.deleteBanner
);


module.exports = router;