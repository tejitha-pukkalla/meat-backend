const mongoose = require('mongoose');

const productVariantSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  variant_name: {
    type: String,
    required: [true, 'Variant name is required'] // e.g., "250g", "500g", "1kg"
  },
  weight: {
    type: Number,
    required: [true, 'Weight is required']
  },
  weight_unit: {
    type: String,
    enum: ['g', 'kg', 'ml', 'l', 'piece', 'dozen'],
    default: 'g'
  },
  mrp: {
    type: Number,
    required: [true, 'MRP is required'],
    min: 0
  },
  selling_price: {
    type: Number,
    required: [true, 'Selling price is required'],
    min: 0
  },
  discount_percentage: {
    type: Number,
    default: 0
  },
  stock_quantity: {
    type: Number,
    default: 0,
    min: 0
  },
  low_stock_threshold: {
    type: Number,
    default: 10
  },
  sku: {
    type: String,
    unique: true,
    uppercase: true
  },
  is_default: {
    type: Boolean,
    default: false
  },
  is_active: {
    type: Boolean,
    default: true
  },
  display_order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Calculate discount percentage before saving
productVariantSchema.pre('save', function(next) {
  if (this.mrp && this.selling_price) {
    this.discount_percentage = Math.round(((this.mrp - this.selling_price) / this.mrp) * 100);
  }
  
  // Generate variant SKU if not exists
  if (!this.sku && this.isNew) {
    const timestamp = Date.now().toString().slice(-6);
    this.sku = `VAR-${timestamp}`;
  }
  
  next();
});

// Validate selling price <= MRP
productVariantSchema.pre('save', function(next) {
  if (this.selling_price > this.mrp) {
    next(new Error('Selling price cannot be greater than MRP'));
  }
  next();
});

// Virtual for available stock (considering reserved stock)
productVariantSchema.virtual('available_stock').get(function() {
  // You can implement reserved stock logic here
  return this.stock_quantity;
});

// Virtual for stock status
productVariantSchema.virtual('stock_status').get(function() {
  if (this.stock_quantity === 0) return 'out_of_stock';
  if (this.stock_quantity <= this.low_stock_threshold) return 'low_stock';
  return 'in_stock';
});

productVariantSchema.set('toJSON', { virtuals: true });
productVariantSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('ProductVariant', productVariantSchema);