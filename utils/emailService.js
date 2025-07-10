// utils/emailService.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendLoginEmail = async (to, password) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: "Login to Evaldemy",
    text: `Welcome to evaldemy,visit ${process.env.WEB_URL} and setup your account. Your login details include:
                - Email: ${to}
                - Password: ${password}`,
  };

  return transporter.sendMail(mailOptions);
};
