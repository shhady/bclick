import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const OrderItemSchema = new Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
});

const OrderSchema = new Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    items: {
      type: [OrderItemSchema],
      required: true,
      validate: {
        validator: (items) => items.length > 0,
        message: 'Order must contain at least one item.',
      },
    },
    total: {
      type: Number,
      required: true,
    },
    tax: {
      type: Number,
      required: true,
      default: 0.17, // Fixed 17% tax rate
    },
    orderNumber:{
        type: Number,
        required: true}
        ,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    notes: {
      type: String,
      maxlength: 500, // Optional field for notes (e.g., special instructions)
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
  }
);

const Order = mongoose.models?.Order || mongoose.model('Order', OrderSchema);
export default Order;
