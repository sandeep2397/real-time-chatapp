import mongoose from 'mongoose';

// Chat schema and model
export type IMessages = {
    sender: String,
    content: String,
    timestamp: String,
    type: String, // text, image, etc.
    fileUrl?:string;
    fileName?: string;
    fileType?:string;
  }

const chatSchema = new mongoose.Schema({
  participants: [String],
  messages:{type:Array<IMessages>}
});
export const Chat = mongoose.model('Chat', chatSchema);
