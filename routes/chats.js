const express = require('express');
const router = express.Router();

const authentication = require('../middleware/auth.js');
const chatsController = require('../controllers/chats.js');


router.post('/message/sendMessage', authentication.authenticate, chatsController.postMessage);
router.get('/message/getMessages', authentication.authenticate, chatsController.getMessages);


module.exports = router;