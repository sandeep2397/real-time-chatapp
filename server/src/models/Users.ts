import mongoose from 'mongoose';

// User schema and model
const userSchema = new mongoose.Schema({
  username: String,
  userid: String,
  online: Boolean,
});
export const User = mongoose.model('User', userSchema);
