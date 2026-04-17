import mongoose, { Schema, Types, Document } from 'mongoose';

export interface ChatMessage {
  sender: Types.ObjectId;
  content: string;
  messageType: string;
  mediaUrl?: string;
  timestamp: Date;
  readBy: Types.ObjectId[];
}

export interface ChatDocument extends Document {
  participants: Types.ObjectId[];
  messages: ChatMessage[];
  isGroup: boolean;
  groupName?: string;
  lastMessage: string;
  lastMessageTime: Date;
}

const ChatMessageSchema = new Schema<ChatMessage>({
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, default: '' },
  messageType: { type: String, default: 'text' },
  mediaUrl: { type: String },
  timestamp: { type: Date, default: Date.now },
  readBy: [{ type: Schema.Types.ObjectId, ref: 'User' }]
}, { _id: false });

const ChatSchema = new Schema<ChatDocument>({
  participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
  messages: [ChatMessageSchema],
  isGroup: { type: Boolean, default: false },
  groupName: { type: String },
  lastMessage: { type: String, default: '' },
  lastMessageTime: { type: Date, default: Date.now }
}, {
  timestamps: true
});

export default mongoose.models.Chat || mongoose.model<ChatDocument>('Chat', ChatSchema);
