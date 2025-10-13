const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const yup = require('yup');

const validatePassword = yup.string()
    .required()
    .min(6, "password must be at least 6 characters")
    .test(
        "at-least-one-uppercase-letter",
        "Contains at least one uppercase letter",
        (value) => {
            if (!value) return false;
            const regex = /^(?=.*[A-Z])/;
            return regex.test(value);
        }
    )
    .test("at-least-one-number", "Contains at least one number", (value) => {
        if (!value) return false;
        const regex = /^(?=.*\d)/;
        return regex.test(value);
    });

const validateConfirmPassword = yup.string()
    .required('Konfirmasi password harus diisi')
    .oneOf([yup.ref('password')], 'Konfirmasi password tidak cocok');

const userDTO = yup.object({
    fullName: yup.string().required('fullName harus diisi'),
    username: yup.string()
        .required('Username harus diisi')
        .max(50, 'Username tidak boleh lebih dari 50 karakter')
        .trim(),
    email: yup.string()
        .email('Format email tidak valid')
        .required('Email harus diisi')
        .lowercase()
        .trim(),
    password: validatePassword,
    confirmPassword: validateConfirmPassword,
    role: yup.string()
        .oneOf(['user', 'merchant', 'admin'], 'Role tidak valid')
        .default('user'),
    phone: yup.string()
        .matches(/^(\+62|62|0)[0-9]{9,12}$/, 'Format nomor telepon tidak valid')
        .trim().required(),
    profilePicture: yup.string().default('default-avatar.png'),
    balance: yup.number().min(0, 'Saldo tidak boleh negatif').default(0),
    isActive: yup.boolean().default(false),
});

const userLoginDTO = yup.object({
    identifier: yup.string().required(),
    password: yup.string()
        .min(6, 'Password minimal 6 karakter')
        .required('Password harus diisi'),
})

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Fullname harus diisi'],
    },
    username: {
        type: String,
        required: [true, 'Username harus diisi'],
        trim: true,
        unique: true
    },
    email: {
        type: String,
        required: [true, 'Email harus diisi'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Format email tidak valid'
        ]
    },
    password: {
        type: String,
        required: [true, 'Password harus diisi'],
        select: false
    },
    role: {
        type: String,
        enum: {
            values: ['user', 'merchant', 'admin'],
            message: 'Role tidak ditemukan, buat apa kamu mengakses ini?'
        },
        default: 'user'
    },
    phone: {
        type: String,
        trim: true,
        match: [/^(\+62|62|0)[0-9]{9,12}$/, 'Format nomor telepon tidak valid']
    },
    profilePicture: {
        type: String,
        default: 'default-avatar.png'
    },
    balance: {
        type: Number,
        default: 0,
        min: [0, 'Saldo tidak boleh negatif']
    },
    isActive: {
        type: Boolean,
        default: false
    },
    lastLogin: {
        type: Date
    }
}, {
    timestamps: true
});

// Encrypt password menggunakan bcrypt sebelum save
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next()
});

const UserModel = mongoose.model('User', userSchema);


// Export DTO agar bisa digunakan di controller/service
module.exports = { UserModel, userDTO, userLoginDTO };