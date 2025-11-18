const CourseServices = require("../services/coursesServices");

const CreateCourses = async (req, res) => {
  try {
    const data = await CourseServices.CreateCourses(req.body);
    return res.json(data);
  } catch {
    return res.status(400);
  }
};

const getCourses = async (req, res) => {
  try {
    const data = await CourseServices.getCourese();
    return res.json(data);
  } catch {
    return res.status(400);
  }
};

const addCourses = async (req, res) => {
  try {
    const data = await CourseServices.AddCourse(req.body);
    return res.json(data);
  } catch {
    return res.status(400);
  }
};

module.exports = { getCourses, CreateCourses, addCourses };
