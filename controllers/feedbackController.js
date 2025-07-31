const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');
const { getRedisClient } = require('../config/redis');

const redisClient = getRedisClient();

// 添加一个辅助函数来检查连接状态
const ensureConnection = async () => {
  if (!redisClient.isOpen) {
    console.log('Redis client not connected, attempting to connect...');
    await redisClient.connect();
    console.log('Redis client connected');
  }
};

// Submit feedback
exports.submitFeedback = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        code: 400,
        message: errors.array()[0].msg,
        data: null
      });
    }
    
    await ensureConnection();
    
    const { userId } = req.user;
    const { type, content, images } = req.body;
    
    // Create feedback object
    const feedbackId = uuidv4();
    const feedback = {
      id: feedbackId,
      userId,
      type,
      content,
      images: images || [],
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    // Save feedback to Redis
    await redisClient.hSet('feedback', feedbackId, JSON.stringify(feedback));
    
    // Add feedback ID to user's feedback list
    const userFeedbackKey = `user:${userId}:feedback`;
    await redisClient.lPush(userFeedbackKey, feedbackId);
    
    return res.status(200).json({
      code: 200,
      message: '提交成功',
      data: {
        id: feedbackId
      }
    });
  } catch (error) {
    console.error('Submit feedback error:', error);
    return res.status(500).json({
      code: 500,
      message: '服务器错误',
      data: null
    });
  }
}; 