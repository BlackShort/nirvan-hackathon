import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  room: {
    type: String,
    required: true,
    enum: ['Emergency', 'Food Help', 'Education', 'Help', 'General'],
    index: true
  },
  username: {
    type: String,
    required: true,
    maxlength: 50
  },
  message: {
    type: String,
    required: true,
    maxlength: 1000
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  userId: {
    type: String,
    required: true
  },
  messageType: {
    type: String,
    enum: ['text', 'system'],
    default: 'text'
  }
}, {
  // Automatically delete messages older than 7 days
  expireAfterSeconds: 7 * 24 * 60 * 60 // 7 days in seconds
});

// Add compound index for efficient queries
messageSchema.index({ room: 1, timestamp: -1 });

// Add TTL index on timestamp field for automatic deletion after 7 days
messageSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60 });

export const Message = mongoose.model('Message', messageSchema);