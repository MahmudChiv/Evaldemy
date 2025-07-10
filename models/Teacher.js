const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Teacher = sequelize.define("Teacher", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: true,
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
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [6, 100], // Password should be at least 6 characters
        },
    },
})

// Associations
Teacher.associate = (models) => {
  Teacher.hasMany(models.SubjectClass, {
    foreignKey: "teacherId",
    onDelete: "CASCADE",
  });
};

// Sync the model with the database
Teacher.sync()
    .then(() => {
        console.log("Teacher table created successfully.");
    })
    .catch((error) => {
        console.error("Error creating Teacher table:", error);
    });

module.exports = Teacher;
