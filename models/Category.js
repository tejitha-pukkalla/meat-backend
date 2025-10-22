// const mongoose = require('mongoose');

// const categorySchema = new mongoose.Schema({
//   category_name: {
//     type: String,
//     required: [true, 'Category name is required'],
//     unique: true,
//     trim: true
//   },
//   category_slug: {
//     type: String,
//     unique: true,
//     lowercase: true
//   },
//   category_description: {
//     type: String,
//     trim: true
//   },
//   category_image: {
//     url: String,
//     public_id: String // for Cloudinary
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

// // Auto-generate slug before saving
// categorySchema.pre('save', function(next) {
//   if (this.isModified('category_name')) {
//     this.category_slug = this.category_name
//       .toLowerCase()
//       .replace(/[^a-z0-9]+/g, '-')
//       .replace(/^-|-$/g, '');
//   }
//   next();
// });

// // Virtual for product count
// categorySchema.virtual('product_count', {
//   ref: 'Product',
//   localField: '_id',
//   foreignField: 'category_id',
//   count: true
// });

// categorySchema.set('toJSON', { virtuals: true });
// categorySchema.set('toObject', { virtuals: true });

// module.exports = mongoose.model('Category', categorySchema);



// const mongoose = require('mongoose');

// const categorySchema = new mongoose.Schema({
//   category_name: {
//     type: String,
//     required: [true, 'Category name is required'],
//     unique: true,
//     trim: true
//   },
//   category_slug: {
//     type: String,
//     unique: true,
//     lowercase: true
//   },
//   category_description: {
//     type: String,
//     trim: true
//   },
//   category_image: {
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

// // Auto-generate slug before saving
// categorySchema.pre('save', function(next) {
//   if (this.isModified('category_name')) {
//     this.category_slug = this.category_name
//       .toLowerCase()
//       .replace(/[^a-z0-9]+/g, '-')
//       .replace(/^-|-$/g, '');
//   }
//   next();
// });

// // Virtual for product count
// categorySchema.virtual('product_count', {
//   ref: 'Product',
//   localField: '_id',
//   foreignField: 'category_id',
//   count: true
// });

// categorySchema.set('toJSON', { virtuals: true });
// categorySchema.set('toObject', { virtuals: true });

// module.exports = mongoose.model('Category', categorySchema);
// vendor to superadmin



const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  category_name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true
  },
  category_slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  category_description: {
    type: String,
    trim: true
  },
  category_image: {
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

// Auto-generate slug before saving
categorySchema.pre('save', function(next) {
  if (this.isModified('category_name')) {
    this.category_slug = this.category_name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
  next();
});

// Virtual for product count
categorySchema.virtual('product_count', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'category_id',
  count: true
});

categorySchema.set('toJSON', { virtuals: true });
categorySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Category', categorySchema);