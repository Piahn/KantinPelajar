const { isValidObjectId } = require('mongoose');
const { CategoryModel, categoryDTO } = require('../models/category.model');
const response = require('../utils/response');
const fs = require('fs');

module.exports = {
    /**
     * @desc    Create a new category
     * @route   POST /api/categories
     * @access  Private (Admin)
     */
    async createCategory(req, res) {
        try {
            const { name, description } = req.body;

            if (!req.file) {
                return response.badRequest(res, 'Ikon kategori harus diunggah.');
            }

            const filename = req.file.filename;
            const iconUrl = `${process.env.BASE_URL}/images/${filename}`;

            await categoryDTO.validate({ name, description, icon: iconUrl });

            const newCategory = await CategoryModel.create({
                name,
                description,
                icon: iconUrl
            });

            response.success(res, newCategory, 'Kategori berhasil dibuat');
        } catch (error) {
            response.error(res, error, 'Gagal membuat kategori');
        }
    },

    /**
     * @desc    Get all categories with search and pagination
     * @route   GET /api/categories
     * @access  Public
     */
    async getAllCategories(req, res) {
        try {
            const page = parseInt(req.query.page, 1) || 1;
            const limit = parseInt(req.query.limit, 8) || 10;
            const search = req.query.search || '';

            let query = {};
            if (search) {
                query = { name: { $regex: search, $options: 'i' } };
            }

            const categories = await CategoryModel.find(query)
                .limit(limit)
                .skip((page - 1) * limit)
                .sort({ createdAt: -1 })
                .exec();
            const count = await CategoryModel.countDocuments(query);

            response.pagination(
                res,
                categories,
                {
                    total: count,
                    current: page,
                    totalPages: Math.ceil(count / limit),
                },
                'Data semua kategori berhasil diambil'
            );
        } catch (error) {
            response.error(res, error, "Gagal mengambil data kategori");
        }
    },

    /**
     * @desc    Get a single category by ID
     * @route   GET /api/categories/:id
     * @access  Public
     */
    async getCategoryById(req, res) {
        try {
            const { id } = req.params;
            if (!isValidObjectId(id)) {
                return response.badRequest(res, "ID Kategori tidak valid.");
            }

            const category = await CategoryModel.findById(id);
            if (!category) {
                return response.notFound(res, "Kategori tidak ditemukan");
            }

            response.success(res, category, "Data kategori berhasil diambil");
        } catch (error) {
            response.error(res, error, "Gagal mengambil data kategori");
        }
    },

    /**
     * @desc    Update a category
     * @route   PUT /api/categories/:id
     * @access  Private (Admin)
     */
    async updateCategory(req, res) {
        try {
            const { id } = req.params;
            const { name, description } = req.body;

            if (!isValidObjectId(id)) {
                return response.badRequest(res, "ID Kategori tidak valid.");
            }

            const categoryToUpdate = await CategoryModel.findById(id);
            if (!categoryToUpdate) {
                return response.notFound(res, 'Kategori tidak ditemukan');
            }

            let updateData = { name, description };

            if (req.file) {
                const oldIconPath = categoryToUpdate.icon.replace(process.env.BASE_URL, 'public');
                try {
                    await fs.promises.unlink(oldIconPath);
                } catch (unlinkError) {
                    console.error("Gagal menghapus ikon lama:", unlinkError.message);
                }

                const filename = req.file.filename;
                updateData.icon = `${process.env.BASE_URL}/images/${filename}`;
            }

            const updatedCategory = await CategoryModel.findByIdAndUpdate(id, updateData, {
                new: true,
            });

            response.success(res, updatedCategory, 'Kategori berhasil diperbarui');
        } catch (error) {
            response.error(res, error, 'Gagal memperbarui kategori');
        }
    },

    /**
     * @desc    Delete a category
     * @route   DELETE /api/categories/:id
     * @access  Private (Admin)
     */
    async deleteCategory(req, res) {
        try {
            const { id } = req.params;
            if (!isValidObjectId(id)) {
                return response.badRequest(res, "ID Kategori tidak valid.");
            }

            const category = await CategoryModel.findById(id);
            if (!category) {
                return response.notFound(res, 'Kategori tidak ditemukan');
            }

            const iconPath = category.icon.replace(process.env.BASE_URL, 'public');
            try {
                await fs.promises.unlink(iconPath);
            } catch (unlinkError) {
                console.error("Gagal menghapus ikon:", unlinkError.message);
            }

            await CategoryModel.findByIdAndDelete(id);

            response.success(res, null, 'Kategori berhasil dihapus');
        } catch (error) {
            response.error(res, error, 'Gagal menghapus kategori');
        }
    }
};