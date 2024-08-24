const Sequelize = require('sequelize');

const sequelize = require('../util/database.js');

const Chats = sequelize.define('chats', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    message: {
        type: Sequelize.STRING(1000),
        allowNull: false
    }
});

module.exports = Chats;