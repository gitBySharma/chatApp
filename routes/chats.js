const express = require('express');
const router = express.Router();
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });

const authentication = require('../middleware/auth.js');
const chatsController = require('../controllers/chats.js');


router.post('/message/sendMessage', authentication.authenticate, chatsController.postMessage);

router.get('/message/getMessages', authentication.authenticate, chatsController.getMessages);

router.post('/file/upload', authentication.authenticate, upload.single('file'), chatsController.uploadFile);


module.exports = router;