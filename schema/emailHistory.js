const mongoose = require("mongoose");

const emailHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User ID is required"],
  },
  roundId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Round",
  },
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Template",
    required: [true, "Template ID is required"],
  },
  status: {
    type: String,
    enum: ["sent", "failed"],
    default: "sent",
  },
  sentAt: {
    type: Date,
    default: Date.now,
  },
  emailContent: {
    subject: String,
    body: String,
  },
  error: {
    type: String,
  },
});

module.exports = mongoose.model("EmailHistory", emailHistorySchema);
