const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT
exports.protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized. Please log in.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found.' });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account deactivated.' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

// Admin only
exports.adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required.' });
  }
  next();
};

// Admin or specific user
exports.adminOrSelf = (req, res, next) => {
  if (req.user.role === 'admin' || req.user._id.toString() === req.params.id) {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Access denied.' });
};
