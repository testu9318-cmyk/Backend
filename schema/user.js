const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // Basic Information
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    age: { type: Number, min: 0 },
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    dob: { type: Date },

    // Contact Info
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String, unique: true, sparse: true },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      country: { type: String },
      zipCode: { type: String },
    },

    // Authentication / Security
    passwordHash: { type: String },
    salt: { type: String },
    isEmailVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
    loginAttempts: { type: Number, default: 0 },

    // Languages & Courses
    languages: [{ type: String, trim: true }],
    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    // Profile & Preferences
    profileImage: { type: String },
    bio: { type: String, maxlength: 500 },
    interests: [{ type: String }],
    skills: [{ type: String }],
    preferredTheme: { type: String, enum: ["light", "dark"], default: "light" },
    notificationsEnabled: { type: Boolean, default: true },
    timezone: { type: String, default: "UTC" },
    languagePreference: { type: String, default: "en" },

    // Social / Connections
    socialLinks: {
      facebook: { type: String },
      twitter: { type: String },
      linkedin: { type: String },
      github: { type: String },
    },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // Roles & Permissions
    role: {
      type: String,
      enum: ["student", "instructor", "admin"],
      default: "student",
    },
    permissions: [{ type: String }],

    // Metadata
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Optional virtual field for full name
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model("User", userSchema);
