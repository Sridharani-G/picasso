import mongoose, { Schema, Document } from 'mongoose';

export interface IAsset extends Document {
  name: string;
  type: 'brush' | 'texture' | 'template';
  category: string;
  config: Record<string, any>;
  thumbnail: string;
  author: mongoose.Types.ObjectId | string;
  isFree: boolean;
  price?: number;
  downloads: number;
  tags: string[];
}

const AssetSchema: Schema = new Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['brush', 'texture', 'template'], required: true },
  category: { type: String, required: true },
  config: { type: Schema.Types.Mixed, required: true },
  thumbnail: { type: String },
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  isFree: { type: Boolean, default: true },
  price: { type: Number, default: 0 },
  downloads: { type: Number, default: 0 },
  tags: [{ type: String }]
}, { timestamps: true });

export default mongoose.model<IAsset>('Asset', AssetSchema);
