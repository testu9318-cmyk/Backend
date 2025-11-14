const Template = require("../schema/templateSchema");

class TemplateServices {
  static async getTemplate(roundId) {
    try {
      const filter = roundId ? { roundId } : {};
      const templates = await Template.find(filter).populate("roundId");
      res.json(templates);
    } catch {
      return res.status(500);
    }
  }

  static async createTemplate(data) {
    const round = await Template.create(data);
    return round;
  }

  static async updateTemplate(id, body) {
    try {
      // Find round by id
      const template = await Template.findById(id);
      if (!template) {
        return res.status(404).json({ message: "template not found" });
      }

      const updatedTemplate = await Template.findByIdAndUpdate(id, body, {
        new: true,
      });
      return updatedTemplate;
    } catch {
      return res.status(500);
    }
  }

  static async deleteTemplate(id) {
    try {
      await Template.findByIdAndDelete(id);
      return res.json({ message: "Templates deleted" });
    } catch {
      return res.status(500);
    }
  }
}

module.exports = TemplateServices;
