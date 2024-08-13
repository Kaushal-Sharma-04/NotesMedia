const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Comment = require("./comments");

const blogSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    excerpt: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    images: [
      {
        url: {
          type: String,
          required: false,
        },
        filename: {
          type: String,
          required: false,
        },
      },
    ],
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// Middleware to delete associated comments when a blog is deleted
blogSchema.pre("findOneAndDelete", async function (next) {
  const blog = await this.model.findOne(this.getQuery());
  await Comment.deleteMany({ blog: blog._id });
  next();
});

module.exports = mongoose.model("Blog", blogSchema);
