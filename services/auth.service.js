const User = require("../schema/user");
const bcrypt = require("bcryptjs");

class AuthService {
  async register(data) {
    const { firstName, lastName, email, password } = data;
    const hashed = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      email,
      passwordHash: hashed,
    });
    
    console.log('user', user);
    await user.save();
    return user;
  }

  async login({ email, password }) {
    const user = await User.findOne({ email }).select('+passwordHash');

    if (!user) {
      console.log(' User not found:', email);
      return null;
    }

    console.log(' User found:', email, 'Has passwordHash:', !!user.passwordHash);

    if (!user.passwordHash) {
      console.error(' No passwordHash in database for user:', email);
      return null;
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    
    if (!match) {
      console.log(' Password mismatch for:', email);
      return null;
    }

    console.log(' Password matched for:', email);
    return user;
  }
}

module.exports = new AuthService();