const mongoose = require("mongoose");
const initData = require("./blogData");
const Blog = require("../models/blogs");

const dbUrl = "mongodb://127.0.0.1:27017/notesmedia";

async function connectToDatabase() {
  try {
    await mongoose.connect(dbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    await initializeDatabase();
  } catch (err) {
    console.error("MongoDB connection error:", err);
  } finally {
    mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

async function initializeDatabase() {
  try {
    await Blog.deleteMany();
    await Blog.insertMany(initData.data);
    console.log("Data initialized successfully");
  } catch (err) {
    console.error("Error initializing data:", err);
  }
}

connectToDatabase();
