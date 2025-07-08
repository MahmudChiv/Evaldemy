const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: "postgres",
  }
);

module.exports = sequelize;

sequelize.authenticate()
  .then(() => {
    console.log('Database connected successfully');
  })
  .catch((error) => {
    console.error('Unable to connect to the database:', error);
  });

sequelize
  .sync({ alter: true }) // Set to `true` for auto-altering tables based on model changes, or `force: true` to drop and recreate tables.
  .then(() => {
    console.log("Database synchronized successfully");
  })
  .catch((error) => {
    console.error("Error during database synchronization:", error);
  });

// Export the Sequelize instance to be used in your models
module.exports = sequelize;