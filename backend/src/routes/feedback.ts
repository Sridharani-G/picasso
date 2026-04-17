import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import Feedback from '../models/Feedback';
import User from '../models/User';
import { auth } from '../middleware/auth';

const router = express.Router();

// Setup upload storage for feedback attachments
const feedbackStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../uploads/feedback');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
    cb(null, unique);
  }
});

const feedbackUpload = multer({
  storage: feedbackStorage,
  limits: { fileSize: 300 * 1024 * 1024 }
});

// Upload feedback attachment
router.post('/upload', auth, feedbackUpload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    const hostUrl = `${req.protocol}://${req.get('host')}`;
    const fileUrl = `${hostUrl}/uploads/feedback/${req.file.filename}`;
    res.json({ success: true, url: fileUrl });
  } catch (error) {
    console.error('Feedback upload error:', error);
    res.status(500).json({ success: false, message: 'Failed to upload file', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Get all feedback and guidelines
router.get('/', async (req: Request, res: Response) => {
  try {
    const { artworkId, artistId, kind } = req.query;
    const filter: any = {};

    if (artworkId) filter.targetArtwork = artworkId;
    if (artistId) filter.targetArtist = artistId;
    if (kind) filter.kind = kind;

    const feedback = await Feedback.find(filter)
      .populate('user', 'username profileImage')
      .populate('targetArtwork', 'title artist')
      .populate('targetArtist', 'username profileImage')
      .sort({ createdAt: -1 });

    res.json({ success: true, feedback });
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: (error as Error).message });
  }
});

// Create feedback or guideline tip
router.post('/', auth, async (req: Request, res: Response) => {
  try {
    const {
      content,
      rating,
      mediaUrl,
      mediaType,
      kind = 'feedback',
      targetArtwork,
      targetArtist,
      threadLink
    } = req.body;

    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    if (!content) {
      return res.status(400).json({ success: false, message: 'Please provide content' });
    }

    if (kind === 'feedback' && (rating === undefined || rating === null)) {
      return res.status(400).json({ success: false, message: 'Please provide rating for feedback' });
    }

    const createData: any = {
      user: userId,
      content,
      kind,
      rating: kind === 'feedback' ? Number(rating) : 0,
      threadLink: threadLink || ''
    };

    if (mediaUrl) createData.mediaUrl = mediaUrl;
    if (mediaType) createData.mediaType = mediaType;
    if (targetArtwork) createData.targetArtwork = targetArtwork;
    if (targetArtist) createData.targetArtist = targetArtist;

    const feedback = await Feedback.create(createData);
    const populatedFeedback = await Feedback.findById(feedback._id)
      .populate('user', 'username profileImage')
      .populate('targetArtwork', 'title artist')
      .populate('targetArtist', 'username profileImage');

    res.status(201).json({ success: true, feedback: populatedFeedback });
  } catch (error) {
    console.error('Post feedback error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: (error as Error).message });
  }
});

export default router;
