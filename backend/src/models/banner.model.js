const mongoose = require('mongoose');
const yup = require('yup');

// DTO (Data Transfer Object) dengan skema validasi Yup
const bannerDTO = yup.object({
    title: yup.string()
        .required('Nama Banner harus diisi'),
    image: yup.string()
        .required('Gambar harus diisi'),
    isShow: yup.string()
        .required('Status tampil harus diisi'),
});


const BannerSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Nama Banner harus diisi'],
        },
        image: {
            type: String,
            required: true,
        },
        isShow: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true,
    }
).index({ title: "text" });

const BannerModel = mongoose.model("Banner", BannerSchema)

module.exports = { BannerModel, bannerDTO };