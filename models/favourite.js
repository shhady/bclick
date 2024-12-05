import mongoose from 'mongoose';

const FavouriteSchema = new mongoose.Schema(
  {
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    productIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }],
  },
  { timestamps: true }
);

FavouriteSchema.index({ clientId: 1 }, { unique: true });

const Favourite = mongoose.models.Favourite || mongoose.model('Favourite', FavouriteSchema);
export default Favourite;