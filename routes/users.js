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

        // Find or create the user
        const user = await User.findOneAndUpdate(
          { googleId: profile.id },
          { googleId: profile.id, email: email, username: profile.displayName },
          { new: true, upsert: true }
        );

        return done(null, user);
      } catch (err) {
        // Log the error for debugging purposes
        console.error(err);
        return done(err);
      }
    }
  )
);

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

router.get("/signup", (req, res) => {
  res.render("users/signup.ejs");
});

router.post(
  "/signup",
  wrapAsync(async (req, res) => {
    const { username, email, password } = req.body;

    // Create a new User instance but don't save it yet
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

router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/login");
  });
});

module.exports = router;
