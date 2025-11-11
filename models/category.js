import mongoose from 'mongoose';
import './user'

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Links to the supplier
  status: { type: String, default: 'shown' }, // Status field
  createdAt: { type: Date, default: Date.now },
});

// Speed up supplier categories lookups
CategorySchema.index({ supplierId: 1, status: 1 });

const Category = mongoose.models?.Category || mongoose.model('Category', CategorySchema);
export default Category;