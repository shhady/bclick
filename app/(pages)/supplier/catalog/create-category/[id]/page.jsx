import { connectToDB } from "@/utils/database";
import Category from "@/models/category";
import Product from "@/models/product";
import ManageCategoriesClient from "../ManageCategoriesClient";

export default async function ManageCategories({ params }) {
  const { id: supplierId } = await params; // Extract supplierId from params
  await connectToDB();

  // Fetch categories for the supplier
  const categories = await Category.find({ supplierId }).lean();

  // Serialize categories to ensure safe passing to client components
  const serializedCategories = categories.map((category) => ({
    ...category,
    _id: category._id.toString(),
    supplierId: category.supplierId.toString(),
    createdAt: category.createdAt ? category.createdAt.toISOString() : null, // Handle dates if necessary
  }));

  // Check if each category has products
  const categoriesWithProductStatus = await Promise.all(
    serializedCategories.map(async (category) => {
      const productCount = await Product.countDocuments({ categoryId: category._id });
      return {
        ...category,
        hasProducts: productCount > 0,
        productCount,
      };
    })
  );

  return (
    <ManageCategoriesClient
      categoriesWithProductStatus={categoriesWithProductStatus}
      categories={serializedCategories}
      supplierId={supplierId}
    />
  );
}
