const express = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const upload = require('../utils/fileUpload');

const router = express.Router();

// Registration validation
const registerValidation = [
  body('username').notEmpty().withMessage('用户名不能为空'),
  body('password').isLength({ min: 6 }).withMessage('密码长度不能少于6位'),
  body('phone').optional().isMobilePhone('zh-CN').withMessage('手机号格式不正确'),
  body('email').optional().isEmail().withMessage('邮箱格式不正确')
];

// Login validation
const loginValidation = [
  body('username').notEmpty().withMessage('用户名不能为空'),
  body('password').notEmpty().withMessage('密码不能为空')
];

// Phone verification code validation
const phoneVerificationValidation = [
  body('phone').notEmpty().withMessage('手机号不能为空')
    .isMobilePhone('zh-CN').withMessage('手机号格式不正确'),
  body('type').optional().isIn(['login', 'register']).withMessage('验证码类型不正确')
];

// Phone login validation
const phoneLoginValidation = [
  body('phone').notEmpty().withMessage('手机号不能为空')
    .isMobilePhone('zh-CN').withMessage('手机号格式不正确'),
  body('code').notEmpty().withMessage('验证码不能为空'),
  body('registerIfNotExists').optional().isBoolean().withMessage('registerIfNotExists必须是布尔值')
];

// Phone register validation
const phoneRegisterValidation = [
  body('phone').notEmpty().withMessage('手机号不能为空')
    .isMobilePhone('zh-CN').withMessage('手机号格式不正确'),
  body('code').notEmpty().withMessage('验证码不能为空'),
  body('nickname').optional().isLength({ min: 2, max: 20 }).withMessage('昵称长度应为2-20位')
];

// WeChat login validation
const wxLoginValidation = [
  body('code').notEmpty().withMessage('微信登录凭证不能为空')
];

// Profile update validation
const updateUserValidation = [
  body('nickname').optional().isLength({ min: 2, max: 20 }).withMessage('昵称长度应为2-20位'),
  body('phone').optional().isMobilePhone('zh-CN').withMessage('手机号格式不正确'),
  body('email').optional().isEmail().withMessage('邮箱格式不正确')
];

// Registration route
router.post('/register', registerValidation, userController.register);

// Login route
router.post('/login', loginValidation, userController.login);

// Send verification code route
router.post('/send-code', phoneVerificationValidation, userController.sendVerificationCode);

// Phone login route
router.post('/phone-login', phoneLoginValidation, userController.phoneLogin);

// Phone register route
router.post('/phone-register', phoneRegisterValidation, userController.phoneRegister);

// WeChat login route
router.post('/wxlogin', wxLoginValidation, userController.wxLogin);

// Get user info route (protected)
router.get('/info', protect, userController.getUserInfo);

// Update user info route (protected)
router.put('/update', protect, updateUserValidation, userController.updateUser);

// Upload avatar route (protected)
router.post('/upload-avatar', protect, upload.single('file'), userController.uploadAvatar);

// Logout route (protected)
router.post('/logout', protect, userController.logout);

module.exports = router;