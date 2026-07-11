import Message from '../models/Message.model.js';
import { NotFoundError, AuthorizationError } from '../utils/errors.js';

// ─── Send Message ────────────────────────────────────────────────────────────

export const sendMessage = async (senderId, { recipientId, tourId, content }) => {
  const message = await Message.create({
    sender:    senderId,
    recipient: recipientId,
    tour:      tourId || null,
    content,
  });
  return message.populate(['sender', 'recipient', 'tour']);
};

// ─── Get Conversation ────────────────────────────────────────────────────────

export const getConversation = async (userId, otherUserId, { page = 1, limit = 30 } = {}) => {
  const skip = (page - 1) * limit;
  const filter = {
    $or: [
      { sender: userId, recipient: otherUserId },
      { sender: otherUserId, recipient: userId },
    ],
  };

  const [messages, total] = await Promise.all([
    Message.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate(['sender', 'recipient']),
    Message.countDocuments(filter),
  ]);

  // Mark incoming messages as read
  await Message.updateMany(
    { sender: otherUserId, recipient: userId, isRead: false },
    { isRead: true }
  );

  return { messages, total, page, totalPages: Math.ceil(total / limit) };
};

// ─── Get My Conversations (inbox) ────────────────────────────────────────────

export const getMyConversations = async (userId) => {
  // Get the latest message from each unique conversation partner
  const conversations = await Message.aggregate([
    {
      $match: {
        $or: [{ sender: userId }, { recipient: userId }],
      },
    },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: {
          $cond: [
            { $lt: ['$sender', '$recipient'] },
            { a: '$sender', b: '$recipient' },
            { a: '$recipient', b: '$sender' },
          ],
        },
        lastMessage: { $first: '$$ROOT' },
      },
    },
    { $replaceRoot: { newRoot: '$lastMessage' } },
    {
      $lookup: { from: 'users', localField: 'sender', foreignField: '_id', as: 'senderData' },
    },
    {
      $lookup: { from: 'users', localField: 'recipient', foreignField: '_id', as: 'recipientData' },
    },
    { $unwind: '$senderData' },
    { $unwind: '$recipientData' },
  ]);

  return conversations;
};

// ─── Unread Message Count ────────────────────────────────────────────────────

export const getUnreadCount = async (userId) => {
  return Message.countDocuments({ recipient: userId, isRead: false });
};
