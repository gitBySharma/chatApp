const User = require('../models/users.js');
const Chats = require('../models/chats.js');
const Sequelize = require('sequelize');

require('dotenv').config();


exports.postMessage = async (req, res, next) => {
    const { message } = req.body;
    try {
        const savedMessages = await Chats.create({
            message: message,
            userId: req.user.id
        });

        const user = await User.findOne({ where: { id: req.user.id } });

        res.status(200).json({ message: "Message saved successfully", savedMessages: savedMessages, name: user.name, success: true });

    } catch (error) {
        res.status(500).json({ error: "Error saving message", success: false });
        console.log(error);
    }
};


exports.getMessages = async (req, res, next) => {
    try {
        const lastMessageId = req.query.lastMessageId;
        let savedMessages;

        if (lastMessageId) {
            savedMessages = await Chats.findAll({
                where: {
                    id: {
                        [Sequelize.Op.gt]: lastMessageId
                    }
                },
                include: [{
                    model: User,
                    attributes: ['name']
                }],
                order: [['id', 'ASC']]
            });

        } else {
            savedMessages = await Chats.findAll({
                include: [{
                    model: User,
                    attributes: ['name']
                }],
                order: [['id', 'ASC']],
                limit: 50
            })
        }

        const mappedMessages = savedMessages.map(chat => ({
            id: chat.id,
            message: chat.message,
            userName: chat.user ? chat.user.name : 'Unknown User' // Ensure we check if User exists
        }));

        res.status(200).json({ savedMessages: mappedMessages, success: true });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error" });
    }
};