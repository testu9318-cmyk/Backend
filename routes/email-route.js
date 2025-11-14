const express = require("express");
const router = express.Router();
const {
  sendSingleEmail,
  sendBulkEmail,
  getEmailHistory,
  getUserEmailHistory,
} = require("../controllers/emailController");

router.post("/send", sendSingleEmail);
router.post("/bulk-send", sendBulkEmail);
router.get("/history", getEmailHistory);
router.get("/history/:userId", getUserEmailHistory);

module.exports = router;
