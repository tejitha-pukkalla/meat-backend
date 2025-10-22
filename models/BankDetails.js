const mongoose = require('mongoose');
const crypto = require('crypto');

const bankDetailsSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
    unique: true
  },
  
  accountHolderName: {
    type: String,
    default: ''
  },
  bankName: {
    type: String,
    default: ''
  },
  accountNumber: {
    type: String,
    default: '' // Will be encrypted
  },
  ifscCode: {
    type: String,
    uppercase: true,
    default: ''
  },
  branchName: {
    type: String,
    default: ''
  },
  upiId: {
    type: String,
    default: ''
  },
  
  // Verification status
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SuperAdmin'
  },
  verifiedAt: {
    type: Date
  }
  
}, {
  timestamps: true
});

// Encrypt account number before saving
bankDetailsSchema.pre('save', function(next) {
  if (this.isModified('accountNumber') && this.accountNumber) {
    try {
      const algorithm = 'aes-256-cbc';
      const key = Buffer.from(process.env.ENCRYPTION_KEY || 'your-32-character-secret-key!!', 'utf8');
      const iv = crypto.randomBytes(16);
      
      const cipher = crypto.createCipheriv(algorithm, key.slice(0, 32), iv);
      let encrypted = cipher.update(this.accountNumber, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      this.accountNumber = iv.toString('hex') + ':' + encrypted;
    } catch (error) {
      console.error('Encryption error:', error);
    }
  }
  next();
});

// Method to decrypt account number
bankDetailsSchema.methods.getDecryptedAccountNumber = function() {
  if (!this.accountNumber || this.accountNumber === '') return '';
  
  try {
    const algorithm = 'aes-256-cbc';
    const key = Buffer.from(process.env.ENCRYPTION_KEY || 'your-32-character-secret-key!!', 'utf8');
    
    const parts = this.accountNumber.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    
    const decipher = crypto.createDecipheriv(algorithm, key.slice(0, 32), iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    return '';
  }
};

module.exports = mongoose.model('BankDetails', bankDetailsSchema);