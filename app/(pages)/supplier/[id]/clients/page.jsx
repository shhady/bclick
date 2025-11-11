import Clients from '@/components/supplierComponents/Clients';
import { connectToDB } from '@/utils/database';
import User from '@/models/user';
import Order from '@/models/order';
import { Suspense } from 'react';
import Loader from '@/components/loader/Loader';
import mongoose from 'mongoose';

export default async function SupplierPage({ params }) {
  const { id } = await params;
  
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return <div>Invalid supplier ID</div>;
  }

  try {
    await connectToDB();

    // Run queries in parallel for better performance
    const [supplier, orderCounts] = await Promise.all([
      // Only fetch necessary fields for supplier and related users
      User.findById(id)
        .select('relatedUsers.user relatedUsers.status')
        .populate('relatedUsers.user', 'clientNumber name businessName phone email')
        .lean(),
      
      // Use aggregation for efficient order counting
      Order.aggregate([
        {
          $match: {
            supplierId: new mongoose.Types.ObjectId(id),
            clientId: { $exists: true, $ne: null } // Ensure clientId exists and is not null
          }
        },
        {
          $group: {
            _id: '$clientId',
            ordersCount: { $sum: 1 }
          }
        }
      ])
    ]);

    if (!supplier || !supplier.relatedUsers) {
      return <div><h1>Supplier Not Found</h1></div>;
    }

    // Safely create a map of client IDs to order counts
    const orderCountMap = new Map(
      (orderCounts || []).map(count => [
        count._id?.toString(),
        typeof count.ordersCount === 'number' ? count.ordersCount : 0
      ]).filter(([id]) => id) // Filter out any undefined IDs
    );

    // Process clients data with validation
    const clientsWithFilteredOrders = supplier.relatedUsers
      .filter(relatedUser => 
        relatedUser?.user && 
        relatedUser.user._id && 
        relatedUser.user.businessName
      )
      .map(relatedUser => {
        const userId = relatedUser.user._id.toString();
        return {
          clientNumber: relatedUser.user.clientNumber || 0,
          id: userId,
          name: relatedUser.user.name || '',
          businessName: relatedUser.user.businessName || '',
          phone: relatedUser.user.phone || '',
          email: relatedUser.user.email || '',
          ordersCount: orderCountMap.get(userId) || 0,
          status: relatedUser.status || 'active',
        };
      });

    // Ensure we have valid data to return
    if (!Array.isArray(clientsWithFilteredOrders)) {
      throw new Error('Failed to process clients data');
    }

    return (
      <Suspense fallback={<Loader/>}>
        <Clients 
          clients={clientsWithFilteredOrders} 
          supplierId={id}
        />
      </Suspense>
    );
  } catch (error) {
    console.error('Error loading supplier clients:', error);
    return <div>Error loading clients data</div>;
  }
}