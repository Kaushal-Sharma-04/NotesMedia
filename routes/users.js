if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const router = express.Router();
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth2").Strategy;
const wrapAsync = require("../utils/wrapAsync");
const { saveRedirectUrl } = require("../utils/middleware");
const User = require("../models/users");

// Google OAuth2 Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.CALLBACK_URL,
    },
    async function (accessToken, refreshToken, profile, done) {
      try {
        const email = profile.emails && profile.emails[0].value;
        if (!email) {
          return done(new Error("No email found in Google profile"));
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
          // If the email exists, log the user in with the existing account
          return done(null, existingUser);
        }

        // Create a new user if not found
        const newUser = new User({
          googleId: profile.id,
          email: email,
          username: profile.displayName,
        });

        await newUser.save();
        return done(null, newUser);
      } catch (err) {
        // Log the error for debugging purposes
        console.error(err);
        return done(err);
      }
    }
  )
);

// Passport serialization and deserialization
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).exec();
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Google OAuth routes
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/auth/google/callback",
  saveRedirectUrl,
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    req.flash("success", "Welcome back to NotesMedia!");
    let redirectUrl = res.locals.redirectUrl || "/home";
    res.redirect(redirectUrl);
  }
);

// Login routes
router.get("/login", (req, res) => {
  res.render("users/login.ejs");
});

router.post(
  "/login",
  saveRedirectUrl,
  passport.authenticate("local", {
    successRedirect: "/home",
    failureRedirect: "/login",
    failureFlash: true,
  }),
  (req, res) => {
    req.flash("success", "Welcome back to NotesMedia!");
    let redirectUrl = res.locals.redirectUrl || "/home";
    res.redirect(redirectUrl);
  }
);

// Signup route
router.get("/signup", (req, res) => {
  res.render("users/signup.ejs");
});

router.post(
  "/signup",
  wrapAsync(async (req, res) => {
    const { username, email, password } = req.body;

    // Check if email or username already exists
    const existingUser = await User.findOne({
      $or: [{ email: email }, { username: username }],
    });

    if (existingUser) {
      req.flash("error", "Email or Username already exists.");
      return res.redirect("/signup");
    }

    // Create a new User instance
    const newUser = new User({ username, email });

    // Register the user with passport-local-mongoose
    User.register(newUser, password, (err, user) => {
      if (err) {
        console.error(err);
        return res.render("users/signup.ejs", { error: err.message });
      }
      passport.authenticate("local")(req, res, () => {
        res.redirect("/home");
      });
    });
  })
);

// Logout route
router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/login");
  });
});

module.exports = router;
