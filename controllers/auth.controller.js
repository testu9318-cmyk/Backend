const authService = require("../services/auth.service");

class AuthController {
  async register(req, res) {

    const user = await authService.register(req.body);
    const userObj = {
    id: user._id.toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    isEmailVerified: user.isEmailVerified,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };   
  return res.status(200).json({ msg: "User registered", userObj });
  }

async login(req, res) {
  console.log('📨 Login request received:', { email: req.body.email }); // Don't log password!
  
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      console.log(' Missing credentials');
      return res.status(400).json({ msg: "Email and password are required" });
    }

    const user = await authService.login({ email, password });

    if (!user) {
      console.log(' Invalid credentials for:', email);
      return res.status(401).json({ msg: "Invalid email or password" });
    }

    req.session.userId = user._id.toString();
    console.log(' Login successful for:', email, 'Session ID:', req.session.userId);

    const userObj = {
      id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      isEmailVerified: user.isEmailVerified,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return res.status(200).json({
      msg: "Login success",
      user: userObj,
    });

  } catch (error) {
    console.error(" Login error:", error);
    return res.status(500).json({ msg: "Server error", error: error.message });
  }
}


  async profile(req, res) {
    if (!req.session.userId)
      return res.status(401).json({ msg: "Not authenticated" });

    res.json({
      msg: "Profile access allowed",
      userId: req.session.userId,
    });
  }

  async logout(req, res) {
    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.json({ msg: "Logged out" });
    });
  }
}

module.exports = new AuthController();
