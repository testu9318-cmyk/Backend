const CoursesController = require("../controllers/coursesController");
const express = require("express");

const router = express.Router();

router.post("/courses", CoursesController.CreateCourses);
router.get("/courses", CoursesController.getCourses);
router.post("/add-courses", CoursesController.addCourses);

module.exports = router;
