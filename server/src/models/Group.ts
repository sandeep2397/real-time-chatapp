import mongoose from 'mongoose';

// Group model
const groupSchema = new mongoose.Schema({
  name: String,
  members: [String],
  messages: [
    {
      sender: String,
      content: String,
      timestamp: Date,
      type: { type: String, default: 'text' }, // text, image, etc.
    },
  ],
});
export const User = mongoose.model('Groups', groupSchema);
