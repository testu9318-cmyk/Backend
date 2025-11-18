const Template = require("../schema/templateSchema");
const Round = require("../schema/roundSchema");
const EmailHistory = require("../schema/emailHistory");

class TemplateServices {
  static async getTemplate(req, res) {
  try {
    const { roundSearch, category, name,selectedDate,customStart,customEnd } = req.query;
    let filter = {};

    if (roundSearch && roundSearch !== "All Rounds") {
      const round = await Round.findOne({
        name: { $regex: `^${roundSearch}`, $options: "i" },
      });

      if (round) {
        filter.roundId = round._id;
      }
    }

    if (category && category !== "All Categories") {
      filter.category = category;
    }

    if (name) {
      filter.name = { $regex: name, $options: "i" };
    }
    const now = new Date();

      switch (selectedDate) {
        case "today":
          const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
          filter.createdAt = { $gte: startOfToday, $lt: endOfToday };
          break;

        case "yesterday":
          const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
          const endOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          filter.createdAt = { $gte: startOfYesterday, $lt: endOfYesterday };
          break;

        case "last7days":
          const sevenDaysAgo = new Date(now);
          sevenDaysAgo.setDate(now.getDate() - 7);
          filter.createdAt = { $gte: sevenDaysAgo, $lte: now };
          break;

        case "last30days":
          const thirtyDaysAgo = new Date(now);
          thirtyDaysAgo.setDate(now.getDate() - 30);
          filter.createdAt = { $gte: thirtyDaysAgo, $lte: now };
          break;

        case "custom":
           if (customStart && customEnd) {
             filter.createdAt = {
               $gte: new Date(customStart), // start of custom range
               $lte: new Date(customEnd + "T23:59:59.999Z"), // include entire end day
             };
           }
          break;

        default:
          // "All time" => no createdAt filter
          break;
      }

    const templates = await Template.find(filter).populate("roundId");

    return res.status(200).json(templates);

  } catch (error) {
    return res.status(500).json({ message: "Server Error", error });
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
