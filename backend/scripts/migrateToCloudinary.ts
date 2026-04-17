import mongoose from 'mongoose';
import User from '../src/models/User';
import Artwork from '../src/models/Artwork';
import { uploadToCloudinary } from '../src/utils/cloudinary';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function migrate() {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/art-community';
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        if (!process.env.CLOUDINARY_CLOUD_NAME) {
            console.error('❌ Cloudinary credentials missing in .env');
            process.exit(1);
        }

        // 1. Migrate User Profile Images (Base64 -> Cloudinary)
        console.log('⏳ Migrating User profile images...');
        const users = await User.find({ profileImage: { $regex: /^data:image/ } });
        console.log(`Found ${users.length} users with Base64 images`);
        
        for (const user of users) {
            try {
                const url = await uploadToCloudinary(user.profileImage!, 'profiles');
                user.profileImage = url;
                await user.save();
                console.log(`✅ Migrated profile for user: ${user.username}`);
            } catch (err) {
                console.error(`❌ Failed to migrate profile for ${user.username}:`, (err as Error).message);
            }
        }

        // 2. Migrate Artwork Media (Local Path -> Cloudinary)
        console.log('⏳ Migrating Artwork media...');
        const artworks = await Artwork.find({ mediaUrl: { $regex: /^uploads\// } });
        console.log(`Found ${artworks.length} artworks with local paths`);

        for (const artwork of artworks) {
            try {
                const localPath = path.join(process.cwd(), artwork.mediaUrl);
                if (fs.existsSync(localPath)) {
                    const url = await uploadToCloudinary(localPath, 'artworks');
                    artwork.mediaUrl = url;
                    artwork.thumbnailUrl = url;
                    await artwork.save();
                    console.log(`✅ Migrated artwork: ${artwork.title}`);
                } else {
                    console.warn(`⚠️ File not found: ${localPath}`);
                }
            } catch (err) {
                console.error(`❌ Failed to migrate artwork ${artwork.title}:`, (err as Error).message);
            }
        }

        console.log('✨ Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

migrate();
