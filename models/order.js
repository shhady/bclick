import mongoose from 'mongoose';
import './user'
import './product'
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
      default: 0.18, // Fixed 18% tax rate
    },
    orderNumber:{
        type: Number,
        required: true}
        ,
    status: {
      type: String,
      enum: ['pending', 'processing', 'approved', 'rejected'],
      default: 'pending',
    },
    notes: [
        {
          message: { type: String, required: true },
          date: { type: Date, default: Date.now },
        },
      ],
      performanceTracking: {
        approvedDate: Date,
        rejectedDate: Date,
      },
    },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
  }
);

// Add indexes for frequently queried fields
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ supplierId: 1, createdAt: -1 });
OrderSchema.index({ clientId: 1, createdAt: -1 });
OrderSchema.index({ status: 1 });

const Order = mongoose.models?.Order || mongoose.model('Order', OrderSchema);
export default Order;
