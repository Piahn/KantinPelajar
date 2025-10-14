const express = require('express');
const authRoutes = require('./auth.route');
const bannerRoutes = require('./banner.route');
// const categoryRoutes = require('./category.route');
// const productRoutes = require('./product.route');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/banners', bannerRoutes);
// router.use('/categories', categoryRoutes);
// router.use('/products', productRoutes);

module.exports = router;