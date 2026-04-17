import { Router, Response } from 'express';
import multer from 'multer';
import { auth, AuthRequest } from '../middleware/auth';
import { uploadToCloudinary } from '../utils/cloudinary';
import path from 'path';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * @route   GET /api/media/gifs/trending
 * @desc    Fetch trending GIFs from Giphy
 */
router.get('/gifs/trending', auth, async (req: AuthRequest, res: Response) => {
  try {
    const apiKey = process.env.GIPHY_API_KEY;
    if (!apiKey) return res.status(500).json({ success: false, message: 'Giphy not configured' });

    const response = await fetch(`https://api.giphy.com/v1/gifs/trending?api_key=${apiKey}&limit=20&rating=g`);
    const data = await response.json() as any;

    const gifs = (data.data || []).map((gif: any) => ({
      id: gif.id,
      url: gif.images.fixed_height.url,
      title: gif.title
    }));

    res.json({ success: true, gifs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Giphy fetch failed', error: (error as Error).message });
  }
});

/**
 * @route   GET /api/media/gifs/search
 * @desc    Search GIFs on Giphy
 */
router.get('/gifs/search', auth, async (req: AuthRequest, res: Response) => {
  try {
    const { q } = req.query;
    const apiKey = process.env.GIPHY_API_KEY;
    if (!apiKey) return res.status(500).json({ success: false, message: 'Giphy not configured' });

    const response = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${q}&limit=20&rating=g`);
    const data = await response.json() as any;

    const gifs = (data.data || []).map((gif: any) => ({
      id: gif.id,
      url: gif.images.fixed_height.url,
      title: gif.title
    }));

    res.json({ success: true, gifs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Giphy search failed', error: (error as Error).message });
  }
});

/**
 * @route   POST /api/media/upload
 * @desc    Upload chat attachment to Cloudinary
 */
router.post('/upload', auth, upload.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Convert buffer to data URI for Cloudinary
    const base64File = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    const folder = 'chat_attachments';
    
    const secureUrl = await uploadToCloudinary(base64File, folder);

    res.json({ 
      success: true, 
      url: secureUrl,
      mimetype: req.file.mimetype,
      size: req.file.size
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Upload failed', error: (error as Error).message });
  }
});

export default router;
