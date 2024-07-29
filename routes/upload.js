const express = require("express");
const router = express.Router();
const multer = require("multer");
const { storage } = require("../cloudinaryConfig");
const upload = multer({ storage });

router.post("/", upload.single("file"), (req, res) => {
  res.json({ url: req.file.path });
});

module.exports = router;
