import mongoose, { Schema, Types, Document } from 'mongoose';


export interface ChatDocument extends Document {
  participants: Types.ObjectId[];
  isGroup: boolean;
  groupName?: string;
  lastMessage: string;
  lastMessageTime: Date;
}


const ChatSchema = new Schema<ChatDocument>({
  participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
  isGroup: { type: Boolean, default: false },
  groupName: { type: String },
  lastMessage: { type: String, default: '' },
  lastMessageTime: { type: Date, default: Date.now }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id?.toString() || ret.id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  },
  toObject: {
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id?.toString() || ret.id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

ChatSchema.index({ participants: 1 });
ChatSchema.index({ lastMessageTime: -1 });

export default mongoose.models.Chat || mongoose.model<ChatDocument>('Chat', ChatSchema);
