// models/SubjectClass.js

const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const SubjectClass = sequelize.define("SubjectClass", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  class: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  teacherId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Teachers',
      key: 'id',
    },
  },
});

// Associations
SubjectClass.associate = (models) => {
  SubjectClass.belongsTo(models.Teacher, {
    foreignKey: "teacherId",
    as: "teacher",
  });
//   SubjectClass.belongsTo(models.Class, {
//     foreignKey: "classId",
//     as: "class",
//   });
}

// Sync the model with the database
SubjectClass.sync()
    .then(() => {
        console.log("SubjectClass table created successfully.");
    })
    .catch((error) => {
        console.error("Error creating SubjectClass table:", error);
    });

module.exports = SubjectClass;
