const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const feedbackController = require('../controllers/feedbackController');

const router = express.Router();

// Feedback validation
const feedbackValidation = [
  body('type').notEmpty().withMessage('反馈类型不能为空'),
  body('content').notEmpty().withMessage('反馈内容不能为空').isLength({ max: 500 }).withMessage('反馈内容不能超过500字'),
  body('images').optional().isArray().withMessage('图片格式不正确')
];

// Submit feedback
router.post('/submit', protect, feedbackValidation, feedbackController.submitFeedback);

module.exports = router; 