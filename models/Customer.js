const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true,
    enum: ['Home', 'Work', 'Other']
  },
  addressLine1: {
    type: String,
    required: true
  },
  addressLine2: String,
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  pincode: {
    type: String,
    required: true
  },
  landmark: String,
  isDefault: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const activityLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true
  },
  description: String,
  ipAddress: String,
  deviceInfo: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  profilePicture: {
    type: String,
    default: ''
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Blocked'],
    default: 'Active'
  },
  blockReason: String,
  blockedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  blockedAt: Date,
  addresses: [addressSchema],
  favoriteVendors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor'
  }],
  favoriteProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  totalOrders: {
    type: Number,
    default: 0
  },
  totalSpending: {
    type: Number,
    default: 0
  },
  averageOrderValue: {
    type: Number,
    default: 0
  },
  lastOrderDate: Date,
  lastActiveDate: Date,
  paymentMethods: [{
    type: {
      type: String,
      enum: ['Card', 'UPI', 'Wallet', 'COD', 'NetBanking']
    },
    lastUsed: Date
  }],
  activityLog: [activityLogSchema],
  fcmToken: String,
  deviceInfo: {
    deviceType: String,
    os: String,
    appVersion: String
  }
}, {
  timestamps: true
});

// Indexes for better query performance
customerSchema.index({ email: 1 });
customerSchema.index({ phone: 1 });
customerSchema.index({ status: 1 });
customerSchema.index({ createdAt: -1 });
customerSchema.index({ totalOrders: -1 });
customerSchema.index({ totalSpending: -1 });

// Method to update order statistics
customerSchema.methods.updateOrderStats = async function(orderAmount) {
  this.totalOrders += 1;
  this.totalSpending += orderAmount;
  this.averageOrderValue = this.totalSpending / this.totalOrders;
  this.lastOrderDate = new Date();
  await this.save();
};

// Method to add activity log
customerSchema.methods.addActivity = function(action, description, ipAddress, deviceInfo) {
  this.activityLog.push({
    action,
    description,
    ipAddress,
    deviceInfo
  });
  if (this.activityLog.length > 100) {
    this.activityLog = this.activityLog.slice(-100);
  }
};

module.exports = mongoose.model('Customer', customerSchema);