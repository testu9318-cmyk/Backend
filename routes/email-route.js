const express = require("express");
const router = express.Router();
const {
  sendSingleEmail,
  sendBulkEmail,
  getEmailHistory,
  getUserEmailHistory,
  getTotalEmails,
  getSentEmailCount,
  addUsersAndSendBulkEmail
} = require("../controllers/emailController");

router.post("/send", sendSingleEmail);
router.post("/bulk-send", sendBulkEmail);
router.get("/history", getEmailHistory);
router.get("/history/:userId", getUserEmailHistory);
router.get("/total-emails",getTotalEmails);
router.get("/emails/sent/count", getSentEmailCount);
router.post('/add-users-and-send-bulk-email',addUsersAndSendBulkEmail);


module.exports = router;
