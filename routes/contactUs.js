const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn } = require("../utils/middleware");

router.get("/contact", isLoggedIn, (req, res) => {
  res.render("contact/contact.ejs");
});

// Handle form submission
router.post(
  "/contact-submit",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    const { name, phone_number, email, query } = req.body;
    console.log(req.body);

    // Create a transporter object using SMTP transport
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Replace with your email
        pass: process.env.EMAIL_PASS, // Replace with your email password
      },
    });

    // Set up email data
    const mailOptions = {
      from: process.env.EMAIL_USER, // Your email address
      to: "rudrakshayt04@gmail.com", // Your email address (or multiple recipients)
      replyTo: email, // User's email address for replies
      subject: "New Contact Us Message",
      text: `Name: ${name}\nPhone Number: ${phone_number}\nEmail: ${email}\n\nQuery:\n${query}`, // Email body
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
    res.redirect("confirmation"); // Redirect to confirmation page
  })
);

// Route to serve the confirmation page
router.get("/confirmation", isLoggedIn, (req, res) => {
  res.render("contact/confirmation.ejs");
});

module.exports = router;
