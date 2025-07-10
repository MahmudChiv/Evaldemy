const csv = require("csv-parser");
const fs = require("fs");
const School = require("../models/school");
const Admin = require("../models/admin");
const Teacher = require("../models/Teacher")
const SubjectClass = require("../models/subjectClass");
const bcrypt = require("bcryptjs");
const sendLoginEmail = require("../utils/emailService").sendLoginEmail;
require("dotenv").config();
const generator = require("generate-password");
const jwt = require("jsonwebtoken");
const { UUID } = require("sequelize");


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
    where: { schoolName: schoolName }
  });
  if (schoolExists)
    return res.status(400).json({ message: "School already exists" });

  const newSchool = await School.create({
    id: UUID.v4(), // Generate a unique ID for the school
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
  const { schoolId, adminName, adminPassword, adminEmail } =
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
    id: UUID.v4(), // Generate a unique ID for the admin
    schoolId,
    adminName,
    adminEmail,
    adminPhone,
    adminPassword: hashedPassword,
  });

  return res.status(201).json({
    message: "Admin registered successfully, please login to continue",
    admin: newAdmin,
    school
  });
};

exports.handleAdminLogin = async (req, res) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ where: { adminEmail: email } });
  if (!admin) {
    return res.status(404).json({ message: "Admin not found" });
  }

  const isPasswordValid = await bcrypt.compare(password, admin.adminPassword);
  if (!isPasswordValid) {
    return res.status(401).json({ message: "Invalid password" });
  }

  // Implemet jwt
  const token = jwt.sign({ id: admin.id, role: "admin" }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  return res.status(200).json({
    token, // Return the JWT token
    message: "Login successful",
    admin,
  });
};

exports.inviteTeachers = async (req, res) => {
  if(req.role !== "admin") {
    return res.status(403).json({ message: "Access denied, you're not an admin!" });
  }
  if (!req.file) {
    return res.status(400).send("No file uploaded");
  }
  const results = [];
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (data) => results.push(data)) // push each row
    .on("end", async () => {
      try {
        for (const row of results) {
          const password = generator.generate({
            length: 12,
            numbers: true,
            symbols: true,
            uppercase: true,
            lowercase: true,
            strict: true, // ensures at least one of each selected type
          });
          // Hash the password before saving
          const hashedPassword = await bcrypt.hash(password, 10);

          console.log(hashedPassword);

          await Teacher.create({
            id: UUID.v4(), // Generate a unique ID for the teacher
            email: row.email,
            password: hashedPassword, // Store the hashed password
          }).catch((error) => {
            console.error("Error saving teacher:", error);
            return res.status(500).send("Error saving teacher to DB");
          });
          // Send login invite email to the teacher
          await sendLoginEmail(row.email, hashedPassword)
        }

        await Teacher.sync(); // Ensure the Teacher model is synced with the database
        fs.unlinkSync(req.file.path); // Delete the uploaded file after processing

        res.status(201).send("Invites sent successfully");
      } catch (err) {
        console.error(err);
        res.status(500).send("Error sending invites");
      }
    });
};

exports.handleLogin = async (req, res) => {
  const { email, password, role } = req.body;

  // Validate required fields
  if (!email || !password || !role) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    if (role === "teacher")  return await handleTeacherLogin(email, password, res);
    else if (role === "student") return await handleStudentLogin(email, password, res);

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateTeacherInfo = async (req, res) => {
  if(!req.user.id) {  
    return res.status(401).json({ message: "Unauthorized, please login first" });
  }
  const { name, phone, password, confirmPassword } = req.body;
  // Validate required fields
  if (!name || !phone || !password || !confirmPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }
  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);
  // Update the teacher's details
  try { 
    const teacher = await Teacher.findByPk(req.user.id);
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }
    teacher.name = name;
    teacher.phone = phone;
    teacher.password = hashedPassword; // Store the hashed password
    await teacher.save();
    return res.status(200).json({
      message: "Teacher information updated successfully",
      teacher,
    });
  } catch (error) {
    console.error("Error updating teacher information:", error);
    return res.status(500).json({ message: "Error updating teacher information" });
  }
};
// This function is used to set up the teacher's subjects and classes

exports.teacherSubjectSetup = async (req, res) => {
  if(!req.user.id) {
    return res.status(401).json({ message: "Unauthorized, please login first" });
  }
  const teacherId = req.user.id;
  const pairs = req.body.pairs;

  if (!pairs || pairs.length === 0) {
    return res.status(400).json({ message: "Fill in your subject and its associated class" });
  }
  // Validate pairs structure
  if (!Array.isArray(pairs) || !pairs.every(pair => pair.subject && pair.class)) {
    return res.status(400).json({ message: "Invalid input" });
  }
  // Check if the teacher already has a setup
  const existingSetup = await SubjectClass.findAll({ where: { teacherId } });
  if (existingSetup.length > 0) {
    return res.status(400).json({ message: "You have already set up your subjects and classes" });
  }

  try {
    const subjectClassPairs = pairs.map(pair => ({
      subject: pair.subject,
      class: pair.class,
      teacherId: teacherId, // Associate the subject class with the teacher 
    }));
    await SubjectClass.bulkCreate(subjectClassPairs);
    return res.status(201).json({
      message: "Subject and class setup successful",
      subjectClasses: subjectClassPairs,
    });
  } catch (error) {
    console.error("Error setting up subjects and classes:", error);
    return res.status(500).json({ message: "Error setting up subjects and classes" });
  }
}


exports.addStudents = async (req, res) => {
  if(req.role !== "teacher") {
    return res.status(403).json({ message: "Access denied, you're not a teacher!" });
  }
  if (!req.file) {
    return res.status(400).send("No file uploaded");
  }
}


const handleTeacherLogin = async (email, password, res) => {
  const teacher = await Teacher.findOne({ where: { email } });
  if (!teacher) {
    return res.status(404).json({ message: "Teacher not found" });
  }

  const isPasswordValid = await bcrypt.compare(password, teacher.password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: "Invalid password" });
  }

  // Implement JWT for teacher login
  const token = jwt.sign({ id: teacher.id, role: "teacher" }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  return res.status(200).json({
    token, // Return the JWT token
    message: "Login successful, proceed to set up your account",
    teacher,
  });
};

const handleStudentLogin = async (email, password, res) => {
  // Implement student login logic here
  // For now, just returning a placeholder response
  return res.status(200).json({
    message: "Student login not implemented yet",
  });
};


// exports.getSchools = async (req, res) => {
//   try {
//     const schools = await School.findAll();
//     return res.status(200).json(schools);
//   } catch (error) {
//     console.error("Error fetching schools:", error);
//     return res.status(500).json({ message: "Error fetching schools" });
//   }
// };