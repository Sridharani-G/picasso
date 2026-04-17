import { Router, Request, Response } from 'express';
import Artwork from '../models/Artwork';
import User from '../models/User';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
    try {
        const totalArtworks = await Artwork.countDocuments();
        const totalVisionaries = await User.countDocuments({ role: 'artist' });
        
        // Calculated resonance (likes + views + comments)
        const resonanceStats = await Artwork.aggregate([
            {
                $group: {
                    _id: null,
                    totalLikes: { $sum: { $size: { $ifNull: ["$likes", []] } } },
                    totalViews: { $sum: { $ifNull: ["$views", 0] } },
                    totalComments: { $sum: { $size: { $ifNull: ["$comments", []] } } }
                }
            }
        ]);

        const stats = resonanceStats[0] || { totalLikes: 0, totalViews: 0, totalComments: 0 };
        const totalResonance = stats.totalLikes + stats.totalViews + stats.totalComments;

        res.json({
            success: true,
            stats: {
                totalArtworks,
                totalVisionaries,
                totalResonance
            }
        });
    } catch (error) {
        console.error('Failed to fetch stats:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch global stats' });
    }
});

export default router;
