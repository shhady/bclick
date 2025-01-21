// import Clients from '@/components/supplierComponents/Clients';
import { connectToDB } from '@/utils/database';
import User from '@/models/user';
import Order from '@/models/order';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import Loader from '@/components/loader/Loader';

const Clients = dynamic(() => import('@/components/supplierComponents/Clients'))

export default async function SupplierPage({ params }) {
  const { id } = await params;
  await connectToDB();

  const supplier = await User.findById(id).populate('relatedUsers.user').lean();

  if (!supplier) {
    return <div><h1>Supplier Not Found</h1></div>;
  }

  // Get filtered orders count for each client
  const clientsWithFilteredOrders = await Promise.all(
    supplier.relatedUsers
      .filter((relatedUser) => relatedUser.user)
      .map(async (relatedUser) => {
        // Count all orders regardless of status
        const ordersCount = await Order.countDocuments({
          supplierId: id,
          clientId: relatedUser.user._id,
          // Add $or to include all possible statuses
          $or: [
            { status: 'pending' },
            { status: 'approved' },
            { status: 'rejected' }
          ]
        });

        // Debug log
        console.log(`Client ${relatedUser.user.businessName}: ${ordersCount} orders`);

        return {
          clientNumber: relatedUser.user.clientNumber,
          id: relatedUser.user._id.toString(),
          name: relatedUser.user.name,
          businessName: relatedUser.user.businessName,
          phone: relatedUser.user.phone,
          email: relatedUser.user.email,
          ordersCount,
          status: relatedUser.status,
        };
      })
  );

  return (
    <>
      <Suspense fallback={<Loader/>}>
        <Clients clients={clientsWithFilteredOrders} supplierId={id}/>
      </Suspense>
    </>
  );
}