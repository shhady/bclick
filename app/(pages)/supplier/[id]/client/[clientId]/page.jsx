import React from 'react';
import { connectToDB } from '@/utils/database';
import User from '@/models/user';
import ClientCard from './ClientCard';

export default async function ClientDetailsPage({ params }) {
  const { id, clientId } = await params;

  await connectToDB();

  // Fetch the supplier and populate related users
  const supplier = await User.findById(id).populate('relatedUsers.user').lean();

  if (!supplier) {
    return <div>Supplier not found.</div>;
  }

  // Find the specific client from relatedUsers
  const relatedUser = supplier.relatedUsers.find(
    (rel) => rel.user?._id.toString() === clientId
  );

  if (!relatedUser) {
    return <div>Client not found for this supplier.</div>;
  }

  const client = {
    id: relatedUser.user._id.toString(),
    name: relatedUser.user.name,
    email: relatedUser.user.email,
    phone: relatedUser.user.phone,
    businessName: relatedUser.user.businessName,
    status: relatedUser.status,
    clientNumber: relatedUser.user.clientNumber, // Add clientNumber
  };

  return (
    <div>
      <ClientCard client={client} supplierId={id} />
    </div>
  );
}
