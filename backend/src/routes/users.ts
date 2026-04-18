import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import User from '../models/User';
import Artwork from '../models/Artwork';
import Feedback from '../models/Feedback';
import Tutorial from '../models/Tutorial';
import Competition from '../models/Competition';
import { auth, optionalAuth, AuthRequest } from '../middleware/auth';
import { mongoConnected } from '../config/database';
import { uploadToCloudinary } from '../utils/cloudinary';

const router = Router();



router.put('/profile', auth, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const updateData = req.body;

        const currentUser = await User.findById(userId);
        if (currentUser && currentUser.role !== 'explorer') {
            delete updateData.role;
        }

        delete updateData.password;
        delete updateData.email;
        delete updateData.isVerified;
        delete updateData.badges;

        if (updateData.profileImage && updateData.profileImage.startsWith('data:image')) {
            try {
                const cloudinaryUrl = await uploadToCloudinary(updateData.profileImage, 'profiles');
                updateData.profileImage = cloudinaryUrl;
            } catch (uploadError) {
                console.error('Profile image upload failed:', uploadError);
                // Continue without updating image if upload fails, or handle as error
            }
        }

        if (updateData.bannerUrl && updateData.bannerUrl.startsWith('data:image')) {
            try {
                const cloudinaryUrl = await uploadToCloudinary(updateData.bannerUrl, 'banners');
                updateData.bannerUrl = cloudinaryUrl;
            } catch (uploadError) {
                console.error('Banner image upload failed:', uploadError);
            }
        }

        if (updateData.socialLinks) {
            updateData.socialMedia = updateData.socialLinks;
            delete updateData.socialLinks;
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        res.json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage,
                bannerUrl: user.bannerUrl,
                bio: user.bio,
                location: user.location,
                website: user.website,
                socialLinks: user.socialMedia,
                categories: user.categories,
                badges: user.badges,
                followersCount: user.followers.length,
                followingCount: user.following.length,
                isVerified: user.isVerified,
                isArtist: user.role === 'artist',
                isOrganization: user.role === 'company',
                isTrending: user.isTrending,
                trendingUntil: user.trendingUntil,
                organizationInfo: user.organizationInfo,
                timeSettings: user.timeSettings,
                commentSettings: user.commentSettings,
                patronTiers: user.patronTiers,
                patronsCount: user.patrons?.length || 0,
                trendVotes: user.trendVotes || 0,
                hasVoted: userId ? user.trendVoters.some(v => v.toString() === userId) : false
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update profile', error: (error as Error).message });
    }
});



router.delete('/profile', auth, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

        const userObjectId = new mongoose.Types.ObjectId(userId);

        // 1. Get all artworks owned by this user to clean up references elsewhere
        const userArtworks = await Artwork.find({ artist: userObjectId }).select('_id');
        const artworkIds = userArtworks.map(art => art._id);

        // 2. Remove references to this user from other users' followers/following lists
        await User.updateMany(
            { $or: [{ followers: userObjectId }, { following: userObjectId }] },
            { $pull: { followers: userObjectId, following: userObjectId } }
        );

        // 3. Remove user's artworks from all users' saved lists
        if (artworkIds.length > 0) {
            await User.updateMany(
                { savedArtworks: { $in: artworkIds } },
                { $pull: { savedArtworks: { $in: artworkIds } } }
            );
        }

        // 4. Delete all artworks owned by this user
        await Artwork.deleteMany({ artist: userObjectId });

        // 5. Remove user's interactions (likes, saves, comments, trend votes) from ALL artworks
        await Artwork.updateMany({}, {
            $pull: {
                likes: userObjectId,
                saves: userObjectId,
                comments: { user: userObjectId },
                trendVoters: userObjectId
            }
        });

        // --- Optional Collections (May not exist or be populated, wrap in try/catch) ---
        try {
            if (mongoose.modelNames().includes('Feedback')) {
                await Feedback.deleteMany({ user: userObjectId });
            }
        } catch (e) { console.warn('Skipping Feedback deletion:', e); }

        try {
            if (mongoose.modelNames().includes('Tutorial')) {
                await Tutorial.deleteMany({ author: userObjectId });
                await Tutorial.updateMany({}, {
                    $pull: { likes: userObjectId }
                });
            }
        } catch (e) { console.warn('Skipping Tutorial deletion:', e); }

        try {
            if (mongoose.modelNames().includes('Competition')) {
                await Competition.updateMany({}, {
                    $pull: {
                        participants: { user: userObjectId },
                        votes: { voter: userObjectId },
                        winners: { user: userObjectId }
                    }
                });
            }
        } catch (e) { console.warn('Skipping Competition deletion:', e); }

        // 9. Remove user from any trend voting lists in other users
        await User.updateMany(
            { trendVoters: userObjectId },
            { $pull: { trendVoters: userObjectId } }
        );

        // 10. Finally, delete the user itself
        const deletedUser = await User.findByIdAndDelete(userObjectId);
        
        if (!deletedUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, message: 'Account and all associated resonance wiped from the matrix.' });
    } catch (error) {
        console.error('Account deletion error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to delete account', 
            error: (error as Error).message 
        });
    }
});

router.post('/patrontiers', auth, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const { tiers } = req.body;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        
        user.patronTiers = tiers;
        await user.save();

        res.json({ success: true, message: 'Tiers updated', patronTiers: user.patronTiers });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update tiers' });
    }
});

router.post('/:id/subscribe/:tierId', auth, async (req: AuthRequest, res: Response) => {
    try {
        const targetId = req.params.id;
        const subId = req.user!.id;

        if (targetId === subId) return res.status(400).json({ success: false, message: 'Cannot subscribe to yourself' });

        const targetUser = await User.findById(targetId);
        if (!targetUser) return res.status(404).json({ success: false, message: 'Target user not found' });

        if (!targetUser.patrons.some(p => p.toString() === subId)) {
            targetUser.patrons.push(new mongoose.Types.ObjectId(subId));
            await targetUser.save();
        }

        res.json({ success: true, message: 'Subscribed successfully!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to subscribe' });
    }
});

router.get('/profile/saved', auth, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const user = await User.findById(userId).populate({
            path: 'savedArtworks',
            populate: { path: 'artist', select: 'username profileImage bio' }
        });
        
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        res.json({ success: true, artworks: user.savedArtworks });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch saved artworks' });
    }
});

router.get('/block', auth, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const user = await User.findById(userId).populate('blockedUsers', 'username profileImage bio');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, blockedUsers: user.blockedUsers || [] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch blocked users' });
    }
});

router.post('/block/:id', auth, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const targetId = req.params.id;

        if (userId === targetId) return res.status(400).json({ success: false, message: 'Cannot block yourself' });

        await User.findByIdAndUpdate(userId, {
            $addToSet: { blockedUsers: targetId }
        });

        res.json({ success: true, message: 'User blocked' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to block user' });
    }
});

router.post('/unblock/:id', auth, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const targetId = req.params.id;

        await User.findByIdAndUpdate(userId, {
            $pull: { blockedUsers: targetId }
        });

        res.json({ success: true, message: 'User unblocked' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to unblock user' });
    }
});



router.get('/artists', optionalAuth, async (req: AuthRequest, res: Response) => {
    try {
        if (!mongoConnected) return res.json({ success: true, users: [] });

        const limit = Number(req.query.limit) || 6;
        const sortBy = String(req.query.sortBy || 'feedback').toLowerCase();

        // Load all artists (in practice, system usually has a manageable number for this endpoint) and their follower metadata.
        const artists = await User.find({ role: 'artist' })
            .populate('followers following', 'username profileImage bio')
            .exec();

        const artistIds = artists.map((artist) => artist._id);

        // Count feedback entries per artist (as feedback provider)
        const feedbackCounts = await Feedback.aggregate([
            { $match: { user: { $in: artistIds } } },
            { $group: { _id: '$user', count: { $sum: 1 } } }
        ]);

        const feedbackMap = new Map<string, number>(
            feedbackCounts.map((f: any) => [f._id.toString(), f.count])
        );

        const result = artists
            .map((artist) => ({
                id: artist._id,
                username: artist.username,
                profileImage: artist.profileImage,
                bio: artist.bio,
                location: artist.location,
                categories: artist.categories,
                followersCount: artist.followers.length,
                followingCount: artist.following.length,
                isFollowing: req.user ? artist.followers.some((f: any) => (f._id || f).toString() === req.user!.id) : false,
                badges: artist.badges,
                isVerified: artist.isVerified,
                isArtist: true,
                isTrending: artist.isTrending,
                feedbackCount: feedbackMap.get(artist._id.toString()) || 0
            }));

        if (sortBy === 'followers') {
            result.sort((a, b) => (b.followersCount || 0) - (a.followersCount || 0));
        } else {
            // default: top feedback creators
            result.sort((a, b) => {
                const feedbackDiff = (b.feedbackCount || 0) - (a.feedbackCount || 0);
                if (feedbackDiff !== 0) return feedbackDiff;
                return (b.followersCount || 0) - (a.followersCount || 0);
            });
        }

        res.json({
            success: true,
            users: result.slice(0, limit)
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch artists' });
    }
});

router.get('/username/:username', optionalAuth, async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findOne({ username: req.params.username })
            .populate('followers following', 'username profileImage bio');

        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const isFollowing = req.user ? user.followers.some(f => (f._id || f).toString() === req.user!.id) : false;

        const artworkStats = await Artwork.aggregate([
            { $match: { artist: user._id } },
            { $group: { _id: null, totalLikes: { $sum: { $size: '$likes' } }, totalViews: { $sum: '$views' } } }
        ]);
        const stats = artworkStats[0] || { totalLikes: 0, totalViews: 0 };

        res.json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                profileImage: user.profileImage,
                bannerUrl: user.bannerUrl,
                bio: user.bio,
                location: user.location,
                website: user.website,
                socialLinks: user.socialMedia,
                categories: user.categories,
                followersCount: user.followers.length,
                followingCount: user.following.length,
                badges: user.badges,
                isVerified: user.isVerified,
                isArtist: user.role === 'artist',
                isOrganization: user.role === 'company',
                isTrending: user.isTrending,
                isFollowing,
                totalLikes: stats.totalLikes,
                totalViews: stats.totalViews,
                organizationInfo: user.organizationInfo,
                createdAt: user.createdAt,
                patronTiers: user.patronTiers,
                patronsCount: user.patrons?.length || 0,
                trendVotes: user.trendVotes || 0,
                hasVoted: (req as any).user ? user.trendVoters.some((v: any) => v.toString() === (req as any).user!.id) : false
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch user by username' });
    }
});

router.get('/:id', optionalAuth, async (req: AuthRequest, res: Response) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid User ID format' });
        }

        const user = await User.findById(req.params.id).populate('followers following', 'username profileImage bio');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const isFollowing = req.user ? user.followers.some(f => (f._id || f).toString() === req.user!.id) : false;

        const artworkStats = await Artwork.aggregate([
            { $match: { artist: user._id } },
            { $group: { _id: null, totalLikes: { $sum: { $size: '$likes' } }, totalViews: { $sum: '$views' } } }
        ]);
        const stats = artworkStats[0] || { totalLikes: 0, totalViews: 0 };

        res.json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                profileImage: user.profileImage,
                bannerUrl: user.bannerUrl,
                bio: user.bio,
                location: user.location,
                website: user.website,
                socialLinks: user.socialMedia,
                categories: user.categories,
                followersCount: user.followers.length,
                followingCount: user.following.length,
                badges: user.badges,
                isVerified: user.isVerified,
                isArtist: user.role === 'artist',
                isOrganization: user.role === 'company',
                isTrending: user.isTrending,
                isFollowing,
                totalLikes: stats.totalLikes,
                totalViews: stats.totalViews,
                organizationInfo: user.organizationInfo,
                createdAt: user.createdAt,
                patronTiers: user.patronTiers,
                patronsCount: user.patrons?.length || 0
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch user profile' });
    }
});



router.post('/:id/follow', auth, async (req: AuthRequest, res: Response) => {
    try {
        const targetId = req.params.id;
        const followerId = req.user!.id;

        if (targetId === followerId) return res.status(400).json({ success: false, message: 'Cannot follow yourself' });

        const user = await User.findById(targetId);
        const follower = await User.findById(followerId);

        if (!user || !follower) return res.status(404).json({ success: false, message: 'User not found' });

        if (user.followers.some(f => f.toString() === followerId)) {
            return res.status(400).json({ success: false, message: 'Already following' });
        }

        user.followers.push(new mongoose.Types.ObjectId(followerId));
        follower.following.push(new mongoose.Types.ObjectId(targetId));

        await user.save();
        await follower.save();

        res.json({
            success: true,
            message: 'Followed!',
            followersCount: user.followers.length
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to follow user' });
    }
});

router.post('/:id/unfollow', auth, async (req: AuthRequest, res: Response) => {
    try {
        const targetId = req.params.id;
        const followerId = req.user!.id;

        const user = await User.findById(targetId);
        const follower = await User.findById(followerId);

        if (!user || !follower) return res.status(404).json({ success: false, message: 'User not found' });

        user.followers = user.followers.filter(fId => fId.toString() !== followerId);
        follower.following = follower.following.filter(fId => fId.toString() !== targetId);

        await user.save();
        await follower.save();

        res.json({
            success: true,
            message: 'Unfollowed.',
            followersCount: user.followers.length
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to unfollow user' });
    }
});

router.get('/:id/followers', async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.params.id).populate('followers', 'username profileImage bio');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, followers: user.followers });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch followers' });
    }
});

router.get('/:id/following', async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.params.id).populate('following', 'username profileImage bio');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, following: user.following });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch following' });
    }
});

router.get('/:id/artworks', optionalAuth, async (req: AuthRequest, res: Response) => {
    try {
        const artworks = await Artwork.find({ artist: req.params.id })
            .populate('artist', 'username profileImage bio')
            .sort({ createdAt: -1 });

        const userId = req.user?.id;
        let savedArtworkIds: string[] = [];
        if (userId) {
            const user = await User.findById(userId).select('savedArtworks');
            if (user) savedArtworkIds = (user.savedArtworks || []).map(id => id.toString());
        }

        res.json({ 
            success: true, 
            artworks: artworks.map(artwork => {
                const safeLikes = (artwork.likes || []).filter(Boolean);
                const safeTrendVoters = (artwork.trendVoters || []).filter(Boolean);
                const safeComments = (artwork.comments || []).filter(Boolean);
                const artworkId = artwork._id.toString();

                return {
                    id: artworkId,
                    title: artwork.title,
                    description: artwork.description,
                    category: artwork.category,
                    mediaType: artwork.mediaType,
                    mediaUrl: artwork.mediaUrl,
                    thumbnailUrl: artwork.thumbnailUrl,
                    tags: artwork.tags,
                    artist: artwork.artist,
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
                    createdAt: artwork.createdAt
                };
            }) 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch user artworks' });
    }
});


router.post('/:id/trend', auth, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const targetId = req.params.id;

        if (userId !== targetId) {
            return res.status(403).json({ success: false, message: 'Only you can activate your own trend' });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        user.isTrending = true;
        user.trendingUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        await user.save();

        res.json({ success: true, message: 'Trending activated!', user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to activate trending' });
    }
});

router.post('/:id/vote-trend', auth, async (req: AuthRequest, res: Response) => {
    try {
        const targetId = req.params.id;
        const voterId = req.user!.id;

        const targetUser = await User.findById(targetId);
        if (!targetUser) return res.status(404).json({ success: false, message: 'Target user not found' });

        if (targetUser.trendVoters.some(v => v.toString() === voterId)) {
            return res.status(400).json({ success: false, message: 'You have already voted' });
        }

        targetUser.trendVoters.push(new mongoose.Types.ObjectId(voterId));
        targetUser.trendVotes = (targetUser.trendVotes || 0) + 1;
        await targetUser.save();

        res.json({ success: true, message: 'Vote recorded!', user: targetUser });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to record trend vote' });
    }
});

export default router;
