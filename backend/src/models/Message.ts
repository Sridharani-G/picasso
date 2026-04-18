import mongoose, { Schema, Types, Document } from 'mongoose';
 
export interface MessageDocument extends Document {
  chatId: Types.ObjectId;
  sender: Types.ObjectId;
  content: string;
  messageType: string;
  mediaUrl?: string;
  timestamp: Date;
  readBy: Types.ObjectId[];
}
 
const MessageSchema = new Schema<MessageDocument>({
  chatId: { type: Schema.Types.ObjectId, ref: 'Chat', required: true },
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, default: '' },
  messageType: { type: String, default: 'text' },
  mediaUrl: { type: String },
  timestamp: { type: Date, default: Date.now },
  readBy: [{ type: Schema.Types.ObjectId, ref: 'User' }]
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
 
// Critical indices for performance
MessageSchema.index({ chatId: 1, createdAt: -1 });
MessageSchema.index({ sender: 1 });
 
export default mongoose.models.Message || mongoose.model<MessageDocument>('Message', MessageSchema);
