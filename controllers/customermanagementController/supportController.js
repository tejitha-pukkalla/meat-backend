const SupportTicket = require('../../models/SupportTicket');
const ResponseTemplate = require('../../models/ResponseTemplate');
const Customer = require('../../models/Customer');

// Get all support tickets with filters
exports.getAllTickets = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      priority,
      issueType,
      assignedTo,
      search,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (issueType) query.issueType = issueType;
    if (assignedTo) query.assignedTo = assignedTo;

    if (search) {
      query.$or = [
        { ticketId: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } }
      ];
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const tickets = await SupportTicket.find(query)
      .populate('customer', 'name email phone profilePicture')
      .populate('assignedTo', 'name email')
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .lean();

    const count = await SupportTicket.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        tickets,
        pagination: {
          page: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalTickets: count,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tickets',
      error: error.message
    });
  }
};

// Get ticket by ID
exports.getTicketById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ticket ID format'
      });
    }

    const ticket = await SupportTicket.findById(id)
      .populate('customer', 'name email phone profilePicture addresses')
      .populate('assignedTo', 'name email profilePicture')
      .populate('communications.senderId', 'name email profilePicture')
      .populate('internalNotes.addedBy', 'name email')
      .populate('resolution.resolvedBy', 'name email')
      .populate('relatedOrder')
      .lean();

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    res.status(200).json({
      success: true,
      data: ticket
    });
  } catch (error) {
    console.error('Error fetching ticket details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching ticket details',
      error: error.message
    });
  }
};

// Create new ticket
exports.createTicket = async (req, res) => {
  try {
    const {
      customerEmail,
      subject,
      issueType,
      description,
      priority,
      attachments,
      relatedOrder
    } = req.body;

    // Validate required fields
    if (!customerEmail || !subject || !issueType || !description) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: customerEmail, subject, issueType, description'
      });
    }

    // Find customer by email
    const customer = await Customer.findOne({ email: customerEmail });
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found with this email'
      });
    }

    const ticket = new SupportTicket({
      customer: customer._id,
      subject,
      issueType,
      description,
      priority: priority || 'Low',
      attachments: attachments || [],
      relatedOrder
    });

    await ticket.save();

    // Send auto-response if available
    const autoResponse = await ResponseTemplate.findOne({
      isAutoResponse: true,
      isActive: true
    });

    if (autoResponse && typeof ticket.addCommunication === 'function') {
      ticket.addCommunication('Admin', null, autoResponse.content);
      await ticket.save();
      
      if (typeof autoResponse.incrementUsage === 'function') {
        await autoResponse.incrementUsage();
      }
    }

    const populatedTicket = await SupportTicket.findById(ticket._id)
      .populate('customer', 'name email phone')
      .lean();

    res.status(201).json({
      success: true,
      message: 'Ticket created successfully',
      data: populatedTicket
    });
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating ticket',
      error: error.message
    });
  }
};

// Assign ticket to admin
exports.assignTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminId } = req.body;

    // Validate MongoDB ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ticket ID format'
      });
    }

    if (!adminId) {
      return res.status(400).json({
        success: false,
        message: 'Admin ID is required'
      });
    }

    const ticket = await SupportTicket.findById(id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    ticket.assignedTo = adminId;
    if (ticket.status === 'Open') {
      ticket.status = 'In Progress';
    }
    ticket.lastUpdated = new Date();

    await ticket.save();

    const updatedTicket = await SupportTicket.findById(id)
      .populate('assignedTo', 'name email')
      .populate('customer', 'name email')
      .lean();

    res.status(200).json({
      success: true,
      message: 'Ticket assigned successfully',
      data: updatedTicket
    });
  } catch (error) {
    console.error('Error assigning ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Error assigning ticket',
      error: error.message
    });
  }
};

// Add reply/response to ticket
exports.addReply = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, attachments } = req.body;
    const adminId = req.superAdmin.id;

    // Validate MongoDB ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ticket ID format'
      });
    }

    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    const ticket = await SupportTicket.findById(id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    if (typeof ticket.addCommunication === 'function') {
      ticket.addCommunication('Admin', adminId, message, attachments || []);
    }
    
    if (ticket.status === 'Open') {
      ticket.status = 'In Progress';
    }

    await ticket.save();

    const updatedTicket = await SupportTicket.findById(id)
      .populate('communications.senderId', 'name email')
      .populate('customer', 'name email')
      .lean();

    res.status(200).json({
      success: true,
      message: 'Reply added successfully',
      data: updatedTicket
    });
  } catch (error) {
    console.error('Error adding reply:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding reply',
      error: error.message
    });
  }
};

// Add internal note
exports.addInternalNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;
    const adminId = req.superAdmin.id;

    // Validate MongoDB ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ticket ID format'
      });
    }

    if (!note || note.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Note content is required'
      });
    }

    const ticket = await SupportTicket.findById(id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    if (typeof ticket.addInternalNote === 'function') {
      ticket.addInternalNote(adminId, note);
    }
    
    await ticket.save();

    const updatedTicket = await SupportTicket.findById(id)
      .populate('internalNotes.addedBy', 'name email')
      .lean();

    res.status(200).json({
      success: true,
      message: 'Internal note added successfully',
      data: updatedTicket
    });
  } catch (error) {
    console.error('Error adding internal note:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding internal note',
      error: error.message
    });
  }
};

// Update ticket priority
exports.updatePriority = async (req, res) => {
  try {
    const { id } = req.params;
    const { priority } = req.body;

    // Validate MongoDB ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ticket ID format'
      });
    }

    if (!['High', 'Medium', 'Low', 'Urgent'].includes(priority)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid priority value. Must be: High, Medium, Low, or Urgent'
      });
    }

    const ticket = await SupportTicket.findByIdAndUpdate(
      id,
      { priority, lastUpdated: new Date() },
      { new: true }
    ).populate('customer assignedTo', 'name email');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Priority updated successfully',
      data: ticket
    });
  } catch (error) {
    console.error('Error updating priority:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating priority',
      error: error.message
    });
  }
};

// Update ticket status
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate MongoDB ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ticket ID format'
      });
    }

    if (!['Open', 'In Progress', 'Resolved', 'Closed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value. Must be: Open, In Progress, Resolved, or Closed'
      });
    }

    const ticket = await SupportTicket.findById(id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    ticket.status = status;
    ticket.lastUpdated = new Date();

    if (status === 'Closed' && !ticket.closedAt) {
      ticket.closedAt = new Date();
    }

    await ticket.save();

    const updatedTicket = await SupportTicket.findById(id)
      .populate('customer assignedTo', 'name email')
      .lean();

    res.status(200).json({
      success: true,
      message: 'Status updated successfully',
      data: updatedTicket
    });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating status',
      error: error.message
    });
  }
};

// Close ticket with resolution
exports.closeTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { resolutionNote } = req.body;
    const adminId = req.superAdmin.id;

    // Validate MongoDB ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ticket ID format'
      });
    }

    if (!resolutionNote || resolutionNote.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Resolution note is required'
      });
    }

    const ticket = await SupportTicket.findById(id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    ticket.status = 'Closed';
    ticket.closedAt = new Date();
    ticket.resolution = {
      resolvedBy: adminId,
      resolvedAt: new Date(),
      resolutionNote
    };
    ticket.lastUpdated = new Date();

    await ticket.save();

    const updatedTicket = await SupportTicket.findById(id)
      .populate('customer assignedTo resolution.resolvedBy', 'name email')
      .lean();

    res.status(200).json({
      success: true,
      message: 'Ticket closed successfully',
      data: updatedTicket
    });
  } catch (error) {
    console.error('Error closing ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Error closing ticket',
      error: error.message
    });
  }
};

// Reopen ticket
exports.reopenTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.superAdmin.id;

    // Validate MongoDB ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ticket ID format'
      });
    }

    const ticket = await SupportTicket.findById(id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    if (ticket.status !== 'Closed' && ticket.status !== 'Resolved') {
      return res.status(400).json({
        success: false,
        message: 'Only closed or resolved tickets can be reopened'
      });
    }

    ticket.status = 'Open';
    ticket.reopenedCount = (ticket.reopenedCount || 0) + 1;
    ticket.closedAt = undefined;
    ticket.lastUpdated = new Date();

    if (reason && typeof ticket.addInternalNote === 'function') {
      ticket.addInternalNote(adminId, `Ticket reopened: ${reason}`);
    }

    await ticket.save();

    const updatedTicket = await SupportTicket.findById(id)
      .populate('customer assignedTo', 'name email')
      .lean();

    res.status(200).json({
      success: true,
      message: 'Ticket reopened successfully',
      data: updatedTicket
    });
  } catch (error) {
    console.error('Error reopening ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Error reopening ticket',
      error: error.message
    });
  }
};

// Get support ticket statistics
exports.getTicketStats = async (req, res) => {
  try {
    const totalTickets = await SupportTicket.countDocuments();
    const openTickets = await SupportTicket.countDocuments({ status: 'Open' });
    const inProgressTickets = await SupportTicket.countDocuments({ status: 'In Progress' });
    const resolvedTickets = await SupportTicket.countDocuments({ status: 'Resolved' });
    const closedTickets = await SupportTicket.countDocuments({ status: 'Closed' });

    const highPriorityTickets = await SupportTicket.countDocuments({ 
      priority: 'High',
      status: { $in: ['Open', 'In Progress'] }
    });

    // Tickets by issue type
    const ticketsByType = await SupportTicket.aggregate([
      {
        $group: {
          _id: '$issueType',
          count: { $sum: 1 }
        }
      }
    ]);

    // Average resolution time
    const resolutionTimeResult = await SupportTicket.aggregate([
      {
        $match: { status: 'Closed', 'resolution.resolvedAt': { $exists: true } }
      },
      {
        $project: {
          resolutionTime: {
            $subtract: ['$resolution.resolvedAt', '$createdAt']
          }
        }
      },
      {
        $group: {
          _id: null,
          avgResolutionTime: { $avg: '$resolutionTime' }
        }
      }
    ]);

    const avgResolutionTimeHours = resolutionTimeResult[0]
      ? (resolutionTimeResult[0].avgResolutionTime / (1000 * 60 * 60)).toFixed(2)
      : 0;

    res.status(200).json({
      success: true,
      data: {
        totalTickets,
        openTickets,
        inProgressTickets,
        resolvedTickets,
        closedTickets,
        highPriorityTickets,
        ticketsByType,
        avgResolutionTimeHours
      }
    });
  } catch (error) {
    console.error('Error fetching ticket statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching ticket statistics',
      error: error.message
    });
  }
};