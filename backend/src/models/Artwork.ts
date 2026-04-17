import mongoose, { Document, Schema } from 'mongoose';

export interface IArtwork extends Document {
    title: string;
    description: string;
    artist: mongoose.Types.ObjectId;
    collaborators: mongoose.Types.ObjectId[];
    category: string;
    style?: string;
    techniques: string[];
    mediaType: 'image' | 'video' | 'pdf';
    mediaUrl: string;
    mediaUrls: string[];
    thumbnailUrl?: string;
    tags: string[];

    likes: mongoose.Types.ObjectId[];
    saves: mongoose.Types.ObjectId[];
    comments: {
        user: mongoose.Types.ObjectId;
        comment: string;
        timestamp: Date;
    }[];

    trendVotes: number;
    trendVoters: mongoose.Types.ObjectId[];
    views: number;

    isForSale: boolean;
    price: number;
    watermark?: string;
    blockchainVerified?: boolean;
    feedbackRequested: boolean;

    createdAt: Date;
    updatedAt: Date;
}

const ArtworkSchema: Schema = new Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: false, default: '', maxlength: 2000 },
    artist: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    collaborators: { type: [{ type: Schema.Types.ObjectId, ref: 'User' }], default: [] },
    category: { type: String, required: true },
    style: { type: String, default: '' },
    techniques: { type: [String], default: [] },
    mediaType: {
        type: String,
        enum: ['image', 'video', 'pdf'],
        required: true
    },
    mediaUrl: { type: String, required: true },
    mediaUrls: { type: [String], default: [] },
    thumbnailUrl: { type: String, default: '' },
    tags: { type: [String], default: [] },

    likes: { type: [{ type: Schema.Types.ObjectId, ref: 'User' }], default: [] },
    saves: { type: [{ type: Schema.Types.ObjectId, ref: 'User' }], default: [] },
    comments: {
        type: [{
            user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
            comment: { type: String, required: true },
            timestamp: { type: Date, default: Date.now }
        }],
        default: []
    },

    trendVotes: { type: Number, default: 0 },
    trendVoters: { type: [{ type: Schema.Types.ObjectId, ref: 'User' }], default: [] },
    views: { type: Number, default: 0 },

    isForSale: { type: Boolean, default: false },
    price: { type: Number, default: 0 },
    watermark: { type: String, default: '' },
    blockchainVerified: { type: Boolean, default: false },
    feedbackRequested: { type: Boolean, default: false }
}, {
    timestamps: true
});

ArtworkSchema.index({ createdAt: -1 });
ArtworkSchema.index({ category: 1, createdAt: -1 });
ArtworkSchema.index({ artist: 1 });
ArtworkSchema.index({ trendVotes: -1 });

export default mongoose.model<IArtwork>('Artwork', ArtworkSchema);
