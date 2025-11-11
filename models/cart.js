import mongoose from 'mongoose';
import './user'
import './product'
const CartSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true, min: 1 },
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Compound index for frequent lookups
CartSchema.index({ clientId: 1, supplierId: 1 });

const Cart = mongoose.models?.Cart || mongoose.model('Cart', CartSchema);
export default Cart;
