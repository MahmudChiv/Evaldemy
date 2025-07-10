// verifyToken.js
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const Teacher = require("../models/Teacher");

exports.verifyToken = async (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1]; // Get token from Authorization header

  if (!token) {
    return res.status(401).json({ message: "Access token is missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user info to request object

    // fetch user details from the database
    if (decoded.role === "admin") {
      const admin = await Admin.findByPk(decoded.id);
      if (!admin) {
        return res.status(404).json({ message: "User not found" });
      }
      req.userDetails = admin;
    } else if (decoded.role === "teacher") {
      const teacher = await Teacher.findByPk(decoded.id);
      if (!teacher) {
        return res.status(404).json({ message: "Teacher not found" });
      }
      req.userDetails = teacher; // Attach teacher details to request object
    }

    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error("JWT verification error:", error);
    return res.status(401).json({ message: "Invalid access token" });
  }
};
