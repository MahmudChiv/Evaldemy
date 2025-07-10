const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const multer = require("multer");
const { verifyToken } = require("../middleware/verifyToken");
const upload = multer({ dest: "uploads/" });

// Register school route
router.post("/school", authController.registerSchool);

// Register Admin route
router.post("/admin", authController.registerAdmin);

// Admin Login route
router.post("/admin/login", authController.handleAdminLogin);

// Register Teachers route
router.post(
  "/admin/inviteTeachers",
  verifyToken,
  upload.single("teachersFile"),
  authController.inviteTeachers
);

// Login route
router.post("/login", authController.handleLogin);

// Teacher account setup route
router.put("/teacher/Setup", verifyToken, authController.updateTeacherInfo);

// Teacher account setup route
router.post("/teacher/subjectSetup", verifyToken, authController.teacherSubjectSetup);

// Add Students route
router.post(
  "/addStudents",
  verifyToken,
  upload.single("studentsFile"),
  authController.addStudents
);

module.exports = router;
