import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User';
import { connectMongoDB, mongoConnected } from '../config/database';
import { auth, AuthRequest } from '../middleware/auth';

const router = Router();

const DEFAULT_BANNER_URL = 'https://res.cloudinary.com/dealm349w/image/upload/v1776260277/defaults/default_profile_banner_v2_aesthetic.jpg';

router.post('/register', async (req: Request, res: Response) => {
    try {
        const {
            username,
            email,
            password,
            role = 'explorer',
            organizationInfo,
            bio,
            artistCategory,
            socialLinks
        } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide all required fields' });
        }

        const validRoles = ['artist', 'company', 'explorer'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ success: false, message: 'Invalid role selected' });
        }

        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Username or email already in use' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new User({
            username,
            email,
            password: hashedPassword,
            role,
            ...(role === 'artist' && {
                bio: bio || '',
                categories: artistCategory ? [artistCategory] : [],
                socialMedia: socialLinks || {}
            }),
            ...(role === 'company' && {
                organizationInfo: organizationInfo || {}
            }),
            bannerUrl: DEFAULT_BANNER_URL
        });

        await user.save();

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) return res.status(500).json({ success: false, message: 'Server misconfiguration.' });
        const token = jwt.sign(
            { id: user._id.toString(), email: user.email, username: user.username, role: user.role },
            jwtSecret,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                profileImage: user.profileImage,
                followersCount: 0,
                followingCount: 0,
                isArtist: role === 'artist',
                isOrganization: role === 'company'
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Registration failed', error: (error as Error).message });
    }
});
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const identifier = (email || '').trim();

        if (!identifier || !password) {
            return res.status(400).json({ success: false, message: 'Please provide identification and password' });
        }

        const isConnected = mongoConnected || mongoose.connection.readyState === 1;
        if (!isConnected) {
            const reconnected = await connectMongoDB();
            console.log('[Auth] login reconnect attempt result:', reconnected, 'readyState=', mongoose.connection.readyState, 'mongoConnected=', mongoConnected);
            if (!reconnected) {
                return res.status(503).json({ success: false, message: 'Database disconnected. Cannot authenticate.' });
            }
        }

        // Search by email (lowercase) OR username
        const user = await User.findOne({
            $or: [
                { email: identifier.toLowerCase() },
                { username: identifier }
            ]
        }).select('+password');

        if (!user) {
            console.log(`[Auth] Login failed for identifier: ${identifier} (User Not Found)`);
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        // Migration: If user has no banner, assign the default one
        if (!user.bannerUrl) {
            user.bannerUrl = DEFAULT_BANNER_URL;
            await user.save();
        }

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) return res.status(500).json({ success: false, message: 'Server misconfiguration.' });
        const token = jwt.sign(
            { id: user._id.toString(), email: user.email, username: user.username, role: user.role },
            jwtSecret,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                profileImage: user.profileImage,
                followersCount: user.followers.length,
                followingCount: user.following.length,
                isArtist: user.role === 'artist',
                isOrganization: user.role === 'company'
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Login failed', error: (error as Error).message });
    }
});

router.get('/validate', auth, async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findById(req.user!.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

export default router;
