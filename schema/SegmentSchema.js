const mongoose = require("mongoose");

const segmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },

    filters: {
      ageRange: {
        min: Number,
        max: Number,
      },

      gender: {
        type: [String],
        enum: ["Male", "Female", "Other"],
      },

      courses: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Course",
        },
      ],

      location: {
        country: String,
        state: String,
        city: String,
      },

      interests: [String],
      skills: [String],

      isEmailVerified: Boolean,
      isActive: Boolean,

      languagePreference: [String],
      timezone: [String],
      role: [String],

      customRules: [
        {
          field: String,
          operator: String,
          value: mongoose.Schema.Types.Mixed,
        },
      ],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Segment", segmentSchema);
