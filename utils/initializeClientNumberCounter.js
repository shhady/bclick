import Counter from '@/models/counter';
import User from '@/models/user';

const initializeClientNumberCounter = async () => {
    // Find the highest client number in the User collection
    const highestClientNumber = await User.findOne({})
        .sort({ clientNumber: -1 })
        .select('clientNumber')
        .then((user) => (user ? user.clientNumber : 0)); // Default to 0 if no users

    // Update or initialize the counter with the highest client number
    const counter = await Counter.findOneAndUpdate(
        { sequenceName: 'clientNumber' },
        { $set: { value: highestClientNumber } },
        { upsert: true, new: true } // Create or return the updated document
    );

    return counter.value;
};

export default initializeClientNumberCounter;