const express = require("express");
const router = express.Router();
const User = require("../models/users");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

// Forgot Password Route
router.get("/forgot-password", (req, res) => {
  res.render("users/forgetPass.ejs");
});

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    req.flash("error", "No account with that email address exists.");
    return res.redirect("/forgot-password");
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/reset-password/${resetToken}`;

  const message = `
  Dear ${user.username},
  
  We received a request to reset the password for your account. You can reset your password by clicking the link below:
  
  ${resetURL}
  
  Please note that this link is only valid for the next 10 minutes.
  
  If you did not request a password reset, please disregard this email. Your account remains secure.
  
  Thank you,
  The NotesMedia Team
  `;

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Your password reset token (valid for 10 minutes)",
      text: message,
    });

    req.flash("success", "Token sent to email!");
    res.redirect("/forgot-password");
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save({ validateBeforeSave: false });

    req.flash(
      "error",
      "There was an error sending the email. Try again later!"
    );
    res.redirect("/forgot-password");
  }
});

// Reset Password Route
router.get("/reset-password/:token", async (req, res) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    req.flash("error", "Token is invalid or has expired.");
    return res.redirect("/forgot-password");
  }

  res.render("users/resetPass", { token: req.params.token });
});

router.post("/reset-password/:token", async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      req.flash("error", "Token is invalid or has expired.");
      return res.redirect("/forgot-password");
    }

    if (req.body.password !== req.body.confirmPassword) {
      req.flash("error", "Passwords do not match.");
      return res.redirect("back");
    }

    // Use passport-local-mongoose's setPassword method to hash and set the password
    await user.setPassword(req.body.password);

    // Clear the reset token and expiration fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    req.flash("success", "Password reset successful. You can now log in.");
    res.redirect("/login");
  } catch (error) {
    console.error("Error resetting password:", error);
    req.flash("error", "Something went wrong. Please try again.");
    res.redirect("/forgot-password");
  }
});

module.exports = router;
