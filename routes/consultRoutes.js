const express = require('express');
const router = express.Router();
const consultController = require('../controllers/consultController');
const auth = require('../middleware/auth');

// 获取在线咨询服务列表
router.get('/services', consultController.getServices);

// 获取医生列表
router.get('/doctors', consultController.getDoctors);

// 获取医生详情
router.get('/doctors/:doctorId', consultController.getDoctorDetail);

// 发起咨询
router.post('/sessions', auth, consultController.createSession);

// 获取我的咨询记录
router.get('/sessions/my', auth, consultController.getMySessions);

// 获取咨询会话详情
router.get('/sessions/:sessionId', auth, consultController.getSessionDetail);

// 发送消息
router.post('/sessions/:sessionId/messages', auth, consultController.sendMessage);

// 结束咨询
router.post('/sessions/:sessionId/end', auth, consultController.endSession);

// 咨询评价
router.post('/sessions/:sessionId/rating', auth, consultController.rateSession);

module.exports = router;
