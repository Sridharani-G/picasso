import mongoose, { Document, Schema } from 'mongoose';

export type UserRole = 'artist' | 'company' | 'explorer' | 'admin';

export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    role: UserRole;
    profileImage?: string;
    bio?: string;
    location?: string;
    website?: string;
    upiId?: string;
    socialMedia: {
        instagram?: string;
        twitter?: string;
        tiktok?: string;
        youtube?: string;
        artstation?: string;
        patreon?: string;
    };
    organizationInfo?: {
        name: string;
        description?: string;
        website?: string;
        industry?: string;
        size?: string;
        verified?: boolean;
    };
    categories: string[];
    followers: mongoose.Types.ObjectId[];
    following: mongoose.Types.ObjectId[];
    badges: string[];
    savedArtworks: mongoose.Types.ObjectId[];
    isVerified: boolean;
    isTrending: boolean;
    trendingUntil?: Date;
    trendVotes: number;
    trendVoters: mongoose.Types.ObjectId[];
    profileVisits: number;
    followersCount: number;
    followingCount: number;
    isArtist: boolean;
    isOrganization: boolean;
    blockedUsers: mongoose.Types.ObjectId[];
    timeSettings: {
        syncLimit: number;
        quietMode: {
            enabled: boolean;
            start: string;
            end: string;
        };
    };
    commentSettings: {
        globalModeration: boolean;
        allowInteractions: 'all' | 'following' | 'none';
    };

    bannerUrl?: string;
    patronTiers: {
        _id?: mongoose.Types.ObjectId;
        name: string;
        price: number;
        description: string;
        perks: string[];
    }[];
    patrons: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema({
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ['artist', 'company', 'explorer', 'admin'],
        default: 'explorer',
        required: true
    },

    profileImage: { type: String, default: '' },
    bannerUrl: { type: String, default: '' },
    bio: { type: String, maxlength: 500, default: '' },
    location: { type: String, default: '' },
    website: { type: String, default: '' },
    upiId: { type: String, default: '' },

    socialMedia: {
        instagram: { type: String, default: '' },
        twitter: { type: String, default: '' },
        tiktok: { type: String, default: '' },
        youtube: { type: String, default: '' },
        artstation: { type: String, default: '' },
        patreon: { type: String, default: '' }
    },

    organizationInfo: {
        name: { type: String, default: '' },
        description: { type: String, default: '' },
        website: { type: String, default: '' },
        industry: { type: String, default: '' },
        size: { type: String, default: '' },
        verified: { type: Boolean, default: false }
    },


    categories: { type: [String], default: [] },
    followers: { type: [{ type: Schema.Types.ObjectId, ref: 'User' }], default: [] },
    following: { type: [{ type: Schema.Types.ObjectId, ref: 'User' }], default: [] },

    badges: { type: [String], default: [] },
    savedArtworks: { type: [{ type: Schema.Types.ObjectId, ref: 'Artwork' }], default: [] },
    
    patronTiers: {
        type: [{
            name: { type: String, required: true },
            price: { type: Number, required: true },
            description: { type: String, default: '' },
            perks: { type: [String], default: [] }
        }],
        default: []
    },
    patrons: { type: [{ type: Schema.Types.ObjectId, ref: 'User' }], default: [] },

    isVerified: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    trendingUntil: { type: Date },

    trendVotes: { type: Number, default: 0 },
    trendVoters: { type: [{ type: Schema.Types.ObjectId, ref: 'User' }], default: [] },
    profileVisits: { type: Number, default: 0 },
    blockedUsers: { type: [{ type: Schema.Types.ObjectId, ref: 'User' }], default: [] },
    timeSettings: {
        syncLimit: { type: Number, default: 60 },
        quietMode: {
            enabled: { type: Boolean, default: false },
            start: { type: String, default: '22:00' },
            end: { type: String, default: '08:00' }
        }
    },
    commentSettings: {
        globalModeration: { type: Boolean, default: true },
        allowInteractions: { type: String, enum: ['all', 'following', 'none'], default: 'all' }
    }
}, {
    timestamps: true
});
UserSchema.virtual('followersCount').get(function () {
    return this.followers ? this.followers.length : 0;
});

UserSchema.virtual('followingCount').get(function () {
    return this.following ? this.following.length : 0;
});

UserSchema.virtual('isArtist').get(function () {
    return this.role === 'artist';
});

UserSchema.virtual('isOrganization').get(function () {
    return this.role === 'company';
});
UserSchema.set('toJSON', {
    virtuals: true,
    transform: function (doc, ret) {
        ret.id = ret._id?.toString() || ret.id;
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        return ret;
    }
});
UserSchema.index({ username: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });

export default mongoose.model<IUser>('User', UserSchema);
