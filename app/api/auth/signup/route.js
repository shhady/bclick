import { NextResponse } from 'next/server';
import { connectToDB } from '@/utils/database';
import User from '@/models/user';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password, role } = body || {};

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectToDB();

    // Clean up legacy Clerk index if present (prevents E11000 on null clerkId)
    try {
      await User.collection.dropIndex('clerkId_1');
    } catch (_) {
      // ignore if index does not exist
    }
    // Drop legacy clientNumber index if present
    try {
      await User.collection.dropIndex('clientNumber_1');
    } catch (_) {}

    const existing = await User.findOne({ email: email.toLowerCase() }).lean();
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const createdUser = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: role === 'supplier' ? 'supplier' : 'client',
    });

    return NextResponse.json({ id: createdUser._id.toString() }, { status: 201 });
  } catch (err) {
    console.error('Signup error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}


