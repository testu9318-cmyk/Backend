const moment = require("moment-timezone");
const Campaign = require("../schema/CampaignSchema");
const Segment = require("../schema/SegmentSchema");
const emailQueue = require("../config/queue/emailQueue");
const User = require("../schema/user");
const buildFilter = require("../builder");

exports.createCampaign = async (req, res) => {
  try {
    const {
      name,
      subject,
      type,
      sendDate,
      sendTime,      // ADD THIS
      timezone,      // used for conversion
      templateId,
      recipientSegmentId
    } = req.body;
console.log('req.body', req.body)
    // Validate required fields
    if (!name || !subject || !type || !sendDate || !sendTime || !timezone || !templateId || !recipientSegmentId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    // Validate segment
    const segment = await Segment.findById(recipientSegmentId);
    console.log('segment', segment)
    if (!segment) {
      return res.status(404).json({
        success: false,
        message: "Recipient segment not found"
      });
    }

   if (!moment(sendDate, "YYYY-MM-DD", true).isValid()) {
  return res.status(400).json({
    success: false,
    message: "sendDate must be in YYYY-MM-DD format"
  });
}

// Validate time format
if (!moment(sendTime, "HH:mm", true).isValid()) {
  return res.status(400).json({
    success: false,
    message: "sendTime must be in HH:mm (24-hour) format"
  });
}

// 1️⃣ Combine date + time in user's timezone
const localDateTime = moment.tz(
  `${sendDate} ${sendTime}`,
  "YYYY-MM-DD HH:mm",
  timezone
);

// 2️⃣ Check if date-time is valid
if (!localDateTime.isValid()) {
  return res.status(400).json({
    success: false,
    message: "Invalid sendDate/sendTime/timezone combination"
  });
}

// 3️⃣ Convert to UTC
const utcDateTime = localDateTime.clone().utc();

// 4️⃣ Calculate delay for Bull
        let delay = utcDateTime.valueOf() - Date.now();

        // Allow today’s date as long as time is ahead
        if (delay < 0) {
        return res.status(400).json({
            success: false,
            message: "sendTime must be later than the current time for today's date"
        });
        }
    // Create campaign (status = draft)
    const campaign = await Campaign.create({
      name,
      subject,
      type,
      sendDate,
      sendTime,
      timezone,
      templateId,
      recipientSegmentId
    });

    await emailQueue.add(
      "send-campaign",
      { campaignId: campaign._id },
      { delay }
    );

    // 5️⃣ Return API response
    return res.json({
      success: true,
      message: "Campaign created successfully",
      data: {
        campaign: {
          id: campaign._id,
          name: campaign.name,
          status: campaign.status
        }
      }
    });

  } catch (error) {
    console.error("Error creating campaign:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};



exports.getSegmentsWithUserCount = async (req, res) => {
  try {
    const segments = await Segment.find();

    const results = await Promise.all(
      segments.map(async (segment) => {
        const filters = segment.filters || {};
        
        // DEBUG: Log the raw filters
        console.log("📋 Segment:", segment.name);
        console.log("📋 Raw Filters:", JSON.stringify(filters, null, 2));

        const query = buildFilter(filters);
        
        // DEBUG: Log the built query
        console.log("🔍 Built Query:", JSON.stringify(query, null, 2));

        const count = await User.countDocuments(query);
        
        // DEBUG: Get actual users to verify
        const users = await User.find(query).limit(5).select('firstName');
        console.log("👥 Sample Users Found:", users);
        console.log("📊 Total Count:", count);

        return {
          _id: segment._id,
          name: segment.name,
          userCount: count,
        };
      })
    );

    return res.json({
      success: true,
      data: results,
    });
  } catch (err) {
    console.error("❌ Segment Count Error →", err);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch segment counts",
      error: err.message,
    });
  }
};
