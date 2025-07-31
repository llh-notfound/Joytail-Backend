const express = require('express');
const router = express.Router();
const insuranceController = require('../controllers/insuranceController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// 获取保险产品列表
router.get('/products', insuranceController.getProducts);

// 获取保险产品详情
router.get('/products/:productId', insuranceController.getProductDetail);

// 上传保险条款图片
router.post('/products/:productId/terms-image', auth.protect, upload.uploadInsuranceDoc, insuranceController.uploadTermsImage);

// 上传理赔流程图片
router.post('/products/:productId/claim-process-image', auth.protect, upload.uploadInsuranceDoc, insuranceController.uploadClaimProcessImage);

// 获取保险报价
router.post('/quote', auth.protect, insuranceController.getQuote);

// 购买保险
router.post('/purchase', auth.protect, insuranceController.purchase);

// 获取我的保单列表
router.get('/policies/my', auth.protect, insuranceController.getMyPolicies);

// 获取保单详情
router.get('/policies/:policyId', auth.protect, insuranceController.getPolicyDetail);

// 提交理赔申请
router.post('/claims', auth.protect, insuranceController.submitClaim);

// 获取理赔记录
router.get('/claims/my', auth.protect, insuranceController.getMyClaims);

// 获取理赔详情
router.get('/claims/:claimId', auth.protect, insuranceController.getClaimDetail);

// 续保
router.post('/policies/:policyId/renew', auth.protect, insuranceController.renewPolicy);

// 取消保单
router.post('/policies/:policyId/cancel', auth.protect, insuranceController.cancelPolicy);

// 获取保险常见问题
router.get('/faq', insuranceController.getFAQ);

module.exports = router;