import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    // Clerk ID for syncing with Clerk authentication
    clerkId: {
      type: String,
      required: true,
      unique: true,
    },

    // User role: Admin, Supplier, or Client
    role: {
      type: String,
      enum: ['admin', 'supplier', 'client'],
      required: true,
    },

    // Common fields
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    address: {
      type: String,
      required: true,
    },
    profileImage:{
      type: String, required: false
    },
    coverImage:{
      type: String, required: false
    },
    // Business details for suppliers and clients
  
      businessName: { type: String, required: false },
      businessNumber: { type: String, required: false },
    

    // Area and location
    country: {
      type: String,
      required: true,
    },
    area: {
      type: String,
      default: 'all-areas',
      required: true,
    },
    city: {
      type: String,
      required: true, 
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
