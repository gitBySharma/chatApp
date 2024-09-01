const express = require('express');
const router = express.Router();

const userController = require('../controllers/users.js');
const forgotPasswordController = require('../controllers/forgotPassword.js');

router.post('/user/signup', userController.userSignup);

router.post('/user/login', userController.userLogin);

//handle forgot password (sends a reset link to users email)
router.post('/user/forgotPassword', forgotPasswordController.forgotPassword);

//handle forgot password request
router.get('/password/resetPassword/:id', forgotPasswordController.resetPassword);

//handle updating the password in database
router.post('/password/updatePassword/:id', forgotPasswordController.updatePassword);

module.exports = router;



