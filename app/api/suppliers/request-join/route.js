import { NextResponse } from 'next/server';
import { connectToDB } from '@/utils/database';
import User from '@/models/user';
import { currentUser } from '@/utils/auth';
import { sendJoinRequestEmail } from '@/app/utils/emails';

export async function POST(req) {
  try {
    const sessionUser = await currentUser();
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { supplierId, phone } = await req.json();
    const clientId = sessionUser.id;

    if (!supplierId) {
      return NextResponse.json({ error: 'supplierId is required' }, { status: 400 });
    }

    await connectToDB();

    const [supplier, client] = await Promise.all([
      User.findById(supplierId),
      User.findById(clientId),
    ]);

    if (!supplier || supplier.role !== 'supplier') {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
    }
    if (!client || client.role !== 'client') {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Update/create relation as pending on both sides
    const supplierRelation =
      supplier.relatedUsers.find((r) => r.user?.toString() === clientId) || null;
    if (supplierRelation) {
      if (supplierRelation.status !== 'active') {
        supplierRelation.status = 'pending';
      }
    } else {
      supplier.relatedUsers.push({ user: clientId, status: 'pending', role: 'client' });
    }

    const clientRelation =
      client.relatedUsers.find((r) => r.user?.toString() === supplierId) || null;
    if (clientRelation) {
      if (clientRelation.status !== 'active') {
        clientRelation.status = 'pending';
      }
    } else {
      client.relatedUsers.push({ user: supplierId, status: 'pending', role: 'supplier' });
    }

    await Promise.all([supplier.save(), client.save()]);

    // Build redirect URL for supplier to open add-client with search prefilled
    const searchValue = phone || client.phone || client.email || client.name || '';
    const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL || ''}/supplier/${supplierId}/client-request/${clientId}`;

    // Send notification email to supplier
    try {
      await sendJoinRequestEmail(supplier.toObject(), client.toObject(), searchValue, redirectUrl);
    } catch (e) {
      // Log but don't fail the request if email fails
      console.error('Failed to send join request email:', e);
    }

    return NextResponse.json({ success: true, redirectUrl });
  } catch (error) {
    console.error('Error in request-join:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


