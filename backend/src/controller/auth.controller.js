const { UserModel, userDTO, userLoginDTO } = require('../models/user.model');
const { matchPassword } = require('../utils/jwt');
const response = require('../utils/response')

module.exports = {
    /**
     * @desc    Register user
     * @route   POST /api/auth/register
     * @access  Public
     */
    async register(req, res) {
        const { fullName, username, email, phone, password, confirmPassword } = req.body;

        try {
            await userDTO.validate({
                fullName,
                username,
                email,
                phone,
                password,
                confirmPassword
            });

            const userExists = await UserModel.findOne({ email });

            if (userExists) {
                return res.status(400).json({ message: 'Email sudah terdaftar' });
            }

            const result = await UserModel.create({
                fullName,
                username,
                password,
                email,
                phone
            });

            response.success(res, result, "Registration Successful")
        } catch (error) {
            response.error(res, error, "registration Failed")
        }
    },
    /**
     * @desc    Login user
     * @route   POST /api/auth/login
     * @access  Public
     */
    async login(req, res) {
        const { identifier, password } = req.body;

        try {
            await userLoginDTO.validate({
                identifier,
                password,
            });

            // ambil data user berdasarkan "identifier" -> email dan Username
            const userByIdentifier = await UserModel.findOne({
                $or: [
                    {
                        email: identifier,
                    },
                    {
                        username: identifier
                    }
                ],
                isActive: true,
            }).select('+password');

            // Validasi Users
            if (!userByIdentifier) {
                return response.unauthorized(res, "User not found");
            }

            const isPasswordMatch = await matchPassword(password, userByIdentifier.password);
            if (!isPasswordMatch) {
                return response.unauthorized(res, "Password Not Match");
            }

            response.authSuccess(res, userByIdentifier, 'Login Berhasil');
        } catch (error) {
            response.error(res, error, "Login Gagal");
        }
    },
    /**
    * @desc    Get current logged in user
    * @route   GET /api/auth/me
    * @access  Privae
    */
    async me(req, res) {
        try {
            const user = req.user;
            const result = await UserModel.findById(user?.id);
            response.success(res, result, "Success Get User Profile");
        } catch (error) {
            response.error(res, error, "Failed Get User Profile");
        }
    }
}