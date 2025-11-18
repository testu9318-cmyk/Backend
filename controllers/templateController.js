const TemplateServices = require("../services/templateServices");

const createTemplate = async (req, res) => {
  try {
    const data = await TemplateServices.createTemplate(req.body);
    return res.json(data);
  } catch {
    return res.status(400);
  }
};

const getTemplate = async (req, res) => {
  try {
    const data = await TemplateServices.getTemplate(req, res);
    return res.json(data);
  } catch {
    return res.status(400);
  }
};

const updateTemplate = async (req, res) => {
  try {
    const data = await TemplateServices.updateTemplate(req.params.id, req.body);
    return res.json(data);
  } catch {
    return res.status(400);
  }
};

const deleteTemplate = async (req, res) => {
  try {
    console.log('req.params.id', req.params.id)
    const data = await TemplateServices.deleteTemplate(req.params.id);
    return res.json(data);
  } catch {
    return res.status(400);
  }
};

const getTotalEmails = async (req, res) => {
  try {
    const data = await TemplateServices.getTotalEmails(req, res);
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ message: "Failed to get total emails", error: error.message });
  }
};

module.exports = {
  createTemplate,
  getTemplate,
  updateTemplate,
  deleteTemplate,
};
