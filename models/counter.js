import mongoose from 'mongoose';

const CounterSchema = new mongoose.Schema({
  sequenceName: { type: String, required: true, unique: true }, // Ensure sequenceName exists in schema
  value: { type: Number, default: 0 }, // Track the last used value
});

const Counter = mongoose.models.Counter || mongoose.model('Counter', CounterSchema);
export default Counter;