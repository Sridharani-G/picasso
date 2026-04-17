import mongoose, { Schema, Document } from 'mongoose';

export interface IFeedback extends Document {
    user: mongoose.Types.ObjectId;
    content: string;
    rating: number;
    kind: 'feedback' | 'guideline';
    targetArtwork?: mongoose.Types.ObjectId;
    targetArtist?: mongoose.Types.ObjectId;
    threadLink?: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'video' | 'audio' | 'file' | 'gif' | 'sticker';
    createdAt: Date;
}

const FeedbackSchema: Schema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    kind: { type: String, enum: ['feedback', 'guideline'], default: 'feedback' },
    targetArtwork: { type: Schema.Types.ObjectId, ref: 'Artwork', default: null },
    targetArtist: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    threadLink: { type: String, default: '' },
    mediaUrl: { type: String, default: '' },
    mediaType: { type: String, enum: ['image', 'video', 'audio', 'file', 'gif', 'sticker'] },
}, {
    timestamps: { createdAt: true, updatedAt: false }
});

export default mongoose.model<IFeedback>('Feedback', FeedbackSchema);
