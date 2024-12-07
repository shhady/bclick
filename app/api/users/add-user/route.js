import initializeClientNumberCounter from '@/utils/initializeClientNumberCounter';
import getNextClientNumber from '@/utils/getNextClientNumber';
import User from '@/models/user';
import { connectToDB } from '@/utils/database';

export async function POST(req) {
    try {
        const data = await req.json();
        console.log(data);
        // Connect to the database
        await connectToDB();

        // Ensure the counter is synced with the highest client number
        await initializeClientNumberCounter();

        // Get the next client number
        const clientNumber = await getNextClientNumber();
        
        // Create a new user with the assigned client number
        const newUser = await User.create({
            ...data,
            clientNumber,
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
