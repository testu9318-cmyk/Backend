const statusServices = require("../services/status/status")


// GET /api/users
 const getStatus = async (req, res) => {
  try {
    const user = await statusServices.createStatus();
    console.log('user', user)
   return res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


module.exports = { getStatus };
