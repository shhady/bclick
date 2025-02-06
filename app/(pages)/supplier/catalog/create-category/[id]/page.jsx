import { connectToDB } from "@/utils/database";
import Category from "@/models/category";
import Product from "@/models/product";
import ManageCategoriesClient from "../ManageCategoriesClient";
import { cache } from 'react';
import mongoose from 'mongoose';
import { Suspense } from 'react';
import Loading from './loading';

// Cache the database connection and queries
const getCategoryData = cache(async (supplierId) => {
  if (!supplierId || !mongoose.Types.ObjectId.isValid(supplierId)) {
    throw new Error('Invalid supplier ID');
  }

  await connectToDB();

  try {
    // Run queries in parallel for better performance
    const [categories, productCounts] = await Promise.all([
      // Fetch all category fields
      Category.find({ supplierId }).lean(),

      // Fix the aggregation query
      Product.aggregate([
        {
          $match: { 
            supplierId: new mongoose.Types.ObjectId(supplierId)
          }
        },
        {
          $group: {
            _id: '$categoryId',
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    // Debug logging
    // console.log('Product counts:', productCounts);
    // console.log('Categories:', categories);

    // Create a Map for product counts
    const productCountMap = new Map(
      productCounts.map(({ _id, count }) => [
        _id.toString(),
        count
      ])
    );

    // Process categories
    const processedCategories = categories.map(category => {
      const categoryId = category._id.toString();
      const count = productCountMap.get(categoryId) || 0;

      return {
        ...category,
        _id: categoryId,
        supplierId: category.supplierId.toString(),
        createdAt: category.createdAt?.toISOString() || null,
        hasProducts: count > 0,
        productCount: count
      };
    });

    // Debug logging
    console.log('Processed categories:', processedCategories);

    return processedCategories;
  } catch (error) {
    console.error('Error in getCategoryData:', error);
    throw error;
  }
});

export default async function ManageCategories({ params }) {
  const { id: supplierId } = await params;


  try {
    if (!supplierId) {
      throw new Error('Supplier ID is required');
    }

    const categoriesData = await getCategoryData(supplierId);

    if (!Array.isArray(categoriesData)) {
      throw new Error('Invalid categories data returned');
    }

    return (
      <Suspense fallback={<Loading />}>
        <ManageCategoriesClient
          categoriesWithProductStatus={categoriesData}
          categories={categoriesData}
          supplierId={supplierId}
        />
      </Suspense>
    );
  } catch (error) {
    console.error('Error in ManageCategories:', error);
    return (
      <div className="p-4 text-red-500">
        שגיאה בטעינת הקטגוריות. אנא נסה שוב מאוחר יותר.
        {process.env.NODE_ENV === 'development' && (
          <pre className="mt-2 text-xs">
            {error.message}
          </pre>
        )}
      </div>
    );
  }
}
