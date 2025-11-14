const TemplateController = require("../controllers/templateController");

const express = require("express");

const router = express.Router();

router.post("/templates", TemplateController.createTemplate);
router.get("/templates", TemplateController.getTemplate);
router.put("/templates/:id", TemplateController.updateTemplate);
router.delete("/templates/:id", TemplateController.deleteTemplate);

module.exports = router;
