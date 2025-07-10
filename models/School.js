const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const School = sequelize.define("School", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  schoolName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  schoolType: {
    type: DataTypes.ENUM("Primary", "Secondary", "University"),
    allowNull: false,
  },
  schoolAddress: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  schoolPhone: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      is: /^\+?[1-9]\d{1,14}$/, // Validates international phone numbers
    },
  },
  schoolEmail: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
    schoolLogo: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
        isUrl: true, // Validates that the logo is a valid URL
        },
    },
});

// Sync the model with the database
School.sync()
  .then(() => {
    console.log("School table created successfully.");
  })
  .catch((error) => {
    console.error("Error creating School table:", error);
  });

module.exports = School;
