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
    const checkThis = await initializeClientNumberCounter();
    console.log("checkThis: " + checkThis);

    // Fetch the highest client number from the existing users
    const lastUser = await User.findOne().sort({ clientNumber: -1 }).lean();
    const highestClientNumber = lastUser?.clientNumber || 0;

    // Get the next client number (ensures uniqueness if counter is used elsewhere)
    const nextCounterClientNumber = await getNextClientNumber();

    // Use the higher value between the manually fetched highest client number and the next counter value
    const clientNumber = Math.max(highestClientNumber + 1, nextCounterClientNumber);
    console.log("Assigned client number: " + clientNumber);

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



