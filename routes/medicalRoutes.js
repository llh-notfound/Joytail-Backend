const express = require('express');
const router = express.Router();
const medicalController = require('../controllers/medicalController');

// 获取医院列表
router.get('/hospitals', medicalController.getHospitals);

// 获取医院详情
router.get('/hospitals/:id', medicalController.getHospitalDetail);

// 初始化医院数据（可选，用于管理员初始化数据）
router.post('/hospitals/initialize', medicalController.initializeHospitals);

module.exports = router;
