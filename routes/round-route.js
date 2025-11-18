const RoundController = require("../controllers/roundController");

const express = require("express");

const router = express.Router();

router.post("/rounds", RoundController.createRound);
router.get("/rounds", RoundController.getRound);
router.put("/rounds/:id", RoundController.updateRound);
router.delete("/rounds/:id", RoundController.deleteRound);

module.exports = router;
