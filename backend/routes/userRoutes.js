const express = require('express');
const { getAllUsers, getFindByUserId } = require('../controllers/userController');

const router = express.Router();

router.get('/getallusers', getAllUsers);
router.get('/getfindbyuserid/:id', getFindByUserId)

module.exports = router;