import React from 'react';
import { connectToDB } from '@/utils/database';
import User from '@/models/user';
import Category from '@/models/category';
import { currentUser } from '@clerk/nextjs/server';
import Product from '@/models/product';
import { redirect, notFound } from 'next/navigation';
import PublicCatalogPage from './PublicCatalogPage';
import Link from 'next/link';
import mongoose from 'mongoose';

export default async function PublicCatalogByBusinessName({ params }) {
    await connectToDB();
    
    // Decode the business name parameter
    const decodedBusinessName = decodeURIComponent(params.businessName);
    
    // Get the current user from Clerk
    const user = await currentUser();
    const clerkId = user?.id;
    
    // Fetch the viewer from our database to get their role and ID
    const dbViewer = clerkId ? await User.findOne({ clerkId }).lean() : null;
    const viewerRole = dbViewer?.role || 'guest'; // Default to guest if not found
    const viewerId = dbViewer?._id?.toString();
    
    // First try to find supplier by business name (case insensitive)
    let supplier = await User.findOne({
      businessName: { $regex: new RegExp(`^${decodedBusinessName}$`, 'i') },
      role: 'supplier'
    }).lean();
    
    // If not found by business name, try by ID
    if (!supplier && mongoose.Types.ObjectId.isValid(decodedBusinessName)) {
      supplier = await User.findOne({
        _id: decodedBusinessName,
        role: 'supplier'
      }).lean();
    }
    
    if (!supplier) {
      // If supplier not found, show 404
      return (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h1 className="text-3xl font-bold mb-4">ספק לא נמצא</h1>
          <p className="text-gray-600 mb-6">הקטלוג שחיפשת אינו קיים או שהוסר.</p>
          <Link href="/" className="px-4 py-2 bg-customBlue text-white rounded-md hover:bg-blue-600 transition">
            חזרה לדף הבית
          </Link>
        </div>
      );
    }
    
    const supplierId = supplier._id.toString();
    
    // Check if the viewer is related to the supplier
    let isRelated = false;
    if (viewerRole === 'client' && viewerId) {
      isRelated = supplier.relatedUsers?.some(
        relation => relation.user?.toString() === viewerId
      );
    }
    
    // Fetch categories
    const categories = await Category.find({ 
      supplierId: supplierId, 
      status: 'shown' 
    })
      .select('name status order supplierId')
      .lean();
    
    // Fetch initial products (first 20) - this is for server-side rendering
    const initialProducts = await Product.find({ 
      supplierId: supplierId,
      status: { $in: ['active', 'out_of_stock'] }
    })
      .populate('categoryId', 'name')
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
    
    // Serialize the data
    const serializedSupplier = serializeSupplier(supplier);
    const serializedCategories = categories.map(serializeCategory);
    const serializedProducts = initialProducts.map(serializeProduct);
    
    // Return the public catalog page
    return (
      <PublicCatalogPage 
        supplier={serializedSupplier}
        categories={serializedCategories}
        initialProducts={serializedProducts}
        clientId={viewerId}
        isRelatedClient={isRelated}
        supplierId={supplierId}
      />
    );
}

// Extracted serialization functions for reusability
function serializeSupplier(supplier) {
  if (!supplier) return null;
  
  return {
    ...supplier,
    _id: supplier._id?.toString() || '',
    relatedUsers: supplier.relatedUsers?.map((relUser) => ({
      ...relUser,
      _id: relUser._id?.toString() || '',
      user: relUser.user?.toString() || '',
    })) || [],
    orders: supplier.orders?.map(orderId => orderId?.toString() || '') || [],
    products: supplier.products?.map(productId => productId?.toString() || '') || [],
    createdAt: supplier.createdAt?.toISOString() || null,
    updatedAt: supplier.updatedAt?.toISOString() || null,
  };
}

function serializeCategory(category) {
  if (!category) return null;
  
  return {
    ...category,
    _id: category._id?.toString() || '',
    supplierId: category.supplierId?.toString() || '',
  };
}

function serializeProduct(product) {
  if (!product) return null;
  
  // Handle categoryId properly
  let categoryId;
  let categoryName = '';
  
  if (product.categoryId) {
    if (typeof product.categoryId === 'object') {
      if (product.categoryId._id) {
        categoryId = product.categoryId._id.toString();
      }
      if (product.categoryId.name) {
        categoryName = product.categoryId.name;
      }
    } else if (typeof product.categoryId === 'string') {
      categoryId = product.categoryId;
    } else {
      categoryId = product.categoryId.toString();
    }
  } else {
    categoryId = '';
  }
  
  return {
    ...product,
    _id: product._id?.toString() || '',
    categoryId: categoryId,
    categoryName: categoryName,
    supplierId: product.supplierId?.toString() || '',
    stock: product.stock || 0,
    createdAt: product.createdAt?.toISOString() || null,
    updatedAt: product.updatedAt?.toISOString() || null,
  };
} 