import mongoose, { Document, Schema } from 'mongoose';

export interface ISystemConfig extends Document {
    key: string;
    value: any;
    lastTrendReset: Date;
    updatedAt: Date;
    createdAt: Date;
}

const SystemConfigSchema: Schema = new Schema({
    key: { type: String, required: true, unique: true },
    value: { type: Schema.Types.Mixed },
    lastTrendReset: { type: Date, default: () => new Date() }
}, {
    timestamps: true
});

export default mongoose.model<ISystemConfig>('SystemConfig', SystemConfigSchema);
