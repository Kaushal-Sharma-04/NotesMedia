const express = require("express");
const router = express.Router();
const Blog = require("../models/blogs");
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn } = require("../utils/middleware");
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
  "/blogs/:id",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const blog = await Blog.findById(id);
    res.render("blogs/showBlog.ejs", { blog });
  })
);

router.post(
  "/blogs/new",
  upload.array("images"),
  wrapAsync(async (req, res) => {
    const newBlog = new Blog(req.body.blog);

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

module.exports = router;