import User from '@/models/user';
import { connectToDB } from '@/utils/database';

export async function POST(req) {
    try {
        const data = await req.json();

        // Connect to the database
        await connectToDB();

        // Fetch the last user with the highest clientNumber
        const lastUser = await User.findOne()
            .sort({ clientNumber: -1 }) // Sort by clientNumber descending
            .collation({ locale: "en", numericOrdering: true }) // Ensure numeric sorting
            .lean();

        const nextClientNumber = lastUser?.clientNumber ? parseInt(lastUser.clientNumber) + 1 : 1;

        // Create a new user with the assigned client number
        const newUser = await User.create({
            ...data,
            clientNumber: nextClientNumber,
        });

        return new Response(JSON.stringify(newUser), { status: 201 });
    } catch (error) {
        console.error('Error creating user:', error.message);
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500 }
        );
    }
}
