const express = require('express');
const router = express.Router();

const authentication = require('../middleware/auth.js');
const chatsController = require('../controllers/chats.js');


router.post('/message/sendMessage', authentication.authenticate, chatsController.postMessage);


module.exports = router;