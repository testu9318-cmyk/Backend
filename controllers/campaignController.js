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
      sendTime,
      timezone,
      templateId,
      recipientSegmentId
    } = req.body;

    console.log('req.body', req.body);

    // Validate required fields
    if (!name || !subject || !type || !sendDate || !sendTime || !timezone || !templateId || !recipientSegmentId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    // Map common timezone abbreviations to IANA identifiers
    const timezoneMap = {
      'UTC': 'UTC',
      'EST': 'America/New_York',
      'PST': 'America/Los_Angeles',
      'GMT': 'Europe/London',
      'IST': 'Asia/Kolkata',
      'CST': 'America/Chicago',
      'MST': 'America/Denver'
    };

    // Use mapped timezone or original if it's already in IANA format
    const ianaTimezone = timezoneMap[timezone] || timezone;

    // Validate timezone
    if (!moment.tz.zone(ianaTimezone)) {
      return res.status(400).json({
        success: false,
        message: `Invalid timezone provided: ${timezone}`
      });
    }

    // Validate segment
    const segment = await Segment.findById(recipientSegmentId);
    console.log('segment', segment);
    
    if (!segment) {
      return res.status(404).json({
        success: false,
        message: "Recipient segment not found"
      });
    }

    // Validate date format (YYYY-MM-DD)
    if (!moment(sendDate, "YYYY-MM-DD", true).isValid()) {
      return res.status(400).json({
        success: false,
        message: "sendDate must be in YYYY-MM-DD format"
      });
    }

    // Validate time format (HH:mm in 24-hour format)
    if (!moment(sendTime, "HH:mm", true).isValid()) {
      return res.status(400).json({
        success: false,
        message: "sendTime must be in HH:mm (24-hour) format"
      });
    }

    // Combine date + time in user's selected timezone
    const localDateTime = moment.tz(
      `${sendDate} ${sendTime}`,
      "YYYY-MM-DD HH:mm",
      ianaTimezone
    );

    console.log('Selected Timezone:', ianaTimezone);
    console.log('Local DateTime:', localDateTime.format('YYYY-MM-DD HH:mm:ss Z'));

    // Check if the combined date-time is valid
    if (!localDateTime.isValid()) {
      return res.status(400).json({
        success: false,
        message: "Invalid sendDate/sendTime/timezone combination"
      });
    }

    // Convert to UTC for storage and scheduling
    const utcDateTime = localDateTime.clone().utc();
    
    console.log('UTC DateTime:', utcDateTime.format('YYYY-MM-DD HH:mm:ss Z'));
    console.log('Current Time (UTC):', moment.utc().format('YYYY-MM-DD HH:mm:ss Z'));

    // Calculate delay for Bull queue (in milliseconds)
    const delay = utcDateTime.valueOf() - Date.now();

    console.log('Delay in ms:', delay);
    console.log('Delay in minutes:', Math.round(delay / 60000));

    // Ensure the scheduled time is in the future
    if (delay < 0) {
      return res.status(400).json({
        success: false,
        message: "Scheduled time must be in the future"
      });
    }

    // Create campaign in database
    const campaign = await Campaign.create({
      name,
      subject,
      type,
      sendDate,
      sendTime,
      timezone: ianaTimezone, // Store IANA timezone
      scheduledAt: utcDateTime.toDate(), // Store UTC datetime
      templateId,
      recipientSegmentId
    });

    // Add job to email queue with calculated delay
    await emailQueue.add(
      "send-campaign",
      { campaignId: campaign._id },
      { delay }
    );

    // Return success response
    return res.json({
      success: true,
      message: "Campaign created and scheduled successfully",
      data: {
        campaign: {
          id: campaign._id,
          name: campaign.name,
          status: campaign.status,
          scheduledAt: utcDateTime.toISOString(),
          scheduledIn: ianaTimezone,
          localTime: localDateTime.format('YYYY-MM-DD HH:mm:ss Z'),
          utcTime: utcDateTime.format('YYYY-MM-DD HH:mm:ss Z')
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
