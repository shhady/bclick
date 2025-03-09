import React from 'react';
import { connectToDB } from '@/utils/database';
import User from '@/models/user';
import Category from '@/models/category';
import { currentUser } from '@clerk/nextjs/server';
import Product from '@/models/product';
import Favourite from '@/models/favourite';
import Cart from '@/models/cart';
import { ClientCatalogWrapper, SupplierCatalogWrapper } from './ClientWrapper';
import { redirect } from 'next/navigation';

export default async function page({ params }) {
    await connectToDB();
    const { id } = await params;
    
    // Get the current user from Clerk
    const user = await currentUser();
    const clerkId = user?.id;
    
    // Fetch the user from our database to get their role and ID
    const dbUser = clerkId ? await User.findOne({ clerkId }).lean() : null;
    const userRole = dbUser?.role || 'client'; // Default to client if not found
    const userId = dbUser?._id?.toString();
    
    // Fetch supplier details
    const supplier = await User.findById(id)
      .select('name email phone address logo coverImage businessName city country role relatedUsers')
      .lean();
    
    if (!supplier) {
      return <h1>Supplier Not Found</h1>;
    }
    
    // Check if the user is a related client of this supplier
    let isRelatedClient = false;
    if (userRole === 'client' && userId) {
      isRelatedClient = supplier.relatedUsers?.some(
        relation => relation.user?.toString() === userId && relation.status === 'active'
      );
      
      // If the user is not a related client, redirect to the public catalog page
      if (!isRelatedClient) {
        redirect(`/catalog-preview/${supplier.businessName}`);
      }
    } else if (!dbUser && userRole !== 'supplier') {
      // If no user is logged in and not a supplier, redirect to public catalog
      redirect(`/catalog-preview/${supplier.businessName}`);
    }
    
    // Conditional rendering based on user role
    if (userRole === 'supplier' && dbUser?._id.toString() === id) {
      // Supplier viewing their own catalog - continue with supplier view
    } else if (userRole === 'client' && !isRelatedClient) {
      // Client not related to this supplier - redirect to public catalog
      redirect(`/catalog-preview/${supplier.businessName}`);
    } else if (!dbUser) {
      // No user logged in - redirect to public catalog
      redirect(`/catalog-preview /${supplier.businessName}`);
    }
    
    // Fetch categories
    const categories = await Category.find({ 
      supplierId: id, 
      status: 'shown' 
    })
      .select('name status order supplierId')
      .lean();
    
    // Fetch initial products (first 20) - this is for server-side rendering
    const initialProducts = await Product.find({ 
      supplierId: id,
      status: { $in: ['active', 'out_of_stock'] }
    })
      .populate('categoryId', 'name')
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
    
    // Initialize variables for client-specific data
    let favorites = [];
    let cart = null;
    
    // If the user is a client, fetch favorites and cart
    if (userRole === 'client' && userId) {
      // Fetch favorites
      const favouritesDoc = await Favourite.findOne({ clientId: userId })
        .populate('productIds', 'name price imageUrl categoryId supplierId stock')
        .lean();
      
      favorites = favouritesDoc?.productIds || [];
      
      // Fetch cart
      cart = await Cart.findOne({ clientId: userId, supplierId: id })
        .populate('items.productId', 'name price stock imageUrl')
        .lean();
    }
    
    // Serialize the data
    const serializedSupplier = serializeSupplier(supplier);
    const serializedCategories = categories.map(serializeCategory);
    const serializedProducts = initialProducts.map(serializeProduct);
    const serializedFavorites = favorites.map(serializeProduct);
    const serializedCart = cart ? serializeCart(cart) : null;
    
    // Mark products that are in favorites
    if (serializedFavorites.length > 0) {
      serializedProducts.forEach(product => {
        product.isFavorite = serializedFavorites.some(fav => fav._id === product._id);
      });
    }
    
    // Conditional rendering based on user role
    if (userRole === 'supplier' && dbUser?._id.toString() === id) {
      return (
        <SupplierCatalogWrapper 
          initialProducts={serializedProducts}
          categories={serializedCategories}
          supplierId={id}
        />
      );
    }
    
    // Default to client view (only for related clients at this point)
    return (
      <ClientCatalogWrapper 
        supplier={serializedSupplier}
        categories={serializedCategories}
        initialProducts={serializedProducts}
        initialFavorites={serializedFavorites}
        cart={serializedCart}
        clientId={userId}
        supplierId={id}
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
    isFavorite: false, // Default value, will be updated later if needed
    createdAt: product.createdAt?.toISOString() || null,
    updatedAt: product.updatedAt?.toISOString() || null,
  };
}

function serializeCart(cart) {
  if (!cart || !cart.items) return null;

  return {
    ...cart,
    _id: cart._id?.toString() || '',
    supplierId: cart.supplierId?.toString() || '',
    clientId: cart.clientId?.toString() || '',
    items: cart.items.map((item) => ({
      ...item,
      _id: item._id?.toString() || '',
      productId: {
        ...item.productId,
        _id: item.productId?._id?.toString() || '',
      },
    })),
    createdAt: cart.createdAt?.toISOString() || null,
    updatedAt: cart.updatedAt?.toISOString() || null,
  };
}
