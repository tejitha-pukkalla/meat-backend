// const mongoose = require('mongoose');

// const productSchema = new mongoose.Schema({
//   product_name: {
//     type: String,
//     required: [true, 'Product name is required'],
//     trim: true
//   },
//   product_slug: {
//     type: String,
//     unique: true,
//     lowercase: true
//   },
//   sku: {
//     type: String,
//     unique: true,
//     uppercase: true
//   },
//   category_id: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Category',
//     required: [true, 'Category is required']
//   },
//   subcategory_id: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Subcategory'
//   },
//   short_description: {
//     type: String,
//     maxlength: 200
//   },
//   long_description: {
//     type: String
//   },
//   preparation_instructions: String,
//   storage_instructions: String,
//   cooking_instructions: String,
//   shelf_life: String,
//   country_of_origin: {
//     type: String,
//     default: 'India'
//   },
//   is_featured: {
//     type: Boolean,
//     default: false
//   },
//   is_bestseller: {
//     type: Boolean,
//     default: false
//   },
//   is_new_arrival: {
//     type: Boolean,
//     default: false
//   },
//   is_active: {
//     type: Boolean,
//     default: true
//   },
//   tags: [{
//     type: String,
//     trim: true
//   }],
//   created_by: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Admin'
//   },
//   updated_by: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Admin'
//   }
// }, {
//   timestamps: true
// });

// // Compound index for category search
// productSchema.index({ category_id: 1, subcategory_id: 1 });
// productSchema.index({ product_name: 'text', tags: 'text' });

// // Auto-generate slug and SKU
// productSchema.pre('save', async function(next) {
//   if (this.isModified('product_name')) {
//     this.product_slug = this.product_name
//       .toLowerCase()
//       .replace(/[^a-z0-9]+/g, '-')
//       .replace(/^-|-$/g, '');
//   }
  
//   // Generate SKU if not exists
//   if (!this.sku && this.isNew) {
//     const Category = mongoose.model('Category');
//     const Subcategory = mongoose.model('Subcategory');
    
//     const category = await Category.findById(this.category_id);
//     const subcategory = this.subcategory_id ? await Subcategory.findById(this.subcategory_id) : null;
    
//     const catCode = category ? category.category_name.substring(0, 3).toUpperCase() : 'PRD';
//     const subCode = subcategory ? subcategory.subcategory_name.substring(0, 3).toUpperCase() : 'GEN';
    
//     // Get count for sequence
//     const count = await this.constructor.countDocuments({
//       category_id: this.category_id,
//       subcategory_id: this.subcategory_id
//     });
    
//     this.sku = `${catCode}-${subCode}-${String(count + 1).padStart(3, '0')}`;
//   }
  
//   next();
// });

// // Virtual to populate variants
// productSchema.virtual('variants', {
//   ref: 'ProductVariant',
//   localField: '_id',
//   foreignField: 'product_id'
// });

// // Virtual to populate images
// productSchema.virtual('images', {
//   ref: 'ProductImage',
//   localField: '_id',
//   foreignField: 'product_id'
// });

// // Virtual to populate nutrition
// productSchema.virtual('nutrition', {
//   ref: 'ProductNutrition',
//   localField: '_id',
//   foreignField: 'product_id',
//   justOne: true
// });

// // Virtual to populate attributes
// productSchema.virtual('attributes', {
//   ref: 'ProductAttribute',
//   localField: '_id',
//   foreignField: 'product_id'
// });

// productSchema.set('toJSON', { virtuals: true });
// productSchema.set('toObject', { virtuals: true });

// module.exports = mongoose.model('Product', productSchema);



const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  product_name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  product_slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  sku: {
    type: String,
    unique: true,
    uppercase: true
  },
  category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  subcategory_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subcategory'
  },
  short_description: {
    type: String,
    maxlength: 200
  },
  long_description: {
    type: String
  },
  preparation_instructions: String,
  storage_instructions: String,
  cooking_instructions: String,
  shelf_life: String,
  country_of_origin: {
    type: String,
    default: 'India'
  },
  is_featured: {
    type: Boolean,
    default: false
  },
  is_bestseller: {
    type: Boolean,
    default: false
  },
  is_new_arrival: {
    type: Boolean,
    default: false
  },
  is_active: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor', // ✅ CHANGED: Admin → Vendor
    required: true
  },
  updated_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor' // ✅ CHANGED: Admin → Vendor
  }
}, {
  timestamps: true
});

// Compound index for category search
productSchema.index({ category_id: 1, subcategory_id: 1 });
productSchema.index({ product_name: 'text', tags: 'text' });

// Auto-generate slug and SKU
productSchema.pre('save', async function(next) {
  if (this.isModified('product_name')) {
    this.product_slug = this.product_name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
  
  // Generate SKU if not exists
  if (!this.sku && this.isNew) {
    const Category = mongoose.model('Category');
    const Subcategory = mongoose.model('Subcategory');
    
    const category = await Category.findById(this.category_id);
    const subcategory = this.subcategory_id ? await Subcategory.findById(this.subcategory_id) : null;
    
    const catCode = category ? category.category_name.substring(0, 3).toUpperCase() : 'PRD';
    const subCode = subcategory ? subcategory.subcategory_name.substring(0, 3).toUpperCase() : 'GEN';
    
    // Get count for sequence
    const count = await this.constructor.countDocuments({
      category_id: this.category_id,
      subcategory_id: this.subcategory_id
    });
    
    this.sku = `${catCode}-${subCode}-${String(count + 1).padStart(3, '0')}`;
  }
  
  next();
});

// Virtual to populate variants
productSchema.virtual('variants', {
  ref: 'ProductVariant',
  localField: '_id',
  foreignField: 'product_id'
});

// Virtual to populate images
productSchema.virtual('images', {
  ref: 'ProductImage',
  localField: '_id',
  foreignField: 'product_id'
});

// Virtual to populate nutrition
productSchema.virtual('nutrition', {
  ref: 'ProductNutrition',
  localField: '_id',
  foreignField: 'product_id',
  justOne: true
});

// Virtual to populate attributes
productSchema.virtual('attributes', {
  ref: 'ProductAttribute',
  localField: '_id',
  foreignField: 'product_id'
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);