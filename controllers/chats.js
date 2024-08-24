const User = require('../models/users.js');
const Chats = require('../models/chats.js');

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
        const savedMessages = await Chats.findAll({ where: { userId: req.user.id } });

        const user = await User.findOne({ where: { id: req.user.id } });

        res.status(200).json({ savedMessages: savedMessages, name: user.name, success: true });

    } catch (error) {
        console.log(error);
    }
};