const Sequelize = require('sequelize');

const sequelize = require('../util/database.js');


const UserGroup = sequelize.define('UserGroup', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    groupId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'groups',
            key: 'id'
        }
    },
    role: {
        type: Sequelize.ENUM('member', 'admin'),
        defaultValue: 'member'
    }
});


module.exports = UserGroup;