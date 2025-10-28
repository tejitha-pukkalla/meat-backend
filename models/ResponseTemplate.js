const mongoose = require('mongoose');

const responseTemplateSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  issueType: {
    type: String,
    enum: [
      'Order Issues',
      'Payment Issues',
      'Account Issues',
      'App/Technical Issues',
      'General Queries',
      'Complaints',
      'Suggestions',
      'Auto-Response'
    ],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  isAutoResponse: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  usageCount: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true
});

// Index for faster queries
responseTemplateSchema.index({ issueType: 1, isActive: 1 });

// Method to increment usage count
responseTemplateSchema.methods.incrementUsage = async function() {
  this.usageCount += 1;
  await this.save();
};

module.exports = mongoose.model('ResponseTemplate', responseTemplateSchema);