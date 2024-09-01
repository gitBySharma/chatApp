const User = require('../models/users.js');
const Chats = require('../models/chats.js');
const Group = require('../models/groups.js');
const UserGroup = require('../models/userGroup.js');
const Sequelize = require('sequelize');

require('dotenv').config();


exports.promoteToAdmin = async (req, res, next) => {
    const email = req.body.email;
    const groupId = req.params.groupId;
    const currentUserId = req.user.id;

    try {
        const currentUserRole = await UserGroup.findOne({  //check if the requesting user is an admin
            where: {
                userId: currentUserId,
                groupId: groupId
            }
        });
        if (currentUserRole.role !== 'admin') {
            return res.status(403).json({ message: 'You are not authorized to perform this action', success: false });
        }

        const userToBeMadeAdmin = await User.findOne({ where: { email: email } });  //find the user first to get the userId

        //check if the user to be made admin exists in the group
        const userInGroup = await UserGroup.findOne({
            where: { userId: userToBeMadeAdmin.id, groupId: groupId }
        });
        if (!userInGroup) {
            return res.status(404).json({ message: 'User is not in the group', success: false });
        }

        //make the user an admin
        await UserGroup.update(
            { role: 'admin' },
            { where: { userId: userToBeMadeAdmin.id, groupId: groupId } }
        );

        res.status(200).json({ message: 'User promoted to admin', success: true });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error promoting user', success: false })
    }
};


exports.demoteFromAdmin = async (req, res, next) => {
    const email = req.body.email;
    const groupId = req.params.groupId;
    const currentUserId = req.user.id;

    try {
        const currentUserRole = await UserGroup.findOne({  //check if the requesting user is an admin
            where: {
                userId: currentUserId,
                groupId: groupId
            }
        });
        if (currentUserRole.role !== 'admin') {
            return res.status(403).json({ message: 'You are not authorized to perform this action', success: false });
        }

        const userToBeDemoted = await User.findOne({ where: { email: email } });  //find the user first to get the userId

        //check if the user exists in the group and is an admin
        const userInGroup = await UserGroup.findOne({
            where: { userId: userToBeDemoted.id, groupId: groupId }
        });
        if (!userInGroup || userInGroup.role !== 'admin') {
            return res.status(404).json({ message: 'User is not an admin or not found in the group', success: false });
        }

        //demote the user from admin
        await UserGroup.update(
            { role: 'member' },
            { where: { userId: userToBeDemoted.id, groupId: groupId } }
        );

        res.status(200).json({ message: 'User is no longer an admin', success: true });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error demoting user', success: false })
    }
};


exports.removeUser = async (req, res, next) => {
    const email = req.body.email;
    const groupId = req.params.groupId;
    const currentUserId = req.user.id;

    try {
        const currentUserRole = await UserGroup.findOne({  //check if the requesting user is an admin
            where: {
                userId: currentUserId,
                groupId: groupId
            }
        });
        if (!currentUserRole || currentUserRole.role !== 'admin') {
            return res.status(403).json({ message: 'You are not authorized to perform this action', success: false });
        }

        const userToBeRemoved = await User.findOne({ where: { email: email } });  //find the user first to get the userId

        //check if the user exists in the group and is an admin
        const userInGroup = await UserGroup.findOne({
            where: { userId: userToBeRemoved.id, groupId: groupId }
        });
        if (!userInGroup) {
            return res.status(404).json({ message: 'User not found in the group', success: false });
        }

        //remove the user from the group
        await UserGroup.destroy(
            { where: { userId: userToBeRemoved.id, groupId: groupId } }
        );

        res.status(200).json({ message: 'User removed successfully', success: true });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error removing user', success: false })
    }
};


exports.deleteGroup = async (req, res, next) => {
    const groupId = req.params.groupId;
    const userId = req.user.id;

    try {
        const group = await Group.findOne({ where: { id: groupId } });  //find the group to delete
        if (!group) {
            return res.status(403).json({ message: 'Group not found', success: false });
        }

        //check if the user is the creator of the group
        if (group.createdBy_id !== userId) {
            return res.status(404).json({ message: 'Only the creator can delete the group', success: false });
        }

        //delete all the associated messages
        await Chats.destroy({ where: { groupId: groupId } });

        //remove all the associated users
        await UserGroup.destroy({ where: { groupId: groupId } });

        //delete the group
        await Group.destroy({ where: { id: groupId } });

        res.status(200).json({ message: 'Group deleted successfully', success: true });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error deleting group', success: false });

    }
};