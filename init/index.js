// const mongoose = require("mongoose");
// const initData = require("./data");
// const Course = require("../models/courses");

// const dbUrl = "";

// async function connectToDatabase() {
//   try {
//     console.log(dbUrl);
//     await mongoose.connect(dbUrl, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });

//     console.log("Connected to MongoDB");

//     await initializeDatabase();
//   } catch (err) {
//     console.error("MongoDB connection error:", err);
//   } finally {
//     mongoose.disconnect();
//     console.log("Disconnected from MongoDB");
//   }
// }

// async function initializeDatabase() {
//   try {
//     await Course.deleteMany();
//     await Course.insertMany(initData.data);
//     console.log("Data initialized successfully");
//   } catch (err) {
//     console.error("Error initializing data:", err);
//   }
// }

// connectToDatabase();
