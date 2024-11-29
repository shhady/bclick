import Product from "@/models/product";
import Category from "@/models/category";
import { connectToDB } from "@/utils/database";
import EditProductClient from "./EditProductClient";

export default async function EditProductPage({ params }) {
  const { id } =  await params;

  await connectToDB();

  // Fetch the product and categories
  const product = await Product.findById(id).lean();
  if (!product) {
    throw new Error("Product not found");
  }

  const categories = await Category.find({ supplierId: product.supplierId }).lean();

  // Serialize MongoDB ObjectId fields
  const serializedProduct = {
    ...product,
    _id: product._id.toString(),
    supplierId: product.supplierId.toString(),
    categoryId: product.categoryId.toString(),
  };

  const serializedCategories = categories.map((category) => ({
    ...category,
    _id: category._id.toString(),
    supplierId: category.supplierId.toString(),
  }));

  return <EditProductClient product={serializedProduct} categories={serializedCategories} />;
}
