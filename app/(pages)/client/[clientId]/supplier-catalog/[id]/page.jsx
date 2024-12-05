import { connectToDB } from '@/utils/database';
import User from '@/models/user';
import Product from '@/models/product';
import Category from '@/models/category';
import SupplierDetails from './SupplierDetails';
import SupplierCategories from './SupplierCategories';
import ClientComponent from './ClientComponent';
import Favourite from '@/models/favourite';

export default async function Page({ params }) {
  const { id , clientId} = await params;

  await connectToDB();

  // Fetch the favourite document
  const favourite = await Favourite.findOne({ clientId })
    .populate({
      path: 'productIds',
      populate: {
        path: 'supplierId',
        select: 'businessName',
      },
    })
    .lean();

  // if (!favourite || !favourite.productIds.length) {
  //   return <h1>No Favourites Found</h1>;
  // }

  // Serialize products and supplier details
  const serializedFavorites = favourite.productIds.map((product) => ({
    ...product,
    _id: product._id.toString(),
    categoryId: product.categoryId.toString(),
    supplierId: {
      _id: product.supplierId._id.toString(),
      businessName: product.supplierId.businessName,
    },
    createdAt: product.createdAt.toISOString(),
  }));

  console.log(serializedFavorites);

  const supplier = await User.findById(id).lean();
  if (!supplier) {
    return <h1>User Not Found</h1>;
  }

  const categories = await Category.find({ supplierId: id, status: 'shown' }).lean();
  const products = await Product.find({
    supplierId: id,
    status: { $in: ['active', 'out_of_stock'] }, // Only include active or out_of_stock
  }).lean();
  const serializedSupplier = (supplier) => ({
    ...supplier,
    _id: supplier._id.toString(),
    relatedUsers: supplier.relatedUsers?.map((relUser) => ({
      ...relUser,
      _id: relUser._id.toString(),
      user: relUser.user.toString(),
    })) || [],
    orders: supplier.orders?.map((orderId) => orderId.toString()) || [],
    products: supplier.products?.map((productId) => productId.toString()) || [],
    createdAt: supplier.createdAt ? supplier.createdAt.toISOString() : null,
    updatedAt: supplier.updatedAt ? supplier.updatedAt.toISOString() : null,
  });


  const serializedCategories = categories.map((category) => ({
    ...category,
    _id: category._id.toString(),
    supplierId: category.supplierId.toString(),
  }));

  const serializedProducts = products.map((product) => ({
    ...product,
    _id: product._id.toString(),
    categoryId: product.categoryId.toString(),
    supplierId: product.supplierId.toString(),
  }));
  console.log(serializedProducts);
  return (
    <div className='mb-24'>
      {/* <SupplierDetails supplier={serializedSupplier(supplier)} /> */}
      <ClientComponent  supplier={serializedSupplier(supplier)} clientId={clientId} categories={serializedCategories} products={serializedProducts} supplierId={supplier._id.toString()} serializedFavorites={serializedFavorites}/>
    </div>
  );
}
