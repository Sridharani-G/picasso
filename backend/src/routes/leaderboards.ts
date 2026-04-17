import { Router, Request, Response } from 'express';
import Artwork from '../models/Artwork';
import User from '../models/User';

const router = Router();



router.get('/weekly', async (req: Request, res: Response) => {
    try {
        const { category, weekOffset = 0 } = req.query;

        const now = new Date();
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);

        const startOfWeek = new Date(now.setDate(diff + (Number(weekOffset) * 7)));
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        let query: any = {};
        if (category) query.category = category;

        const topArtworksByTrending = await Artwork.aggregate([
            { $match: { ...query } },
            { $addFields: { trendingScore: { $ifNull: ["$trendVotes", 0] } } },
            { $sort: { trendingScore: -1 } },
            { $limit: 10 },
            { $lookup: { from: 'users', localField: 'artist', foreignField: '_id', as: 'artistInfo' } },
            { $unwind: '$artistInfo' },
            {
                $project: {
                    id: '$_id',
                    title: 1,
                    mediaUrl: 1,
                    category: 1,
                    trendVotes: { $ifNull: ["$trendVotes", 0] },
                    trendingScore: 1,
                    likes: { $size: { $ifNull: ['$likes', []] } },
                    comments: { $size: { $ifNull: ['$comments', []] } },
                    artist: {
                        id: '$artistInfo._id',
                        username: '$artistInfo.username',
                        profileImage: '$artistInfo.profileImage'
                    }
                }
            }
        ]);

        const topArtworksByLikes = await Artwork.aggregate([
            { $match: { ...query } },
            { $addFields: { likesCount: { $size: { $ifNull: ['$likes', []] } } } },
            { $sort: { likesCount: -1 } },
            { $limit: 10 },
            { $lookup: { from: 'users', localField: 'artist', foreignField: '_id', as: 'artistInfo' } },
            { $unwind: '$artistInfo' },
            {
                $project: {
                    id: '$_id',
                    title: 1,
                    mediaUrl: 1,
                    category: 1,
                    likes: { $size: { $ifNull: ['$likes', []] } },
                    comments: { $size: { $ifNull: ['$comments', []] } },
                    artist: {
                        id: '$artistInfo._id',
                        username: '$artistInfo.username',
                        profileImage: '$artistInfo.profileImage'
                    }
                }
            }
        ]);

        const topArtists = await User.aggregate([
            { $match: { role: 'artist' } },
            {
                $lookup: {
                    from: 'artworks',
                    localField: '_id',
                    foreignField: 'artist',
                    as: 'artworks'
                }
            },
            {
                $addFields: {
                    totalLikes: {
                        $sum: {
                            $map: {
                                input: "$artworks",
                                as: "art",
                                in: { $size: { $ifNull: ["$$art.likes", []] } }
                            }
                        }
                    },
                    totalComments: {
                        $sum: {
                            $map: {
                                input: "$artworks",
                                as: "art",
                                in: { $size: { $ifNull: ["$$art.comments", []] } }
                            }
                        }
                    },
                    totalViews: { $sum: "$artworks.views" },
                    totalArtworkTrends: { $sum: "$artworks.trendVotes" },
                    followersCount: { $size: { $ifNull: ["$followers", []] } }
                }
            },
            {
                $addFields: {
                    totalTrends: { $add: [{ $ifNull: ["$trendVotes", 0] }, "$totalArtworkTrends"] },
                    compositeScore: {
                        $add: [
                            { $multiply: [{ $add: [{ $ifNull: ["$trendVotes", 0] }, "$totalArtworkTrends"] }, 10] },
                            { $multiply: [{ $ifNull: ["$profileVisits", 0] }, 2] },
                            { $multiply: ["$followersCount", 5] },
                            { $multiply: ["$totalLikes", 1] },
                            { $multiply: ["$totalComments", 2] }
                        ]
                    }
                }
            },
            { $sort: { compositeScore: -1 } },
            { $limit: 10 },
            {
                $project: {
                    id: '$_id',
                    username: 1,
                    profileImage: 1,
                    compositeScore: 1,
                    profileVisits: { $ifNull: ["$profileVisits", 0] },
                    totalTrends: 1,
                    totalLikes: 1,
                    totalComments: 1,
                    totalViews: 1,
                    topArtwork: {
                        $let: {
                            vars: {
                                topArt: {
                                    $arrayElemAt: [
                                        {
                                            $filter: {
                                                input: {
                                                    $sortArray: {
                                                        input: "$artworks",
                                                        sortBy: { trendVotes: -1, views: -1 }
                                                    }
                                                },
                                                as: "a",
                                                cond: { $ne: ["$$a", null] }
                                            }
                                        },
                                        0
                                    ]
                                }
                            },
                            in: {
                                $cond: {
                                    if: { $ne: ["$$topArt", null] },
                                    then: {
                                        id: "$$topArt._id",
                                        title: "$$topArt.title",
                                        mediaUrl: "$$topArt.mediaUrl",
                                        category: "$$topArt.category",
                                        trendVotes: { $ifNull: ["$$topArt.trendVotes", 0] }
                                    },
                                    else: null
                                }
                            }
                        }
                    }
                }
            }
        ]);

        res.json({
            success: true,
            leaderboard: {
                byTips: topArtworksByTrending,
                byLikes: topArtworksByLikes,
                topArtists: topArtists
            },
            period: { start: startOfWeek, end: endOfWeek, weekOffset: Number(weekOffset) }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch weekly leaderboard' });
    }
});




router.get('/all-time', async (req: Request, res: Response) => {
    try {
        const { category } = req.query;
        let query: any = {};
        if (category) query.category = category;

        const topArtworks = await Artwork.aggregate([
            { $match: query },
            { $sort: { trendVotes: -1 } },
            { $limit: 20 },
            { $lookup: { from: 'users', localField: 'artist', foreignField: '_id', as: 'ar' } },
            { $unwind: '$ar' },
            {
                $project: {
                    id: '$_id',
                    title: 1,
                    mediaUrl: 1,
                    category: 1,
                    trendVotes: 1,
                    likes: { $size: { $ifNull: ['$likes', []] } },
                    views: 1,
                    artist: { id: '$ar._id', username: '$ar.username', profileImage: '$ar.profileImage' }
                }
            }
        ]);

        res.json({ success: true, leaderboard: { topArtworks, topArtists: [] } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch all-time leaderboard' });
    }
});

export default router;
