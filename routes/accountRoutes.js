const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');
const auth = require('../middleware/auth');
const upload = require('../utils/fileUpload');

// 获取账户信息
router.get('/info', auth, accountController.getAccountInfo);

// 修改账户信息
router.put('/update', auth, accountController.updateAccount);

// 上传账户头像
router.post('/upload-avatar', auth, upload.single('file'), accountController.uploadAvatar);

// 获取账户余额
router.get('/balance', auth, accountController.getBalance);

// 获取账户积分
router.get('/points', auth, accountController.getPoints);

// 获取账户交易记录
router.get('/transactions', auth, accountController.getTransactions);

// 获取账户推荐人
router.get('/referrer', auth, accountController.getReferrer);

// 获取账户推荐人列表
router.get('/referrers', auth, accountController.getReferrers);

// 获取账户推荐人关系
router.get('/referrer-relation', auth, accountController.getReferrerRelation);

// 获取账户推荐人关系列表
router.get('/referrer-relations', auth, accountController.getReferrerRelations);

// 获取账户推荐人关系详情
router.get('/referrer-relation-detail', auth, accountController.getReferrerRelationDetail);

// 获取账户推荐人关系详情列表
router.get('/referrer-relation-details', auth, accountController.getReferrerRelationDetails);

module.exports = router;
