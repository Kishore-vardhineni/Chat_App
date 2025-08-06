const express = require('express');
const { signup, signin, verifyTokens } = require('../controllers/authController');
const verifyToken = require('../verifyToken');
const router = express.Router();


router.post('/signup', signup);
router.post('/signin', signin);
router.get('/verify-token', verifyToken, verifyTokens)


module.exports = router;