const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Admin = sequelize.define("Admin", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
    },
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
            isEmail: true, // Must be a valid email format
        },
    },
    adminPhone: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            is: /^[0-9]+$/, // Phone must contain only numbers
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

// Associations
Admin.associate = (models) => {
    Admin.belongsTo(models.School, {
        foreignKey: "schoolId",
        as: "school",
    });
};

module.exports = Admin;