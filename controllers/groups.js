const User = require('../models/users.js');
const Chats = require('../models/chats.js');
const Group = require('../models/groups.js');
const UserGroup = require('../models/userGroup.js');
const Sequelize = require('sequelize');

require('dotenv').config();


exports.createGroup = async (req, res, next) => {
    try {
        const groupName = req.body.name;

        const group = await Group.create({
            groupName: groupName,
            createdBy_id: req.user.id
        });

        await UserGroup.create({
            userId: req.user.id,
            groupId: group.id,
            role: 'admin'
        })
        res.status(200).json({ message: 'Group created successfully', group, success: true });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error creating group', success: false });
    }
};


exports.getGroupsList = async (req, res, next) => {
    try {
        const user = await User.findOne({
            where: { id: req.user.id },
            include: [{
                model: Group,
                through: UserGroup,
                attributes: ['id', 'groupName']
            }]
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found', success: false });
        }

        const groupsList = user.groups.map(group => ({
            id: group.id,
            name: group.groupName
        }));

        res.status(200).json({ message: 'Groups fetched successfully', groups: groupsList, success: true });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error fetching groups', success: false });
    }
};


exports.postGroupMessage = async (req, res, next) => {
    try {
        const { message, groupId } = req.body;

        const isMember = await UserGroup.findOne({
            where: {
                userId: req.user.id,
                groupId: groupId
            }
        });

        if (!isMember) {
            return res.status(403).json({ message: 'You are not a member of this group', success: false });
        }

        const savedMessages = await Chats.create({
            message: message,
            userId: req.user.id,
            groupId: groupId
        });

        const user = await User.findOne({ where: { id: req.user.id } });

        res.status(200).json({
            message: "Group message saved successfully",
            savedMessages: {
                id: savedMessages.id,
                message: savedMessages.message,
                userName: user.name,
                userId: user.id,
                groupId: savedMessages.groupId
            },
            success: true
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error saving group message', success: false });
    }
};


exports.getGroupMessages = async (req, res, next) => {
    try {
        const groupId = req.params.groupId;
        const lastMessageId = req.query.lastMessageId;

        const isMember = await UserGroup.findOne({
            where: {
                userId: req.user.id,
                groupId: groupId
            }
        });

        if (!isMember) {
            return res.status(403).json({ message: 'You are not a member of this group', success: false });
        }

        let whereClause = { groupId: groupId };

        if (lastMessageId) {
            whereClause.id = { [Sequelize.Op.gt]: lastMessageId }
        }

        const savedMessages = await Chats.findAll({
            where: whereClause,
            include: [{
                model: User,
                attributes: ['name']
            }],
            order: [['id', 'ASC']],
            limit: lastMessageId ? undefined : 100
        });

        const mappedMessages = savedMessages.map(chat => ({
            id: chat.id,
            message: chat.message,
            userName: chat.user ? chat.user.name : 'Unknown user',
            userId: chat.userId,
            groupId: chat.groupId
        }));

        res.status(200).json({ savedMessages: mappedMessages, success: true });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error fetching messages', success: false });
    }
};


exports.inviteToGroup = async (req, res, next) => {
    const currentGroupId = req.params.currentGroupId;
    try {
        const invitingUser = await UserGroup.findOne({ where: { userId: req.user.id, groupId: currentGroupId } });
        if (!invitingUser || invitingUser.role !== 'admin') {
            return res.status(403).json({ message: 'Only admin is allowed to invite others', success: false });
        }

        const email = req.body.email;
        const user = await User.findOne({ where: { email: email } });
        if (!user) {
            return res.status(404).json({ message: 'User not found', success: false });

        }

        await UserGroup.create({
            userId: user.id,
            groupId: currentGroupId
        });

        res.status(200).json({ message: "User invited successfully", success: true });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error inviting user', success: false });
    }
};


exports.leaveGroup = async (req, res, next) => {
    const groupId = req.params.groupId;
    const userId = req.user.id;

    try {
        // Check if the user is a member of the group
        const userGroup = await UserGroup.findOne({
            where: { userId: userId, groupId: groupId }
        });

        if (!userGroup) {
            return res.status(403).json({ message: 'You are not a member of this group', success: false });
        }

        // Check if the group is created by the user
        const group = await Group.findOne({
            where: { id: groupId, createdBy_id: userId }
        });

        if (group) {
            return res.status(404).json({ message: 'You cannot leave a group you created', success: false });
        }

        // Remove the user from the group
        await UserGroup.destroy({
            where: { userId: userId, groupId: groupId }
        });

        res.status(200).json({ message: 'Successfully left the group', success: true });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error leaving group', success: false });
    }
};