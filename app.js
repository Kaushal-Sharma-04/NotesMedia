require("dotenv").config();
const express = require("express");
const app = express();

const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const path = require("path");
const mongoose = require("mongoose");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const ExpressError = require("./utils/ExpressError");
const User = require("./models/users");
const userRouter = require("./routes/users");
const forgetPassRouter = require("./routes/forgetPass");
const courseRouter = require("./routes/courses");
const blogsRouter = require("./routes/blogs");
const commentsRouter = require("./routes/comments");
const contactRouter = require("./routes/contactUs");
const Course = require("./models/courses");
const Blog = require("./models/blogs");

const dbUrl = process.env.ATLAS_DB_URL;


main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dbUrl);
}
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "/public")));
app.engine("ejs", ejsMate);
app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", () => {
  console.log("ERROR in MONGO SESSION STORE", err);
});

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionOptions));

// Configure passport
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(flash());

// Middleware to set currUser in response locals
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

app.get("/home", async (req, res) => {
  const allCourses = await Course.find({});
  const allBlogs = await Blog.find({});
  res.render("index.ejs", { allCourses, allBlogs });
});

app.use("/", userRouter);
app.use("/", forgetPassRouter);
app.use("/", courseRouter);
app.use("/", blogsRouter);
app.use("/", commentsRouter);
app.use("/", contactRouter);

app.get("/coming-soon", (req, res) => {
  res.render("comingSoon.ejs");
});

app.get("/", (req, res) => {
  res.redirect("/home");
});
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).render("error.ejs", { message });
});

app.listen(8080, () => {
  console.log("Server started on http://localhost:8080");
});
