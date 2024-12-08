// import Clients from '@/components/supplierComponents/Clients';
import { connectToDB } from '@/utils/database';
import User from '@/models/user';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import Loader from '@/components/loader/Loader';

const Clients = dynamic(() => import('@/components/supplierComponents/Clients'))
export default async function SupplierPage({ params }) {
  const { id } = await params; // Extract the supplier ID from the route parameters

  await connectToDB(); // Ensure the database connection is established

  // Fetch the supplier and populate related users
  const supplier = await User.findById(id).populate('relatedUsers.user').lean();

  if (!supplier) {
    return (
      <div>
        <h1>Supplier Not Found</h1>
      </div>
    );
  }

  const clients = supplier.relatedUsers
    .filter((relatedUser) => relatedUser.user) // Filter out null users
    .map((relatedUser) => ({
      clientNumber: relatedUser.user.clientNumber,
      id: relatedUser.user._id.toString(),
      name: relatedUser.user.name,
      businessName: relatedUser.user.businessName,
      phone: relatedUser.user.phone,
      email: relatedUser.user.email,
      ordersCount: relatedUser.user.orders?.length || 0,
      status: relatedUser.status,
    }));

    console.log(clients);
  return (
    <>
    <Suspense fallback={<Loader/>}>
    <Clients clients={clients} supplierId={id}/>
    </Suspense>
    </>
  )}