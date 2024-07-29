const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../utils/middleware");
const Course = require("../models/courses");

router.get("/courses", async (req, res) => {
  const allCourses = await Course.find({});
  res.render("courses/courses.ejs", { allCourses });
});

router.get("/courses/:id", isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const courses = await Course.findById(id);
  res.render("courses/courseDetail.ejs", { courses });
});

module.exports = router;
