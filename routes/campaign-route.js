const express = require("express");
const router = express.Router();
const { createCampaign, getSegmentsWithUserCount } = require("../controllers/campaignController");

// POST /api/campaigns
router.post("/campaigns", createCampaign);
router.get("/with-count", getSegmentsWithUserCount);

module.exports = router;
