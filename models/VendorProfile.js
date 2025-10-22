const mongoose = require('mongoose');

const vendorProfileSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
    unique: true
  },
  
  // Personal Information
  fullName: {
    type: String,
    trim: true,
    default: ''
  },  
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', ''],
    default: ''
  },
  profilePhoto: {
    type: String,
    default: ''
  },
  emergencyContact: {
    type: String,
    default: ''
  },
  
  // Shop Location (IMPORTANT for nearby vendors)
  shopLocation: {
    latitude: {
      type: Number,
      min: -90,
      max: 90
    },
    longitude: {
      type: Number,
      min: -180,
      max: 180
    },
    fullAddress: {
      type: String,
      default: ''
    }
  },
  
  // Shop Images
  shopImages: [{
    type: String
  }],
  
  // Additional Info
  yearsInBusiness: {
    type: Number,
    default: 0
  },
  
}, {
  timestamps: true
});

// Index for geospatial queries (nearby vendors)
vendorProfileSchema.index({ 
  'shopLocation.latitude': 1, 
  'shopLocation.longitude': 1 
});

module.exports = mongoose.model('VendorProfile', vendorProfileSchema);