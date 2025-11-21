const emailQueue = require("../queue/emailQueue");
const { Worker } = require("bullmq");

const Campaign = require("../../schema/CampaignSchema");
const User = require("../../schema/user");
const Segment = require("../../schema/SegmentSchema");
const { sendBulkEmails } = require("../../services/emailServices");

// Process the campaign emails
require("dotenv").config();
const mongoose = require("mongoose");
const buildFilter = require("../../builder");

const connection = {
  host: "127.0.0.1",
  port: 6379,
};

// ----------------------
// 🔥 CONNECT MONGODB HERE
// ----------------------
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("✅ Worker connected to MongoDB");
  } catch (err) {
    console.error("❌ Worker MongoDB connection failed", err);
    process.exit(1);
  }
}

connectDB();

// ----------------------
//  🔥 START WORKER
// ----------------------
console.log("📩 Email worker started");
function cleanFilters(filters) {
  const cleaned = {};

  for (const key in filters) {
    const value = filters[key];

    // Skip function values or mongoose internals
    if (typeof value === "function") continue;
    if (key.startsWith("$")) continue; // skip $isNew etc

    // Skip empty objects
    if (
      typeof value === "object" &&
      !Array.isArray(value) &&
      Object.keys(value).length === 0
    ) {
      continue;
    }

    // Skip undefined
    if (value === undefined || value === null) continue;

    // Array handling
    if (Array.isArray(value)) {
      if (value.length === 0) continue;
      if (value.length === 1) {
        cleaned[key] = value[0]; // exact match
      } else {
        cleaned[key] = { $in: value };
      }
      continue;
    }

    cleaned[key] = value;
  }

  return cleaned;
}

const worker = new Worker(
  "emailQueue",
  async (job) => {
    console.log(`🔥 Processing job ${job.id}`);
    const { campaignId } = job.data;
    console.log("campaignId", campaignId);
    const campaign = await Campaign.findById(campaignId);
    console.log("campaign", campaign);
    if (!campaign) throw new Error("Campaign not found");

    const segment = await Segment.findById(campaign.recipientSegmentId);
      const filters = segment.filters || {};
        
        // DEBUG: Log the raw filters
        console.log("📋 Segment:", segment.name);
        console.log("📋 Raw Filters:", JSON.stringify(filters, null, 2));

        const query = buildFilter(filters);
        
        // DEBUG: Log the built query
        console.log("🔍 Built Query:", JSON.stringify(query, null, 2));

    const users = await User.find(query);

    console.log("Users:", users.length);

    await sendBulkEmails(users, campaign.templateId);

    campaign.status = "sent";
    campaign.sentAt = new Date();
    await campaign.save();

    return { sent: users.length };
  },
  { connection }
);

worker.on("completed", (job) => {
  console.log(`✔ Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`❌ Job ${job.id} failed`, err);
});
