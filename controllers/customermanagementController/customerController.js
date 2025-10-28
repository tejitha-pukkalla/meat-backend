const Customer = require('../../models/Customer');

// Note: Import Order model when ready
// const Order = require('../../models/Order');

// Get all customers with filters and pagination
exports.getAllCustomers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      search,
      startDate,
      endDate,
      minOrders,
      maxOrders,
      minSpending,
      maxSpending,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    if (minOrders || maxOrders) {
      query.totalOrders = {};
      if (minOrders) query.totalOrders.$gte = parseInt(minOrders);
      if (maxOrders) query.totalOrders.$lte = parseInt(maxOrders);
    }

    if (minSpending || maxSpending) {
      query.totalSpending = {};
      if (minSpending) query.totalSpending.$gte = parseFloat(minSpending);
      if (maxSpending) query.totalSpending.$lte = parseFloat(maxSpending);
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const customers = await Customer.find(query)
      .select('-password -activityLog')
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .lean();

    const count = await Customer.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        customers,
        pagination: {
          page: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalCustomers: count,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching customers',
      error: error.message
    });
  }
};

// Get customer by ID with full details
exports.getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid customer ID format'
      });
    }

    const customer = await Customer.findById(id)
      .select('-password')
      .populate('favoriteVendors', 'name logo')
      .populate('favoriteProducts', 'name image price')
      .lean();

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        customer,
        orders: [] // Empty until Order model is ready
      }
    });
  } catch (error) {
    console.error('Error fetching customer details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching customer details',
      error: error.message
    });
  }
};

// Get customer profile with order statistics
exports.getCustomerProfile = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid customer ID format'
      });
    }

    const customer = await Customer.findById(id)
      .select('-password')
      .populate('favoriteVendors', 'name logo rating')
      .populate('favoriteProducts', 'name image price')
      .lean();

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        ...customer,
        orderFrequency: '0.00'
      }
    });
  } catch (error) {
    console.error('Error fetching customer profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching customer profile',
      error: error.message
    });
  }
};

// Block customer
exports.blockCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.superAdmin.id;

    // Validate MongoDB ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid customer ID format'
      });
    }

    if (!reason || reason.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Block reason is required'
      });
    }

    const customer = await Customer.findById(id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    if (customer.status === 'Blocked') {
      return res.status(400).json({
        success: false,
        message: 'Customer is already blocked'
      });
    }

    customer.status = 'Blocked';
    customer.blockReason = reason;
    customer.blockedBy = adminId;
    customer.blockedAt = new Date();
    
    if (typeof customer.addActivity === 'function') {
      customer.addActivity('BLOCKED', `Account blocked: ${reason}`, req.ip, req.headers['user-agent']);
    }

    await customer.save();

    res.status(200).json({
      success: true,
      message: 'Customer blocked successfully',
      data: customer
    });
  } catch (error) {
    console.error('Error blocking customer:', error);
    res.status(500).json({
      success: false,
      message: 'Error blocking customer',
      error: error.message
    });
  }
};

// Unblock customer
exports.unblockCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid customer ID format'
      });
    }

    const customer = await Customer.findById(id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    if (customer.status !== 'Blocked') {
      return res.status(400).json({
        success: false,
        message: 'Customer is not blocked'
      });
    }

    customer.status = 'Active';
    customer.blockReason = undefined;
    customer.blockedBy = undefined;
    customer.blockedAt = undefined;
    
    if (typeof customer.addActivity === 'function') {
      customer.addActivity('UNBLOCKED', 'Account unblocked', req.ip, req.headers['user-agent']);
    }

    await customer.save();

    res.status(200).json({
      success: true,
      message: 'Customer unblocked successfully',
      data: customer
    });
  } catch (error) {
    console.error('Error unblocking customer:', error);
    res.status(500).json({
      success: false,
      message: 'Error unblocking customer',
      error: error.message
    });
  }
};

// Update customer details
exports.updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Validate MongoDB ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid customer ID format'
      });
    }

    // Prevent updating sensitive fields
    delete updates.password;
    delete updates.totalOrders;
    delete updates.totalSpending;
    delete updates.activityLog;
    delete updates.blockedBy;
    delete updates.blockedAt;
    delete updates.blockReason;

    const customer = await Customer.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Customer updated successfully',
      data: customer
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating customer',
      error: error.message
    });
  }
};

// Get customer activity log
exports.getCustomerActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 50 } = req.query;

    // Validate MongoDB ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid customer ID format'
      });
    }

    const customer = await Customer.findById(id)
      .select('activityLog name email')
      .lean();

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    const activities = customer.activityLog
      ? customer.activityLog
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, parseInt(limit))
      : [];

    res.status(200).json({
      success: true,
      data: activities
    });
  } catch (error) {
    console.error('Error fetching activity log:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching activity log',
      error: error.message
    });
  }
};

// Get customer statistics
exports.getCustomerStats = async (req, res) => {
  try {
    const totalCustomers = await Customer.countDocuments();
    const activeCustomers = await Customer.countDocuments({ status: 'Active' });
    const blockedCustomers = await Customer.countDocuments({ status: 'Blocked' });
    const inactiveCustomers = await Customer.countDocuments({ status: 'Inactive' });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newCustomers = await Customer.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    const spendingResult = await Customer.aggregate([
      {
        $group: {
          _id: null,
          totalSpending: { $sum: '$totalSpending' },
          avgSpending: { $avg: '$totalSpending' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalCustomers,
        activeCustomers,
        blockedCustomers,
        inactiveCustomers,
        newCustomers,
        totalSpending: spendingResult[0]?.totalSpending || 0,
        averageSpending: spendingResult[0]?.avgSpending || 0
      }
    });
  } catch (error) {
    console.error('Error fetching customer statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching customer statistics',
      error: error.message
    });
  }
};