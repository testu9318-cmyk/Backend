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
const sendEmail = async (userId, templateId) => {
  try {
    // Fetch required data
    const user = await User.findById(userId);
    const template = await Template.findById(templateId);

    if (!user || !template) {
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
      templateId,
      status: "failed",
      error: error.message,
    });
    await history.save();

    throw error;
  }
};

// Send bulk emails
const sendBulkEmails = async (userIds, templateId) => {
  const template = await Template.findById(templateId);
  if (!template) {
    throw new Error("Template not found");
  }

  const results = [];

  for (const userId of userIds) {
    try {
      const result = await sendEmail(userId, templateId);
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


  const addUsersAndSendEmails = async (userDatas,templateId) => {
  const results = [];
  let addedUsers = [];

  try {
   for (let userData of userDatas) {
      const { id, ...rest } = userData; 
     const user = await addUserToDatabase(rest); 
     addedUsers.push(user);
   }
    // Send emails to the added users
      const success = await sendBulkEmails(addedUsers, templateId);
      results.push(...success);
    console.log('results', results)
    return results;
  } catch (error) {
    console.error("Error adding users or sending emails:", error);
    throw new Error("Failed to add users or send emails.");
  }
};

// Function to add a user to the database (simplified)
const addUserToDatabase = async (userData) => {
  try {
    const cleanData = {
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      name: userData.name,
    };

    const user = await User.create(cleanData);
    return user;

  } catch (error) {
    console.error(`Error adding user to the database:`, error);
    throw new Error(`Failed to add user`);
  }
};

module.exports = {
  sendEmail,
  sendBulkEmails,
  getTotalEmails,
  countSentEmails,
  addUsersAndSendEmails
};
