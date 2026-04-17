import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import Artwork from '../models/Artwork';
import User from '../models/User';
import { auth, optionalAuth, AuthRequest } from '../middleware/auth';
import { mongoConnected } from '../config/database';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { uploadToCloudinary } from '../utils/cloudinary';

const router = Router();



const artworkStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(process.cwd(), 'uploads/artworks');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: artworkStorage,
    limits: { fileSize: 50 * 1024 * 1024 }
});



router.get('/categories', async (req: Request, res: Response) => {
    try {
        if (!mongoConnected) return res.json({ success: true, categories: [] });

        const categories = await Artwork.aggregate([
            { $group: { _id: "$category", count: { $sum: 1 } } },
            { $match: { _id: { $ne: null } } },
            { $project: { _id: 0, name: "$_id", count: "$count" } },
            { $sort: { count: -1 } }
        ]);

        res.json({ success: true, categories });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch categories' });
    }
});

router.get('/styles', async (req: Request, res: Response) => {
    try {
        if (!mongoConnected) return res.json({ success: true, styles: [] });

        const styles = await Artwork.aggregate([
            { $group: { _id: "$style", count: { $sum: 1 } } },
            { $match: { _id: { $nin: [null, ""] } } },
            { $project: { _id: 0, name: "$_id", count: "$count" } },
            { $sort: { count: -1 } }
        ]);

        res.json({ success: true, styles });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch styles' });
    }
});



router.get('/', optionalAuth, async (req: AuthRequest, res: Response) => {
    try {
        if (!mongoConnected) return res.json({ success: true, artworks: [], pagination: {} });

        const { category, style, search, sortBy = 'createdAt', limit = 20, page = 1, isForSale } = req.query;
        let query: any = {};

        if (category) query.category = category;
        if (style) query.style = style;
        if (search) {
            query.$or = [
                { title: { $regex: search as string, $options: 'i' } },
                { description: { $regex: search as string, $options: 'i' } }
            ];
        }

        if (String(isForSale).toLowerCase() === 'true') {
            query.isForSale = true;
        }

        const skip = (Number(page) - 1) * Number(limit);

        const artworks = await Artwork.find(query)
            .populate('artist', 'username profileImage bio representsOrganization location')
            .populate('collaborators', 'username profileImage')
            .populate('comments.user', 'username profileImage')
            .sort({ [sortBy as string]: -1 })
            .limit(Number(limit))
            .skip(skip);

        const total = await Artwork.countDocuments(query);
        const userId = req.user?.id;
        let savedArtworkIds: string[] = [];
        
        if (userId) {
            const user = await User.findById(userId).select('savedArtworks');
            if (user && user.savedArtworks) {
                savedArtworkIds = user.savedArtworks.map(id => id.toString());
            }
        }

        res.json({
            success: true,
            artworks: artworks.map(artwork => {
                const artworkId = artwork._id.toString();

                const safeLikes = (artwork.likes || []).filter(Boolean);
                const safeTrendVoters = (artwork.trendVoters || []).filter(Boolean);
                const safeComments = (artwork.comments || []).filter(Boolean);

                return {
                    id: artwork._id,
                    title: artwork.title,
                    description: artwork.description,
                    category: artwork.category,
                    style: artwork.style || '',
                    techniques: artwork.techniques || [],
                    mediaType: artwork.mediaType,
                    mediaUrl: artwork.mediaUrl,
                    mediaUrls: artwork.mediaUrls || [],
                    thumbnailUrl: artwork.thumbnailUrl,
                    tags: artwork.tags,
                    artist: artwork.artist,
                    collaborators: artwork.collaborators || [],
                    likes: safeLikes.length,
                    isLiked: userId ? safeLikes.some(id => id.toString() === userId) : false,
                    isSaved: userId ? savedArtworkIds.includes(artworkId) : false,
                    comments: safeComments.length,
                    commentList: safeComments,
                    trendVotes: artwork.trendVotes || 0,
                    isTrended: userId ? safeTrendVoters.some(v => v.toString() === userId) : false,
                    views: artwork.views || 0,
                    isForSale: artwork.isForSale,
                    price: artwork.price,
                    feedbackRequested: artwork.feedbackRequested || false,
                    createdAt: artwork.createdAt
                };
            }),
            pagination: {
                currentPage: Number(page),
                totalPages: Math.ceil(total / Number(limit)),
                totalArtworks: total
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch artworks', error: (error as Error).message });
    }
});



router.get('/:id', optionalAuth, async (req: AuthRequest, res: Response) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid Artwork ID format' });
        }

        const artwork = await Artwork.findById(req.params.id)
            .populate('artist', 'username profileImage bio')
            .populate('collaborators', 'username profileImage')
            .populate('comments.user', 'username profileImage');

        if (!artwork) return res.status(404).json({ success: false, message: 'Artwork not found' });

        artwork.views += 1;
        await artwork.save();

        const userId = req.user?.id;
        let isSaved = false;
        if (userId) {
            const user = await User.findById(userId).select('savedArtworks');
            if (user && user.savedArtworks) {
                isSaved = user.savedArtworks.some(id => id.toString() === req.params.id);
            }
        }

        const safeLikes = (artwork.likes || []).filter(Boolean);
        const safeTrendVoters = (artwork.trendVoters || []).filter(Boolean);
        const safeComments = (artwork.comments || []).filter(Boolean);

        res.json({
            success: true,
            artwork: {
                id: artwork._id,
                title: artwork.title,
                description: artwork.description,
                category: artwork.category,
                style: artwork.style || '',
                techniques: artwork.techniques || [],
                mediaType: artwork.mediaType,
                mediaUrl: artwork.mediaUrl,
                mediaUrls: artwork.mediaUrls || [],
                tags: artwork.tags,
                artist: artwork.artist,
                collaborators: artwork.collaborators || [],
                likesCount: safeLikes.length,
                isLiked: userId ? safeLikes.some(id => id.toString() === userId) : false,
                isSaved,
                commentsCount: safeComments.length,
                commentList: safeComments,
                trendVotes: artwork.trendVotes || 0,
                isTrended: userId ? safeTrendVoters.some(v => v.toString() === userId) : false,
                views: artwork.views,
                isForSale: artwork.isForSale,
                price: artwork.price,
                feedbackRequested: artwork.feedbackRequested || false,
                createdAt: artwork.createdAt
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching artwork' });
    }
});



router.post('/:id/like', auth, async (req: AuthRequest, res: Response) => {
    try {
        const artworkId = req.params.id;
        const userId = req.user!.id;

        const artwork = await Artwork.findById(artworkId);
        if (!artwork) return res.status(404).json({ success: false, message: 'Artwork not found' });

        const safeLikes = (artwork.likes || []).filter(Boolean);
        const isLiked = safeLikes.some(id => id.toString() === userId);

        if (isLiked) {
            artwork.likes = artwork.likes.filter(id => id && id.toString() !== userId);
        } else {
            artwork.likes.push(new mongoose.Types.ObjectId(userId));
        }

        await artwork.save();

        res.json({
            success: true,
            likes: artwork.likes.length,
            isLiked: !isLiked
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update like status' });
    }
});

router.post('/:id/comment', auth, async (req: AuthRequest, res: Response) => {
    try {
        const artworkId = req.params.id;
        const userId = req.user!.id;
        const { comment } = req.body;

        if (!comment || !comment.trim()) {
            return res.status(400).json({ success: false, message: 'Comment cannot be empty' });
        }

        const artwork = await Artwork.findById(artworkId);
        if (!artwork) return res.status(404).json({ success: false, message: 'Artwork not found' });

        artwork.comments.push({
            user: new mongoose.Types.ObjectId(userId),
            comment: comment.trim(),
            timestamp: new Date()
        });

        await artwork.save();

        await artwork.populate('comments.user', 'username profileImage');

        res.json({
            success: true,
            message: 'Comment added',
            comment: artwork.comments[artwork.comments.length - 1]
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to add comment' });
    }
});

// Create new artwork
router.post('/', auth, upload.array('media', 10), async (req: AuthRequest, res: Response) => {
    try {
        const { title, description, category, style, techniques, tags, isForSale, price, collaboratorUsernames } = req.body;
        const artistId = req.user!.id;
        
        const files = req.files as Express.Multer.File[];

        if (!title || !title.trim()) {
            return res.status(400).json({ success: false, message: 'Title is required' });
        }

        if (!files || files.length === 0) {
            return res.status(400).json({ success: false, message: 'No artwork files uploaded' });
        }

        const mediaUrls: string[] = [];
        try {
            for (const file of files) {
                const url = await uploadToCloudinary(file.path, 'artworks');
                mediaUrls.push(url);
                // Delete local file after upload
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            }
            console.log('✅ POST /artworks - Cloudinary upload success:', mediaUrls);
        } catch (uploadError: any) {
            return res.status(500).json({ success: false, message: 'Cloudinary upload failed', error: uploadError.message });
        }

        let collaboratorIds: mongoose.Types.ObjectId[] = [];
        if (collaboratorUsernames && typeof collaboratorUsernames === 'string') {
            const usernames = collaboratorUsernames.split(',').map(u => u.trim()).filter(u => u.length > 0);
            if (usernames.length > 0) {
                const users = await User.find({ username: { $in: usernames } });
                collaboratorIds = users.map(u => u._id as mongoose.Types.ObjectId);
            }
        }

        const parsedTechniques = typeof techniques === 'string'
            ? techniques.split(',').map((t: string) => t.trim()).filter((t: string) => t.length > 0)
            : Array.isArray(techniques) ? techniques : [];

        let parsedTags: string[] = [];
        if (tags) {
            try {
                parsedTags = Array.isArray(tags) ? tags : JSON.parse(tags);
            } catch (pErr) {
                console.warn('⚠️ POST /artworks - Failed to parse tags as JSON, splitting by comma instead');
                parsedTags = String(tags).split(',').map(t => t.trim()).filter(t => t.length > 0);
            }
        }


        
        const artwork = new Artwork({
            title: title.trim(),
            description: description || '',
            category,
            style: style || '',
            techniques: parsedTechniques,
            mediaType: files[0].mimetype.startsWith('image/') ? 'image' : 'video',
            mediaUrl: mediaUrls[0] || '',
            mediaUrls: mediaUrls, // This should be an array of strings
            thumbnailUrl: mediaUrls[0] || '',
            tags: parsedTags,
            artist: artistId,
            collaborators: collaboratorIds,
            isForSale: isForSale === 'true' || isForSale === true,
            price: price ? Number(price) : 0,
        });

        try {
            await artwork.save();
        } catch (validationError: any) {
            console.error('❌ POST /artworks - Artwork validation error:', validationError.message);
            return res.status(400).json({ success: false, message: `Validation failed: ${validationError.message}` });
        }

        await artwork.populate('artist', 'username profileImage bio');

        res.status(201).json({
            success: true,
            artwork: {
                id: artwork._id,
                title: artwork.title,
                description: artwork.description,
                category: artwork.category,
                style: artwork.style,
                techniques: artwork.techniques,
                mediaType: artwork.mediaType,
                mediaUrl: artwork.mediaUrl,
                thumbnailUrl: artwork.thumbnailUrl,
                tags: artwork.tags,
                artist: artwork.artist,
                collaborators: artwork.collaborators || [],
                likes: 0,
                views: 0,
                isForSale: artwork.isForSale,
                price: artwork.price,
                createdAt: artwork.createdAt
            }
        });
    } catch (error: any) {
        console.error('🔥 POST /artworks - CRITICAL FAILURE:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to create artwork', 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Save artwork
router.post('/:id/save', auth, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const artworkId = req.params.id;
        const isSaved = (user.savedArtworks || []).some(id => id.toString() === artworkId);

        if (isSaved) {
            await User.findByIdAndUpdate(userId, { $pull: { savedArtworks: artworkId } });
        } else {
            await User.findByIdAndUpdate(userId, { $addToSet: { savedArtworks: artworkId } });
        }

        res.json({ success: true, saved: !isSaved });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Trend artwork
router.post('/:id/trend', auth, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id;
        const artwork = await Artwork.findById(req.params.id);
        if (!artwork) return res.status(404).json({ success: false, message: 'Artwork not found' });

        const isTrended = (artwork.trendVoters || []).some(v => v.toString() === userId);

        if (isTrended) {
            await Artwork.findByIdAndUpdate(req.params.id, {
                $pull: { trendVoters: userId },
                $inc: { trendVotes: -1 }
            });
        } else {
            await Artwork.findByIdAndUpdate(req.params.id, {
                $addToSet: { trendVoters: userId },
                $inc: { trendVotes: 1 }
            });
        }

        const updatedArtwork = await Artwork.findById(req.params.id);
        res.json({
            success: true,
            trended: !isTrended,
            trendVotes: Math.max(0, updatedArtwork?.trendVotes || 0)
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Alias vote to trend
router.post('/:id/vote', auth, async (req: AuthRequest, res: Response) => {
    // Re-use trend logic
    try {
        const userId = req.user!.id;
        const artwork = await Artwork.findById(req.params.id);
        if (!artwork) return res.status(404).json({ success: false, message: 'Artwork not found' });

        const isTrended = (artwork.trendVoters || []).some(v => v.toString() === userId);
        if (!isTrended) {
            artwork.trendVoters.push(new mongoose.Types.ObjectId(userId));
            artwork.trendVotes = (artwork.trendVotes || 0) + 1;
            await artwork.save();
        }
        res.json({ success: true, trendVotes: artwork.trendVotes });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Update artwork
router.put('/:id', auth, async (req: AuthRequest, res: Response) => {
    try {
        const artwork = await Artwork.findById(req.params.id);
        if (!artwork) return res.status(404).json({ success: false, message: 'Artwork not found' });

        if (artwork.artist.toString() !== req.user!.id) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        const { title, description, category, tags, isForSale, price } = req.body;
        if (title) artwork.title = title;
        if (description) artwork.description = description;
        if (category) artwork.category = category;
        if (tags) artwork.tags = tags;
        if (isForSale !== undefined) artwork.isForSale = isForSale;
        if (price !== undefined) artwork.price = price;

        await artwork.save();
        res.json({ success: true, message: 'Artwork updated successfully', artwork });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update artwork' });
    }
});

// Request feedback on own artwork
router.post('/:id/request-feedback', auth, async (req: AuthRequest, res: Response) => {
    try {
        const artwork = await Artwork.findById(req.params.id);
        if (!artwork) return res.status(404).json({ success: false, message: 'Artwork not found' });

        if (artwork.artist.toString() !== req.user!.id) {
            return res.status(403).json({ success: false, message: 'Only owner can request feedback' });
        }

        artwork.feedbackRequested = true;
        await artwork.save();

        res.json({ success: true, message: 'Feedback requested', artwork: {
            id: artwork._id,
            feedbackRequested: artwork.feedbackRequested
        }});
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to request feedback' });
    }
});

// Delete artwork
router.delete('/:id', auth, async (req: AuthRequest, res: Response) => {
    try {
        const artwork = await Artwork.findById(req.params.id);
        if (!artwork) return res.status(404).json({ success: false, message: 'Artwork not found' });

        if (artwork.artist.toString() !== req.user!.id) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        if (artwork.mediaUrl && artwork.mediaUrl.includes('res.cloudinary.com')) {
            try {
                // Extracts public_id from Cloudinary URL
                const publicId = artwork.mediaUrl.split('/').slice(-2).join('/').split('.')[0];
                const { v2: cloudinary } = require('cloudinary');
                await cloudinary.uploader.destroy(publicId);
            } catch (delError) {
                console.error('Failed to delete from Cloudinary:', delError);
            }
        }

        await Artwork.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Artwork deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete artwork' });
    }
});

export default router;
