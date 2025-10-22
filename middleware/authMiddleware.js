// const jwt = require('jsonwebtoken');
// const Admin = require('../models/Admin');
// const User = require('../models/User');

// // =================== Verify Token ===================
// const verifyToken = async (req, res, next) => {
//   try {
//     // Get token from Authorization header
//     const authHeader = req.headers.authorization;
    
//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//       return res.status(401).json({ 
//         success: false, 
//         message: 'Access denied. No token provided or invalid format. Use: Bearer <token>' 
//       });
//     }

//     const token = authHeader.split(' ')[1];

//     if (!token) {
//       return res.status(401).json({ 
//         success: false, 
//         message: 'Token required' 
//       });
//     }

//     // Verify token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
//     console.log('Decoded Token:', decoded); // For debugging

//     // Attach decoded token to request
//     req.tokenData = decoded;
//     next();
//   } catch (error) {
//     console.error('Token verification error:', error.message);
    
//     if (error.name === 'JsonWebTokenError') {
//       return res.status(401).json({ 
//         success: false, 
//         message: 'Invalid token' 
//       });
//     }
    
//     if (error.name === 'TokenExpiredError') {
//       return res.status(401).json({ 
//         success: false, 
//         message: 'Token expired' 
//       });
//     }
    
//     return res.status(401).json({ 
//       success: false, 
//       message: 'Token verification failed' 
//     });
//   }
// };

// // =================== Verify Admin ===================
// const verifyAdmin = async (req, res, next) => {
//   try {
//     const decoded = req.tokenData;

//     if (!decoded) {
//       return res.status(403).json({ 
//         success: false, 
//         message: 'Token data not found' 
//       });
//     }

//     console.log('Token Role:', decoded.role); // For debugging
//     console.log('Admin ID:', decoded.id); // For debugging

//     // Check if role is admin (case-insensitive)
//     const role = decoded.role?.toLowerCase();
//     if (role !== 'admin' && role !== 'super_admin' && role !== 'manager') {
//       return res.status(403).json({ 
//         success: false, 
//         message: 'Admin access required. Your role: ' + decoded.role 
//       });
//     }

//     // Find admin in DB
//     const admin = await Admin.findById(decoded.id);
    
//     if (!admin) {
//       return res.status(403).json({ 
//         success: false, 
//         message: 'Admin account not found' 
//       });
//     }

//     if (!admin.is_active) {
//       return res.status(403).json({ 
//         success: false, 
//         message: 'Admin account is inactive' 
//       });
//     }

//     console.log('Admin verified:', admin.email); // For debugging

//     // Attach admin object for controllers
//     req.admin = admin;
//     next();
//   } catch (error) {
//     console.error('verifyAdmin error:', error);
//     return res.status(403).json({ 
//       success: false, 
//       message: 'Admin verification failed: ' + error.message 
//     });
//   }
// };

// // =================== Verify User ===================
// const verifyUser = async (req, res, next) => {
//   try {
//     const decoded = req.tokenData;

//     if (!decoded) {
//       return res.status(403).json({ 
//         success: false, 
//         message: 'Token data not found' 
//       });
//     }

//     // Check if role is user
//     const role = decoded.role?.toLowerCase();
//     if (role !== 'user') {
//       return res.status(403).json({ 
//         success: false, 
//         message: 'User access required. Your role: ' + decoded.role 
//       });
//     }

//     // Find user in DB
//     const user = await User.findById(decoded.id);
    
//     if (!user) {
//       return res.status(403).json({ 
//         success: false, 
//         message: 'User account not found' 
//       });
//     }

//     if (!user.is_active) {
//       return res.status(403).json({ 
//         success: false, 
//         message: 'User account is inactive' 
//       });
//     }

//     // Attach user object
//     req.user = user;
//     next();
//   } catch (error) {
//     console.error('verifyUser error:', error);
//     return res.status(403).json({ 
//       success: false, 
//       message: 'User verification failed: ' + error.message 
//     });
//   }
// };

// module.exports = { verifyToken, verifyAdmin, verifyUser };

// THIS IS THE FILE THAT CHANGE FOR ADMIN TO VENDOR 


const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Vendor = require('../models/Vendor');

// =================== Verify Token ===================
const verifyToken = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided or invalid format. Use: Bearer <token>' 
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token required' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    console.log('Decoded Token:', decoded);

    // Attach decoded token to request
    req.tokenData = decoded;
    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired' 
      });
    }
    
    return res.status(401).json({ 
      success: false, 
      message: 'Token verification failed' 
    });
  }
};

// =================== Verify Vendor (NEW) ===================
const verifyVendor = async (req, res, next) => {
  try {
    const decoded = req.tokenData;

    if (!decoded) {
      return res.status(403).json({ 
        success: false, 
        message: 'Token data not found' 
      });
    }

    console.log('Token Role:', decoded.role);
    console.log('Vendor ID:', decoded.id);

    // Check if role is vendor
    const role = decoded.role?.toLowerCase();
    if (role !== 'vendor') {
      return res.status(403).json({ 
        success: false, 
        message: 'Vendor access required. Your role: ' + decoded.role 
      });
    }

    // Find vendor in DB
    const vendor = await Vendor.findById(decoded.id);
    
    if (!vendor) {
      return res.status(403).json({ 
        success: false, 
        message: 'Vendor account not found' 
      });
    }

    // Check vendor status
    if (vendor.status !== 'active') {
      return res.status(403).json({ 
        success: false, 
        message: `Vendor account is ${vendor.status}. Contact Super Admin for activation.`
      });
    }

    console.log('Vendor verified:', vendor.email);

    // Attach vendor object for controllers
    req.user = vendor; // Using req.user to maintain consistency
    next();
  } catch (error) {
    console.error('verifyVendor error:', error);
    return res.status(403).json({ 
      success: false, 
      message: 'Vendor verification failed: ' + error.message 
    });
  }
};

// =================== Verify User ===================
const verifyUser = async (req, res, next) => {
  try {
    const decoded = req.tokenData;

    if (!decoded) {
      return res.status(403).json({ 
        success: false, 
        message: 'Token data not found' 
      });
    }

    // Check if role is user
    const role = decoded.role?.toLowerCase();
    if (role !== 'user') {
      return res.status(403).json({ 
        success: false, 
        message: 'User access required. Your role: ' + decoded.role 
      });
    }

    // Find user in DB
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(403).json({ 
        success: false, 
        message: 'User account not found' 
      });
    }

    if (!user.is_active) {
      return res.status(403).json({ 
        success: false, 
        message: 'User account is inactive' 
      });
    }

    // Attach user object
    req.user = user;
    next();
  } catch (error) {
    console.error('verifyUser error:', error);
    return res.status(403).json({ 
      success: false, 
      message: 'User verification failed: ' + error.message 
    });
  }
};

module.exports = { verifyToken, verifyVendor, verifyUser };