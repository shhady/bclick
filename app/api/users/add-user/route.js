import User from '@/models/user';
import { connectToDB } from '@/utils/database';

export async function POST(req) {
    try {
        const data = await req.json();
        const { email } = data;

        if (!email) {
            return new Response(
                JSON.stringify({ error: 'Email is required' }),
                { status: 400 }
            );
        }

        // Connect to the database
        await connectToDB();

        // Clean up legacy Clerk index if present (prevents E11000 on null clerkId)
        try {
            await User.collection.dropIndex('clerkId_1');
        } catch (_) {
            // ignore if index does not exist
        }

        // Check if user already exists
        let user = await User.findOne({ email: email.toLowerCase() });

        if (user) {
            // Update existing user
            Object.assign(user, data);
            await user.save();
            return new Response(JSON.stringify(user), { status: 200 });
        }

        // Drop legacy clientNumber index if present
        try {
            await User.collection.dropIndex('clientNumber_1');
        } catch (_) {}

        // Create new user
        const newUser = await User.create({
            ...data,
        });

        // If you need to populate fields, you need to fetch the user after creation
        const populatedUser = await User.findById(newUser._id)
            .populate('orders')
            .populate('products')
            .populate('relatedUsers');

        return new Response(JSON.stringify(populatedUser), { status: 201 });
    } catch (error) {
        console.error('Error in add-user:', error.message);
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500 }
        );
    }
}
