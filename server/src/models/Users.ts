import mongoose from 'mongoose';

// User schema and model
export type IContact = {
  username: string;
  preferedName: string;
  socketId:string;
};
const userSchema = new mongoose.Schema({
  username: String,
  userId: String,
  online: Boolean,
  contacts: { type: Array<IContact>, required: false },
  socketId:String
});
export const User = mongoose.model('users', userSchema);
