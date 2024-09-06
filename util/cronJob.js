const cron = require("node-cron");
const Sequelize = require("sequelize");

const Chats = require('../models/chats.js');
const ArchivedChats = require('../models/archivedChats.js');


const archivedChatsJob = cron.schedule('0 0 * * *', async () => {
    try {
        const oneDayOldChats = await Chats.findAll({
            where: {
                createdAt: {
                    [Sequelize.Op.lte]: new Date(new Date() - 24 * 60 * 60 * 1000)
                }
            }
        });

        if (oneDayOldChats.length > 0) {
            const archivedChatsData = oneDayOldChats.map(chat => ({
                message: chat.message,
                createdAt: chat.createdAt,
                updatedAt: chat.updatedAt,
                userId: chat.userId,
                groupId: chat.groupId
            }));

            await ArchivedChats.bulkCreate(archivedChatsData);
            await Chats.destroy({
                where: {
                    id: oneDayOldChats.map(chat => chat.id)
                }
            });

            console.log("One day old chats archived and deleted");

        } else {
            console.log("No chats to archive");
        }

    } catch (error) {
        console.error("Error archiving chats", error);
    }
});

module.exports = archivedChatsJob;