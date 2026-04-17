import express from 'express';
import Asset from '../models/Asset';

const router = express.Router();

// Get all assets
router.get('/', async (req, res) => {
  try {
    const { type, category } = req.query;
    const query: any = {};
    if (type) query.type = type;
    if (category) query.category = category;
    
    const assets = await Asset.find(query).sort({ downloads: -1 });
    res.json(assets);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Get single asset
router.get('/:id', async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) return res.status(404).json({ message: 'Asset not found' });
    res.json(asset);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Increment download count
router.post('/:id/download', async (req, res) => {
  try {
    const asset = await Asset.findByIdAndUpdate(req.params.id, { $inc: { downloads: 1 } }, { new: true });
    res.json(asset);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Temporary Seed Endpoint
router.post('/emergency-seed', async (req, res) => {
    const assets = [
        { name: 'G-Pen', type: 'brush', category: 'Ink', description: 'Pro manga inking.', config: { size: 5, opacity: 1, stabilization: 12 } },
        { name: 'Dense Watercolor', type: 'brush', category: 'Paint', description: 'Rich pigment.', config: { size: 25, opacity: 0.6, stabilization: 5 } },
        { name: 'Soft Smudge', type: 'blender', category: 'Blender', description: 'Smears pigment.', config: { size: 30, opacity: 0.5, stabilization: 5 } },
        { name: 'Blur Brush', type: 'blender', category: 'Blender', description: 'Gaussian blur.', config: { size: 50, opacity: 0.4, stabilization: 5 } },
        { name: 'Kneaded Eraser', type: 'eraser', category: 'Eraser', description: 'Soft eraser.', config: { size: 20, opacity: 0.5, stabilization: 5 } }
    ];
    try {
        await Asset.deleteMany({});
        const seeded = await Asset.insertMany(assets);
        res.json({ message: 'Seeded', count: seeded.length });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
