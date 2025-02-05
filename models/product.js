import mongoose from 'mongoose';
import './category'
import './user'
const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Links to the supplier
  stock: { type: Number, required: true, default: 0 },
  price: { type: Number, required: true },
  imageUrl: { type: Object },
  units : { type: String },
  weight: { type: String },
  weightUnit:{ type: String},
  barCode : { type: String },
  status: { type: String, enum: ['active', 'draft', 'out_of_stock', 'hidden'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
});

const Product = mongoose.models?.Product || mongoose.model('Product', ProductSchema);
export default Product;

