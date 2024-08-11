import mongoose from 'mongoose';
import { IMessages } from './Chat';

type IUser = {
  username: string;
  preferedName: string;
};

// Group model
const groupSchema = new mongoose.Schema({
  name: { type: String, default: 'text',required:true,unique:true },
  description: { type: String, default: 'text'},
  groupImage:{ type: String },
  participants: {type:Array<IUser>},
  messages:{type:Array<IMessages>}
  // messages: [
  //   {
  //     sender: String,
  //     content: String,
  //     timestamp: Date,
  //     type: { type: String, default: 'text' }, // text, image, etc.
  //   },
  // ],
});
export const Group = mongoose.model('Groups', groupSchema);
