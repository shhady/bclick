// app/client/supplier/[id]/page.jsx
import { connectToDB } from '@/utils/database';
import User from '@/models/user';
import Product from '@/models/product';
import Category from '@/models/category';
import SupplierDetails from './SupplierDetails';
import CategoryProducts from './CategoryProducts';

export default async function Page({ params }) {
  const { id } = await params;

  await connectToDatabase();

  // Fetch user
  const user = await User.findById(id).lean();
  if (!user) {
    return <h1>User Not Found</h1>;
  }

  // Fetch categories associated with the supplier
  const categories = await Category.find({ supplierId: id, status: 'shown' }).lean();

  // Fetch products associated with the supplier
  const products = await Product.find({ supplierId: id }).lean();

  // Serialize user
  const serializedUser = {
    ...user,
    _id: user._id.toString(),
    relatedUsers: user.relatedUsers.map((relUser) => ({
      ...relUser,
      _id: relUser._id.toString(),
      user: relUser.user.toString(),
    })),
    orders: user.orders.map((orderId) => orderId.toString()),
    products: user.products.map((productId) => productId.toString()),
    createdAt: user.createdAt ? user.createdAt.toISOString() : null,
    updatedAt: user.updatedAt ? user.updatedAt.toISOString() : null,
  };

  // Serialize categories
  const serializedCategories = categories.map((category) => ({
    ...category,
    _id: category._id.toString(),
    supplierId: category.supplierId.toString(),
    createdAt: category.createdAt ? category.createdAt.toISOString() : null,
  }));

  // Serialize products
  const serializedProducts = products.map((product) => ({
    ...product,
    _id: product._id.toString(),
    categoryId: product.categoryId.toString(),
    supplierId: product.supplierId.toString(),
    createdAt: product.createdAt ? product.createdAt.toISOString() : null,
    updatedAt: product.updatedAt ? product.updatedAt.toISOString() : null,
  }));

  return (
    <div>
      <SupplierDetails user={serializedUser} />
      <div className="categories">
        {serializedCategories.map((category) => (
          <CategoryProducts
          serializedCategories={serializedCategories}
            key={category._id}
            category={category}
            products={serializedProducts.filter(
              (product) => product.categoryId === category._id
            )}
          />
        ))}
      </div>
    </div>
  );
}
