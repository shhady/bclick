import React from 'react';
import { connectToDB } from '@/utils/database';
import Product from '@/models/product';
import Category from '@/models/category';
// import CatalogPage from './CatalogComponent';
import dynamic from 'next/dynamic';


const CatalogPage = dynamic(() => import('./CatalogComponent'))

export default async function ProductsPage({ params }) {
  const { id } = await params; // Extract supplier ID from the route params

  // Connect to the database
  await connectToDB();

  // Fetch products and categories for the given supplier ID
  const products = await Product.find({ supplierId: id }).lean();
  const categories = await Category.find({ supplierId: id }).lean();

  // Serialize MongoDB ObjectId to string for client components
  const serializedProducts = products.map((product) => ({
    ...product,
    _id: product._id.toString(),
    supplierId: product.supplierId.toString(),
    categoryId: product.categoryId.toString(),
  }));

  const serializedCategories = categories.map((category) => ({
    ...category,
    _id: category._id.toString(),
    supplierId: category.supplierId.toString(),
  }));

  return (
    <div>
      {/* <h1>Products for Supplier: {id}</h1> */}
      <CatalogPage sProducts={serializedProducts} sCategories={serializedCategories}/>
      {/* Categories Section */}
      {/* <h2>Categories</h2>
      <ul>
        {serializedCategories.map((category) => (
          <li key={category._id}>{category.name}</li>
        ))}
      </ul> */}

      {/* Products Section */}
      {/* <h2>Products</h2>
      <ul>
        {serializedProducts.map((product) => (
          <li key={product._id}>
            <p>Name: {product.name}</p>
            <p>Description: {product.description}</p>
            <p>Price: ${product.price}</p>
            <p>Status: {product.status}</p>
            <hr />
          </li>
        ))}
      </ul> */}
    </div>
  );
}
