const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

// 1. 创建订单
router.post('/create', protect, orderController.createOrder);

// 2. 获取订单列表 (goods-list 符合API文档)
router.get('/goods-list', protect, orderController.getOrderList);

// 3. 获取订单详情
router.get('/detail/:orderNumber', protect, orderController.getOrderDetail);

// 4. 订单支付
router.post('/pay/:orderNumber', protect, orderController.payOrder);

// 5. 支付状态查询
router.get('/payment-status/:orderNumber', protect, orderController.getPaymentStatus);

// 6. 模拟支付成功 (开发测试用)
router.post('/mock-payment-success/:orderNumber', protect, orderController.mockPaymentSuccess);

// 7. 取消订单
router.post('/cancel/:orderNumber', protect, orderController.cancelOrder);

// 8. 确认收货
router.post('/confirm/:orderNumber', protect, orderController.confirmOrder);

// 9. 获取订单统计
router.get('/stats', protect, orderController.getOrderStats);

module.exports = router; 