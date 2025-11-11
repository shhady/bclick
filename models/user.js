import mongoose from 'mongoose';
import './order';
import './product'
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
 
    // User role: Admin, Supplier, or Client
    role: {
      type: String,
      enum: ['admin', 'supplier', 'client'],
      required: true,
      default: 'client',
    },
    // Common fields
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    address: {
      type: String,
      required: false,
    },
    passwordHash: {
      type: String,
      required: false,
    },
    profileImage:{
      type: String, required: false
    },
    coverImage:{
      type: Object, required: false
    },
    // Business details for suppliers and clients
  
      businessName: { type: String, required: false },
      businessNumber: { type: String, required: false },
    

    // Area and location
    country: {
      type: String,
      required: false,
    },
    area: {
      type: String,
      default: 'all-areas',
      required: false,
    },
    city: {
      type: String,
      required: false, 
    },
    // Related users (clients or suppliers)
    relatedUsers: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User', // References other users
        },
        status: {
          type: String,
          default: 'active',
        },
      },
    ],

    // Orders associated with this user
    orders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order', // References orders
      },
    ],

    // Supplier-specific: Products managed by the supplier
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', // References products
      },
    ],
  },
  { timestamps: true } // Add createdAt and updatedAt fields
);

const User = mongoose.models?.User || mongoose.model('User', userSchema);

export default User;
