// const mongoose = require('mongoose');

// const vendorSchema = new mongoose.Schema({
//   // Basic Info (created by Super Admin)
//   name: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   email: {
//     type: String,
//     required: true,
//     unique: true,
//     lowercase: true,
//     match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
//   },
//   phone: {
//     type: String,
//     required: true,
//     unique: true,
//     match: /^[0-9]{10}$/,
//   },
//   password: {
//     type: String,
//     required: true,
//     minlength: 6,
//   },
  
//   // Address (created by Super Admin)
//   address: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   city: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   state: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   pincode: {
//     type: String,
//     required: true,
//     match: /^[0-9]{6}$/
//   },
  
//   // Legal Compliance (created by Super Admin)
//   fssaiLicense: {
//     type: String,
//     required: true,
//     unique: true,
//     trim: true
//   },
//   fssaiCertificate: {
//     type: String, // File path
//     required: true
//   },
  
//   // Meat Categories (created by Super Admin)
//   meatCategories: [{
//     type: String,
//     enum: ['Chicken', 'Mutton', 'Fish', 'Seafood', 'Beef', 'Pork', 'Eggs']
//   }],
  
//   // Platform Settings (created by Super Admin)
//   commissionRate: {
//     type: Number,
//     default: 20, // ₹20 per order
//     required: true
//   },
//   status: {
//     type: String,
//     enum: ['active', 'inactive', 'pending', 'suspended'],
//     default: 'pending'
//   },
  
//   // Super Admin Reference
//   createdBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'SuperAdmin',
//     required: true
//   },
  
//   // Profile Completion (updated by Vendor later)
//   profileCompletionPercentage: {
//     type: Number,
//     default: 20, // 20% after super admin creates
//     min: 0,
//     max: 100
//   },
  
//   // Business Details (added by Vendor later)
//   businessType: {
//     type: String,
//     enum: ['Butcher Shop', 'Wholesaler', 'Farm Supplier', 'Multi-category', ''],
//     default: ''
//   },
//   businessDescription: {
//     type: String,
//     default: ''
//   },
//   specialization: {
//     type: String,
//     default: ''
//   },
  
//   // Media (added by Vendor later)
//   logo: {
//     type: String,
//     default: ''
//   },
//   shopPhotos: [{
//     type: String
//   }],
//   coverImage: {
//     type: String,
//     default: ''
//   },
  
//   // Operations (added by Vendor later)
//   openingTime: {
//     type: String,
//     default: ''
//   },
//   closingTime: {
//     type: String,
//     default: ''
//   },
//   workingDays: [{
//     type: String,
//     enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
//   }],
//   weeklyOff: {
//     type: String,
//     default: ''
//   },
//   alternatePhone: {
//     type: String,
//     default: ''
//   },
//   landmark: {
//     type: String,
//     default: ''
//   },
//   googleMapsLocation: {
//     type: String,
//     default: ''
//   },
  
//   // Certifications (added by Vendor later)
//   halalCertified: {
//     type: Boolean,
//     default: false
//   },
//   halalCertificate: {
//     type: String,
//     default: ''
//   },
//   jhatkaAvailable: {
//     type: Boolean,
//     default: false
//   },
//   municipalLicense: {
//     type: String,
//     default: ''
//   },
//   healthCertificate: {
//     type: String,
//     default: ''
//   },
//   otherCertifications: [{
//     type: String
//   }],
  
//   // Operations Details (added by Vendor later)
//   coldStorageAvailable: {
//     type: Boolean,
//     default: false
//   },
//   refrigeratedVehicles: {
//     type: Boolean,
//     default: false
//   },
//   deliveryAvailable: {
//     type: Boolean,
//     default: false
//   },
//   deliveryRadius: {
//     type: Number, // in km
//     default: 0
//   },
//   deliveryCharges: {
//     type: Number,
//     default: 0
//   },
//   minimumOrderValue: {
//     type: Number,
//     default: 0
//   },
//   preOrderAccepted: {
//     type: Boolean,
//     default: false
//   },
//   customCuttingService: {
//     type: Boolean,
//     default: false
//   },
//   marinationService: {
//     type: Boolean,
//     default: false
//   },
//   specialServices: [{
//     type: String
//   }],
  
//   // Banking Details (added by Vendor later)
//   bankName: {
//     type: String,
//     default: ''
//   },
//   accountNumber: {
//     type: String,
//     default: ''
//   },
//   ifscCode: {
//     type: String,
//     default: ''
//   },
//   accountHolderName: {
//     type: String,
//     default: ''
//   },
//   upiId: {
//     type: String,
//     default: ''
//   },
//   paymentMethodsAccepted: [{
//     type: String,
//     enum: ['Cash', 'UPI', 'Card', 'Net Banking', 'Wallet']
//   }],
//   bankingVerified: {
//     type: Boolean,
//     default: false
//   },
  
//   // Documents (added by Vendor later)
//   shopEstablishmentCertificate: {
//     type: String,
//     default: ''
//   },
//   tradeLicense: {
//     type: String,
//     default: ''
//   },
//   gstCertificate: {
//     type: String,
//     default: ''
//   },
//   idProof: {
//     type: String,
//     default: ''
//   },
//   addressProof: {
//     type: String,
//     default: ''
//   },
//   documentsVerified: {
//     type: Boolean,
//     default: false
//   },
  
//   // Password Reset
//   resetOTPAttempts: {
//     type: Number,
//     default: 0,
//   },
//   resetOTPLastSent: {
//     type: Date,
//     default: null,
//   },
  
//   // Last Login
//   lastLogin: {
//     type: Date,
//     default: null
//   }
// }, {
//   timestamps: true // createdAt, updatedAt
// });

// module.exports = mongoose.model('Vendor', vendorSchema);

// THIS IS THE CHANGES FOR ADMIN TI VENDOR

const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  // ============================================
  // BASIC INFO (Created by Super Admin - REQUIRED)
  // ============================================
  name: {
    type: String,
    required: [true, 'Vendor name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true,
    match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  
  // ============================================
  // ADDRESS (Created by Super Admin - REQUIRED)
  // ============================================
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true
  },
  pincode: {
    type: String,
    required: [true, 'Pincode is required'],
    match: [/^[0-9]{6}$/, 'Pincode must be 6 digits']
  },
  
  // ============================================
  // LEGAL COMPLIANCE (Created by Super Admin - REQUIRED)
  // ============================================
  fssaiLicense: {
    type: String,
    required: [true, 'FSSAI License is required'],
    unique: true,
    trim: true
  },
  fssaiCertificate: {
    type: String, // File path
    default: '' // ✅ NOT REQUIRED - Can be uploaded later
  },
  
  // ============================================
  // MEAT CATEGORIES (Created by Super Admin - REQUIRED)
  // ============================================
  meatCategories: [{
    type: String,
    enum: ['Chicken', 'Mutton', 'Fish', 'Seafood', 'Beef', 'Pork', 'Eggs']
  }],
  
  // ============================================
  // PLATFORM SETTINGS (Created by Super Admin)
  // ============================================
  commissionRate: {
    type: Number,
    default: 20, // ₹20 per order
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending', 'suspended'],
    default: 'pending'
  },
  
  // ============================================
  // SUPER ADMIN REFERENCE (Link to Super Admin)
  // ============================================
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SuperAdmin',
    required: true
  },
  
  // ============================================
  // PROFILE COMPLETION
  // ============================================
  profileCompletionPercentage: {
    type: Number,
    default: 20, // 20% after super admin creates
    min: 0,
    max: 100
  },
  
  // ============================================
  // BUSINESS DETAILS (Added by Vendor later - OPTIONAL)
  // ============================================
  businessType: {
    type: String,
    enum: ['Butcher Shop', 'Wholesaler', 'Farm Supplier', 'Multi-category', ''],
    default: ''
  },
  businessDescription: {
    type: String,
    default: '',
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  specialization: {
    type: String,
    default: '',
    maxlength: [500, 'Specialization cannot exceed 500 characters']
  },
  
  // ============================================
  // MEDIA (Added by Vendor later - OPTIONAL)
  // ============================================
  logo: {
    type: String,
    default: ''
  },
  shopPhotos: [{
    type: String
  }],
  coverImage: {
    type: String,
    default: ''
  },
  
  // ============================================
  // OPERATIONS (Added by Vendor later - OPTIONAL)
  // ============================================
  openingTime: {
    type: String,
    default: ''
  },
  closingTime: {
    type: String,
    default: ''
  },
  workingDays: [{
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  }],
  weeklyOff: {
    type: String,
    default: ''
  },
  alternatePhone: {
    type: String,
    default: '',
    match: [/^$|^[0-9]{10}$/, 'Alternate phone must be 10 digits']
  },
  landmark: {
    type: String,
    default: ''
  },
  googleMapsLocation: {
    type: String,
    default: ''
  },
  
  // ============================================
  // CERTIFICATIONS (Added by Vendor later - OPTIONAL)
  // ============================================
  halalCertified: {
    type: Boolean,
    default: false
  },
  halalCertificate: {
    type: String,
    default: ''
  },
  jhatkaAvailable: {
    type: Boolean,
    default: false
  },
  municipalLicense: {
    type: String,
    default: ''
  },
  healthCertificate: {
    type: String,
    default: ''
  },
  otherCertifications: [{
    type: String
  }],
  

   // ✅ ADD THIS SECTION - Shop Location in GeoJSON format
  shopLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude] - ORDER IS IMPORTANT!
      default: undefined
    }
  },
  // ============================================
  // OPERATIONS DETAILS (Added by Vendor later - OPTIONAL)
  // ============================================
  coldStorageAvailable: {
    type: Boolean,
    default: false
  },
  refrigeratedVehicles: {
    type: Boolean,
    default: false
  },
  deliveryAvailable: {
    type: Boolean,
    default: false
  },
  deliveryRadius: {
    type: Number, // in km
    default: 0,
    min: [0, 'Delivery radius cannot be negative']
  },
  deliveryCharges: {
    type: Number,
    default: 0,
    min: [0, 'Delivery charges cannot be negative']
  },
  minimumOrderValue: {
    type: Number,
    default: 0,
    min: [0, 'Minimum order value cannot be negative']
  },
  preOrderAccepted: {
    type: Boolean,
    default: false
  },
  customCuttingService: {
    type: Boolean,
    default: false
  },
  marinationService: {
    type: Boolean,
    default: false
  },
  specialServices: [{
    type: String
  }],
  
  // ============================================
  // BANKING DETAILS (Added by Vendor later - OPTIONAL)
  // ============================================
  bankName: {
    type: String,
    default: ''
  },
  accountNumber: {
    type: String,
    default: ''
  },
  ifscCode: {
    type: String,
    default: '',
    uppercase: true
  },
  accountHolderName: {
    type: String,
    default: ''
  },
  upiId: {
    type: String,
    default: ''
  },
  paymentMethodsAccepted: [{
    type: String,
    enum: ['Cash', 'UPI', 'Card', 'Net Banking', 'Wallet']
  }],
  bankingVerified: {
    type: Boolean,
    default: false
  },
  
  // ============================================
  // DOCUMENTS (Added by Vendor later - OPTIONAL)
  // ============================================
  shopEstablishmentCertificate: {
    type: String,
    default: ''
  },
  tradeLicense: {
    type: String,
    default: ''
  },
  gstCertificate: {
    type: String,
    default: ''
  },
  idProof: {
    type: String,
    default: ''
  },
  addressProof: {
    type: String,
    default: ''
  },
  documentsVerified: {
    type: Boolean,
    default: false
  },
  
  // ============================================
  // PASSWORD RESET
  // ============================================
  resetOTPAttempts: {
    type: Number,
    default: 0,
  },
  resetOTPLastSent: {
    type: Date,
    default: null,
  },
  
  // ============================================
  // LAST LOGIN
  // ============================================
  lastLogin: {
    type: Date,
    default: null
  }
}, {
  timestamps: true // createdAt, updatedAt
});

// ============================================
// INDEXES (For faster queries)
// ============================================
vendorSchema.index({ email: 1 });
vendorSchema.index({ phone: 1 });
vendorSchema.index({ fssaiLicense: 1 });
vendorSchema.index({ status: 1 });
vendorSchema.index({ createdBy: 1 });
// ✅ ADD THIS INDEX - Very important for geospatial queries
vendorSchema.index({ shopLocation: '2dsphere' });

module.exports = mongoose.model('Vendor', vendorSchema);