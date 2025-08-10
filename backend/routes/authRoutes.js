const express = require('express');
const { signUp, signIn, verifyTokens, logOut, forgotPassword, resetPassword, changePassword, refreshToken, verifyEmail } = require('../controllers/authController');
const verifyToken = require('../verifyToken');
const router = express.Router();


router.post('/signup', signUp);
router.post('/signin', signIn);
router.post('/logout', logOut);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/change-password', verifyToken, changePassword);
router.post('/refresh-token', refreshToken);
router.post('/verify-email', verifyToken, verifyEmail);
router.get('/verify-token', verifyToken, verifyTokens);

module.exports = router;