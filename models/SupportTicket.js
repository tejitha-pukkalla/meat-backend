const mongoose = require('mongoose');

const communicationSchema = new mongoose.Schema({
  sender: {
    type: String,
    enum: ['Customer', 'Admin'],
    required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'communications.senderModel'
  },
  senderModel: {
    type: String,
    enum: ['Customer', 'Admin']
  },
  message: {
    type: String,
    required: true
  },
  attachments: [{
    url: String,
    type: String,
    filename: String
  }],
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const internalNoteSchema = new mongoose.Schema({
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  note: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const supportTicketSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    unique: true,
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  subject: {
    type: String,
    required: true
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
      'Suggestions'
    ],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
    default: 'Open'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  attachments: [{
    url: String,
    type: String,
    filename: String
  }],
  communications: [communicationSchema],
  internalNotes: [internalNoteSchema],
  relatedOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  resolution: {
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    resolvedAt: Date,
    resolutionNote: String
  },
  closedAt: Date,
  reopenedCount: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Auto-generate ticket ID
supportTicketSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await mongoose.model('SupportTicket').countDocuments();
    this.ticketId = `TKT${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Indexes
supportTicketSchema.index({ ticketId: 1 });
supportTicketSchema.index({ customer: 1 });
supportTicketSchema.index({ status: 1 });
supportTicketSchema.index({ priority: 1 });
supportTicketSchema.index({ createdAt: -1 });
supportTicketSchema.index({ assignedTo: 1 });

// Method to add communication
supportTicketSchema.methods.addCommunication = function(sender, senderId, message, attachments = []) {
  this.communications.push({
    sender,
    senderId,
    senderModel: sender,
    message,
    attachments
  });
  this.lastUpdated = new Date();
};

// Method to add internal note
supportTicketSchema.methods.addInternalNote = function(adminId, note) {
  this.internalNotes.push({
    addedBy: adminId,
    note
  });
  this.lastUpdated = new Date();
};

module.exports = mongoose.model('SupportTicket', supportTicketSchema);