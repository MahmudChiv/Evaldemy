const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Teacher = sequelize.define("Teacher", {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [2, 50], // Name should be between 2 and 50 characters
        },
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            is: /^[0-9]+$/, // Phone should contain only numbers
        },
    },
    subject: {
        type: DataTypes.STRING,
        allowNull: false,
    },
})