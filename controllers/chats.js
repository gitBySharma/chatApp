const User = require('../models/users.js');
const Chats = require('../models/chats.js');
const Sequelize = require('sequelize');

require('dotenv').config();


exports.postMessage = async (req, res, next) => {
    const { message, groupId } = req.body;
    try {
        const savedMessages = await Chats.create({
            message: message,
            userId: req.user.id,
            groupId: groupId || null
        });

        const user = await User.findOne({ where: { id: req.user.id } });

        res.status(200).json({
            message: "Message saved successfully",
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
        res.status(500).json({ error: "Error saving message", success: false });
        console.log(error);
    }
};


exports.getMessages = async (req, res, next) => {
    try {
        const lastMessageId = req.query.lastMessageId;
        let savedMessages;
        const groupId = req.params.groupId;
        let whereClause = {};

        if (lastMessageId) {
            whereClause.id = { [Sequelize.Op.gt]: lastMessageId }

        }

        if (groupId) {
            whereClause.groupId = groupId;
        } else {
            whereClause.groupId = null;
        }

        savedMessages = await Chats.findAll({
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
            userName: chat.user ? chat.user.name : 'Unknown User', // Ensure we check if User exists
            userId: chat.userId,
            groupId: chat.groupId
        }));

        res.status(200).json({ savedMessages: mappedMessages, success: true });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error", success: false });
    }
};