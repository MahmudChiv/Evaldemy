const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Register school route
router.post("/registerSchool", authController.registerSchool );

// Register Admin route
router.post("/registerAdmin", authController.registerAdmin );

// Register Teachers route
router.post("/addTeachers", upload.single("teachersFile"), authController.addTeachers );

module.exports = router; 