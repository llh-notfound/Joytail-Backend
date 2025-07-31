const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const auth = require('../middleware/auth');

// 1. 获取购物车列表
router.get('/list', auth, cartController.getCartList);

// 2. 添加商品到购物车
router.post('/add', auth, cartController.addToCart);

// 3. 更新购物车商品数量
router.put('/update', auth, cartController.updateCartItem);

// 4. 更新购物车商品选中状态
router.put('/select', auth, cartController.updateCartItemSelected);

// 5. 全选/取消全选
router.put('/select-all', auth, cartController.selectAllCartItems);

// 6. 删除购物车商品
router.delete('/delete', auth, cartController.deleteCartItems);

module.exports = router; 