const express = require('express');
const router = express.Router();

const userController = require('../controllers/users.js');

router.post('/user/signup', userController.userSignup);
router.post('/user/login', userController.userLogin);

module.exports = router;



