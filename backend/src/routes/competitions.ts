import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import Competition from '../models/Competition';
import Artwork from '../models/Artwork';
import User from '../models/User';
import { auth, AuthRequest } from '../middleware/auth';

const router = Router();
router.get('/', async (req: Request, res: Response) => {
    try {
        const { category, status = 'active', search } = req.query;
        let query: any = {};

        if (category) query.category = category;
        if (status === 'active') query.isActive = true;
        if (status === 'ended') query.isActive = false;
        if (search) query.title = { $regex: search as string, $options: 'i' };

        const competitions = await Competition.find(query).sort({ createdAt: -1 });

        res.json({
            success: true,
            competitions: competitions.map(comp => ({
                id: comp._id,
                title: comp.title,
                description: comp.description,
                category: comp.category,
                startDate: comp.startDate,
                endDate: comp.endDate,
                submissionDeadline: comp.submissionDeadline,
                votingStartDate: comp.votingStartDate,
                votingEndDate: comp.votingEndDate,
                prizePool: comp.prizePool,
                entryFee: comp.entryFee,
                maxParticipants: comp.maxParticipants,
                participantCount: comp.participants.length,
                isActive: comp.isActive,
                isVotingOpen: comp.isVotingOpen,
                createdAt: comp.createdAt
            }))
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch competitions' });
    }
});
router.get('/:id', async (req: Request, res: Response) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid ID' });
        }

        const competition = await Competition.findById(req.params.id)
            .populate('participants.user', 'username profileImage')
            .populate('participants.artwork', 'title mediaUrl thumbnailUrl');

        if (!competition) return res.status(404).json({ success: false, message: 'Competition not found' });

        res.json({
            success: true,
            competition: {
                id: competition._id,
                title: competition.title,
                description: competition.description,
                category: competition.category,
                startDate: competition.startDate,
                endDate: competition.endDate,
                submissionDeadline: competition.submissionDeadline,
                votingStartDate: competition.votingStartDate,
                votingEndDate: competition.votingEndDate,
                prizePool: competition.prizePool,
                entryFee: competition.entryFee,
                maxParticipants: competition.maxParticipants,
                participantCount: competition.participants.length,
                participants: competition.participants.map(p => ({
                    user: p.user,
                    artwork: p.artwork,
                    submissionDate: p.submissionDate
                })),
                winners: competition.winners,
                isActive: competition.isActive,
                isVotingOpen: competition.isVotingOpen,
                createdAt: competition.createdAt
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch competition' });
    }
});
router.post('/:id/submit', auth, async (req: AuthRequest, res: Response) => {
    try {
        const { artworkId } = req.body;
        const userId = req.user?.id;

        if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

        const competition = await Competition.findById(req.params.id);
        if (!competition) return res.status(404).json({ success: false, message: 'Competition not found' });

        if (new Date() > competition.submissionDeadline) {
            return res.status(400).json({ success: false, message: 'Submission deadline passed' });
        }

        if (competition.participants.length >= competition.maxParticipants) {
            return res.status(400).json({ success: false, message: 'Maximum participants reached' });
        }

        const existingSubmission = competition.participants.some(p => p.user.toString() === userId);
        if (existingSubmission) {
            return res.status(400).json({ success: false, message: 'Already submitted' });
        }

        const artwork = await Artwork.findById(artworkId);
        if (!artwork || artwork.artist.toString() !== userId) {
            return res.status(400).json({ success: false, message: 'Invalid artwork owner' });
        }

        competition.participants.push({
            user: new mongoose.Types.ObjectId(userId),
            artwork: new mongoose.Types.ObjectId(artworkId),
            submissionDate: new Date()
        });

        await competition.save();

        res.json({
            success: true,
            message: 'Artwork submitted successfully',
            participantCount: competition.participants.length
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Submission failed' });
    }
});

router.post('/:id/vote', auth, async (req: AuthRequest, res: Response) => {
    try {
        const { artworkId, rating } = req.body;
        const userId = req.user?.id;

        if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

        const competition = await Competition.findById(req.params.id);
        if (!competition) return res.status(404).json({ success: false, message: 'Competition not found' });

        if (!competition.isVotingOpen || new Date() > competition.votingEndDate) {
            return res.status(400).json({ success: false, message: 'Voting is not open for this competition' });
        }

        const validRating = Number(rating) || 1;
        if (validRating < 1 || validRating > 5) {
            return res.status(400).json({ success: false, message: 'Invalid vote rating' });
        }

        const existingVote = competition.votes.find(v => v.voter.toString() === userId && v.artwork.toString() === artworkId);
        
        if (existingVote) {
             existingVote.vote = validRating;
             existingVote.timestamp = new Date();
        } else {
            competition.votes.push({
                voter: new mongoose.Types.ObjectId(userId),
                artwork: new mongoose.Types.ObjectId(artworkId),
                vote: validRating,
                timestamp: new Date()
            });
        }

        await competition.save();

        res.json({
            success: true,
            message: 'Vote registered successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Voting failed', error: (error as Error).message });
    }
});

export default router;
