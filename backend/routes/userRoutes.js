const express = require('express');
const { getAllUsers, getFindByUserId, getUpdatedByUserId } = require('../controllers/userController');
const verifyToken = require('../verifyToken');

const router = express.Router();

router.get('/getallusers', getAllUsers);
router.get('/getfindbyuserid/:id', getFindByUserId);
router.put('/getupdatedbyuserid/:id', verifyToken, getUpdatedByUserId);

module.exports = router;