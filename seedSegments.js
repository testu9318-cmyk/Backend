// FILE: seedSegments.js

const mongoose = require("mongoose");
const Segment = require("./schema/SegmentSchema");

// Replace with your MongoDB connection string
const MONGO_URI = "mongodb+srv://testu9318_db_user:mQcyeyWc1gLJUuBR@cluster0.eorh8e9.mongodb.net/";

const segments = [
  {
    name: "All Users",
    description: "Every user in the system",
    filters: {},
    isActive: true,
  },
  {
    name: "Active Users (Last 30 Days)",
    description: "Users who logged in within the last 30 days",
    filters: {
      lastLogin: {
        $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    },
    isActive: true,
  },
  {
    name: "Verified Email Users",
    description: "Users whose email is verified",
    filters: {
      isEmailVerified: true,
    },
    isActive: true,
  },
  {
    name: "Users from USA",
    description: "Users living in the United States",
    filters: {
      "address.country": "USA",
    },
    isActive: true,
  },
  {
    name: "Users Interested in Programming",
    description: "Users whose interests include programming",
    filters: {
      interests: "programming",
    },
    isActive: true,
  },
];

(async () => {
  try {
    console.log("⏳ Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);

    console.log("✔ Connected.");

    console.log("🗑 Clearing old segments...");
    await Segment.deleteMany();

    console.log("➕ Inserting new segments...");
    await Segment.insertMany(segments);

    console.log("🎉 Successfully added 5 segments to database!");

    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
})();
