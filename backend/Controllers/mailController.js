import asyncHandler from "express-async-handler";
import nodemailer from "nodemailer";

// Set up Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "", // Replace with your email
    pass: "", // Replace with your email password or app password
  },
});

// Handle form submission
export const mail = asyncHandler(async (req, res) => {
  const { name, email, phone, subject, category, message } = req.body;

  const mailOptions = {
    from: email,
    to: "mckvie25@gmail.com", // Your email
    subject: `New message from ${name}`,
    html: `
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Category:</strong> ${category}</p>
      <p><strong>Message:</strong> ${message}</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).send("Failed to send email");
  }
});

