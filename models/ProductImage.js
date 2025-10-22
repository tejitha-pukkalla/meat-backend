const mongoose = require('mongoose');

const productImageSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  image_url: {
    type: String,
    required: true
  },
  public_id: {
    type: String // Cloudinary public_id for deletion
  },
  image_alt_text: {
    type: String,
    trim: true
  },
  is_primary: {
    type: Boolean,
    default: false
  },
  display_order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Ensure only one primary image per product
productImageSchema.pre('save', async function(next) {
  if (this.is_primary && this.isModified('is_primary')) {
    await this.constructor.updateMany(
      { product_id: this.product_id, _id: { $ne: this._id } },
      { is_primary: false }
    );
  }
  next();
});

module.exports = mongoose.model('ProductImage', productImageSchema);