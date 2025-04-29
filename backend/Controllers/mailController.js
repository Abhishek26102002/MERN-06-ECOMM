import asyncHandler from "express-async-handler";
import nodemailer from "nodemailer";

// Set up Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER, // Replace with your email
    pass: process.env.MAIL_PASS, // Replace with your email password or app password
  },
});

// Handle form submission
export const mail = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const mailOptions = {
    from: process.env.MAIL_USER,
    to: user.email, // user email
    subject: `OTP verification for Ecomm App`,
    html: `<p>Your OTP is <strong>${otp}</strong>. It will expire in 10 minutes.</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).send("Failed to send email");
  }
});
