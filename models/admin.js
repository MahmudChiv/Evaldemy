const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Admin = sequelize.define("Admin", {
    schoolId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Schools', // Assuming the table name is 'Schools'
            key: 'id',
        },
    },
    adminName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [3, 50], // Name must be between 3 and 50 characters
        },
    },
    adminEmail: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
        isEmail: true,
        },
    },
    adminPhone: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            is: /^\+?[1-9]\d{1,14}$/, // Validates international phone numbers
        },
    },
    adminPassword: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [6, 100], // Password must be at least 6 characters
        },
    },
});

module.exports = Admin;