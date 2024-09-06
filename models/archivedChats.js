const Sequelize = require('sequelize');

const sequelize = require('../util/database.js');

const ArchivedChats = sequelize.define('archivedChats', {
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

module.exports = ArchivedChats;