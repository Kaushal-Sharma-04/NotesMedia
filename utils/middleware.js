const Blog = require("../models/blogs.js");
const Comment = require("../models/comments.js");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "Please Login!");
    return res.redirect("/login");
  }
  next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

module.exports.isAuthor = async (req, res, next) => {
  let { id } = req.params;
  let blog = await Blog.findById(id);
  if (!blog.author._id.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not the author of this Blog!");
    return res.redirect(`/blogs/${id}`);
  }
  next();
};

module.exports.isCommentAuthor = async (req, res, next) => {
  let { id, commentId } = req.params;
  let comment = await Comment.findById(commentId);
  if (!comment.author.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not the author of this comment!");
    return res.redirect(`/blogs/${id}`);
  }
  next();
};
