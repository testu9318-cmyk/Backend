const User = require("../schema/user");

class UserService {
  // Create a new user
  static async createUser(userData) {
    // Check if email exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new Error("Email already exists");
    }
    const user = new User(userData);
    return await user.save();
  }

  // Get all users
  static async getAllUsers() {
    return await User.find().select("-passwordHash -salt").populate("courses");
  }

  // Get single user by ID
  static async getUserById(id) {
    const user = await User.findById(id).select("-passwordHash -salt");
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }
}

module.exports = UserService;
