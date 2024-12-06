import mongoose from 'mongoose';

export default async function handler(req, res) {
  try {
    await connectToDB(); // Ensure the database connection is active

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      await Favourite.findOneAndUpdate(
        { clientId: req.body.clientId },
        { $addToSet: { productIds: req.body.productId } },
        { upsert: true, new: true, session }
      );
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error in handler:', error);
    res.status(500).json({ error: error.message });
  }
}
