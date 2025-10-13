const mongoose = require('mongoose');
const yup = require('yup');

// DTO (Data Transfer Object) dengan skema validasi Yup
const categoryDTO = yup.object({
    name: yup.string()
        .required('Nama kategori harus diisi'),
    description: yup.string()
        .required('Deskripsi harus diisi'),
    icon: yup.string()
        .required('Ikon harus diisi'),
});


const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Nama kategori harus diisi'],
    },
    slug: {
        type: String,
        lowercase: true,
        unique: true,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    icon: {
        type: String,
        required: true,
    },
}, {
    timestamps: true
}).index({ slug: 1 });

// Generate slug dari name sebelum save
categorySchema.pre('save', function (next) {
    if (this.isModified('name')) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
    next();
});

const CategoryModel = mongoose.model('Category', categorySchema);

module.exports = { CategoryModel, categoryDTO };