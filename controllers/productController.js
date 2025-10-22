const Product = require('../models/Product');
const ProductVariant = require('../models/ProductVariant');
const ProductImage = require('../models/ProductImage');
const { ProductNutrition, ProductAttribute, Inventory } = require('../models/OtherModels');
const Category = require('../models/Category');
const Subcategory = require('../models/Subcategory');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');

// ============= CREATE PRODUCT (COMPLETE WORKFLOW) =============
exports.createProduct = async (req, res) => {
  try {
    console.log('=== CREATE PRODUCT REQUEST ===');
    console.log('Body:', req.body);
    console.log('Files:', req.files ? req.files.length : 0);
    
    let variants = [];
    let nutrition = {};
    let tags = [];

    try {
      if (req.body.variants) {
        variants = JSON.parse(req.body.variants);
        console.log('Parsed variants:', variants);
      }
    } catch (e) {
      console.error('Failed to parse variants:', e);
      return res.status(400).json({
        success: false,
        message: 'Invalid variants format',
        error: e.message
      });
    }

    try {
      if (req.body.nutrition) {
        nutrition = JSON.parse(req.body.nutrition);
        console.log('Parsed nutrition:', nutrition);
      }
    } catch (e) {
      console.error('Failed to parse nutrition:', e);
    }

    try {
      if (req.body.tags) {
        tags = JSON.parse(req.body.tags);
        console.log('Parsed tags:', tags);
      }
    } catch (e) {
      console.error('Failed to parse tags:', e);
    }

    const {
      product_name,
      category_id,
      subcategory_id,
      short_description,
      long_description,
      preparation_instructions,
      storage_instructions,
      cooking_instructions,
      shelf_life,
      country_of_origin,
      is_featured,
      is_bestseller,
      is_new_arrival,
    } = req.body;

    if (!product_name) {
      return res.status(400).json({
        success: false,
        message: 'Product name is required'
      });
    }

    if (!category_id) {
      return res.status(400).json({
        success: false,
        message: 'Category is required'
      });
    }

    // ✅ FIXED: Vendor can use ANY active category (created by superadmin)
    const category = await Category.findOne({
      _id: category_id,
      is_active: true
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found or inactive'
      });
    }

    // ✅ FIXED: Vendor can use ANY active subcategory
    if (subcategory_id) {
      const subcategory = await Subcategory.findOne({
        _id: subcategory_id,
        is_active: true
      });

      if (!subcategory) {
        return res.status(404).json({
          success: false,
          message: 'Subcategory not found or inactive'
        });
      }
    }

    if (!variants || variants.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one variant is required'
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one product image is required'
      });
    }

    console.log('Creating product...');

    const product = await Product.create({
      product_name,
      category_id,
      subcategory_id: subcategory_id || null,
      short_description: short_description || '',
      long_description: long_description || '',
      preparation_instructions: preparation_instructions || '',
      storage_instructions: storage_instructions || '',
      cooking_instructions: cooking_instructions || '',
      shelf_life: shelf_life || '',
      country_of_origin: country_of_origin || 'India',
      is_featured: is_featured === 'true' || is_featured === true,
      is_bestseller: is_bestseller === 'true' || is_bestseller === true,
      is_new_arrival: is_new_arrival === 'true' || is_new_arrival === true,
      tags: tags || [],
      created_by: req.user._id
    });

    console.log('Product created:', product._id);
    console.log('Uploading images...');

    const imageUploadPromises = req.files.map(async (file, index) => {
      try {
        const uploadResult = await uploadToCloudinary(file.path, 'products');
        console.log(`Image ${index} uploaded:`, uploadResult.public_id);
        
        return ProductImage.create({
          product_id: product._id,
          image_url: uploadResult.secure_url,
          public_id: uploadResult.public_id,
          image_alt_text: `${product_name} - Image ${index + 1}`,
          is_primary: index === 0,
          display_order: index
        });
      } catch (uploadError) {
        console.error(`Failed to upload image ${index}:`, uploadError);
        throw uploadError;
      }
    });

    await Promise.all(imageUploadPromises);
    console.log('All images uploaded');
    console.log('Creating variants...');

    const variantPromises = variants.map(async (variant, index) => {
      const createdVariant = await ProductVariant.create({
        product_id: product._id,
        variant_name: variant.variant_name,
        weight: variant.weight,
        weight_unit: variant.weight_unit || 'g',
        mrp: variant.mrp,
        selling_price: variant.selling_price,
        stock_quantity: variant.stock_quantity || 0,
        low_stock_threshold: variant.low_stock_threshold || 10,
        is_default: index === 0,
        display_order: index
      });

      console.log(`Variant ${index} created:`, createdVariant._id);

      await Inventory.create({
        variant_id: createdVariant._id,
        current_stock: variant.stock_quantity || 0,
        reserved_stock: 0,
        low_stock_threshold: variant.low_stock_threshold || 10,
        last_restocked_at: new Date(),
        last_restocked_quantity: variant.stock_quantity || 0
      });

      return createdVariant;
    });

    await Promise.all(variantPromises);
    console.log('All variants created');

    if (nutrition && Object.keys(nutrition).length > 0) {
      try {
        await ProductNutrition.create({
          product_id: product._id,
          ...nutrition
        });
        console.log('Nutrition info added');
      } catch (nutritionError) {
        console.error('Failed to add nutrition:', nutritionError);
      }
    }

    const completeProduct = await Product.findById(product._id)
      .populate('category_id')
      .populate('subcategory_id')
      .populate('variants')
      .populate('images')
      .populate('nutrition');

    console.log('Product creation complete!');

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: completeProduct
    });

  } catch (error) {
    console.error('=== CREATE PRODUCT ERROR ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: error.message
    });
  }
};

// ============= GET ALL PRODUCTS =============
exports.getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 25,
      search = '',
      category_id,
      subcategory_id,
      is_active,
      is_featured,
      is_bestseller,
      is_new_arrival,
      stock_status,
      min_price,
      max_price,
      sort_by = 'createdAt',
      sort_order = 'desc',
      tags
    } = req.query;

    const query = {
      created_by: req.user._id
    };

    if (search) {
      query.$or = [
        { product_name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    if (category_id) query.category_id = category_id;
    if (subcategory_id) query.subcategory_id = subcategory_id;
    if (is_active !== undefined) query.is_active = is_active === 'true';
    if (is_featured !== undefined) query.is_featured = is_featured === 'true';
    if (is_bestseller !== undefined) query.is_bestseller = is_bestseller === 'true';
    if (is_new_arrival !== undefined) query.is_new_arrival = is_new_arrival === 'true';
    if (tags) query.tags = { $in: tags.split(',') };

    const sortOptions = {};
    sortOptions[sort_by] = sort_order === 'desc' ? -1 : 1;

    let products = await Product.find(query)
      .populate('category_id', 'category_name')
      .populate('subcategory_id', 'subcategory_name')
      .populate('variants')
      .populate('images')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean()
      .exec();

    if (min_price || max_price || stock_status) {
      products = products.filter(product => {
        if (!product.variants || product.variants.length === 0) return false;

        if (min_price || max_price) {
          const hasVariantInRange = product.variants.some(v => {
            const price = v.selling_price;
            const minCheck = min_price ? price >= parseFloat(min_price) : true;
            const maxCheck = max_price ? price <= parseFloat(max_price) : true;
            return minCheck && maxCheck;
          });
          if (!hasVariantInRange) return false;
        }

        if (stock_status) {
          const hasMatchingStock = product.variants.some(v => {
            if (stock_status === 'out_of_stock') return v.stock_quantity === 0;
            if (stock_status === 'low_stock') return v.stock_quantity > 0 && v.stock_quantity <= v.low_stock_threshold;
            if (stock_status === 'in_stock') return v.stock_quantity > v.low_stock_threshold;
            return true;
          });
          if (!hasMatchingStock) return false;
        }

        return true;
      });
    }

    products = products.map(product => ({
      ...product,
      primary_image: product.images?.find(img => img.is_primary)?.image_url || product.images?.[0]?.image_url,
      min_price: product.variants?.length > 0 ? Math.min(...product.variants.map(v => v.selling_price)) : 0,
      max_price: product.variants?.length > 0 ? Math.max(...product.variants.map(v => v.selling_price)) : 0,
      total_stock: product.variants?.reduce((sum, v) => sum + v.stock_quantity, 0) || 0
    }));

    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        products,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(total / limit),
          total_items: total,
          items_per_page: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message
    });
  }
};

// ============= GET SINGLE PRODUCT =============
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findOne({
      _id: id,
      created_by: req.user._id
    })
      .populate('category_id')
      .populate('subcategory_id')
      .populate('variants')
      .populate('images')
      .populate('nutrition')
      .populate('attributes')
      .populate('created_by', 'name email')
      .populate('updated_by', 'name email');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or you do not have access'
      });
    }

    const variantsWithInventory = await Promise.all(
      product.variants.map(async (variant) => {
        const inventory = await Inventory.findOne({ variant_id: variant._id });
        return {
          ...variant.toObject(),
          inventory
        };
      })
    );

    const productData = product.toObject();
    productData.variants = variantsWithInventory;

    res.status(200).json({
      success: true,
      data: productData
    });

  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: error.message
    });
  }
};

// ============= UPDATE PRODUCT =============
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    updateData.updated_by = req.user._id;

    delete updateData.variants;
    delete updateData.nutrition;
    delete updateData.attributes;
    delete updateData.sku;

    const product = await Product.findOne({
      _id: id,
      created_by: req.user._id
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or you do not have access'
      });
    }

    // ✅ FIXED: Vendor can change to ANY active category
    if (updateData.category_id && updateData.category_id !== product.category_id.toString()) {
      const category = await Category.findOne({
        _id: updateData.category_id,
        is_active: true
      });

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found or inactive'
        });
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('category_id')
      .populate('subcategory_id')
      .populate('variants')
      .populate('images')
      .populate('nutrition')
      .populate('attributes');

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct
    });

  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: error.message
    });
  }
};

// ============= DELETE PRODUCT =============
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { hard_delete = false } = req.query;

    const product = await Product.findOne({
      _id: id,
      created_by: req.user._id
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or you do not have access'
      });
    }

    if (hard_delete === 'true') {
      const images = await ProductImage.find({ product_id: id });
      for (const image of images) {
        if (image.public_id) {
          await deleteFromCloudinary(image.public_id);
        }
      }
      await ProductImage.deleteMany({ product_id: id });

      const variants = await ProductVariant.find({ product_id: id });
      for (const variant of variants) {
        await Inventory.deleteOne({ variant_id: variant._id });
      }
      await ProductVariant.deleteMany({ product_id: id });

      await ProductNutrition.deleteOne({ product_id: id });
      await ProductAttribute.deleteMany({ product_id: id });

      await Product.findByIdAndDelete(id);

      res.status(200).json({
        success: true,
        message: 'Product deleted permanently'
      });
    } else {
      await Product.findByIdAndUpdate(id, { is_active: false });
      
      res.status(200).json({
        success: true,
        message: 'Product deactivated successfully'
      });
    }

  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: error.message
    });
  }
};

// ============= ADD PRODUCT VARIANT =============
exports.addVariant = async (req, res) => {
  try {
    const { product_id } = req.params;
    const { variant_name, weight, weight_unit, mrp, selling_price, stock_quantity, low_stock_threshold, is_default } = req.body;

    const product = await Product.findOne({
      _id: product_id,
      created_by: req.user._id
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or you do not have access'
      });
    }

    const variant = await ProductVariant.create({
      product_id,
      variant_name,
      weight,
      weight_unit: weight_unit || 'g',
      mrp,
      selling_price,
      stock_quantity: stock_quantity || 0,
      low_stock_threshold: low_stock_threshold || 10,
      is_default: is_default || false
    });

    await Inventory.create({
      variant_id: variant._id,
      current_stock: stock_quantity || 0,
      reserved_stock: 0,
      low_stock_threshold: low_stock_threshold || 10,
      last_restocked_at: new Date(),
      last_restocked_quantity: stock_quantity || 0
    });

    res.status(201).json({
      success: true,
      message: 'Variant added successfully',
      data: variant
    });

  } catch (error) {
    console.error('Add variant error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add variant',
      error: error.message
    });
  }
};

// ============= UPDATE PRODUCT VARIANT =============
exports.updateVariant = async (req, res) => {
  try {
    const { variant_id } = req.params;
    const updateData = { ...req.body };

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

    const updatedVariant = await ProductVariant.findByIdAndUpdate(
      variant_id,
      updateData,
      { new: true, runValidators: true }
    );

    if (updateData.stock_quantity !== undefined) {
      await Inventory.findOneAndUpdate(
        { variant_id },
        { 
          current_stock: updateData.stock_quantity,
          last_restocked_at: new Date()
        }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Variant updated successfully',
      data: updatedVariant
    });

  } catch (error) {
    console.error('Update variant error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update variant',
      error: error.message
    });
  }
};

// ============= DELETE VARIANT =============
exports.deleteVariant = async (req, res) => {
  try {
    const { variant_id } = req.params;

    const variant = await ProductVariant.findById(variant_id);
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

    const variantCount = await ProductVariant.countDocuments({ product_id: variant.product_id });
    if (variantCount === 1) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete the only variant. Product must have at least one variant.'
      });
    }

    await ProductVariant.findByIdAndDelete(variant_id);
    await Inventory.deleteOne({ variant_id });

    res.status(200).json({
      success: true,
      message: 'Variant deleted successfully'
    });

  } catch (error) {
    console.error('Delete variant error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete variant',
      error: error.message
    });
  }
};

// ============= ADD PRODUCT IMAGES =============
exports.addProductImages = async (req, res) => {
  try {
    const { product_id } = req.params;

    const product = await Product.findOne({
      _id: product_id,
      created_by: req.user._id
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or you do not have access'
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No images provided'
      });
    }

    const currentImageCount = await ProductImage.countDocuments({ product_id });

    const imageUploadPromises = req.files.map(async (file, index) => {
      const uploadResult = await uploadToCloudinary(file.path, 'products');
      
      return ProductImage.create({
        product_id,
        image_url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
        image_alt_text: `${product.product_name} - Image ${currentImageCount + index + 1}`,
        is_primary: false,
        display_order: currentImageCount + index
      });
    });

    const images = await Promise.all(imageUploadPromises);

    res.status(201).json({
      success: true,
      message: 'Images added successfully',
      data: images
    });

  } catch (error) {
    console.error('Add images error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add images',
      error: error.message
    });
  }
};

// ============= SET PRIMARY IMAGE =============
exports.setPrimaryImage = async (req, res) => {
  try {
    const { image_id } = req.params;

    const image = await ProductImage.findById(image_id);
    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    const product = await Product.findOne({
      _id: image.product_id,
      created_by: req.user._id
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'You do not have access to this image'
      });
    }

    await ProductImage.updateMany(
      { product_id: image.product_id },
      { is_primary: false }
    );

    await ProductImage.findByIdAndUpdate(image_id, { is_primary: true });

    res.status(200).json({
      success: true,
      message: 'Primary image updated successfully'
    });

  } catch (error) {
    console.error('Set primary image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to set primary image',
      error: error.message
    });
  }
};

// ============= DELETE PRODUCT IMAGE =============
exports.deleteProductImage = async (req, res) => {
  try {
    const { image_id } = req.params;

    const image = await ProductImage.findById(image_id);
    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    const product = await Product.findOne({
      _id: image.product_id,
      created_by: req.user._id
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'You do not have access to this image'
      });
    }

    const imageCount = await ProductImage.countDocuments({ product_id: image.product_id });
    if (imageCount === 1) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete the only image. Product must have at least one image.'
      });
    }

    if (image.public_id) {
      await deleteFromCloudinary(image.public_id);
    }

    await ProductImage.findByIdAndDelete(image_id);

    if (image.is_primary) {
      const firstImage = await ProductImage.findOne({ product_id: image.product_id }).sort({ display_order: 1 });
      if (firstImage) {
        await ProductImage.findByIdAndUpdate(firstImage._id, { is_primary: true });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully'
    });

  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete image',
      error: error.message
    });
  }
};

// ============= REORDER IMAGES =============
exports.reorderImages = async (req, res) => {
  try {
    const { image_orders } = req.body;

    if (image_orders && image_orders.length > 0) {
      const firstImage = await ProductImage.findById(image_orders[0].id);
      if (firstImage) {
        const product = await Product.findOne({
          _id: firstImage.product_id,
          created_by: req.user._id
        });

        if (!product) {
          return res.status(403).json({
            success: false,
            message: 'You do not have access to these images'
          });
        }
      }
    }

    const updatePromises = image_orders.map(item =>
      ProductImage.findByIdAndUpdate(item.id, { display_order: item.display_order })
    );

    await Promise.all(updatePromises);

    res.status(200).json({
      success: true,
      message: 'Images reordered successfully'
    });

  } catch (error) {
    console.error('Reorder images error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reorder images',
      error: error.message
    });
  }
};

// ============= UPDATE NUTRITION INFO =============
exports.updateNutrition = async (req, res) => {
  try {
    const { product_id } = req.params;
    const nutritionData = req.body;

    const product = await Product.findOne({
      _id: product_id,
      created_by: req.user._id
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or you do not have access'
      });
    }

    const nutrition = await ProductNutrition.findOneAndUpdate(
      { product_id },
      nutritionData,
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Nutrition info updated successfully',
      data: nutrition
    });

  } catch (error) {
    console.error('Update nutrition error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update nutrition info',
      error: error.message
    });
  }
};

// ============= ADD PRODUCT ATTRIBUTES =============
exports.addAttributes = async (req, res) => {
  try {
    const { product_id } = req.params;
    const { attributes } = req.body;

    const product = await Product.findOne({
      _id: product_id,
      created_by: req.user._id
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or you do not have access'
      });
    }

    const attributePromises = attributes.map(attr =>
      ProductAttribute.create({
        product_id,
        attribute_name: attr.attribute_name,
        attribute_value: attr.attribute_value
      })
    );

    const createdAttributes = await Promise.all(attributePromises);

    res.status(201).json({
      success: true,
      message: 'Attributes added successfully',
      data: createdAttributes
    });

  } catch (error) {
    console.error('Add attributes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add attributes',
      error: error.message
    });
  }
};

// ============= UPDATE ATTRIBUTE =============
exports.updateAttribute = async (req, res) => {
  try {
    const { attribute_id } = req.params;
    const { attribute_name, attribute_value } = req.body;

    const attribute = await ProductAttribute.findById(attribute_id);
    if (!attribute) {
      return res.status(404).json({
        success: false,
        message: 'Attribute not found'
      });
    }

    const product = await Product.findOne({
      _id: attribute.product_id,
      created_by: req.user._id
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'You do not have access to this attribute'
      });
    }

    const updatedAttribute = await ProductAttribute.findByIdAndUpdate(
      attribute_id,
      { attribute_name, attribute_value },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Attribute updated successfully',
      data: updatedAttribute
    });

  } catch (error) {
    console.error('Update attribute error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update attribute',
      error: error.message
    });
  }
};

// ============= DELETE ATTRIBUTE =============
exports.deleteAttribute = async (req, res) => {
  try {
    const { attribute_id } = req.params;

    const attribute = await ProductAttribute.findById(attribute_id);
    
    if (!attribute) {
      return res.status(404).json({
        success: false,
        message: 'Attribute not found'
      });
    }

    const product = await Product.findOne({
      _id: attribute.product_id,
      created_by: req.user._id
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'You do not have access to this attribute'
      });
    }

    await ProductAttribute.findByIdAndDelete(attribute_id);

    res.status(200).json({
      success: true,
      message: 'Attribute deleted successfully'
    });

  } catch (error) {
    console.error('Delete attribute error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete attribute',
      error: error.message
    });
  }
};

// ============= BULK UPDATE PRODUCTS STATUS =============
exports.bulkUpdateStatus = async (req, res) => {
  try {
    const { product_ids, is_active } = req.body;

    if (!Array.isArray(product_ids) || product_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide product IDs'
      });
    }

    await Product.updateMany(
      { 
        _id: { $in: product_ids },
        created_by: req.user._id
      },
      { 
        is_active, 
        updated_by: req.user._id
      }
    );

    res.status(200).json({
      success: true,
      message: `Products ${is_active ? 'activated' : 'deactivated'} successfully`
    });

  } catch (error) {
    console.error('Bulk update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update products',
      error: error.message
    });
  }
};

// ============= BULK DELETE PRODUCTS =============
exports.bulkDeleteProducts = async (req, res) => {
  try {
    const { product_ids } = req.body;

    if (!Array.isArray(product_ids) || product_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide product IDs'
      });
    }

    await Product.updateMany(
      { 
        _id: { $in: product_ids },
        created_by: req.user._id
      },
      { 
        is_active: false, 
        updated_by: req.user._id
      }
    );

    res.status(200).json({
      success: true,
      message: 'Products deactivated successfully'
    });

  } catch (error) {
    console.error('Bulk delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete products',
      error: error.message
    });
  }
};

// ============= BULK PRICE UPDATE =============
exports.bulkPriceUpdate = async (req, res) => {
  try {
    const { product_ids, discount_type, discount_value } = req.body;

    if (!Array.isArray(product_ids) || product_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide product IDs'
      });
    }

    const products = await Product.find({
      _id: { $in: product_ids },
      created_by: req.user._id
    });

    const productIds = products.map(p => p._id);

    const variants = await ProductVariant.find({
      product_id: { $in: productIds }
    });

    const updatePromises = variants.map(variant => {
      let newPrice;
      
      if (discount_type === 'percentage') {
        newPrice = variant.mrp - (variant.mrp * discount_value / 100);
      } else {
        newPrice = variant.mrp - discount_value;
      }

      newPrice = Math.max(0, newPrice);

      return ProductVariant.findByIdAndUpdate(variant._id, {
        selling_price: Math.round(newPrice)
      });
    });

    await Promise.all(updatePromises);

    res.status(200).json({
      success: true,
      message: 'Prices updated successfully'
    });

  } catch (error) {
    console.error('Bulk price update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update prices',
      error: error.message
    });
  }
};

module.exports = exports;