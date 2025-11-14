require("dotenv").config(); // <-- must be at the top

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT), // ensure it's a number
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.log("Email service configuration error:", error);
  } else {
    console.log("Email service is ready to send messages");
  }
});
module.exports = transporter;
