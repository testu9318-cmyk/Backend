const TemplateServices = require("../services/templateServices");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error("❌ GEMINI_API_KEY is missing. Add it to your .env file.");
  
}
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

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

const generateEmailContent = async (req, res) => {
  try {
    const {
      templateName,
      round,
      category,
      currentSubject,
      tone,
      purpose,
      additionalInfo,
    } = req.body;

    // Validate required fields
    if (!templateName || !round || !category) {
      return res.status(400).json({
        error: "Missing required fields: templateName, round, category",
      });
    }

    // Create the prompt for Gemini
    const prompt = `Generate a professional email template with the following specifications:

Template Name: ${templateName}
Round: ${round}
Category: ${category}
Tone: ${tone || "professional"}
Purpose: ${purpose || "general communication"}
${additionalInfo ? `Additional Context: ${additionalInfo}` : ""}
${currentSubject ? `Current Subject Line: ${currentSubject}` : ""}

Requirements:
1. Generate a compelling subject line (if current subject is provided, improve it)
2. Generate email body content that is ${tone} and suitable for ${category} emails
3. Use template variables like {{firstName}}, {{lastName}}, {{email}}, {{companyName}} where appropriate
4. Keep the email concise but informative (150-300 words)
5. Include appropriate greeting and closing
6. Make it sound natural and human-like
7. For ${round}, make sure the content is appropriate for that stage of communication

Return ONLY a valid JSON object in this exact format (no markdown, no code blocks):
{
  "subject": "Your generated subject line here",
  "body": "Your generated email body here"
}`;

    // Call Gemini API
    
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });   
   const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Clean up the response - remove markdown code blocks if present
    text = text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    // Parse the JSON response
    let generatedContent;
    try {
      generatedContent = JSON.parse(text);
    } catch (parseError) {
      // If parsing fails, try to extract JSON from the text
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        generatedContent = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to parse AI response as JSON");
      }
    }

    // Validate response structure
    if (!generatedContent.subject || !generatedContent.body) {
      return res.status(500).json({
        error: "Invalid AI response structure",
        details: "Response missing subject or body",
      });
    }

    // Return the generated content
    res.json({
      success: true,
      subject: generatedContent.subject,
      body: generatedContent.body,
      metadata: {
        tone,
        category,
        round,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error generating email content:", error);
    res.status(500).json({
      error: "Failed to generate email content",
      message: error.message,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};



module.exports = {
  createTemplate,
  getTemplate,
  updateTemplate,
  deleteTemplate,
  generateEmailContent
};
