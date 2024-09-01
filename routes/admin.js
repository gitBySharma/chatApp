const express = require('express');
const router = express.Router();

const authentication = require('../middleware/auth.js');
const adminController = require('../controllers/admin.js');


router.post('/admin/promote/:groupId', authentication.authenticate, adminController.promoteToAdmin);

router.post('/admin/demote/:groupId', authentication.authenticate, adminController.demoteFromAdmin);

router.post('/admin/removeUser/:groupId', authentication.authenticate, adminController.removeUser);

router.delete('/group/deleteGroup/:groupId', authentication.authenticate, adminController.deleteGroup);


module.exports = router;