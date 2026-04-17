import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import Chat from '../models/Chat';
import User from '../models/User';
import { auth, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(auth);

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const chats = await Chat.find({ participants: userId })
      .populate('participants', 'username profileImage role')
      .populate('messages.sender', 'username profileImage')
      .sort({ lastMessageTime: -1 });

    res.json({ success: true, chats });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch chats', error: (error as Error).message });
  }
});

router.get('/:chatId', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const chat = await Chat.findById(req.params.chatId)
      .populate('participants', 'username profileImage role')
      .populate('messages.sender', 'username profileImage');
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });
    if (!chat.participants.some((participant: any) => participant._id.toString() === userId)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    res.json({ success: true, chat });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch chat', error: (error as Error).message });
  }
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { participants = [], isGroup = false, groupName } = req.body;
    if (!Array.isArray(participants) || participants.length === 0) {
      return res.status(400).json({ success: false, message: 'Participants are required' });
    }

    const creationIds = participants
      .filter((id: string) => mongoose.Types.ObjectId.isValid(id))
      .map((id: string) => new mongoose.Types.ObjectId(id));

    const currentUserId = new mongoose.Types.ObjectId(userId);
    if (!creationIds.some((id: mongoose.Types.ObjectId) => id.equals(currentUserId))) {
      creationIds.push(currentUserId);
    }

    let chat = null;
    if (!isGroup && creationIds.length === 2) {
      chat = await Chat.findOne({
        isGroup: false,
        participants: { $all: creationIds }
      });
    }

    if (!chat) {
      chat = new Chat({
        participants: creationIds,
        isGroup,
        groupName: isGroup ? groupName : undefined,
        lastMessage: '',
        lastMessageTime: new Date()
      });
      await chat.save();
    }

    await chat.populate('participants', 'username profileImage role');
    await chat.populate('messages.sender', 'username profileImage');
    res.status(201).json({ success: true, chat });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create chat', error: (error as Error).message });
  }
});

router.post('/:chatId/messages', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { content, messageType = 'text', mediaUrl } = req.body;
    if (!content && !mediaUrl) {
      return res.status(400).json({ success: false, message: 'Message content or mediaUrl is required' });
    }

    const chat = await Chat.findById(req.params.chatId);
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });

    if (!chat.participants.some((participant) => participant.toString() === userId)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const message = {
      sender: new mongoose.Types.ObjectId(userId),
      content,
      messageType,
      mediaUrl,
      timestamp: new Date(),
      readBy: [new mongoose.Types.ObjectId(userId)]
    };

    chat.messages.push(message);
    chat.lastMessage = content || 'Sent a message';
    chat.lastMessageTime = new Date();
    await chat.save();

    await chat.populate('participants', 'username profileImage role');
    await chat.populate('messages.sender', 'username profileImage');
    res.status(201).json({ success: true, chat });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to send message', error: (error as Error).message });
  }
});

export default router;
