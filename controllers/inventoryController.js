// const { Inventory, InventoryHistory } = require('../models/OtherModels');
// const ProductVariant = require('../models/ProductVariant');
// const Product = require('../models/Product');

// // ============= UPDATE STOCK (MANUAL ADJUSTMENT) =============
// exports.updateStock = async (req, res) => {
//   try {
//     const { variant_id } = req.params;
//     const { quantity_change, action_type, reason, batch_number, expiry_date } = req.body;
//     // action_type: 'restock', 'damage', 'expired', 'adjustment'

//     const variant = await ProductVariant.findById(variant_id);
//     if (!variant) {
//       return res.status(404).json({
//         success: false,
//         message: 'Variant not found'
//       });
//     }

//     const inventory = await Inventory.findOne({ variant_id });
//     if (!inventory) {
//       return res.status(404).json({
//         success: false,
//         message: 'Inventory record not found'
//       });
//     }

//     const stock_before = inventory.current_stock;
//     const new_stock = Math.max(0, stock_before + quantity_change);

//     // Update inventory
//     const updateData = {
//       current_stock: new_stock
//     };

//     if (action_type === 'restock') {
//       updateData.last_restocked_at = new Date();
//       updateData.last_restocked_quantity = quantity_change;
//     }

//     if (batch_number) updateData.batch_number = batch_number;
//     if (expiry_date) updateData.expiry_date = expiry_date;

//     const updatedInventory = await Inventory.findOneAndUpdate(
//       { variant_id },
//       updateData,
//       { new: true }
//     );

//     // Update variant stock
//     await ProductVariant.findByIdAndUpdate(variant_id, {
//       stock_quantity: new_stock
//     });

//     // Log in inventory history
//     await InventoryHistory.create({
//       variant_id,
//       action_type,
//       quantity_change,
//       stock_before,
//       stock_after: new_stock,
//       reason,
//       performed_by: req.admin._id
//     });

//     res.status(200).json({
//       success: true,
//       message: 'Stock updated successfully',
//       data: {
//         inventory: updatedInventory,
//         stock_before,
//         stock_after: new_stock
//       }
//     });

//   } catch (error) {
//     console.error('Update stock error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to update stock',
//       error: error.message
//     });
//   }
// };

// // ============= GET LOW STOCK PRODUCTS =============
// exports.getLowStockProducts = async (req, res) => {
//   try {
//     const { page = 1, limit = 50 } = req.query;

//     // Find all variants with low stock
//     const variants = await ProductVariant.find({
//       is_active: true,
//       $expr: { $lte: ['$stock_quantity', '$low_stock_threshold'] }
//     })
//       .populate({
//         path: 'product_id',
//         populate: [
//           { path: 'category_id', select: 'category_name' },
//           { path: 'subcategory_id', select: 'subcategory_name' }
//         ]
//       })
//       .limit(limit * 1)
//       .skip((page - 1) * limit)
//       .sort({ stock_quantity: 1 });

//     const total = await ProductVariant.countDocuments({
//       is_active: true,
//       $expr: { $lte: ['$stock_quantity', '$low_stock_threshold'] }
//     });

//     // Get inventory details for each variant
//     const lowStockItems = await Promise.all(
//       variants.map(async (variant) => {
//         const inventory = await Inventory.findOne({ variant_id: variant._id });
//         return {
//           variant,
//           inventory,
//           product: variant.product_id
//         };
//       })
//     );

//     res.status(200).json({
//       success: true,
//       data: {
//         low_stock_items: lowStockItems,
//         pagination: {
//           current_page: parseInt(page),
//           total_pages: Math.ceil(total / limit),
//           total_items: total,
//           items_per_page: parseInt(limit)
//         }
//       }
//     });

//   } catch (error) {
//     console.error('Get low stock error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch low stock products',
//       error: error.message
//     });
//   }
// };

// // ============= GET OUT OF STOCK PRODUCTS =============
// exports.getOutOfStockProducts = async (req, res) => {
//   try {
//     const { page = 1, limit = 50 } = req.query;

//     const variants = await ProductVariant.find({
//       is_active: true,
//       stock_quantity: 0
//     })
//       .populate({
//         path: 'product_id',
//         populate: [
//           { path: 'category_id', select: 'category_name' },
//           { path: 'subcategory_id', select: 'subcategory_name' }
//         ]
//       })
//       .limit(limit * 1)
//       .skip((page - 1) * limit);

//     const total = await ProductVariant.countDocuments({
//       is_active: true,
//       stock_quantity: 0
//     });

//     res.status(200).json({
//       success: true,
//       data: {
//         out_of_stock_items: variants,
//         pagination: {
//           current_page: parseInt(page),
//           total_pages: Math.ceil(total / limit),
//           total_items: total,
//           items_per_page: parseInt(limit)
//         }
//       }
//     });

//   } catch (error) {
//     console.error('Get out of stock error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch out of stock products',
//       error: error.message
//     });
//   }
// };

// // ============= GET PRODUCTS NEARING EXPIRY =============
// exports.getExpiringProducts = async (req, res) => {
//   try {
//     const { days = 7 } = req.query; // Default 7 days
    
//     const expiryDate = new Date();
//     expiryDate.setDate(expiryDate.getDate() + parseInt(days));

//     const inventories = await Inventory.find({
//       expiry_date: { 
//         $exists: true, 
//         $lte: expiryDate,
//         $gte: new Date()
//       }
//     })
//       .populate({
//         path: 'variant_id',
//         populate: {
//           path: 'product_id',
//           populate: [
//             { path: 'category_id', select: 'category_name' },
//             { path: 'subcategory_id', select: 'subcategory_name' }
//           ]
//         }
//       })
//       .sort({ expiry_date: 1 });

//     res.status(200).json({
//       success: true,
//       data: {
//         expiring_items: inventories,
//         total_items: inventories.length
//       }
//     });

//   } catch (error) {
//     console.error('Get expiring products error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch expiring products',
//       error: error.message
//     });
//   }
// };

// // ============= GET INVENTORY HISTORY =============
// exports.getInventoryHistory = async (req, res) => {
//   try {
//     const { variant_id } = req.params;
//     const { page = 1, limit = 50, action_type } = req.query;

//     const query = { variant_id };
//     if (action_type) query.action_type = action_type;

//     const history = await InventoryHistory.find(query)
//       .populate('performed_by', 'name email')
//       .populate('order_id', 'order_number')
//       .sort({ createdAt: -1 })
//       .limit(limit * 1)
//       .skip((page - 1) * limit);

//     const total = await InventoryHistory.countDocuments(query);

//     res.status(200).json({
//       success: true,
//       data: {
//         history,
//         pagination: {
//           current_page: parseInt(page),
//           total_pages: Math.ceil(total / limit),
//           total_items: total,
//           items_per_page: parseInt(limit)
//         }
//       }
//     });

//   } catch (error) {
//     console.error('Get inventory history error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch inventory history',
//       error: error.message
//     });
//   }
// };

// // ============= BULK STOCK UPDATE =============
// exports.bulkStockUpdate = async (req, res) => {
//   try {
//     const { stock_updates } = req.body;
//     // stock_updates = [{ variant_id, quantity, action_type, reason }, ...]

//     if (!Array.isArray(stock_updates) || stock_updates.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: 'Please provide stock updates'
//       });
//     }

//     const results = [];
//     const errors = [];

//     for (const update of stock_updates) {
//       try {
//         const { variant_id, quantity, action_type, reason } = update;

//         const inventory = await Inventory.findOne({ variant_id });
//         if (!inventory) {
//           errors.push({ variant_id, error: 'Inventory not found' });
//           continue;
//         }

//         const stock_before = inventory.current_stock;
//         const new_stock = Math.max(0, stock_before + quantity);

//         await Inventory.findOneAndUpdate(
//           { variant_id },
//           { current_stock: new_stock }
//         );

//         await ProductVariant.findByIdAndUpdate(variant_id, {
//           stock_quantity: new_stock
//         });

//         await InventoryHistory.create({
//           variant_id,
//           action_type: action_type || 'adjustment',
//           quantity_change: quantity,
//           stock_before,
//           stock_after: new_stock,
//           reason,
//           performed_by: req.admin._id
//         });

//         results.push({ variant_id, success: true, new_stock });

//       } catch (error) {
//         errors.push({ variant_id: update.variant_id, error: error.message });
//       }
//     }

//     res.status(200).json({
//       success: true,
//       message: 'Bulk stock update completed',
//       data: {
//         successful: results.length,
//         failed: errors.length,
//         results,
//         errors
//       }
//     });

//   } catch (error) {
//     console.error('Bulk stock update error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to update stocks',
//       error: error.message
//     });
//   }
// };

// // ============= GET INVENTORY SUMMARY =============
// exports.getInventorySummary = async (req, res) => {
//   try {
//     const totalProducts = await Product.countDocuments({ is_active: true });
//     const totalVariants = await ProductVariant.countDocuments({ is_active: true });
    
//     const lowStockCount = await ProductVariant.countDocuments({
//       is_active: true,
//       $expr: { $lte: ['$stock_quantity', '$low_stock_threshold'] }
//     });

//     const outOfStockCount = await ProductVariant.countDocuments({
//       is_active: true,
//       stock_quantity: 0
//     });

//     // Total stock value
//     const variants = await ProductVariant.find({ is_active: true });
//     const totalStockValue = variants.reduce((sum, v) => sum + (v.stock_quantity * v.selling_price), 0);

//     // Products expiring in next 7 days
//     const expiryDate = new Date();
//     expiryDate.setDate(expiryDate.getDate() + 7);
    
//     const expiringCount = await Inventory.countDocuments({
//       expiry_date: { 
//         $exists: true,
//         $lte: expiryDate,
//         $gte: new Date()
//       }
//     });

//     res.status(200).json({
//       success: true,
//       data: {
//         total_products: totalProducts,
//         total_variants: totalVariants,
//         low_stock_count: lowStockCount,
//         out_of_stock_count: outOfStockCount,
//         expiring_soon_count: expiringCount,
//         total_stock_value: Math.round(totalStockValue)
//       }
//     });

//   } catch (error) {
//     console.error('Get inventory summary error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch inventory summary',
//       error: error.message
//     });
//   }
// };

// module.exports = exports;
// this is chnaged file for admin to vendor


const { Inventory, InventoryHistory } = require('../models/OtherModels');
const ProductVariant = require('../models/ProductVariant');
const Product = require('../models/Product');

// ============= UPDATE STOCK (MANUAL ADJUSTMENT) =============
exports.updateStock = async (req, res) => {
  try {
    const { variant_id } = req.params;
    const { quantity_change, action_type, reason, batch_number, expiry_date } = req.body;

    const variant = await ProductVariant.findById(variant_id).populate('product_id');
    if (!variant) {
      return res.status(404).json({
        success: false,
        message: 'Variant not found'
      });
    }

    // ✅ CHANGED: Verify product belongs to vendor
    const product = await Product.findOne({
      _id: variant.product_id,
      created_by: req.user._id
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'You do not have access to this variant'
      });
    }

    const inventory = await Inventory.findOne({ variant_id });
    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Inventory record not found'
      });
    }

    const stock_before = inventory.current_stock;
    const new_stock = Math.max(0, stock_before + quantity_change);

    const updateData = {
      current_stock: new_stock
    };

    if (action_type === 'restock') {
      updateData.last_restocked_at = new Date();
      updateData.last_restocked_quantity = quantity_change;
    }

    if (batch_number) updateData.batch_number = batch_number;
    if (expiry_date) updateData.expiry_date = expiry_date;

    const updatedInventory = await Inventory.findOneAndUpdate(
      { variant_id },
      updateData,
      { new: true }
    );

    await ProductVariant.findByIdAndUpdate(variant_id, {
      stock_quantity: new_stock
    });

    // ✅ CHANGED: req.admin._id → req.user._id
    await InventoryHistory.create({
      variant_id,
      action_type,
      quantity_change,
      stock_before,
      stock_after: new_stock,
      reason,
      performed_by: req.user._id
    });

    res.status(200).json({
      success: true,
      message: 'Stock updated successfully',
      data: {
        inventory: updatedInventory,
        stock_before,
        stock_after: new_stock
      }
    });

  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update stock',
      error: error.message
    });
  }
};

// ============= GET LOW STOCK PRODUCTS =============
exports.getLowStockProducts = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    // ✅ CHANGED: First get vendor's products
    const vendorProducts = await Product.find({
      created_by: req.user._id,
      is_active: true
    }).select('_id');

    const productIds = vendorProducts.map(p => p._id);

    // Find variants with low stock for vendor's products
    const variants = await ProductVariant.find({
      product_id: { $in: productIds },
      is_active: true,
      $expr: { $lte: ['$stock_quantity', '$low_stock_threshold'] }
    })
      .populate({
        path: 'product_id',
        populate: [
          { path: 'category_id', select: 'category_name' },
          { path: 'subcategory_id', select: 'subcategory_name' }
        ]
      })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ stock_quantity: 1 });

    const total = await ProductVariant.countDocuments({
      product_id: { $in: productIds },
      is_active: true,
      $expr: { $lte: ['$stock_quantity', '$low_stock_threshold'] }
    });

    const lowStockItems = await Promise.all(
      variants.map(async (variant) => {
        const inventory = await Inventory.findOne({ variant_id: variant._id });
        return {
          variant,
          inventory,
          product: variant.product_id
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        low_stock_items: lowStockItems,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(total / limit),
          total_items: total,
          items_per_page: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get low stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch low stock products',
      error: error.message
    });
  }
};

// ============= GET OUT OF STOCK PRODUCTS =============
exports.getOutOfStockProducts = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    // ✅ CHANGED: Get vendor's products
    const vendorProducts = await Product.find({
      created_by: req.user._id,
      is_active: true
    }).select('_id');

    const productIds = vendorProducts.map(p => p._id);

    const variants = await ProductVariant.find({
      product_id: { $in: productIds },
      is_active: true,
      stock_quantity: 0
    })
      .populate({
        path: 'product_id',
        populate: [
          { path: 'category_id', select: 'category_name' },
          { path: 'subcategory_id', select: 'subcategory_name' }
        ]
      })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ProductVariant.countDocuments({
      product_id: { $in: productIds },
      is_active: true,
      stock_quantity: 0
    });

    res.status(200).json({
      success: true,
      data: {
        out_of_stock_items: variants,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(total / limit),
          total_items: total,
          items_per_page: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get out of stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch out of stock products',
      error: error.message
    });
  }
};

// ============= GET PRODUCTS NEARING EXPIRY =============
exports.getExpiringProducts = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + parseInt(days));

    // ✅ CHANGED: Get vendor's products first
    const vendorProducts = await Product.find({
      created_by: req.user._id,
      is_active: true
    }).select('_id');

    const productIds = vendorProducts.map(p => p._id);

    // Get variants for vendor's products
    const vendorVariants = await ProductVariant.find({
      product_id: { $in: productIds }
    }).select('_id');

    const variantIds = vendorVariants.map(v => v._id);

    const inventories = await Inventory.find({
      variant_id: { $in: variantIds },
      expiry_date: { 
        $exists: true, 
        $lte: expiryDate,
        $gte: new Date()
      }
    })
      .populate({
        path: 'variant_id',
        populate: {
          path: 'product_id',
          populate: [
            { path: 'category_id', select: 'category_name' },
            { path: 'subcategory_id', select: 'subcategory_name' }
          ]
        }
      })
      .sort({ expiry_date: 1 });

    res.status(200).json({
      success: true,
      data: {
        expiring_items: inventories,
        total_items: inventories.length
      }
    });

  } catch (error) {
    console.error('Get expiring products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch expiring products',
      error: error.message
    });
  }
};

// ============= GET INVENTORY HISTORY =============
exports.getInventoryHistory = async (req, res) => {
  try {
    const { variant_id } = req.params;
    const { page = 1, limit = 50, action_type } = req.query;

    // ✅ CHANGED: Verify variant belongs to vendor
    const variant = await ProductVariant.findById(variant_id).populate('product_id');
    if (!variant) {
      return res.status(404).json({
        success: false,
        message: 'Variant not found'
      });
    }

    const product = await Product.findOne({
      _id: variant.product_id,
      created_by: req.user._id
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'You do not have access to this variant'
      });
    }

    const query = { variant_id };
    if (action_type) query.action_type = action_type;

    const history = await InventoryHistory.find(query)
      .populate('performed_by', 'name email')
      .populate('order_id', 'order_number')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await InventoryHistory.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        history,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(total / limit),
          total_items: total,
          items_per_page: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get inventory history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory history',
      error: error.message
    });
  }
};

// ============= BULK STOCK UPDATE =============
exports.bulkStockUpdate = async (req, res) => {
  try {
    const { stock_updates } = req.body;

    if (!Array.isArray(stock_updates) || stock_updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide stock updates'
      });
    }

    const results = [];
    const errors = [];

    for (const update of stock_updates) {
      try {
        const { variant_id, quantity, action_type, reason } = update;

        // ✅ CHANGED: Verify variant belongs to vendor
        const variant = await ProductVariant.findById(variant_id).populate('product_id');
        if (!variant) {
          errors.push({ variant_id, error: 'Variant not found' });
          continue;
        }

        const product = await Product.findOne({
          _id: variant.product_id,
          created_by: req.user._id
        });

        if (!product) {
          errors.push({ variant_id, error: 'You do not have access to this variant' });
          continue;
        }

        const inventory = await Inventory.findOne({ variant_id });
        if (!inventory) {
          errors.push({ variant_id, error: 'Inventory not found' });
          continue;
        }

        const stock_before = inventory.current_stock;
        const new_stock = Math.max(0, stock_before + quantity);

        await Inventory.findOneAndUpdate(
          { variant_id },
          { current_stock: new_stock }
        );

        await ProductVariant.findByIdAndUpdate(variant_id, {
          stock_quantity: new_stock
        });

        // ✅ CHANGED: req.admin._id → req.user._id
        await InventoryHistory.create({
          variant_id,
          action_type: action_type || 'adjustment',
          quantity_change: quantity,
          stock_before,
          stock_after: new_stock,
          reason,
          performed_by: req.user._id
        });

        results.push({ variant_id, success: true, new_stock });

      } catch (error) {
        errors.push({ variant_id: update.variant_id, error: error.message });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Bulk stock update completed',
      data: {
        successful: results.length,
        failed: errors.length,
        results,
        errors
      }
    });

  } catch (error) {
    console.error('Bulk stock update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update stocks',
      error: error.message
    });
  }
};

// ============= GET INVENTORY SUMMARY =============
exports.getInventorySummary = async (req, res) => {
  try {
    // ✅ CHANGED: Get only vendor's products
    const vendorProducts = await Product.find({
      created_by: req.user._id,
      is_active: true
    }).select('_id');

    const productIds = vendorProducts.map(p => p._id);

    const totalProducts = productIds.length;
    
    const totalVariants = await ProductVariant.countDocuments({
      product_id: { $in: productIds },
      is_active: true
    });
    
    const lowStockCount = await ProductVariant.countDocuments({
      product_id: { $in: productIds },
      is_active: true,
      $expr: { $lte: ['$stock_quantity', '$low_stock_threshold'] }
    });

    const outOfStockCount = await ProductVariant.countDocuments({
      product_id: { $in: productIds },
      is_active: true,
      stock_quantity: 0
    });

    // Total stock value
    const variants = await ProductVariant.find({
      product_id: { $in: productIds },
      is_active: true
    });
    const totalStockValue = variants.reduce((sum, v) => sum + (v.stock_quantity * v.selling_price), 0);

    // Products expiring in next 7 days
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);
    
    const vendorVariants = await ProductVariant.find({
      product_id: { $in: productIds }
    }).select('_id');

    const variantIds = vendorVariants.map(v => v._id);

    const expiringCount = await Inventory.countDocuments({
      variant_id: { $in: variantIds },
      expiry_date: { 
        $exists: true,
        $lte: expiryDate,
        $gte: new Date()
      }
    });

    res.status(200).json({
      success: true,
      data: {
        total_products: totalProducts,
        total_variants: totalVariants,
        low_stock_count: lowStockCount,
        out_of_stock_count: outOfStockCount,
        expiring_soon_count: expiringCount,
        total_stock_value: Math.round(totalStockValue)
      }
    });

  } catch (error) {
    console.error('Get inventory summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory summary',
      error: error.message
    });
  }
};

module.exports = exports;