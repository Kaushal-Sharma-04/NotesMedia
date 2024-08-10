if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}
const express = require("express");
const app = express();

const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const path = require("path");
const mongoose = require("mongoose");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const session = require("express-session");
const flash = require("connect-flash");
const ExpressError = require("./utils/ExpressError");
const User = require("./models/users");
const userRouter = require("./routes/users");
const courseRouter = require("./routes/courses");
const blogsRouter = require("./routes/blogs");
const commentsRouter = require("./routes/comments");
const Course = require("./models/courses");
const Blog = require("./models/blogs");

const dbUrl = "mongodb://127.0.0.1:27017/notesmedia";

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

const sess = {
  secret: "keyboard cat",
  resave: false,
  saveUninitialized: true,
};

app.use(session(sess));

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
app.use("/", courseRouter);
app.use("/", blogsRouter);
app.use("/", commentsRouter);
app.get("/contact", (req, res) => {
  res.render("contact.ejs");
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
