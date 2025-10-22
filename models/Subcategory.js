// const mongoose = require('mongoose');

// const subcategorySchema = new mongoose.Schema({
//   parent_category_id: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Category',
//     required: [true, 'Parent category is required']
//   },
//   subcategory_name: {
//     type: String,
//     required: [true, 'Subcategory name is required'],
//     trim: true
//   },
//   subcategory_slug: {
//     type: String,
//     lowercase: true
//   },
//   subcategory_description: {
//     type: String,
//     trim: true
//   },
//   subcategory_image: {
//     url: String,
//     public_id: String
//   },
//   display_order: {
//     type: Number,
//     default: 0
//   },
//   is_active: {
//     type: Boolean,
//     default: true
//   },
//   meta_title: String,
//   meta_description: String,
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

// // Compound index for unique subcategory name within parent category
// subcategorySchema.index({ parent_category_id: 1, subcategory_name: 1 }, { unique: true });

// // Auto-generate slug
// subcategorySchema.pre('save', function(next) {
//   if (this.isModified('subcategory_name')) {
//     this.subcategory_slug = this.subcategory_name
//       .toLowerCase()
//       .replace(/[^a-z0-9]+/g, '-')
//       .replace(/^-|-$/g, '');
//   }
//   next();
// });

// // Virtual for product count
// subcategorySchema.virtual('product_count', {
//   ref: 'Product',
//   localField: '_id',
//   foreignField: 'subcategory_id',
//   count: true
// });

// subcategorySchema.set('toJSON', { virtuals: true });
// subcategorySchema.set('toObject', { virtuals: true });

// module.exports = mongoose.model('Subcategory', subcategorySchema);




// const mongoose = require('mongoose');

// const subcategorySchema = new mongoose.Schema({
//   parent_category_id: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Category',
//     required: [true, 'Parent category is required']
//   },
//   subcategory_name: {
//     type: String,
//     required: [true, 'Subcategory name is required'],
//     trim: true
//   },
//   subcategory_slug: {
//     type: String,
//     lowercase: true
//   },
//   subcategory_description: {
//     type: String,
//     trim: true
//   },
//   subcategory_image: {
//     url: String,
//     public_id: String
//   },
//   display_order: {
//     type: Number,
//     default: 0
//   },
//   is_active: {
//     type: Boolean,
//     default: true
//   },
//   meta_title: String,
//   meta_description: String,
//   created_by: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Vendor', // ✅ CHANGED: Admin → Vendor
//     required: true
//   },
//   updated_by: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Vendor' // ✅ CHANGED: Admin → Vendor
//   }
// }, {
//   timestamps: true
// });

// // Compound index for unique subcategory name within parent category
// subcategorySchema.index({ parent_category_id: 1, subcategory_name: 1 }, { unique: true });

// // Auto-generate slug
// subcategorySchema.pre('save', function(next) {
//   if (this.isModified('subcategory_name')) {
//     this.subcategory_slug = this.subcategory_name
//       .toLowerCase()
//       .replace(/[^a-z0-9]+/g, '-')
//       .replace(/^-|-$/g, '');
//   }
//   next();
// });

// // Virtual for product count
// subcategorySchema.virtual('product_count', {
//   ref: 'Product',
//   localField: '_id',
//   foreignField: 'subcategory_id',
//   count: true
// });

// subcategorySchema.set('toJSON', { virtuals: true });
// subcategorySchema.set('toObject', { virtuals: true });

// module.exports = mongoose.model('Subcategory', subcategorySchema);

// vendor to superadmin 


const mongoose = require('mongoose');

const subcategorySchema = new mongoose.Schema({
  parent_category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Parent category is required']
  },
  subcategory_name: {
    type: String,
    required: [true, 'Subcategory name is required'],
    trim: true
  },
  subcategory_slug: {
    type: String,
    lowercase: true
  },
  subcategory_description: {
    type: String,
    trim: true
  },
  subcategory_image: {
    url: String,
    public_id: String
  },
  display_order: {
    type: Number,
    default: 0
  },
  is_active: {
    type: Boolean,
    default: true
  },
  meta_title: String,
  meta_description: String,
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SuperAdmin', // ✅ CHANGED: Vendor → SuperAdmin
    required: true
  },
  updated_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SuperAdmin' // ✅ CHANGED: Vendor → SuperAdmin
  }
}, {
  timestamps: true
});

// Compound index for unique subcategory name within parent category
subcategorySchema.index({ parent_category_id: 1, subcategory_name: 1 }, { unique: true });

// Auto-generate slug
subcategorySchema.pre('save', function(next) {
  if (this.isModified('subcategory_name')) {
    this.subcategory_slug = this.subcategory_name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
  next();
});

// Virtual for product count
subcategorySchema.virtual('product_count', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'subcategory_id',
  count: true
});

subcategorySchema.set('toJSON', { virtuals: true });
subcategorySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Subcategory', subcategorySchema);