// here course scherma and also know as modal

// models/Course.js
const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },

  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },

  description: {
    type: String,
    required: true,
  },

  category: {
    type: String,
    enum: ["Programming", "Design", "Marketing", "Business", "Other"],
    default: "Other",
  },

  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // assuming you have a User model
    required: true,
  },

  price: {
    type: Number,
    required: true,
    min: 0,
  },

  discountPrice: {
    type: Number,
    default: 0,
  },

  duration: {
    type: String, // e.g., "10 hours", "6 weeks"
    required: true,
  },

  level: {
    type: String,
    enum: ["Beginner", "Intermediate", "Advanced"],
    default: "Beginner",
  },

  language: {
    type: String,
    default: "English",
  },

  thumbnail: {
    type: String, // URL or file path
    default: "",
  },

  videoUrl: {
    type: String,
  },

  lessons: [
    {
      title: String,
      content: String,
      videoUrl: String,
      duration: String,
    },
  ],

  tags: [String],

  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 },
  },

  studentsEnrolled: {
    type: Number,
    default: 0,
  },

  isPublished: {
    type: Boolean,
    default: false,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Auto-update `updatedAt` before saving
courseSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Course", courseSchema);
