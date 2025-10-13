const mongoose = require('mongoose');
const yup = require('yup');

// DTO (Data Transfer Object) dengan skema validasi Yup
const productDTO = yup.object({
    name: yup.string()
        .required('Nama produk harus diisi')
        .trim(),
    description: yup.string()
        .required('Deskripsi produk harus diisi'),
    price: yup.number()
        .required('Harga harus diisi'),
    banner: yup.array()
        .of(yup.string())
        .min(1, 'Minimal satu banner harus diunggah')
        .required('Banner harus diisi'),
    category: yup.string()
        .required('Kategori harus dipilih'),
    merchant: yup.string()
        .required('Merchant harus ada'),
    stock: yup.number()
        .required('Stok harus diisi')
        .default(0),
    unit: yup.string()
        .oneOf(['pcs', 'porsi', 'pack', 'kg', 'liter'], 'Unit tidak valid')
        .default('pcs'),
    isAvailable: yup.boolean().default(true),
    isFeatured: yup.boolean().default(false),
});


const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Nama produk harus diisi'],
        trim: true,
    },
    slug: {
        type: String,
        lowercase: true,
        unique: true
    },
    description: {
        type: String,
        required: [true, 'Deskripsi produk harus diisi'],
    },
    price: {
        type: Number,
        required: [true, 'Harga harus diisi'],
    },
    banner: [{
        type: String,
        required: true,
    }],
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Kategori harus dipilih']
    },
    merchant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Merchant harus ada']
    },
    stock: {
        type: Number,
        required: [true, 'Stok harus diisi'],
        default: 0
    },
    unit: {
        type: String,
        enum: ['pcs', 'porsi', 'pack', 'kg', 'liter'],
        default: 'pcs'
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    ratings: {
        average: {
            type: Number,
            default: 0,
        },
        count: {
            type: Number,
            default: 0
        }
    },
    sold: {
        type: Number,
        default: 0
    },
}, {
    timestamps: true
}).index(
    {
        name: 'text',
        description: 'text',
        category: 1,
        isAvailable: 1,
        merchant: 1,
        slug: 1,
        price: 1
    }
);

// Generate slug dari name sebelum save
productSchema.pre('save', function (next) {
    if (this.isModified('name')) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '') + '-' + this._id.toString().slice(-6);
    }
    next();
})

const ProductModel = mongoose.model('Product', productSchema);

module.exports = { ProductModel, productDTO };