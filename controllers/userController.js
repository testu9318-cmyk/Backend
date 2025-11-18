const UserService = require("../services/userServices");

class UserController {
  // POST /users
  static async createUser(req, res) {
    console.log("test");

    try {
      const { firstName, lastName, email, passwordHash, ...rest } = req.body;
      if (!firstName || !lastName || !email || !passwordHash) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const user = await UserService.createUser({
        firstName,
        lastName,
        email,
        passwordHash,
        ...rest,
      });
      res.status(201).json({ message: "User created successfully", user });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  // GET /users
  static async getAllUsers(req, res) {
    try {
      const users = await UserService.getAllUsers();
      res.status(200).json(users);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  // GET /users/:id
  static async getUserById(req, res) {
    try {
      const user = await UserService.getUserById(req.params.id);
      res.status(200).json(user);
    } catch (err) {
      res.status(404).json({ message: err.message });
    }
  }
}

module.exports = UserController;
