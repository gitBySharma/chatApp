const express = require('express');
const router = express.Router();

const authentication = require('../middleware/auth.js');
const groupController = require('../controllers/groups.js');
const { route } = require('./user.js');


router.post('/group/createGroup', authentication.authenticate, groupController.createGroup);

router.get('/groups/list', authentication.authenticate, groupController.getGroupsList);

router.get('/message/getGroupMessages/:groupId', authentication.authenticate, groupController.getGroupMessages);

router.post('/group/inviteToGroup/:currentGroupId', authentication.authenticate, groupController.inviteToGroup);

router.post('/group/leaveGroup/:groupId', authentication.authenticate, groupController.leaveGroup);


module.exports = router;