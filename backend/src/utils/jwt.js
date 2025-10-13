const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

/**
 * Membuat JSON Web Token untuk user
 * @param {object} user - Objek user dari database
 * @returns {string} - Token JWT
 */
const generateToken = (user) => {
    if (!process.env.JWT_SECRET || !process.env.JWT_EXPIRE) {
        throw new Error('JWT_SECRET or JWT_EXPIRE not defined in .env file');
    }

    return jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
    );
};

/**
 * Membandingkan password yang diinput dengan password yang di-hash
 * @param {string} enteredPassword - Password dari input user
 * @param {string} hashedPassword - Password dari database
 * @returns {Promise<boolean>} - True jika cocok, false jika tidak
 */
const matchPassword = async (enteredPassword, hashedPassword) => {
    return await bcrypt.compare(enteredPassword, hashedPassword);
};

module.exports = {
    generateToken,
    matchPassword,
};