const transporter = require("../config/email");
const User = require("../schema/user");
const Round = require("../schema/roundSchema");
const Template = require("../schema/templateSchema");
const EmailHistory = require("../schema/emailHistory");

// Process template variables
function processTemplate(templateString, data) {
  return templateString.replace(/{{(.*?)}}/g, (_, key) => data[key.trim()] || '');
}


// Send single email
const sendEmail = async (userId, roundId, templateId) => {
  try {
    // Fetch required data
    const user = await User.findById(userId);
    const round = await Round.findById(roundId);
    const template = await Template.findById(templateId);

    if (!user || !round || !template) {
      throw new Error("User, Round, or Template not found");
    }
    // Process template

   const templateData = {
     firstName: user.firstName,
     email: user.email,
   };

    const subject = processTemplate(template.subject, templateData);
    const body = processTemplate(template.body, templateData);

    // Send email
    await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || "Email Manager"}" <${
        process.env.EMAIL_USER
      }>`,
      to: user.email,
      subject: subject,
      html: body,
    });

    // Save to history
    const history = new EmailHistory({
      userId,
      roundId,
      templateId,
      status: "sent",
      emailContent: { subject, body },
    });
    await history.save();

    return {
      success: true,
      historyId: history._id,
      sentAt: history.sentAt,
      email: user.email,
    };
  } catch (error) {
    // Save failed attempt
    const history = new EmailHistory({
      userId,
      roundId,
      templateId,
      status: "failed",
      error: error.message,
    });
    await history.save();

    throw error;
  }
};

// Send bulk emails
const sendBulkEmails = async (userIds, roundId, templateId) => {
  const round = await Round.findById(roundId);
  const template = await Template.findById(templateId);

  if (!round || !template) {
    throw new Error("Round or Template not found");
  }

  const results = [];

  for (const userId of userIds) {
    try {
      const result = await sendEmail(userId, roundId, templateId);
      results.push({
        userId,
        email: result.email,
        success: true,
        historyId: result.historyId,
      });
    } catch (error) {
      results.push({
        userId,
        success: false,
        error: error.message,
      });
    }
  }

  return results;
};

module.exports = {
  sendEmail,
  sendBulkEmails,
};
