function authMiddleware(req, res, next) {
  if (!req.session) {
    console.log('req.session', req.session);
    return res.status(401).json({ msg: "Unauthorized. Please login." });
  }

  next();
}

module.exports = authMiddleware;
