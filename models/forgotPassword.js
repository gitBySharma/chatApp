const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const ForgotPassword = sequelize.define('forgotPasswordRequests', {
    id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
    },
    active: Sequelize.BOOLEAN
});

module.exports = ForgotPassword;