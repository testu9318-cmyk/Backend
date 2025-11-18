const Round = require("../schema/roundSchema");

class RoundServices {
  static async getRound() {
    try {
      const rounds = await Round.find().sort({ order: 1 });
      return rounds;
    } catch {
      return res.status(500);
    }
  }

  static async createRound(data) {
    const round = await Round.create(data);
    return round;
  }

  static async updateRound(id, body) {
    try {
      // Find round by id
      const round = await Round.findById(id);
      if (!round) {
        return res.status(404).json({ message: "round not found" });
      }

      const updatedRound = await Round.findByIdAndUpdate(id, body, {
        new: true,
      });
      return updatedRound;
    } catch {
      return res.status(500);
    }
  }

  static async deleteRound(id) {
    try {
      await Round.findByIdAndDelete(id);
      return res.json({ message: "Round deleted" });
    } catch {
      return res.status(500);
    }
  }
}

module.exports = RoundServices;
