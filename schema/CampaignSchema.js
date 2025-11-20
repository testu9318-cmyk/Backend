const mongoose = require("mongoose");

const CampaignSchema = new mongoose.Schema({
  name: { type: String, required: true },

  subject: { type: String, required: true },

  type: {
    type: String,
    enum: ["once", "recurring", "triggered"],
    required: true
  },

  sendDate: { type: Date, required: true },
  sendTime: { type: String, required: true },

  timezone: { type: String, required: true },

  templateId: { type: String, required: true },

  // IMPORTANT: segment ID reference
  recipientSegmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Segment",   // <-- points to another collection
    required: true
  },

  status: {
    type: String,
    enum: ["draft", "scheduled", "sending", "sent", "failed"],
    default: "draft"
  }

}, { timestamps: true });

module.exports = mongoose.model("Campaign", CampaignSchema);
