const express = require('express');
const router = express.Router();

const homePageController = require('../controllers/homePage.js');

router.get('/', homePageController.getHomePage);

module.exports = router;