// const express = require('express');
// const router = express.Router();
// const Category = require('../models/Category');
// const Subcategory = require('../models/Subcategory');

// // ============= GET ACTIVE CATEGORIES (FOR VENDORS/USERS) =============
// // âœ… CHANGED: Removed verifyToken - this is PUBLIC
// router.get('/categories', async (req, res) => {
//   try {
//     const categories = await Category.find({ is_active: true })
//       .select('_id category_name category_slug display_order')
//       .sort({ display_order: 1, category_name: 1 });

//     res.status(200).json({
//       success: true,
//       data: categories
//     });
//   } catch (error) {
//     console.error('Get categories error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch categories',
//       error: error.message
//     });
//   }
// });

// // ============= GET ACTIVE SUBCATEGORIES BY CATEGORY (FOR VENDORS/USERS) =============
// // âœ… CHANGED: Removed verifyToken - this is PUBLIC
// router.get('/subcategories/:categoryId', async (req, res) => {
//   try {
//     const { categoryId } = req.params;

//     const subcategories = await Subcategory.find({ 
//       parent_category_id: categoryId,
//       is_active: true 
//     })
//       .select('_id subcategory_name subcategory_slug display_order')
//       .sort({ display_order: 1, subcategory_name: 1 });

//     res.status(200).json({
//       success: true,
//       data: subcategories
//     });
//   } catch (error) {
//     console.error('Get subcategories error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch subcategories',
//       error: error.message
//     });
//   }
// });

// // ============= GET ALL ACTIVE SUBCATEGORIES (FOR VENDORS/USERS) =============
// // âœ… CHANGED: Removed verifyToken - this is PUBLIC
// router.get('/subcategories', async (req, res) => {
//   try {
//     const subcategories = await Subcategory.find({ is_active: true })
//       .populate('parent_category_id', 'category_name')
//       .select('_id subcategory_name subcategory_slug parent_category_id display_order')
//       .sort({ display_order: 1, subcategory_name: 1 });

//     res.status(200).json({
//       success: true,
//       data: subcategories
//     });
//   } catch (error) {
//     console.error('Get subcategories error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch subcategories',
//       error: error.message
//     });
//   }
// });

// module.exports = router;



// public routes loo product routes add chesa 
const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Subcategory = require('../models/Subcategory');
const Product = require('../models/Product');
const ProductVariant = require('../models/ProductVariant');
const ProductImage = require('../models/ProductImage');
const { ProductNutrition } = require('../models/OtherModels');

// ============= CATEGORIES =============

router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find({ is_active: true })
      .select('_id category_name category_slug category_image display_order')
      .sort({ display_order: 1, category_name: 1 });

    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
});

// ============= SUBCATEGORIES =============

router.get('/subcategories/:categoryId', async (req, res) => {
  try {
    const { categoryId } = req.params;

    const subcategories = await Subcategory.find({ 
      parent_category_id: categoryId,
      is_active: true 
    })
      .select('_id subcategory_name subcategory_slug subcategory_image display_order')
      .sort({ display_order: 1, subcategory_name: 1 });

    res.status(200).json({
      success: true,
      data: subcategories
    });
  } catch (error) {
    console.error('Get subcategories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subcategories',
      error: error.message
    });
  }
});

router.get('/subcategories', async (req, res) => {
  try {
    const subcategories = await Subcategory.find({ is_active: true })
      .populate('parent_category_id', 'category_name')
      .select('_id subcategory_name subcategory_slug parent_category_id display_order')
      .sort({ display_order: 1, subcategory_name: 1 });

    res.status(200).json({
      success: true,
      data: subcategories
    });
  } catch (error) {
    console.error('Get subcategories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subcategories',
      error: error.message
    });
  }
});

// ============= PRODUCTS =============

// GET ALL PRODUCTS (with filters)
router.get('/products', async (req, res) => {
  try {
    const { 
      category_id, 
      subcategory_id, 
      search,
      is_featured,
      is_bestseller,
      is_new_arrival,
      min_price,
      max_price,
      page = 1,
      limit = 20,
      sort_by = 'createdAt',
      sort_order = 'desc'
    } = req.query;

    // Build query - only active products
    const query = { 
      is_active: true
    };

    // Filter by category
    if (category_id) {
      query.category_id = category_id;
    }

    // Filter by subcategory
    if (subcategory_id) {
      query.subcategory_id = subcategory_id;
    }

    // Search by product name
    if (search) {
      query.product_name = { $regex: search, $options: 'i' };
    }

    // Filter by flags
    if (is_featured === 'true') {
      query.is_featured = true;
    }
    if (is_bestseller === 'true') {
      query.is_bestseller = true;
    }
    if (is_new_arrival === 'true') {
      query.is_new_arrival = true;
    }

    // Sorting
    const sortOptions = {};
    sortOptions[sort_by] = sort_order === 'desc' ? -1 : 1;

    // Pagination
    const skip = (page - 1) * limit;

    // Fetch products
    let products = await Product.find(query)
      .populate('category_id', 'category_name category_slug')
      .populate('subcategory_id', 'subcategory_name subcategory_slug')
      .populate('created_by', 'name email phone address city state') // Vendor details
      .select('-__v')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get variants and images for each product
    const productsWithDetails = await Promise.all(
      products.map(async (product) => {
        // Get variants
        const variants = await ProductVariant.find({ 
          product_id: product._id,
          is_active: true 
        }).select('-__v').lean();

        // Get images
        const images = await ProductImage.find({ product_id: product._id })
          .sort({ display_order: 1 })
          .select('image_url image_alt_text is_primary display_order')
          .lean();

        // Calculate price range
        const prices = variants.map(v => v.selling_price);
        const minVariantPrice = variants.length > 0 ? Math.min(...prices) : 0;
        const maxVariantPrice = variants.length > 0 ? Math.max(...prices) : 0;

        return {
          ...product,
          variants,
          images,
          primary_image: images.find(img => img.is_primary)?.image_url || images[0]?.image_url,
          min_price: minVariantPrice,
          max_price: maxVariantPrice,
          in_stock: variants.some(v => v.stock_quantity > 0)
        };
      })
    );

    // Apply price filter if needed
    let filteredProducts = productsWithDetails;
    if (min_price || max_price) {
      filteredProducts = productsWithDetails.filter(product => {
        const minCheck = min_price ? product.min_price >= parseFloat(min_price) : true;
        const maxCheck = max_price ? product.max_price <= parseFloat(max_price) : true;
        return minCheck && maxCheck;
      });
    }

    // Get total count
    const totalProducts = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        products: filteredProducts,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalProducts / limit),
          totalProducts,
          productsPerPage: parseInt(limit)
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
});

// GET SINGLE PRODUCT BY ID (detailed view)
router.get('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findOne({ 
      _id: id, 
      is_active: true 
    })
      .populate('category_id', 'category_name category_slug')
      .populate('subcategory_id', 'subcategory_name subcategory_slug')
      .populate('created_by', 'name email phone address city state pincode fssaiLicense')
      .lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Get variants
    const variants = await ProductVariant.find({ 
      product_id: id,
      is_active: true 
    }).select('-__v').lean();

    // Get images
    const images = await ProductImage.find({ product_id: id })
      .sort({ display_order: 1 })
      .lean();

    // Get nutrition info
    const nutrition = await ProductNutrition.findOne({ product_id: id })
      .select('-_id -product_id -__v')
      .lean();

    // Build complete product object
    const completeProduct = {
      ...product,
      variants,
      images,
      nutrition,
      primary_image: images.find(img => img.is_primary)?.image_url || images[0]?.image_url,
      min_price: variants.length > 0 ? Math.min(...variants.map(v => v.selling_price)) : 0,
      max_price: variants.length > 0 ? Math.max(...variants.map(v => v.selling_price)) : 0,
      in_stock: variants.some(v => v.stock_quantity > 0)
    };

    res.status(200).json({
      success: true,
      data: completeProduct
    });

  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: error.message
    });
  }
});

// GET FEATURED PRODUCTS
router.get('/products/featured/all', async (req, res) => {
  try {
    const products = await Product.find({ 
      is_active: true,
      is_featured: true 
    })
      .populate('category_id', 'category_name')
      .populate('created_by', 'name')
      .limit(8)
      .sort({ createdAt: -1 })
      .lean();

    // Get variants and images for each product
    const productsWithDetails = await Promise.all(
      products.map(async (product) => {
        const variants = await ProductVariant.find({ 
          product_id: product._id,
          is_active: true 
        }).lean();

        const images = await ProductImage.find({ product_id: product._id })
          .sort({ display_order: 1 })
          .limit(1)
          .lean();

        const prices = variants.map(v => v.selling_price);

        return {
          ...product,
          primary_image: images[0]?.image_url,
          min_price: variants.length > 0 ? Math.min(...prices) : 0,
          max_price: variants.length > 0 ? Math.max(...prices) : 0,
          variants: variants.slice(0, 3) // Show only first 3 variants
        };
      })
    );

    res.status(200).json({
      success: true,
      data: productsWithDetails
    });

  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured products',
      error: error.message
    });
  }
});

// GET BESTSELLER PRODUCTS
router.get('/products/bestseller/all', async (req, res) => {
  try {
    const products = await Product.find({ 
      is_active: true,
      is_bestseller: true 
    })
      .populate('category_id', 'category_name')
      .populate('created_by', 'name')
      .limit(8)
      .sort({ createdAt: -1 })
      .lean();

    const productsWithDetails = await Promise.all(
      products.map(async (product) => {
        const variants = await ProductVariant.find({ 
          product_id: product._id,
          is_active: true 
        }).lean();

        const images = await ProductImage.find({ product_id: product._id })
          .sort({ display_order: 1 })
          .limit(1)
          .lean();

        const prices = variants.map(v => v.selling_price);

        return {
          ...product,
          primary_image: images[0]?.image_url,
          min_price: variants.length > 0 ? Math.min(...prices) : 0,
          max_price: variants.length > 0 ? Math.max(...prices) : 0,
          variants: variants.slice(0, 3)
        };
      })
    );

    res.status(200).json({
      success: true,
      data: productsWithDetails
    });

  } catch (error) {
    console.error('Get bestseller products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bestseller products',
      error: error.message
    });
  }
});

// GET NEW ARRIVAL PRODUCTS
router.get('/products/new-arrivals/all', async (req, res) => {
  try {
    const products = await Product.find({ 
      is_active: true,
      is_new_arrival: true 
    })
      .populate('category_id', 'category_name')
      .populate('created_by', 'name')
      .limit(8)
      .sort({ createdAt: -1 })
      .lean();

    const productsWithDetails = await Promise.all(
      products.map(async (product) => {
        const variants = await ProductVariant.find({ 
          product_id: product._id,
          is_active: true 
        }).lean();

        const images = await ProductImage.find({ product_id: product._id })
          .sort({ display_order: 1 })
          .limit(1)
          .lean();

        const prices = variants.map(v => v.selling_price);

        return {
          ...product,
          primary_image: images[0]?.image_url,
          min_price: variants.length > 0 ? Math.min(...prices) : 0,
          max_price: variants.length > 0 ? Math.max(...prices) : 0,
          variants: variants.slice(0, 3)
        };
      })
    );

    res.status(200).json({
      success: true,
      data: productsWithDetails
    });

  } catch (error) {
    console.error('Get new arrival products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch new arrival products',
      error: error.message
    });
  }
});

// GET PRODUCTS BY VENDOR (Vendor Store Page)
router.get('/vendors/:vendorId/products', async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (page - 1) * limit;

    const products = await Product.find({ 
      created_by: vendorId,
      is_active: true 
    })
      .populate('category_id', 'category_name')
      .populate('subcategory_id', 'subcategory_name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const productsWithDetails = await Promise.all(
      products.map(async (product) => {
        const variants = await ProductVariant.find({ 
          product_id: product._id,
          is_active: true 
        }).lean();

        const images = await ProductImage.find({ product_id: product._id })
          .sort({ display_order: 1 })
          .lean();

        const prices = variants.map(v => v.selling_price);

        return {
          ...product,
          variants,
          images,
          primary_image: images.find(img => img.is_primary)?.image_url || images[0]?.image_url,
          min_price: variants.length > 0 ? Math.min(...prices) : 0,
          max_price: variants.length > 0 ? Math.max(...prices) : 0
        };
      })
    );

    const totalProducts = await Product.countDocuments({ 
      created_by: vendorId,
      is_active: true 
    });

    // Get vendor info
    const Vendor = require('../models/Vendor');
    const vendor = await Vendor.findById(vendorId)
      .select('name email phone address city state pincode fssaiLicense')
      .lean();

    res.status(200).json({
      success: true,
      data: {
        vendor,
        products: productsWithDetails,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalProducts / limit),
          totalProducts,
          productsPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get vendor products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vendor products',
      error: error.message
    });
  }
});

module.exports = router;