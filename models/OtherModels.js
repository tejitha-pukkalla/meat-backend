// const mongoose = require('mongoose');

// // ============= PRODUCT NUTRITION MODEL =============
// const productNutritionSchema = new mongoose.Schema({
//   product_id: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Product',
//     required: true,
//     unique: true
//   },
//   serving_size: {
//     type: String,
//     default: 'per 100g'
//   },
//   calories: Number,
//   protein: Number, // in grams
//   fat: Number,
//   carbohydrates: Number,
//   cholesterol: Number,
//   sodium: Number,
//   fiber: Number,
//   sugar: Number,
//   other_nutrients: {
//     type: Map,
//     of: mongoose.Schema.Types.Mixed
//   }
// }, {
//   timestamps: true
// });

// const ProductNutrition = mongoose.model('ProductNutrition', productNutritionSchema);

// // ============= PRODUCT ATTRIBUTE MODEL =============
// const productAttributeSchema = new mongoose.Schema({
//   product_id: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Product',
//     required: true
//   },
//   attribute_name: {
//     type: String,
//     required: true
//   },
//   attribute_value: {
//     type: String,
//     required: true
//   }
// }, {
//   timestamps: true
// });

// const ProductAttribute = mongoose.model('ProductAttribute', productAttributeSchema);

// // ============= INVENTORY MODEL =============
// const inventorySchema = new mongoose.Schema({
//   variant_id: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'ProductVariant',
//     required: true,
//     unique: true
//   },
//   current_stock: {
//     type: Number,
//     default: 0,
//     min: 0
//   },
//   reserved_stock: {
//     type: Number,
//     default: 0,
//     min: 0
//   },
//   low_stock_threshold: {
//     type: Number,
//     default: 10
//   },
//   expiry_date: Date,
//   batch_number: String,
//   last_restocked_at: Date,
//   last_restocked_quantity: Number
// }, {
//   timestamps: true
// });

// // Virtual for available stock
// inventorySchema.virtual('available_stock').get(function() {
//   return Math.max(0, this.current_stock - this.reserved_stock);
// });

// inventorySchema.set('toJSON', { virtuals: true });
// inventorySchema.set('toObject', { virtuals: true });

// const Inventory = mongoose.model('Inventory', inventorySchema);

// // ============= INVENTORY HISTORY MODEL =============
// const inventoryHistorySchema = new mongoose.Schema({
//   variant_id: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'ProductVariant',
//     required: true
//   },
//   action_type: {
//     type: String,
//     enum: ['restock', 'sale', 'damage', 'expired', 'return', 'adjustment'],
//     required: true
//   },
//   quantity_change: {
//     type: Number,
//     required: true // positive for increase, negative for decrease
//   },
//   stock_before: Number,
//   stock_after: Number,
//   reason: String,
//   performed_by: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Admin'
//   },
//   order_id: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Order'
//   }
// }, {
//   timestamps: true
// });

// const InventoryHistory = mongoose.model('InventoryHistory', inventoryHistorySchema);

// // ============= PRODUCT FAQ MODEL =============
// const productFaqSchema = new mongoose.Schema({
//   product_id: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Product',
//     required: true
//   },
//   question: {
//     type: String,
//     required: true
//   },
//   answer: {
//     type: String,
//     required: true
//   },
//   display_order: {
//     type: Number,
//     default: 0
//   }
// }, {
//   timestamps: true
// });

// const ProductFaq = mongoose.model('ProductFaq', productFaqSchema);

// // ============= RELATED PRODUCTS MODEL =============
// const relatedProductSchema = new mongoose.Schema({
//   product_id: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Product',
//     required: true
//   },
//   related_product_id: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Product',
//     required: true
//   },
//   relation_type: {
//     type: String,
//     enum: ['similar', 'frequently_bought_together', 'alternative'],
//     default: 'similar'
//   }
// }, {
//   timestamps: true
// });

// const RelatedProduct = mongoose.model('RelatedProduct', relatedProductSchema);

// module.exports = {
//   ProductNutrition,
//   ProductAttribute,
//   Inventory,
//   InventoryHistory,
//   ProductFaq,
//   RelatedProduct
// };



const mongoose = require('mongoose');

// ============= PRODUCT NUTRITION MODEL =============
const productNutritionSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    unique: true
  },
  serving_size: {
    type: String,
    default: 'per 100g'
  },
  calories: Number,
  protein: Number,
  fat: Number,
  carbohydrates: Number,
  cholesterol: Number,
  sodium: Number,
  fiber: Number,
  sugar: Number,
  other_nutrients: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

const ProductNutrition = mongoose.model('ProductNutrition', productNutritionSchema);

// ============= PRODUCT ATTRIBUTE MODEL =============
const productAttributeSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  attribute_name: {
    type: String,
    required: true
  },
  attribute_value: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

const ProductAttribute = mongoose.model('ProductAttribute', productAttributeSchema);

// ============= INVENTORY MODEL =============
const inventorySchema = new mongoose.Schema({
  variant_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductVariant',
    required: true,
    unique: true
  },
  current_stock: {
    type: Number,
    default: 0,
    min: 0
  },
  reserved_stock: {
    type: Number,
    default: 0,
    min: 0
  },
  low_stock_threshold: {
    type: Number,
    default: 10
  },
  expiry_date: Date,
  batch_number: String,
  last_restocked_at: Date,
  last_restocked_quantity: Number
}, {
  timestamps: true
});

// Virtual for available stock
inventorySchema.virtual('available_stock').get(function() {
  return Math.max(0, this.current_stock - this.reserved_stock);
});

inventorySchema.set('toJSON', { virtuals: true });
inventorySchema.set('toObject', { virtuals: true });

const Inventory = mongoose.model('Inventory', inventorySchema);

// ============= INVENTORY HISTORY MODEL =============
const inventoryHistorySchema = new mongoose.Schema({
  variant_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductVariant',
    required: true
  },
  action_type: {
    type: String,
    enum: ['restock', 'sale', 'damage', 'expired', 'return', 'adjustment'],
    required: true
  },
  quantity_change: {
    type: Number,
    required: true
  },
  stock_before: Number,
  stock_after: Number,
  reason: String,
  performed_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor' // ✅ CHANGED: Admin → Vendor
  },
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }
}, {
  timestamps: true
});

const InventoryHistory = mongoose.model('InventoryHistory', inventoryHistorySchema);

// ============= PRODUCT FAQ MODEL =============
const productFaqSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  question: {
    type: String,
    required: true
  },
  answer: {
    type: String,
    required: true
  },
  display_order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const ProductFaq = mongoose.model('ProductFaq', productFaqSchema);

// ============= RELATED PRODUCTS MODEL =============
const relatedProductSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  related_product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  relation_type: {
    type: String,
    enum: ['similar', 'frequently_bought_together', 'alternative'],
    default: 'similar'
  }
}, {
  timestamps: true
});

const RelatedProduct = mongoose.model('RelatedProduct', relatedProductSchema);

module.exports = {
  ProductNutrition,
  ProductAttribute,
  Inventory,
  InventoryHistory,
  ProductFaq,
  RelatedProduct
};