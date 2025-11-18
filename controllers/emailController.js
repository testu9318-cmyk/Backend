const EmailHistory = require("../schema/emailHistory");
const { sendEmail, sendBulkEmails,getTotalEmails, countSentEmails } = require("../services/emailServices");

// @desc    Send single email
// @route   POST /api/email/send
exports.sendSingleEmail = async (req, res) => {
  const { userId, roundId, templateId } = req.body;

  if (!userId || !roundId || !templateId) {
    return res.status(400).json({
      success: false,
      error: "userId, roundId, and templateId are required",
    });
  }

  const result = await sendEmail(userId, roundId, templateId);

  res.json({
    success: true,
    message: "Email sent successfully",
    data: result,
  });
};

// @desc    Send bulk emails
// @route   POST /api/email/bulk-send
exports.sendBulkEmail = async (req, res) => {
  const { userIds, roundId, templateId } = req.body;

  if (!userIds || !Array.isArray(userIds) || !roundId || !templateId) {
    return res.status(400).json({
      success: false,
      error: "userIds (array), roundId, and templateId are required",
    });
  }

  const results = await sendBulkEmails(userIds, roundId, templateId);

  const successCount = results.filter((r) => r.success).length;
  const failCount = results.filter((r) => !r.success).length;

  res.json({
    success: true,
    message: `Emails sent to ${successCount} users, ${failCount} failed`,
    data: {
      total: results.length,
      successful: successCount,
      failed: failCount,
      results,
    },
  });
};

// @desc    Get email history
// @route   GET /api/email/history
exports.getEmailHistory = async (req, res) => {
  const { userId, roundId, status } = req.query;

  const filter = {};
  if (userId) filter.userId = userId;
  if (roundId) filter.roundId = roundId;
  if (status) filter.status = status;

  const history = await EmailHistory.find(filter)
    .populate("userId", "name email")
    .populate("roundId", "name")
    .populate("templateId", "name")
    .sort({ sentAt: -1 });

  res.json({
    success: true,
    count: history.length,
    data: history,
  });
};

// @desc    Get email history for specific user
// @route   GET /api/email/history/:userId
exports.getUserEmailHistory = async (req, res) => {
  const history = await EmailHistory.find({ userId: req.params.userId })
    .populate("roundId", "name")
    .populate("templateId", "name")
    .sort({ sentAt: -1 });

  res.json({
    success: true,
    count: history.length,
    data: history,
  });
};


exports.getTotalEmails = async (req, res) => {
  try {
    const data = await getTotalEmails(req, res);
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ message: "Failed to get total emails", error: error.message });
  }
};

exports.getSentEmailCount = async (req, res) => {
  try {
    const data = await countSentEmails();
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ message: "Failed to get sent email count", error: error.message });
  }
};