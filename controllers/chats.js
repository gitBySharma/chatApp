const User = require('../models/users.js');
const Chats = require('../models/chats.js');
const FileUrls = require('../models/fileUrls.js');

const Sequelize = require('sequelize');
const AWS = require("aws-sdk");

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


const s3 = new AWS.S3({
    accessKeyId: process.env.IAM_USER_ACCESS_KEY,
    secretAccessKey: process.env.IAM_USER_SECRET,
    Bucket: "groupchatapp1133"
});

exports.uploadFile = async (req, res, next) => {
    console.log("req object", req.file);
    try {

        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded", success: false });
        }

        const fileName = `Upload_${req.user.id}/${req.file.originalname}`;

        const params = {
            Bucket: "groupchatapp1133",
            Key: fileName,
            Body: req.file.buffer,
            ContentType: req.file.mimetype,
            ACL: "public-read"
        };

        const uploadResponse = await s3.upload(params).promise();

        const fileUrl = await FileUrls.create({
            url: uploadResponse.Location,
        });

        res.status(200).json({ message: "File uploaded successfully", fileUrl: fileUrl.url, success: true });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error", success: false });
    }
};