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
    const data = await TemplateServices.getTemplate();
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
    const data = await TemplateServices.deleteTemplate(req.params.id);
    return res.json(data);
  } catch {
    return res.status(400);
  }
};

module.exports = {
  createTemplate,
  getTemplate,
  updateTemplate,
  deleteTemplate,
};
