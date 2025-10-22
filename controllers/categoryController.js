// const Category = require('../models/Category');
// const Subcategory = require('../models/Subcategory');
// const Product = require('../models/Product');
// const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');

// // ============= CREATE CATEGORY =============
// exports.createCategory = async (req, res) => {
//   try {
//     const { category_name, category_description, display_order, meta_title, meta_description } = req.body;
    
//     // Check if category already exists
//     const existingCategory = await Category.findOne({ category_name });
//     if (existingCategory) {
//       return res.status(400).json({
//         success: false,
//         message: 'Category with this name already exists'
//       });
//     }

//     // Upload image to Cloudinary if provided
//     let category_image = {};
//     if (req.file) {
//       const uploadResult = await uploadToCloudinary(req.file.path, 'categories');
//       category_image = {
//         url: uploadResult.secure_url,
//         public_id: uploadResult.public_id
//       };
//     }

//     // Create category
//     const category = await Category.create({
//       category_name,
//       category_description,
//       category_image,
//       display_order: display_order || 0,
//       meta_title,
//       meta_description,
//       created_by: req.admin._id
//     });

//     res.status(201).json({
//       success: true,
//       message: 'Category created successfully',
//       data: category
//     });

//   } catch (error) {
//     console.error('Create category error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to create category',
//       error: error.message
//     });
//   }
// };

// // ============= GET ALL CATEGORIES =============
// exports.getAllCategories = async (req, res) => {
//   try {
//     const { 
//       page = 1, 
//       limit = 25, 
//       search = '', 
//       is_active,
//       sort_by = 'display_order',
//       sort_order = 'asc'
//     } = req.query;

//     // Build query
//     const query = {};
    
//     if (search) {
//       query.category_name = { $regex: search, $options: 'i' };
//     }
    
//     if (is_active !== undefined) {
//       query.is_active = is_active === 'true';
//     }

//     // Sort options
//     const sortOptions = {};
//     sortOptions[sort_by] = sort_order === 'desc' ? -1 : 1;

//     // Execute query with pagination
//     const categories = await Category.find(query)
//       .sort(sortOptions)
//       .limit(limit * 1)
//       .skip((page - 1) * limit)
//       .populate('product_count')
//       .exec();

//     // Get total count
//     const total = await Category.countDocuments(query);

//     res.status(200).json({
//       success: true,
//       data: {
//         categories,
//         pagination: {
//           current_page: parseInt(page),
//           total_pages: Math.ceil(total / limit),
//           total_items: total,
//           items_per_page: parseInt(limit)
//         }
//       }
//     });

//   } catch (error) {
//     console.error('Get categories error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch categories',
//       error: error.message
//     });
//   }
// };

// // ============= GET SINGLE CATEGORY =============
// exports.getCategoryById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const category = await Category.findById(id)
//       .populate('product_count');

//     if (!category) {
//       return res.status(404).json({
//         success: false,
//         message: 'Category not found'
//       });
//     }

//     // Get subcategories
//     const subcategories = await Subcategory.find({ parent_category_id: id })
//       .populate('product_count');

//     res.status(200).json({
//       success: true,
//       data: {
//         category,
//         subcategories
//       }
//     });

//   } catch (error) {
//     console.error('Get category error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch category',
//       error: error.message
//     });
//   }
// };

// // ============= UPDATE CATEGORY =============
// exports.updateCategory = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updateData = { ...req.body };
//     updateData.updated_by = req.admin._id;

//     const category = await Category.findById(id);
//     if (!category) {
//       return res.status(404).json({
//         success: false,
//         message: 'Category not found'
//       });
//     }

//     // Handle image update
//     if (req.file) {
//       // Delete old image from Cloudinary
//       if (category.category_image?.public_id) {
//         await deleteFromCloudinary(category.category_image.public_id);
//       }

//       // Upload new image
//       const uploadResult = await uploadToCloudinary(req.file.path, 'categories');
//       updateData.category_image = {
//         url: uploadResult.secure_url,
//         public_id: uploadResult.public_id
//       };
//     }

//     // Update category
//     const updatedCategory = await Category.findByIdAndUpdate(
//       id,
//       updateData,
//       { new: true, runValidators: true }
//     );

//     res.status(200).json({
//       success: true,
//       message: 'Category updated successfully',
//       data: updatedCategory
//     });

//   } catch (error) {
//     console.error('Update category error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to update category',
//       error: error.message
//     });
//   }
// };

// // ============= DELETE CATEGORY (SOFT DELETE) =============
// exports.deleteCategory = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { hard_delete = false } = req.query;

//     const category = await Category.findById(id);
//     if (!category) {
//       return res.status(404).json({
//         success: false,
//         message: 'Category not found'
//       });
//     }

//     // Check if products exist
//     const productCount = await Product.countDocuments({ category_id: id });
    
//     if (productCount > 0 && hard_delete === 'true') {
//       return res.status(400).json({
//         success: false,
//         message: `Cannot delete category. ${productCount} product(s) are associated with this category.`
//       });
//     }

//     if (hard_delete === 'true') {
//       // Hard delete
//       await Category.findByIdAndDelete(id);
      
//       // Delete image from Cloudinary
//       if (category.category_image?.public_id) {
//         await deleteFromCloudinary(category.category_image.public_id);
//       }

//       res.status(200).json({
//         success: true,
//         message: 'Category deleted permanently'
//       });
//     } else {
//       // Soft delete
//       await Category.findByIdAndUpdate(id, { is_active: false });
      
//       res.status(200).json({
//         success: true,
//         message: 'Category deactivated successfully'
//       });
//     }

//   } catch (error) {
//     console.error('Delete category error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to delete category',
//       error: error.message
//     });
//   }
// };

// // ============= BULK ACTIVATE/DEACTIVATE =============
// exports.bulkUpdateStatus = async (req, res) => {
//   try {
//     const { category_ids, is_active } = req.body;

//     if (!Array.isArray(category_ids) || category_ids.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: 'Please provide category IDs'
//       });
//     }

//     await Category.updateMany(
//       { _id: { $in: category_ids } },
//       { is_active }
//     );

//     res.status(200).json({
//       success: true,
//       message: `Categories ${is_active ? 'activated' : 'deactivated'} successfully`
//     });

//   } catch (error) {
//     console.error('Bulk update error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to update categories',
//       error: error.message
//     });
//   }
// };

// // ============= REORDER CATEGORIES =============
// exports.reorderCategories = async (req, res) => {
//   try {
//     const { category_orders } = req.body;
//     // category_orders = [{ id: 'xxx', display_order: 1 }, ...]

//     const updatePromises = category_orders.map(item =>
//       Category.findByIdAndUpdate(item.id, { display_order: item.display_order })
//     );

//     await Promise.all(updatePromises);

//     res.status(200).json({
//       success: true,
//       message: 'Categories reordered successfully'
//     });

//   } catch (error) {
//     console.error('Reorder error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to reorder categories',
//       error: error.message
//     });
//   }
// };




// const Category = require('../models/Category');
// const Subcategory = require('../models/Subcategory');
// const Product = require('../models/Product');
// const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');

// // ============= CREATE CATEGORY =============
// exports.createCategory = async (req, res) => {
//   try {
//     const { category_name, category_description, display_order, meta_title, meta_description } = req.body;
    
//     // Check if category already exists
//     const existingCategory = await Category.findOne({ category_name });
//     if (existingCategory) {
//       return res.status(400).json({
//         success: false,
//         message: 'Category with this name already exists'
//       });
//     }

//     // Upload image to Cloudinary if provided
//     let category_image = {};
//     if (req.file) {
//       const uploadResult = await uploadToCloudinary(req.file.path, 'categories');
//       category_image = {
//         url: uploadResult.secure_url,
//         public_id: uploadResult.public_id
//       };
//     }

//     // ✅ CHANGED: req.admin._id → req.user._id (vendor)
//     const category = await Category.create({
//       category_name,
//       category_description,
//       category_image,
//       display_order: display_order || 0,
//       meta_title,
//       meta_description,
//       created_by: req.user._id // Vendor ID
//     });

//     res.status(201).json({
//       success: true,
//       message: 'Category created successfully',
//       data: category
//     });

//   } catch (error) {
//     console.error('Create category error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to create category',
//       error: error.message
//     });
//   }
// };

// // ============= GET ALL CATEGORIES =============
// exports.getAllCategories = async (req, res) => {
//   try {
//     const { 
//       page = 1, 
//       limit = 25, 
//       search = '', 
//       is_active,
//       sort_by = 'display_order',
//       sort_order = 'asc'
//     } = req.query;

//     // ✅ CHANGED: Only show vendor's own categories
//     const query = {
//       created_by: req.user._id // Filter by vendor
//     };
    
//     if (search) {
//       query.category_name = { $regex: search, $options: 'i' };
//     }
    
//     if (is_active !== undefined) {
//       query.is_active = is_active === 'true';
//     }

//     const sortOptions = {};
//     sortOptions[sort_by] = sort_order === 'desc' ? -1 : 1;

//     const categories = await Category.find(query)
//       .sort(sortOptions)
//       .limit(limit * 1)
//       .skip((page - 1) * limit)
//       .populate('product_count')
//       .exec();

//     const total = await Category.countDocuments(query);

//     res.status(200).json({
//       success: true,
//       data: {
//         categories,
//         pagination: {
//           current_page: parseInt(page),
//           total_pages: Math.ceil(total / limit),
//           total_items: total,
//           items_per_page: parseInt(limit)
//         }
//       }
//     });

//   } catch (error) {
//     console.error('Get categories error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch categories',
//       error: error.message
//     });
//   }
// };

// // ============= GET SINGLE CATEGORY =============
// exports.getCategoryById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // ✅ CHANGED: Check if category belongs to vendor
//     const category = await Category.findOne({
//       _id: id,
//       created_by: req.user._id
//     }).populate('product_count');

//     if (!category) {
//       return res.status(404).json({
//         success: false,
//         message: 'Category not found or you do not have access'
//       });
//     }

//     // Get subcategories
//     const subcategories = await Subcategory.find({ 
//       parent_category_id: id,
//       created_by: req.user._id 
//     }).populate('product_count');

//     res.status(200).json({
//       success: true,
//       data: {
//         category,
//         subcategories
//       }
//     });

//   } catch (error) {
//     console.error('Get category error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch category',
//       error: error.message
//     });
//   }
// };

// // ============= UPDATE CATEGORY =============
// exports.updateCategory = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updateData = { ...req.body };
//     updateData.updated_by = req.user._id; // ✅ CHANGED

//     // ✅ CHANGED: Check ownership
//     const category = await Category.findOne({
//       _id: id,
//       created_by: req.user._id
//     });

//     if (!category) {
//       return res.status(404).json({
//         success: false,
//         message: 'Category not found or you do not have access'
//       });
//     }

//     // Handle image update
//     if (req.file) {
//       if (category.category_image?.public_id) {
//         await deleteFromCloudinary(category.category_image.public_id);
//       }

//       const uploadResult = await uploadToCloudinary(req.file.path, 'categories');
//       updateData.category_image = {
//         url: uploadResult.secure_url,
//         public_id: uploadResult.public_id
//       };
//     }

//     const updatedCategory = await Category.findByIdAndUpdate(
//       id,
//       updateData,
//       { new: true, runValidators: true }
//     );

//     res.status(200).json({
//       success: true,
//       message: 'Category updated successfully',
//       data: updatedCategory
//     });

//   } catch (error) {
//     console.error('Update category error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to update category',
//       error: error.message
//     });
//   }
// };

// // ============= DELETE CATEGORY =============
// exports.deleteCategory = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { hard_delete = false } = req.query;

//     // ✅ CHANGED: Check ownership
//     const category = await Category.findOne({
//       _id: id,
//       created_by: req.user._id
//     });

//     if (!category) {
//       return res.status(404).json({
//         success: false,
//         message: 'Category not found or you do not have access'
//       });
//     }

//     // Check if products exist
//     const productCount = await Product.countDocuments({ category_id: id });
    
//     if (productCount > 0 && hard_delete === 'true') {
//       return res.status(400).json({
//         success: false,
//         message: `Cannot delete category. ${productCount} product(s) are associated with this category.`
//       });
//     }

//     if (hard_delete === 'true') {
//       await Category.findByIdAndDelete(id);
      
//       if (category.category_image?.public_id) {
//         await deleteFromCloudinary(category.category_image.public_id);
//       }

//       res.status(200).json({
//         success: true,
//         message: 'Category deleted permanently'
//       });
//     } else {
//       await Category.findByIdAndUpdate(id, { is_active: false });
      
//       res.status(200).json({
//         success: true,
//         message: 'Category deactivated successfully'
//       });
//     }

//   } catch (error) {
//     console.error('Delete category error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to delete category',
//       error: error.message
//     });
//   }
// };

// // ============= BULK ACTIVATE/DEACTIVATE =============
// exports.bulkUpdateStatus = async (req, res) => {
//   try {
//     const { category_ids, is_active } = req.body;

//     if (!Array.isArray(category_ids) || category_ids.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: 'Please provide category IDs'
//       });
//     }

//     // ✅ CHANGED: Only update vendor's own categories
//     await Category.updateMany(
//       { 
//         _id: { $in: category_ids },
//         created_by: req.user._id
//       },
//       { is_active }
//     );

//     res.status(200).json({
//       success: true,
//       message: `Categories ${is_active ? 'activated' : 'deactivated'} successfully`
//     });

//   } catch (error) {
//     console.error('Bulk update error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to update categories',
//       error: error.message
//     });
//   }
// };

// // ============= REORDER CATEGORIES =============
// exports.reorderCategories = async (req, res) => {
//   try {
//     const { category_orders } = req.body;

//     // ✅ CHANGED: Only reorder vendor's own categories
//     const updatePromises = category_orders.map(async (item) => {
//       return Category.findOneAndUpdate(
//         { _id: item.id, created_by: req.user._id },
//         { display_order: item.display_order }
//       );
//     });

//     await Promise.all(updatePromises);

//     res.status(200).json({
//       success: true,
//       message: 'Categories reordered successfully'
//     });

//   } catch (error) {
//     console.error('Reorder error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to reorder categories',
//       error: error.message
//     });
//   }
// };

// vendor to superadmin

const Category = require('../models/Category');
const Subcategory = require('../models/Subcategory');
const Product = require('../models/Product');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');

// ============= CREATE CATEGORY =============
exports.createCategory = async (req, res) => {
  try {
    const { category_name, category_description, display_order, meta_title, meta_description } = req.body;
    
    // Check if category already exists
    const existingCategory = await Category.findOne({ category_name });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }

    // Upload image to Cloudinary if provided
    let category_image = {};
    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.path, 'categories');
      category_image = {
        url: uploadResult.secure_url,
        public_id: uploadResult.public_id
      };
    }

    // ✅ CHANGED: req.user._id → req.superAdmin.id
    const category = await Category.create({
      category_name,
      category_description,
      category_image,
      display_order: display_order || 0,
      meta_title,
      meta_description,
      created_by: req.superAdmin.id // SuperAdmin ID
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });

  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create category',
      error: error.message
    });
  }
};

// ============= GET ALL CATEGORIES =============
exports.getAllCategories = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 25, 
      search = '', 
      is_active,
      sort_by = 'display_order',
      sort_order = 'asc'
    } = req.query;

    // ✅ CHANGED: Removed vendor filter - show all categories
    const query = {};
    
    if (search) {
      query.category_name = { $regex: search, $options: 'i' };
    }
    
    if (is_active !== undefined) {
      query.is_active = is_active === 'true';
    }

    const sortOptions = {};
    sortOptions[sort_by] = sort_order === 'desc' ? -1 : 1;

    const categories = await Category.find(query)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('product_count')
      .exec();

    const total = await Category.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        categories,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(total / limit),
          total_items: total,
          items_per_page: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
};

// ============= GET SINGLE CATEGORY =============
exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ CHANGED: Removed ownership check
    const category = await Category.findById(id)
      .populate('product_count');

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Get subcategories
    const subcategories = await Subcategory.find({ 
      parent_category_id: id
    }).populate('product_count');

    res.status(200).json({
      success: true,
      data: {
        category,
        subcategories
      }
    });

  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category',
      error: error.message
    });
  }
};

// ============= UPDATE CATEGORY =============
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    updateData.updated_by = req.superAdmin.id; // ✅ CHANGED

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Handle image update
    if (req.file) {
      if (category.category_image?.public_id) {
        await deleteFromCloudinary(category.category_image.public_id);
      }

      const uploadResult = await uploadToCloudinary(req.file.path, 'categories');
      updateData.category_image = {
        url: uploadResult.secure_url,
        public_id: uploadResult.public_id
      };
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: updatedCategory
    });

  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update category',
      error: error.message
    });
  }
};

// ============= DELETE CATEGORY =============
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { hard_delete = false } = req.query;

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if products exist
    const productCount = await Product.countDocuments({ category_id: id });
    
    if (productCount > 0 && hard_delete === 'true') {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. ${productCount} product(s) are associated with this category.`
      });
    }

    if (hard_delete === 'true') {
      await Category.findByIdAndDelete(id);
      
      if (category.category_image?.public_id) {
        await deleteFromCloudinary(category.category_image.public_id);
      }

      res.status(200).json({
        success: true,
        message: 'Category deleted permanently'
      });
    } else {
      await Category.findByIdAndUpdate(id, { is_active: false });
      
      res.status(200).json({
        success: true,
        message: 'Category deactivated successfully'
      });
    }

  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete category',
      error: error.message
    });
  }
};

// ============= BULK ACTIVATE/DEACTIVATE =============
exports.bulkUpdateStatus = async (req, res) => {
  try {
    const { category_ids, is_active } = req.body;

    if (!Array.isArray(category_ids) || category_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide category IDs'
      });
    }

    // ✅ CHANGED: Removed ownership filter
    await Category.updateMany(
      { _id: { $in: category_ids } },
      { is_active }
    );

    res.status(200).json({
      success: true,
      message: `Categories ${is_active ? 'activated' : 'deactivated'} successfully`
    });

  } catch (error) {
    console.error('Bulk update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update categories',
      error: error.message
    });
  }
};

// ============= REORDER CATEGORIES =============
exports.reorderCategories = async (req, res) => {
  try {
    const { category_orders } = req.body;

    // ✅ CHANGED: Removed ownership filter
    const updatePromises = category_orders.map(async (item) => {
      return Category.findByIdAndUpdate(
        item.id,
        { display_order: item.display_order }
      );
    });

    await Promise.all(updatePromises);

    res.status(200).json({
      success: true,
      message: 'Categories reordered successfully'
    });

  } catch (error) {
    console.error('Reorder error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reorder categories',
      error: error.message
    });
  }
};