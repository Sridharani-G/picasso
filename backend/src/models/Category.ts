import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
    name: string;
    description: string;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
}

const CategorySchema: Schema = new Schema({
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: '' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, {
    timestamps: { createdAt: true, updatedAt: false }
});

export default mongoose.model<ICategory>('Category', CategorySchema);
