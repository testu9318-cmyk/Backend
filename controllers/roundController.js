const RoundServices = require("../services/roundServices");

const createRound = async (req, res) => {
  try {
    const data = await RoundServices.createRound(req.body);
    return res.json(data);
  } catch {
    return res.status(400);
  }
};

const getRound = async (req, res) => {
  try {
    const data = await RoundServices.getRound();
    return res.json(data);
  } catch {
    return res.status(400);
  }
};

const updateRound = async (req, res) => {
  try {
    const data = await RoundServices.updateRound(req.params.id, req.body);
    return res.json(data);
  } catch {
    return res.status(400);
  }
};

const deleteRound = async (req, res) => {
  try {
    const data = await RoundServices.deleteRound(req.params.id);
    return res.json(data);
  } catch {
    return res.status(400);
  }
};

module.exports = { createRound, getRound, updateRound, deleteRound };
