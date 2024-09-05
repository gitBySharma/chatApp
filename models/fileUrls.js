const Sequelize = require('sequelize');

const sequelize = require('../util/database.js');

const Files = sequelize.define('files', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    url: {
        type: Sequelize.STRING
    }
});

module.exports = Files;