const express = require('express');
const { protect } = require('../middleware/auth');
const addressController = require('../controllers/addressController');
const router = express.Router();

// 1. 获取地址列表
router.get('/list', protect, addressController.getAddressList);

// 2. 新增地址
router.post('/add', protect, addressController.addAddress);

// 3. 更新地址
router.put('/update', protect, addressController.updateAddress);

// 4. 删除地址
router.delete('/delete', protect, addressController.deleteAddress);

// 5. 设置默认地址
router.put('/set-default', protect, addressController.setDefaultAddress);

// 6. 获取默认地址
router.get('/default', protect, addressController.getDefaultAddress);

module.exports = router; 