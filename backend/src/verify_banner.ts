
import mongoose from 'mongoose';
import User from './models/User';
import dotenv from 'dotenv';
import path from 'path';

async function verify() {
    dotenv.config({ path: path.join(__dirname, '../.env') });
    await mongoose.connect(process.env.MONGODB_URI!);

    console.log('Finding user without banner...');
    const user = await User.findOne({ username: 'admin' }); // Assuming 'admin' is a user
    
    if (user) {
        console.log('Current banner:', user.bannerUrl);
        if (!user.bannerUrl || user.bannerUrl.includes('placeholder')) {
            console.log('Updating to default...');
            user.bannerUrl = 'https://res.cloudinary.com/dealm349w/image/upload/v1776259891/defaults/default_profile_banner_v1.jpg';
            await user.save();
            console.log('Update verified.');
        }
    } else {
        console.log('User not found.');
    }
    
    await mongoose.disconnect();
}

verify();
