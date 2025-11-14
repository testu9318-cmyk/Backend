const mongoose = require("mongoose");

const roundSchema = new mongoose.Schema({
  name: { type: String, required: true },
  order: { type: Number, required: true },
  description: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Round", roundSchema);
