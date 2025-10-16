const { isValidObjectId } = require('mongoose');
const { BannerModel, bannerDTO } = require('../models/banner.model');
const response = require('../utils/response');
const fs = require('fs');

module.exports = {
    /**
     * @desc    Create a new banner
     * @route   POST /api/banners
     * @access  Private (misal: hanya Admin)
     */
    async createBanner(req, res) {
        try {
            const { title, isShow } = req.body;


            if (!req.file) {
                return response.badRequest(res, 'Gambar banner harus diunggah.');
            }

            const imagePath = req.file.path;
            const imageUrl = `${process.env.BASE_URL}/images/${imagePath}`;

            await bannerDTO.validate({ title, isShow, image: imageUrl });

            const newBanner = await BannerModel.create({
                title,
                isShow,
                image: imageUrl
            });

            response.success(res, newBanner, 'Banner berhasil dibuat');

        } catch (error) {
            response.error(res, error, 'Gagal membuat banner');
        }
    },
    /**
     * @desc    Get all banners
     * @route   GET /api/banners
     * @access  Public
     */
    async getAllBanners(req, res) {
        try {
            const { limit = 10, page = 1, search } = req.query;
            const query = {};

            if (search) {
                query.$text = { $search: search };
            }

            const result = await BannerModel.find(query)
                .limit(limit)
                .skip((page - 1) * limit)
                .sort({ createdAt: -1 })
                .exec();
            const count = await BannerModel.countDocuments(query);

            response.pagination(
                res,
                result,
                {
                    total: count,
                    current: page,
                    totalPages: Math.ceil(count / limit),
                },
                "Success fineAll a banners"
            )
        } catch (error) {
            response.error(res, error, "failed to get all a banners");
        }
    },
    /**
     * @desc    Get a single banner by ID
     * @route   GET /api/banners/:id
     * @access  Public
     */
    async getBannerById(req, res) {
        try {
            const { id } = req.params;

            if (!isValidObjectId(id)) {
                return response.notFound(res, "failed fineOne a banner ");
            }

            const result = await BannerModel.findById(id);

            if (!result) {
                return response.notFound(res, "banners to fineOne is not found");
            }

            response.success(res, result, "success find one banners");
        } catch (error) {
            response.error(res, error, "failed to fine one a banners");
        }
    },
    /**
    * @desc    Update a banner
    * @route   PUT /api/banners/:id
    * @access  Private (Admin)
    */
    async updateBanner(req, res) {
        try {
            const { id } = req.params;
            const { title, isShow } = req.body; // <-- Ambil data teks dari body

            if (!isValidObjectId(id)) {
                return response.badRequest(res, "ID Banner tidak valid.");
            }

            const bannerToUpdate = await BannerModel.findById(id);

            if (!bannerToUpdate) {
                return response.notFound(res, 'Banner yang akan diperbarui tidak ditemukan');
            }

            let updateData = { title, isShow };

            if (req.file) {
                const oldImagePath = bannerToUpdate.image.replace(process.env.BASE_URL, 'public');

                try {
                    await fs.promises.unlink(oldImagePath);
                } catch (unlinkError) {
                    console.error("Gagal menghapus gambar lama:", unlinkError.message);
                }

                const filename = req.file.filename;
                updateData.image = `${process.env.BASE_URL}/images/${filename}`;
            }

            const updatedBanner = await BannerModel.findByIdAndUpdate(id, updateData, {
                new: true,
            });

            response.success(res, updatedBanner, 'Banner berhasil diperbarui');
        } catch (error) {
            response.error(res, error, 'Gagal memperbarui banner');
        }
    },
    /**
    * @desc    Delete a banner
    * @route   DELETE /api/banners/:id
    * @access  Private (Admin)
    */
    async deleteBanner(req, res) {
        try {
            const { id } = req.params;

            if (!isValidObjectId(id)) {
                return response.notFound(res, "failed remove a banner ");
            }

            const banner = await BannerModel.findById(id);

            if (!banner) {
                return response.notFound(res, 'Banner tidak ditemukan');
            }

            const imagePath = banner.image.replace(process.env.BASE_URL, 'public');
            try {
                await fs.promises.unlink(imagePath);
            } catch (unlinkError) {
                console.error("Gagal menghapus gambar (mungkin file tidak ada):", unlinkError.message);
            }

            await BannerModel.findByIdAndDelete(id);

            response.success(res, null, 'Banner berhasil dihapus');
        } catch (error) {
            response.error(res, error, 'Gagal menghapus banner');
        }
    }
}
