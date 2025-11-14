const Course = require("../schema/courses");
const User = require("../schema/user");

class CourseServices {
  static async CreateCourses(data) {
    const course = await Course.create(data);
    return course;
  }

  static async getCourese() {
    const courses = await Course.find();
    return courses;
  }

  static async AddCourse(body) {
    try {
      const { userId, courseId } = body;

      // Find user and course
      const user = await User.findById(userId);
      const course = await Course.findById(courseId);
      if (!user || !course) {
        return res.status(404).json({ message: "User or Course not found" });
      }

      // Check if course already added
      if (user.courses.includes(courseId)) {
        return res
          .status(400)
          .json({ message: "Course already added to user" });
      }

      user.courses.push(courseId);
      await user.save();

      // Populate course info if needed
      await user.populate("courses");
      return user;
    } catch {
      return res.status(500);
    }
  }
}

module.exports = CourseServices;
