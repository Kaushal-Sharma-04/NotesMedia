const express = require("express");
const router = express.Router();
const Blog = require("../models/blogs");
const Comment = require("../models/comments");
const { isLoggedIn, isCommentAuthor } = require("../utils/middleware");
const wrapAsync = require("../utils/wrapAsync");

router.post(
  "/blogs/:id/comments",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    console.log(req);
    let blog = await Blog.findById(req.params.id);
    let newComment = new Comment(req.body.comment);
    newComment.blog = blog._id;
    newComment.author = req.user._id;
    blog.comments.push(newComment);

    await newComment.save();
    await blog.save();
    req.flash("success", "New Comment Created!");
    res.redirect(`/blogs/${blog._id}`);
  })
);

router.delete(
  "/blogs/:id/comments/:commentId",
  isLoggedIn,
  isCommentAuthor,
  wrapAsync(async (req, res) => {
    let { id, commentId } = req.params;
    await Blog.findByIdAndUpdate(id, { $pull: { comments: commentId } });
    await Comment.findByIdAndDelete(commentId);
    req.flash("success", "Comment Deleted!");
    res.redirect(`/blogs/${id}`);
  })
);

module.exports = router;
