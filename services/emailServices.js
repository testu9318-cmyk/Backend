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


const getTotalEmails = async () =>{
    try {
      const count = await EmailHistory.countDocuments();
      return { totalEmails: count };
    } catch (error) {
      throw new Error("Error counting emails: " + error.message);
    }
  };


 const  countSentEmails= async () => {
    try {
      const count = await EmailHistory.countDocuments({ status: "sent" });
      return { totalSentEmails: count };
    } catch (error) {
      throw new Error("Error counting sent emails: " + error.message);
    }
  };


  const addUsersAndSendEmails = async (userDatas, roundId, templateId) => {
  const results = [];
  let addedUsers = [];

  try {
    // Add users to the database
    for (let userData of userDatas) {
      const user = await addUserToDatabase(userData); // Add user to DB
      addedUsers.push(user);  // Collect users added to the DB
    }

    // Send emails to the added users
    for (let user of addedUsers) {
      const success = await sendEmailToUser(user._id, roundId, templateId);
      results.push({ userId: user.id, success });
    }

    return results;
  } catch (error) {
    console.error("Error adding users or sending emails:", error);
    throw new Error("Failed to add users or send emails.");
  }
};

// Function to add a user to the database (simplified)
const addUserToDatabase = async (userData) => {
  try {
    // Assuming `User` is the Sequelize model for your users
    const user = await User.create(userData); // Add user with basic data
    return user;
  } catch (error) {
    console.error(`Error adding user ${userId} to the database:`, error);
    throw new Error(`Failed to add user ${userId}`);
  }
};

module.exports = {
  sendEmail,
  sendBulkEmails,
  getTotalEmails,
  countSentEmails,
  addUsersAndSendEmails
};
