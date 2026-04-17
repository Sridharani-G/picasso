import { Router, Request, Response } from 'express';
import Artwork from '../models/Artwork';
import User from '../models/User';
import Tutorial from '../models/Tutorial';
import Competition from '../models/Competition';
import { optionalAuth, AuthRequest } from '../middleware/auth';

const router = Router();
router.get('/', optionalAuth, async (req: AuthRequest, res: Response) => {
    try {
        const { q, type = 'all', limit = 20, page = 1 } = req.query;
        const query = q as string;

        if (!query) return res.status(400).json({ success: false, message: 'Search query is required' });

        const skip = (Number(page) - 1) * Number(limit);
        const results: any = {};
        const userId = req.user?.id;

        if (type === 'all' || type === 'artworks') {
            const artworks = await Artwork.find({
                $or: [
                    { title: { $regex: query, $options: 'i' } },
                    { description: { $regex: query, $options: 'i' } },
                    { tags: { $in: [new RegExp(query, 'i')] } }
                ]
            })
                .populate('artist', 'username profileImage upiId')
                .sort({ createdAt: -1 })
                .limit(Number(limit))
                .skip(skip);

            results.artworks = artworks.map(artwork => {
                const safeLikes = (artwork.likes || []).filter(Boolean);
                const safeTrendVoters = (artwork.trendVoters || []).filter(Boolean);
                const safeComments = (artwork.comments || []).filter(Boolean);

                return {
                    id: artwork._id,
                    title: artwork.title,
                    description: artwork.description,
                    category: artwork.category,
                    mediaType: artwork.mediaType,
                    mediaUrl: artwork.mediaUrl,
                    thumbnailUrl: artwork.thumbnailUrl,
                    tags: artwork.tags,
                    artist: artwork.artist,
                    likes: safeLikes.length,
                    comments: safeComments.length,
                    trendVotes: artwork.trendVotes || 0,
                    isTrended: userId ? safeTrendVoters.some(v => v.toString() === userId) : false,
                    views: artwork.views || 0,
                    isForSale: artwork.isForSale,
                    price: artwork.price,
                    createdAt: artwork.createdAt
                };
            });
        }

        if (type === 'all' || type === 'users') {
            const users = await User.find({
                $or: [
                    { username: { $regex: query, $options: 'i' } },
                    { bio: { $regex: query, $options: 'i' } }
                ]
            })
                .limit(Number(limit))
                .skip(skip);

            results.users = users.map(user => ({
                id: user._id,
                username: user.username,
                profileImage: user.profileImage,
                bio: user.bio,
                location: user.location,
                categories: user.categories,
                followers: user.followers.length,
                following: user.following.length,
                badges: user.badges,
                isVerified: user.isVerified,
                isArtist: user.role === 'artist',
                createdAt: user.createdAt
            }));
        }

        res.json({
            success: true,
            query,
            type,
            results,
            pagination: { currentPage: Number(page), limit: Number(limit) }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Search failed' });
    }
});

export default router;
