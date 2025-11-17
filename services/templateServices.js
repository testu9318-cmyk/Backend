const Template = require("../schema/templateSchema");
const Round = require("../schema/roundSchema");

class TemplateServices {
  static async getTemplate(roundId) {
    try {
      const filter = roundId ? { roundId } : {};
      const templates = await Template.find(filter).populate("roundId");
      return templates;
    } catch {
      return res.status(500);
    }
  }

  static async createTemplate(data) {
    const { roundName, ...rest } = data;
    const round = await Round.findOne({
      name: { $regex: `^${roundName}`, $options: "i" },
    });
    if (!round) {
      throw new Error("Round not found");
    }
    const template = await Template.create({
      ...rest,
      roundId: round._id,
    });

    return template;
  }

  static async updateTemplate(id, body) {
    try {
      // Find round by id
    const { roundName, ...rest } = body;

    const round = await Round.findOne({
      name: { $regex: `^${roundName}`, $options: "i" },
    });
    if (!round) {
      throw new Error("Round not found");
    }

      const template = await Template.findById(id);
      if (!template) {
        return res.status(404).json({ message: "template not found" });
      }

    const updatedTemplate = await Template.findByIdAndUpdate(
      id,
      {
        ...rest,
        roundId: round._id,
      },
      { new: true } // return the updated document
    );
      return updatedTemplate;
    } catch {
      return res.status(500);
    }
  }

  static async deleteTemplate(id) {
    try {
      await Template.findByIdAndDelete(id);
      return { message: "Template deleted successfully" };
    } catch {
      return res.status(500);
    }
  }
}

module.exports = TemplateServices;
