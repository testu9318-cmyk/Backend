const express = require("express");
const { getStatus } = require("../controllers/statusController");
const router = express.Router();

// GET route — return static users
router.get("/", getStatus);

// POST route — create a new user (static simulation)

module.exports = router;
