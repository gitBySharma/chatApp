const Sequelize = require('sequelize');

const sequelize = require('../util/database.js');

const Group = sequelize.define('groups', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    groupName :{
        type:Sequelize.STRING,
        allowNull: false
    },
    createdBy_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
});

module.exports = Group;