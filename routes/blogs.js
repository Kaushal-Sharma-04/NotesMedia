const express = require("express");
const router = express.Router();
const Blog = require("../models/blogs");
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn, isAuthor } = require("../utils/middleware");
const Course = require("../models/courses");
const { storage } = require("../cloudinaryConfig");
const multer = require("multer");
const upload = multer({ storage });

router.get("/blogs", async (req, res) => {
  const allBlogs = await Blog.find({});
  res.render("blogs/blogs.ejs", { allBlogs });
});

router.get("/blogs/new", isLoggedIn, (req, res) => {
  res.render("blogs/newBlog.ejs", {
    cloudName: process.env.CLOUD_NAME,
    uploadPreset: process.env.UPLOAD_PRESET,
  });
});

router.get(
  "/user/blogs",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    // Fetch blogs authored by the logged-in user
    const userBlogs = await Blog.find({ author: req.user._id });
    res.render("blogs/userBlog.ejs", { userBlogs });
  })
);

router.get(
  "/blogs/:id",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const blog = await Blog.findById(id)
      .populate({ path: "comments", populate: { path: "author" } })
      .populate("author");
    if (!blog) {
      req.flash("error", "Cannot find that blog!");
      return res.redirect("/blogs");
    }
    res.render("blogs/showBlog.ejs", { blog });
  })
);

// Search Route
router.get(
  "/search",
  wrapAsync(async (req, res) => {
    const searchQuery = req.query.q;
    if (!searchQuery) {
      return res.render("search", { results: [], query: "" });
    }

    // Search in Blogs
    const blogResults = await Blog.find({
      $or: [
        { title: { $regex: searchQuery, $options: "i" } },
        { description: { $regex: searchQuery, $options: "i" } },
      ],
    });

    // Search in Courses
    const courseResults = await Course.find({
      $or: [
        { title: { $regex: searchQuery, $options: "i" } },
        { description: { $regex: searchQuery, $options: "i" } },
      ],
    });

    // Combine results
    const results = [
      ...blogResults.map((item) => ({ type: "Blog", ...item._doc })),
      ...courseResults.map((item) => ({ type: "Course", ...item._doc })),
    ];

    res.render("search.ejs", { results, query: searchQuery });
  })
);

router.post(
  "/blogs/new",
  isLoggedIn,
  upload.array("images"),
  wrapAsync(async (req, res) => {
    const newBlog = new Blog(req.body.blog);
    newBlog.author = req.user._id;

    // Process images uploaded via TinyMCE
    const imageUrls = req.body.blog.imageUrls
      ? req.body.blog.imageUrls.split(";").filter((url) => url !== "")
      : [];

    // Add the images from the hidden input field
    imageUrls.forEach((url) => {
      newBlog.images.push({ url, filename: url.split("/").pop() });
    });

    // Add the images from the file upload (if any)
    if (req.files && req.files.length) {
      req.files.forEach((file) => {
        newBlog.images.push({ url: file.path, filename: file.filename });
      });
    }

    await newBlog.save();
    res.redirect("/blogs");
  })
);

router.get(
  "/blogs/:id/edit",
  isLoggedIn,
  isAuthor,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const blog = await Blog.findById(id);
    res.render("blogs/editBlog.ejs", {
      blog,
      cloudName: process.env.CLOUD_NAME,
      uploadPreset: process.env.UPLOAD_PRESET,
    });
  })
);

// Handle updating a blog
router.put(
  "/blogs/:id",
  isLoggedIn,
  isAuthor,
  upload.array("images"),
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const updatedBlog = req.body.blog;

    // Find the existing blog
    const blog = await Blog.findById(id);

    if (!blog) {
      req.flash("error", "Cannot find that blog!");
      return res.redirect("/blogs");
    }

    // Process images uploaded via TinyMCE
    const imageUrls = req.body.blog.imageUrls
      ? req.body.blog.imageUrls.split(";").filter((url) => url !== "")
      : [];

    // Update the images from the hidden input field
    blog.images = imageUrls.map((url) => ({
      url,
      filename: url.split("/").pop(),
    }));

    // Add the images from the file upload (if any)
    if (req.files && req.files.length) {
      req.files.forEach((file) => {
        blog.images.push({ url: file.path, filename: file.filename });
      });
    }

    // Update other blog fields
    blog.title = updatedBlog.title;
    blog.excerpt = updatedBlog.excerpt;
    blog.content = updatedBlog.content;

    // Save the updated blog
    await blog.save();

    // Redirect to the updated blog page
    res.redirect(`/blogs/${id}`);
  })
);

router.delete(
  "/blogs/:id",
  isLoggedIn,
  isAuthor,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Blog.findByIdAndDelete(id); // This triggers the pre-hook
    req.flash("success", "Blog and associated comments deleted successfully");
    res.redirect("/blogs");
  })
);

module.exports = router;
