const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");
const upload = multer({ dest: "uploads/" });
const { Teacher } = require("./models");
const School = require("../models/school");
const Admin = require("../models/admin");
const bcrypt = require("bcryptjs");

exports.registerSchool = async (req, res) => {
  const {
    schoolName,
    schoolType,
    schoolAddress,
    schoolPhone,
    schoolEmail,
    schoolLogo,
  } = req.body;
  // Validate required fields
  if (
    !schoolName ||
    !schoolType ||
    !schoolAddress ||
    !schoolPhone ||
    !schoolEmail ||
    !schoolLogo
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const schoolExists = await School.findOne({
    where: { schoolName: schoolName },
    attributes: ["schoolName"],
  });
  if (schoolExists)
    return res.status(400).json({ message: "School already exists" });

  const newSchool = await School.create({
    schoolName,
    schoolType,
    schoolAddress,
    schoolPhone,
    schoolEmail,
    schoolLogo,
  })
    .then((school) => {
      return res.status(201).json({
        message: "School registered successfully",
        school,
      });
    })
    .catch((error) => {
      console.error("Error registering school:", error);
      return res.status(500).json({ message: "Error registering school" });
    });
};

exports.registerAdmin = async (req, res) => {
  const { schoolId, adminName, adminEmail, adminPhone, adminPassword } =
    req.body;

  // Validate required fields
  if (!schoolId || !adminName || !adminEmail || !adminPhone || !adminPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Check if the school exists
  const school = await School.findByPk(schoolId);
  if (!school) {
    return res.status(404).json({ message: "School not found" });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  // Create the admin
  const newAdmin = await Admin.create({
    schoolId,
    adminName,
    adminEmail,
    adminPhone,
    adminPassword: hashedPassword,
  });

  return res.status(201).json({
    message: "Admin registered successfully",
    admin: newAdmin,
  });
};

exports.addTeachers = async (req, res) => {
  const results = [];
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (data) => results.push(data)) // push each row
    .on("end", async () => {
      try {
        for (const row of results) {
          await Teacher.create({
            name: row.name,
            email: row.email,
            phone: row.phone,
            subject: row.subject,
          });
        }
        res.status(201).send("Teachers added successfully");
      } catch (err) {
        console.error(err);
        res.status(500).send("Error saving teachers to DB");
      }
    });
};
