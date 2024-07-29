const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const courseSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    url: {
      type: String,
      required: true
    }
  },
  videos_id: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Course", courseSchema);
