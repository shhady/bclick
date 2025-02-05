import User from '@/models/user';
import { connectToDB } from '@/utils/database';

export async function POST(req) {
    try {
        const data = await req.json();
        const { clerkId } = data;

        if (!clerkId) {
            return new Response(
                JSON.stringify({ error: 'Clerk ID is required' }),
                { status: 400 }
            );
        }

        // Connect to the database
        await connectToDB();

        // Check if user already exists
        let user = await User.findOne({ clerkId });

        if (user) {
            // Update existing user
            Object.assign(user, data);
            await user.save();
            return new Response(JSON.stringify(user), { status: 200 });
        }

        // If user doesn't exist, create new user with next client number
        const lastUser = await User.findOne()
            .sort({ clientNumber: -1 })
            .collation({ locale: "en", numericOrdering: true })
            .lean();

        const nextClientNumber = lastUser?.clientNumber ? parseInt(lastUser.clientNumber) + 1 : 1;

        // Create new user
        const newUser = await User.create({
            ...data,
            clientNumber: nextClientNumber,
        });

        return new Response(JSON.stringify(newUser), { status: 201 });
    } catch (error) {
        console.error('Error in add-user:', error.message);
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500 }
        );
    }
}
