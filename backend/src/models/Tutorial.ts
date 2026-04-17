import mongoose, { Document, Schema } from 'mongoose';

export interface ITutorial extends Document {
    title: string;
    description: string;
    author: mongoose.Types.ObjectId;
    category: 'digital' | 'traditional' | 'handcrafted' | 'books' | 'illustration' | 'general';
    content: string;
    mediaUrl?: string;
    tags: string[];
    likes: mongoose.Types.ObjectId[];
    views: number;
    isPublished: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const TutorialSchema: Schema = new Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, maxlength: 2000 },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    category: {
        type: String,
        enum: ['digital', 'traditional', 'handcrafted', 'books', 'illustration', 'general'],
        required: true
    },
    content: { type: String, required: true },
    mediaUrl: { type: String, default: '' },
    tags: { type: [String], default: [] },
    likes: { type: [{ type: Schema.Types.ObjectId, ref: 'User' }], default: [] },
    views: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false }
}, {
    timestamps: true
});

export default mongoose.model<ITutorial>('Tutorial', TutorialSchema);
