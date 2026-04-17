import mongoose, { Document, Schema } from 'mongoose';

export interface ICompetition extends Document {
    title: string;
    description: string;
    category: 'digital' | 'traditional' | 'handcrafted' | 'books' | 'illustration';
    startDate: Date;
    endDate: Date;
    submissionDeadline: Date;
    votingStartDate: Date;
    votingEndDate: Date;
    prizePool: number;
    entryFee: number;
    maxParticipants: number;
    participants: {
        user: mongoose.Types.ObjectId;
        artwork: mongoose.Types.ObjectId;
        submissionDate: Date;
    }[];
    votes: {
        voter: mongoose.Types.ObjectId;
        artwork: mongoose.Types.ObjectId;
        vote: number;
        timestamp: Date;
    }[];
    winners: {
        position: number;
        user: mongoose.Types.ObjectId;
        artwork: mongoose.Types.ObjectId;
        prize: number;
    }[];
    isActive: boolean;
    isVotingOpen: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const CompetitionSchema: Schema = new Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, maxlength: 2000 },
    category: {
        type: String,
        enum: ['digital', 'traditional', 'handcrafted', 'books', 'illustration'],
        required: true
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    submissionDeadline: { type: Date, required: true },
    votingStartDate: { type: Date, required: true },
    votingEndDate: { type: Date, required: true },
    prizePool: { type: Number, required: true },
    entryFee: { type: Number, default: 0 },
    maxParticipants: { type: Number, required: true },
    participants: {
        type: [{
            user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
            artwork: { type: Schema.Types.ObjectId, ref: 'Artwork', required: true },
            submissionDate: { type: Date, default: Date.now }
        }],
        default: []
    },
    votes: {
        type: [{
            voter: { type: Schema.Types.ObjectId, ref: 'User', required: true },
            artwork: { type: Schema.Types.ObjectId, ref: 'Artwork', required: true },
            vote: { type: Number, min: 1, max: 5, required: true },
            timestamp: { type: Date, default: Date.now }
        }],
        default: []
    },
    winners: {
        type: [{
            position: { type: Number, required: true },
            user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
            artwork: { type: Schema.Types.ObjectId, ref: 'Artwork', required: true },
            prize: { type: Number, required: true }
        }],
        default: []
    },
    isActive: { type: Boolean, default: true },
    isVotingOpen: { type: Boolean, default: false }
}, {
    timestamps: true
});

export default mongoose.model<ICompetition>('Competition', CompetitionSchema);
