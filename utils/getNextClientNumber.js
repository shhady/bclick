import Counter from '@/models/counter';

const getNextClientNumber = async () => {
    const counter = await Counter.findOneAndUpdate(
        { sequenceName: 'clientNumber' },
        { $inc: { value: 1 } },
        { new: true, upsert: true }
    );
    return counter.value;
};

export default getNextClientNumber;