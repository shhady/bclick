import { connectToDB } from '@/utils/database';
import User from '@/models/user';
import Product from '@/models/product';
import Category from '@/models/category';
import SupplierDetails from './SupplierDetails';
import SupplierCategories from './SupplierCategories';
import ClientComponent from './ClientComponent';
import Link from 'next/link';

export default async function Page({ params }) {
  const { id } = await params;

  await connectToDB();

  const supplier = await User.findById(id).lean();
  if (!supplier) {
    return <h1>User Not Found</h1>;
  }

  const categories = await Category.find({ supplierId: id, status: 'shown' }).lean();
  const products = await Product.find({ supplierId: id }).lean();

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

  return (
    <div className='mb-24'>
      <div className='fixed w-full md:top-20 top-0 left-0 bg-black opacity-80 h-28 flex justify-center items-center z-50'>
        <div className='flex md:flex-row flex-col justify-center items-center gap-3'>
          <span className='text-white'>התוכן בקטלוג שלך כפי שיופיע לאחרים </span>
          <Link href={'/profile'}><button className='bg-gray-600 text-white py-1 px-3 rounded-md mx-4'>צא מתצוגה</button></Link></div>
        
      </div>
      <SupplierDetails supplier={serializedSupplier(supplier)} />
      <ClientComponent categories={serializedCategories} products={serializedProducts} supplierId={supplier._id.toString()} />
    </div>
  );
}
