const Queue = require("bull");
const Campaign = require("../models/Campaign");
const User = require("../schema/user");
const Segment = require("../schema/Segment");
const { sendBulkEmails } = require("../../services/emailServices");


const emailQueue = new Queue("emailQueue", {
  redis: { host: "127.0.0.1", port: 6379 }
});

emailQueue.process("send-campaign", async (job) => {
  const { campaignId } = job.data;
  const campaign = await Campaign.findById(campaignId);
  if (!campaign) return;

  // 1. Get segment
  const segment = await Segment.findById(campaign.recipientSegmentId);
  if (!segment) return;

  // 2. Get users based on segment filters
  const users = await User.find(segment.filters);

  console.log("Recipients:", users.length);

  // 3. Loop and send email
 const success = await sendBulkEmails(users, campaign.templateId);
 console.log('success', success)

  // 4. Update campaign status
  campaign.status = "sent";
  await campaign.save();
});

