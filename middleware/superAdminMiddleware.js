const jwt = require('jsonwebtoken');
const SuperAdmin = require('../models/SuperAdmin');

// Verify JWT Token
const verifyToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Authorization denied.'
      });
    }

    // Extract token
    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find super admin in database
    const superAdmin = await SuperAdmin.findById(decoded.id).select('-password');

    if (!superAdmin) {
      return res.status(401).json({
        success: false,
        message: 'Super Admin not found. Invalid token.'
      });
    }

    // Check if account is active
    if (superAdmin.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Contact support.'
      });
    }

    // Attach super admin to request
    req.superAdmin = {
      id: superAdmin._id,
      email: superAdmin.email,
      name: superAdmin.name,
      role: 'super_admin'
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.'
      });
    }
    
    console.error('Token Verification Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Token verification failed',
      error: error.message
    });
  }
};

// Check if authenticated user is Super Admin
const checkSuperAdmin = (req, res, next) => {
  if (!req.superAdmin) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (req.superAdmin.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Super Admin privileges required.'
    });
  }

  next();
};

module.exports = {verifyToken,checkSuperAdmin};