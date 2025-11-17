const mongoose = require("mongoose");

const templateSchema = new mongoose.Schema({
  roundId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Round",  
  },
  category: {
    type: String,
    enum: ["Onboarding", "Follow-up", "Newsletter", "Promotional"],
    required: true,
  },
  name: { type: String, required: true },
  subject: { type: String, required: true },
  body: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Template", templateSchema);
