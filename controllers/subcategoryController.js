
// const Subcategory = require('../models/Subcategory');
// const Category = require('../models/Category');
// const Product = require('../models/Product');
// const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');

// // ============= CREATE SUBCATEGORY =============
// exports.createSubcategory = async (req, res) => {
//   try {
//     const { parent_category_id, subcategory_name, subcategory_description, display_order, meta_title, meta_description } = req.body;
    
//     const parentCategory = await Category.findById(parent_category_id);
//     if (!parentCategory) {
//       return res.status(404).json({
//         success: false,
//         message: 'Parent category not found'
//       });
//     }

//     const existingSubcategory = await Subcategory.findOne({ 
//       parent_category_id, 
//       subcategory_name 
//     });
    
//     if (existingSubcategory) {
//       return res.status(400).json({
//         success: false,
//         message: 'Subcategory with this name already exists under this category'
//       });
//     }

//     let subcategory_image = {};
//     if (req.file) {
//       const uploadResult = await uploadToCloudinary(req.file.path, 'subcategories');
//       subcategory_image = {
//         url: uploadResult.secure_url,
//         public_id: uploadResult.public_id
//       };
//     }

//     const subcategory = await Subcategory.create({
//       parent_category_id,
//       subcategory_name,
//       subcategory_description,
//       subcategory_image,
//       display_order: display_order || 0,
//       meta_title,
//       meta_description,
//       created_by: req.admin._id
//     });

//     res.status(201).json({
//       success: true,
//       message: 'Subcategory created successfully',
//       data: subcategory
//     });

//   } catch (error) {
//     console.error('Create subcategory error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to create subcategory',
//       error: error.message
//     });
//   }
// };

// // ============= GET ALL SUBCATEGORIES =============
// exports.getAllSubcategories = async (req, res) => {
//   try {
//     const { 
//       page = 1, 
//       limit = 25, 
//       search = '', 
//       parent_category_id,
//       is_active,
//       sort_by = 'display_order',
//       sort_order = 'asc'
//     } = req.query;

//     const query = {};
    
//     if (search) {
//       query.subcategory_name = { $regex: search, $options: 'i' };
//     }
    
//     if (parent_category_id) {
//       query.parent_category_id = parent_category_id;
//     }
    
//     if (is_active !== undefined) {
//       query.is_active = is_active === 'true';
//     }

//     const sortOptions = {};
//     sortOptions[sort_by] = sort_order === 'desc' ? -1 : 1;

//     const subcategories = await Subcategory.find(query)
//       .populate('parent_category_id', 'category_name')
//       .populate('product_count')
//       .sort(sortOptions)
//       .limit(limit * 1)
//       .skip((page - 1) * limit)
//       .exec();

//     const total = await Subcategory.countDocuments(query);

//     res.status(200).json({
//       success: true,
//       data: {
//         subcategories,
//         pagination: {
//           current_page: parseInt(page),
//           total_pages: Math.ceil(total / limit),
//           total_items: total,
//           items_per_page: parseInt(limit)
//         }
//       }
//     });

//   } catch (error) {
//     console.error('Get subcategories error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch subcategories',
//       error: error.message
//     });
//   }
// };

// // ============= GET SUBCATEGORY BY ID =============
// exports.getSubcategoryById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const subcategory = await Subcategory.findById(id)
//       .populate('parent_category_id')
//       .populate('product_count');

//     if (!subcategory) {
//       return res.status(404).json({
//         success: false,
//         message: 'Subcategory not found'
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: subcategory
//     });

//   } catch (error) {
//     console.error('Get subcategory error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch subcategory',
//       error: error.message
//     });
//   }
// };

// // ============= UPDATE SUBCATEGORY =============
// exports.updateSubcategory = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updateData = { ...req.body };
//     updateData.updated_by = req.admin._id;

//     const subcategory = await Subcategory.findById(id);
//     if (!subcategory) {
//       return res.status(404).json({
//         success: false,
//         message: 'Subcategory not found'
//       });
//     }

//     if (req.file) {
//       if (subcategory.subcategory_image?.public_id) {
//         await deleteFromCloudinary(subcategory.subcategory_image.public_id);
//       }

//       const uploadResult = await uploadToCloudinary(req.file.path, 'subcategories');
//       updateData.subcategory_image = {
//         url: uploadResult.secure_url,
//         public_id: uploadResult.public_id
//       };
//     }

//     const updatedSubcategory = await Subcategory.findByIdAndUpdate(
//       id,
//       updateData,
//       { new: true, runValidators: true }
//     );

//     res.status(200).json({
//       success: true,
//       message: 'Subcategory updated successfully',
//       data: updatedSubcategory
//     });

//   } catch (error) {
//     console.error('Update subcategory error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to update subcategory',
//       error: error.message
//     });
//   }
// };

// // ============= DELETE SUBCATEGORY =============
// exports.deleteSubcategory = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { hard_delete = false } = req.query;

//     const subcategory = await Subcategory.findById(id);
//     if (!subcategory) {
//       return res.status(404).json({
//         success: false,
//         message: 'Subcategory not found'
//       });
//     }

//     const productCount = await Product.countDocuments({ subcategory_id: id });
    
//     if (productCount > 0 && hard_delete === 'true') {
//       return res.status(400).json({
//         success: false,
//         message: `Cannot delete subcategory. ${productCount} product(s) are associated.`
//       });
//     }

//     if (hard_delete === 'true') {
//       await Subcategory.findByIdAndDelete(id);
      
//       if (subcategory.subcategory_image?.public_id) {
//         await deleteFromCloudinary(subcategory.subcategory_image.public_id);
//       }

//       res.status(200).json({
//         success: true,
//         message: 'Subcategory deleted permanently'
//       });
//     } else {
//       await Subcategory.findByIdAndUpdate(id, { is_active: false });
      
//       res.status(200).json({
//         success: true,
//         message: 'Subcategory deactivated successfully'
//       });
//     }

//   } catch (error) {
//     console.error('Delete subcategory error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to delete subcategory',
//       error: error.message
//     });
//   }
// };

// // ============= BULK ACTIVATE/DEACTIVATE SUBCATEGORIES =============
// exports.bulkUpdateStatus = async (req, res) => {
//   try {
//     const { subcategory_ids, is_active } = req.body;

//     if (!Array.isArray(subcategory_ids) || subcategory_ids.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: 'Please provide subcategory IDs'
//       });
//     }

//     await Subcategory.updateMany(
//       { _id: { $in: subcategory_ids } },
//       { is_active }
//     );

//     res.status(200).json({
//       success: true,
//       message: `Subcategories ${is_active ? 'activated' : 'deactivated'} successfully`
//     });

//   } catch (error) {
//     console.error('Bulk update error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to update subcategories',
//       error: error.message
//     });
//   }
// };



// const Subcategory = require('../models/Subcategory');
// const Category = require('../models/Category');
// const Product = require('../models/Product');
// const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');

// // ============= CREATE SUBCATEGORY =============
// exports.createSubcategory = async (req, res) => {
//   try {
//     const { parent_category_id, subcategory_name, subcategory_description, display_order, meta_title, meta_description } = req.body;
    
//     // ✅ CHANGED: Verify parent category belongs to vendor
//     const parentCategory = await Category.findOne({
//       _id: parent_category_id,
//       created_by: req.user._id
//     });

//     if (!parentCategory) {
//       return res.status(404).json({
//         success: false,
//         message: 'Parent category not found or you do not have access'
//       });
//     }

//     // Check if subcategory already exists under this parent
//     const existingSubcategory = await Subcategory.findOne({ 
//       parent_category_id, 
//       subcategory_name,
//       created_by: req.user._id
//     });
    
//     if (existingSubcategory) {
//       return res.status(400).json({
//         success: false,
//         message: 'Subcategory with this name already exists under this category'
//       });
//     }

//     let subcategory_image = {};
//     if (req.file) {
//       const uploadResult = await uploadToCloudinary(req.file.path, 'subcategories');
//       subcategory_image = {
//         url: uploadResult.secure_url,
//         public_id: uploadResult.public_id
//       };
//     }

//     // ✅ CHANGED: req.admin._id → req.user._id
//     const subcategory = await Subcategory.create({
//       parent_category_id,
//       subcategory_name,
//       subcategory_description,
//       subcategory_image,
//       display_order: display_order || 0,
//       meta_title,
//       meta_description,
//       created_by: req.user._id
//     });

//     res.status(201).json({
//       success: true,
//       message: 'Subcategory created successfully',
//       data: subcategory
//     });

//   } catch (error) {
//     console.error('Create subcategory error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to create subcategory',
//       error: error.message
//     });
//   }
// };

// // ============= GET ALL SUBCATEGORIES =============
// exports.getAllSubcategories = async (req, res) => {
//   try {
//     const { 
//       page = 1, 
//       limit = 25, 
//       search = '', 
//       parent_category_id,
//       is_active,
//       sort_by = 'display_order',
//       sort_order = 'asc'
//     } = req.query;

//     // ✅ CHANGED: Only show vendor's own subcategories
//     const query = {
//       created_by: req.user._id
//     };
    
//     if (search) {
//       query.subcategory_name = { $regex: search, $options: 'i' };
//     }
    
//     if (parent_category_id) {
//       query.parent_category_id = parent_category_id;
//     }
    
//     if (is_active !== undefined) {
//       query.is_active = is_active === 'true';
//     }

//     const sortOptions = {};
//     sortOptions[sort_by] = sort_order === 'desc' ? -1 : 1;

//     const subcategories = await Subcategory.find(query)
//       .populate('parent_category_id', 'category_name')
//       .populate('product_count')
//       .sort(sortOptions)
//       .limit(limit * 1)
//       .skip((page - 1) * limit)
//       .exec();

//     const total = await Subcategory.countDocuments(query);

//     res.status(200).json({
//       success: true,
//       data: {
//         subcategories,
//         pagination: {
//           current_page: parseInt(page),
//           total_pages: Math.ceil(total / limit),
//           total_items: total,
//           items_per_page: parseInt(limit)
//         }
//       }
//     });

//   } catch (error) {
//     console.error('Get subcategories error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch subcategories',
//       error: error.message
//     });
//   }
// };

// // ============= GET SUBCATEGORY BY ID =============
// exports.getSubcategoryById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // ✅ CHANGED: Check ownership
//     const subcategory = await Subcategory.findOne({
//       _id: id,
//       created_by: req.user._id
//     })
//       .populate('parent_category_id')
//       .populate('product_count');

//     if (!subcategory) {
//       return res.status(404).json({
//         success: false,
//         message: 'Subcategory not found or you do not have access'
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: subcategory
//     });

//   } catch (error) {
//     console.error('Get subcategory error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch subcategory',
//       error: error.message
//     });
//   }
// };

// // ============= UPDATE SUBCATEGORY =============
// exports.updateSubcategory = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updateData = { ...req.body };
//     updateData.updated_by = req.user._id; // ✅ CHANGED

//     // ✅ CHANGED: Check ownership
//     const subcategory = await Subcategory.findOne({
//       _id: id,
//       created_by: req.user._id
//     });

//     if (!subcategory) {
//       return res.status(404).json({
//         success: false,
//         message: 'Subcategory not found or you do not have access'
//       });
//     }

//     if (req.file) {
//       if (subcategory.subcategory_image?.public_id) {
//         await deleteFromCloudinary(subcategory.subcategory_image.public_id);
//       }

//       const uploadResult = await uploadToCloudinary(req.file.path, 'subcategories');
//       updateData.subcategory_image = {
//         url: uploadResult.secure_url,
//         public_id: uploadResult.public_id
//       };
//     }

//     const updatedSubcategory = await Subcategory.findByIdAndUpdate(
//       id,
//       updateData,
//       { new: true, runValidators: true }
//     );

//     res.status(200).json({
//       success: true,
//       message: 'Subcategory updated successfully',
//       data: updatedSubcategory
//     });

//   } catch (error) {
//     console.error('Update subcategory error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to update subcategory',
//       error: error.message
//     });
//   }
// };

// // ============= DELETE SUBCATEGORY =============
// exports.deleteSubcategory = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { hard_delete = false } = req.query;

//     // ✅ CHANGED: Check ownership
//     const subcategory = await Subcategory.findOne({
//       _id: id,
//       created_by: req.user._id
//     });

//     if (!subcategory) {
//       return res.status(404).json({
//         success: false,
//         message: 'Subcategory not found or you do not have access'
//       });
//     }

//     const productCount = await Product.countDocuments({ 
//       subcategory_id: id,
//       created_by: req.user._id
//     });
    
//     if (productCount > 0 && hard_delete === 'true') {
//       return res.status(400).json({
//         success: false,
//         message: `Cannot delete subcategory. ${productCount} product(s) are associated.`
//       });
//     }

//     if (hard_delete === 'true') {
//       await Subcategory.findByIdAndDelete(id);
      
//       if (subcategory.subcategory_image?.public_id) {
//         await deleteFromCloudinary(subcategory.subcategory_image.public_id);
//       }

//       res.status(200).json({
//         success: true,
//         message: 'Subcategory deleted permanently'
//       });
//     } else {
//       await Subcategory.findByIdAndUpdate(id, { is_active: false });
      
//       res.status(200).json({
//         success: true,
//         message: 'Subcategory deactivated successfully'
//       });
//     }

//   } catch (error) {
//     console.error('Delete subcategory error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to delete subcategory',
//       error: error.message
//     });
//   }
// };

// // ============= BULK ACTIVATE/DEACTIVATE =============
// exports.bulkUpdateStatus = async (req, res) => {
//   try {
//     const { subcategory_ids, is_active } = req.body;

//     if (!Array.isArray(subcategory_ids) || subcategory_ids.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: 'Please provide subcategory IDs'
//       });
//     }

//     // ✅ CHANGED: Only update vendor's own subcategories
//     await Subcategory.updateMany(
//       { 
//         _id: { $in: subcategory_ids },
//         created_by: req.user._id
//       },
//       { is_active }
//     );

//     res.status(200).json({
//       success: true,
//       message: `Subcategories ${is_active ? 'activated' : 'deactivated'} successfully`
//     });

//   } catch (error) {
//     console.error('Bulk update error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to update subcategories',
//       error: error.message
//     });
//   }
// };

// vendor to superadmin 

const Subcategory = require('../models/Subcategory');
const Category = require('../models/Category');
const Product = require('../models/Product');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');

// ============= CREATE SUBCATEGORY =============
exports.createSubcategory = async (req, res) => {
  try {
    const { parent_category_id, subcategory_name, subcategory_description, display_order, meta_title, meta_description } = req.body;
    
    // ✅ CHANGED: Removed vendor ownership check
    const parentCategory = await Category.findById(parent_category_id);

    if (!parentCategory) {
      return res.status(404).json({
        success: false,
        message: 'Parent category not found'
      });
    }

    // Check if subcategory already exists under this parent
    const existingSubcategory = await Subcategory.findOne({ 
      parent_category_id, 
      subcategory_name
    });
    
    if (existingSubcategory) {
      return res.status(400).json({
        success: false,
        message: 'Subcategory with this name already exists under this category'
      });
    }

    let subcategory_image = {};
    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.path, 'subcategories');
      subcategory_image = {
        url: uploadResult.secure_url,
        public_id: uploadResult.public_id
      };
    }

    // ✅ CHANGED: req.user._id → req.superAdmin.id
    const subcategory = await Subcategory.create({
      parent_category_id,
      subcategory_name,
      subcategory_description,
      subcategory_image,
      display_order: display_order || 0,
      meta_title,
      meta_description,
      created_by: req.superAdmin.id // SuperAdmin ID
    });

    res.status(201).json({
      success: true,
      message: 'Subcategory created successfully',
      data: subcategory
    });

  } catch (error) {
    console.error('Create subcategory error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create subcategory',
      error: error.message
    });
  }
};

// ============= GET ALL SUBCATEGORIES =============
exports.getAllSubcategories = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 25, 
      search = '', 
      parent_category_id,
      is_active,
      sort_by = 'display_order',
      sort_order = 'asc'
    } = req.query;

    // ✅ CHANGED: Removed vendor filter - show all subcategories
    const query = {};
    
    if (search) {
      query.subcategory_name = { $regex: search, $options: 'i' };
    }
    
    if (parent_category_id) {
      query.parent_category_id = parent_category_id;
    }
    
    if (is_active !== undefined) {
      query.is_active = is_active === 'true';
    }

    const sortOptions = {};
    sortOptions[sort_by] = sort_order === 'desc' ? -1 : 1;

    const subcategories = await Subcategory.find(query)
      .populate('parent_category_id', 'category_name')
      .populate('product_count')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Subcategory.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        subcategories,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(total / limit),
          total_items: total,
          items_per_page: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get subcategories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subcategories',
      error: error.message
    });
  }
};

// ============= GET SUBCATEGORY BY ID =============
exports.getSubcategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ CHANGED: Removed ownership check
    const subcategory = await Subcategory.findById(id)
      .populate('parent_category_id')
      .populate('product_count');

    if (!subcategory) {
      return res.status(404).json({
        success: false,
        message: 'Subcategory not found'
      });
    }

    res.status(200).json({
      success: true,
      data: subcategory
    });

  } catch (error) {
    console.error('Get subcategory error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subcategory',
      error: error.message
    });
  }
};

// ============= UPDATE SUBCATEGORY =============
exports.updateSubcategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    updateData.updated_by = req.superAdmin.id; // ✅ CHANGED

    const subcategory = await Subcategory.findById(id);

    if (!subcategory) {
      return res.status(404).json({
        success: false,
        message: 'Subcategory not found'
      });
    }

    if (req.file) {
      if (subcategory.subcategory_image?.public_id) {
        await deleteFromCloudinary(subcategory.subcategory_image.public_id);
      }

      const uploadResult = await uploadToCloudinary(req.file.path, 'subcategories');
      updateData.subcategory_image = {
        url: uploadResult.secure_url,
        public_id: uploadResult.public_id
      };
    }

    const updatedSubcategory = await Subcategory.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Subcategory updated successfully',
      data: updatedSubcategory
    });

  } catch (error) {
    console.error('Update subcategory error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update subcategory',
      error: error.message
    });
  }
};

// ============= DELETE SUBCATEGORY =============
exports.deleteSubcategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { hard_delete = false } = req.query;

    const subcategory = await Subcategory.findById(id);

    if (!subcategory) {
      return res.status(404).json({
        success: false,
        message: 'Subcategory not found'
      });
    }

    const productCount = await Product.countDocuments({ 
      subcategory_id: id
    });
    
    if (productCount > 0 && hard_delete === 'true') {
      return res.status(400).json({
        success: false,
        message: `Cannot delete subcategory. ${productCount} product(s) are associated.`
      });
    }

    if (hard_delete === 'true') {
      await Subcategory.findByIdAndDelete(id);
      
      if (subcategory.subcategory_image?.public_id) {
        await deleteFromCloudinary(subcategory.subcategory_image.public_id);
      }

      res.status(200).json({
        success: true,
        message: 'Subcategory deleted permanently'
      });
    } else {
      await Subcategory.findByIdAndUpdate(id, { is_active: false });
      
      res.status(200).json({
        success: true,
        message: 'Subcategory deactivated successfully'
      });
    }

  } catch (error) {
    console.error('Delete subcategory error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete subcategory',
      error: error.message
    });
  }
};

// ============= BULK ACTIVATE/DEACTIVATE =============
exports.bulkUpdateStatus = async (req, res) => {
  try {
    const { subcategory_ids, is_active } = req.body;

    if (!Array.isArray(subcategory_ids) || subcategory_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide subcategory IDs'
      });
    }

    // ✅ CHANGED: Removed ownership filter
    await Subcategory.updateMany(
      { _id: { $in: subcategory_ids } },
      { is_active }
    );

    res.status(200).json({
      success: true,
      message: `Subcategories ${is_active ? 'activated' : 'deactivated'} successfully`
    });

  } catch (error) {
    console.error('Bulk update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update subcategories',
      error: error.message
    });
  }
};