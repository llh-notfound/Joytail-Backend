const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { getRedisClient } = require('../config/redis');
const jwtConfig = require('../config/jwt');
const smsService = require('../utils/smsService');

const redisClient = getRedisClient();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn });
};

// 添加一个辅助函数来检查连接状态
const ensureConnection = async () => {
  if (!redisClient.isOpen) {
    console.log('Redis client not connected, attempting to connect...');
    await redisClient.connect();
    console.log('Redis client connected');
  }
};

// User registration
exports.register = async (req, res) => {
  try {
    await ensureConnection();
    
    const { username, password, phone, email } = req.body;
    
    // 验证必填字段
    if (!username || !password) {
      return res.status(400).json({
        code: 400,
        message: "用户名和密码不能为空",
        data: null
      });
    }

    // 验证密码长度
    if (password.length < 6) {
      return res.status(400).json({
        code: 400,
        message: "密码长度不能少于6位",
        data: null
      });
    }
    
    // Check if username already exists
    const existingUser = await redisClient.hGet('users', username);
    if (existingUser) {
      return res.status(400).json({
        code: 400,
        message: '用户名已存在',
        data: null
      });
    }
    
    // Check if phone is already registered
    if (phone) {
      const phoneKey = `phone:${phone}`;
      const existingPhone = await redisClient.get(phoneKey);
      if (existingPhone) {
        return res.status(400).json({
          code: 400,
          message: '手机号已注册',
          data: null
        });
      }
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user object
    const userId = uuidv4();
    const newUser = {
      userId,
      username,
      password: hashedPassword,
      phone,
      email,
      nickname: username,
      avatar: '',
      memberLevel: 'normal',
      petAvatar: '',
      points: 0,
      coupons: 0,
      createdAt: Date.now()
    };
    
    // Save user to Redis
    await redisClient.hSet('users', username, JSON.stringify(newUser));
    await redisClient.hSet('userIds', userId, username);
    
    // If phone number is provided, save the mapping
    if (phone) {
      const phoneKey = `phone:${phone}`;
      await redisClient.set(phoneKey, userId);
    }
    
    // Generate token
    const token = generateToken(userId);
    
    return res.status(200).json({
      code: 200,
      message: '注册成功',
      data: {
        userId,
        token,
        isNewUser: true
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      code: 500,
      message: '服务器错误',
      data: null
    });
  }
};

// User login
exports.login = async (req, res) => {
  try {
    await ensureConnection();
    
    const { username, password } = req.body;
    
    // 验证必填字段
    if (!username || !password) {
      return res.status(400).json({
        code: 400,
        message: "用户名和密码不能为空",
        data: null
      });
    }
    
    // Find user
    const userData = await redisClient.hGet('users', username);
    if (!userData) {
      return res.status(401).json({
        code: 401,
        message: '用户名或密码错误',
        data: null
      });
    }
    
    const user = JSON.parse(userData);
    
    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        code: 401,
        message: '用户名或密码错误',
        data: null
      });
    }
    
    // Generate token
    const token = generateToken(user.userId);
    
    return res.status(200).json({
      code: 200,
      message: '登录成功',
      data: {
        userId: user.userId,
        token,
        nickname: user.nickname || user.username,
        avatar: user.avatar || '',
        memberLevel: user.memberLevel || 'basic',
        petAvatar: user.petAvatar || ''
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      code: 500,
      message: '服务器错误',
      data: null
    });
  }
};

// Send verification code for phone login/register
exports.sendVerificationCode = async (req, res) => {
  try {
    await ensureConnection();
    
    const { phone, type = 'login' } = req.body;
    
    if (!phone) {
      return res.status(400).json({
        code: 400,
        message: '手机号不能为空',
        data: null
      });
    }
    
    // 检查手机号格式 (简单验证，实际项目可能需要更复杂的验证)
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        code: 400,
        message: '手机号格式不正确',
        data: null
      });
    }
    
    // 如果是注册验证码，检查手机号是否已被注册
    if (type === 'register') {
      const { exists } = await smsService.checkPhoneExists(phone);
      if (exists) {
        return res.status(400).json({
          code: 400,
          message: '该手机号已注册',
          data: null
        });
      }
    }
    
    // 发送验证码
    const result = await smsService.sendVerificationCode(phone, type);
    
    if (!result.success) {
      return res.status(400).json({
        code: 400,
        message: result.message,
        data: null
      });
    }
    
    return res.status(200).json({
      code: 200,
      message: '验证码发送成功',
      data: {
        // 注意：实际环境中不应该返回验证码，这里是为了方便测试
        code: process.env.NODE_ENV === 'development' ? result.code : undefined
      }
    });
  } catch (error) {
    console.error('Send verification code error:', error);
    return res.status(500).json({
      code: 500,
      message: '服务器错误',
      data: null
    });
  }
};

// Phone verification code login
exports.phoneLogin = async (req, res) => {
  try {
    await ensureConnection();
    
    const { phone, code, registerIfNotExists = false } = req.body;
    
    if (!phone || !code) {
      return res.status(400).json({
        code: 400,
        message: '手机号和验证码不能为空',
        data: null
      });
    }
    
    // 验证验证码
    const isCodeValid = await smsService.verifyCode(phone, code, 'login');
    if (!isCodeValid) {
      return res.status(401).json({
        code: 401,
        message: '验证码错误或已过期',
        data: null
      });
    }
    
    // 检查手机号是否已注册
    const { exists, userId, username } = await smsService.checkPhoneExists(phone);
    
    let user;
    let token;
    let isNewUser = false;
    
    if (exists) {
      // 用户已存在，直接登录
      const userData = await redisClient.hGet('users', username);
      user = JSON.parse(userData);
      token = generateToken(userId);
    } else if (registerIfNotExists) {
      // 用户不存在，创建新用户
      isNewUser = true;
      
      // 生成随机用户名
      const randomUsername = `user_${Math.floor(Math.random() * 1000000)}`;
      
      // 创建新用户
      const newUserId = uuidv4();
      const newUser = {
        userId: newUserId,
        username: randomUsername,
        phone,
        nickname: `用户${phone.substring(7)}`,
        avatar: '',
        memberLevel: 'normal',
        petAvatar: '',
        points: 0,
        coupons: 0,
        createdAt: Date.now()
      };
      
      // 保存用户到Redis
      await redisClient.hSet('users', randomUsername, JSON.stringify(newUser));
      await redisClient.hSet('userIds', newUserId, randomUsername);
      
      // 关联手机号与用户ID
      const phoneKey = `phone:${phone}`;
      await redisClient.set(phoneKey, newUserId);
      
      user = newUser;
      token = generateToken(newUserId);
    } else {
      // 用户不存在，且不自动注册
      return res.status(404).json({
        code: 404,
        message: '该手机号未注册',
        data: null
      });
    }
    
    return res.status(200).json({
      code: 200,
      message: '登录成功',
      data: {
        userId: user.userId,
        token,
        nickname: user.nickname,
        avatar: user.avatar,
        memberLevel: user.memberLevel,
        petAvatar: user.petAvatar,
        isNewUser
      }
    });
  } catch (error) {
    console.error('Phone login error:', error);
    return res.status(500).json({
      code: 500,
      message: '服务器错误',
      data: null
    });
  }
};

// Phone verification code register
exports.phoneRegister = async (req, res) => {
  try {
    await ensureConnection();
    
    const { phone, code, nickname } = req.body;
    
    if (!phone || !code) {
      return res.status(400).json({
        code: 400,
        message: '手机号和验证码不能为空',
        data: null
      });
    }
    
    // 检查手机号是否已注册
    const { exists } = await smsService.checkPhoneExists(phone);
    if (exists) {
      return res.status(400).json({
        code: 400,
        message: '该手机号已注册',
        data: null
      });
    }
    
    // 验证验证码
    const isCodeValid = await smsService.verifyCode(phone, code, 'register');
    if (!isCodeValid) {
      return res.status(401).json({
        code: 401,
        message: '验证码错误或已过期',
        data: null
      });
    }
    
    // 生成随机用户名
    const randomUsername = `user_${Math.floor(Math.random() * 1000000)}`;
    
    // 创建新用户
    const userId = uuidv4();
    const newUser = {
      userId,
      username: randomUsername,
      phone,
      nickname: nickname || `用户${phone.substring(7)}`,
      avatar: '',
      memberLevel: 'normal',
      petAvatar: '',
      points: 0,
      coupons: 0,
      createdAt: Date.now()
    };
    
    // 保存用户到Redis
    await redisClient.hSet('users', randomUsername, JSON.stringify(newUser));
    await redisClient.hSet('userIds', userId, randomUsername);
    
    // 关联手机号与用户ID
    const phoneKey = `phone:${phone}`;
    await redisClient.set(phoneKey, userId);
    
    // 生成token
    const token = generateToken(userId);
    
    return res.status(200).json({
      code: 200,
      message: '注册成功',
      data: {
        userId,
        token,
        nickname: newUser.nickname,
        isNewUser: true
      }
    });
  } catch (error) {
    console.error('Phone register error:', error);
    return res.status(500).json({
      code: 500,
      message: '服务器错误',
      data: null
    });
  }
};

// WeChat login
exports.wxLogin = async (req, res) => {
  try {
    await ensureConnection();
    
    const { code, userInfo } = req.body;
    
    if (!code) {
      return res.status(400).json({
        code: 400,
        message: "微信登录凭证不能为空",
        data: null
      });
    }

    // 模拟微信API调用获取openid
    // 实际项目中需要调用微信API: https://api.weixin.qq.com/sns/jscode2session
    const mockOpenId = `wx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 检查是否已有用户
    const existingUserData = await redisClient.get(`wx:${mockOpenId}`);
    let isNewUser = !existingUserData;
    let user;
    
    if (existingUserData) {
      // 现有用户
      user = JSON.parse(existingUserData);
    } else {
      // 新用户注册
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const username = `wx_${mockOpenId.substr(-8)}`;
      
      user = {
        userId,
        username,
        nickname: userInfo?.nickName || username,
        avatar: userInfo?.avatarUrl || '',
        gender: userInfo?.gender || 0,
        openId: mockOpenId,
        memberLevel: 'basic',
        petAvatar: '',
        phone: '',
        email: '',
        points: 0,
        coupons: 0,
        createdAt: new Date().toISOString()
      };
      
      // 保存用户数据
      await redisClient.hSet('users', username, JSON.stringify(user));
      await redisClient.set(`wx:${mockOpenId}`, JSON.stringify(user));
    }
    
    // 生成JWT token
    const token = generateToken(user.userId);
    
    return res.status(200).json({
      code: 200,
      message: "登录成功",
      data: {
        userId: user.userId,
        token,
        isNewUser
      }
    });
    
  } catch (error) {
    console.error('WeChat login error:', error);
    return res.status(500).json({
      code: 500,
      message: "服务器错误",
      data: null
    });
  }
};

// Get user info
exports.getUserInfo = async (req, res) => {
  try {
    await ensureConnection();
    
    const { userId } = req.user;
    
    // Get username from userId
    const username = await redisClient.hGet('userIds', userId);
    if (!username) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在',
        data: null
      });
    }
    
    // Get user data
    const userData = await redisClient.hGet('users', username);
    if (!userData) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在',
        data: null
      });
    }
    
    const user = JSON.parse(userData);
    
    // Remove sensitive information
    const { password, ...userInfo } = user;
    
    return res.status(200).json({
      code: 200,
      message: 'success',
      data: userInfo
    });
  } catch (error) {
    console.error('Get user info error:', error);
    return res.status(500).json({
      code: 500,
      message: '服务器错误',
      data: null
    });
  }
};

// Update user info
exports.updateUser = async (req, res) => {
  try {
    await ensureConnection();
    
    const { userId } = req.user;
    const { nickname, avatar, phone, email } = req.body;
    
    // Get username from userId
    const username = await redisClient.hGet('userIds', userId);
    if (!username) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在',
        data: null
      });
    }
    
    // Get user data
    const userData = await redisClient.hGet('users', username);
    if (!userData) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在',
        data: null
      });
    }
    
    const user = JSON.parse(userData);
    
    // 检查手机号是否已被其他用户使用
    if (phone && phone !== user.phone) {
      const { exists, userId: existingUserId } = await smsService.checkPhoneExists(phone);
      if (exists && existingUserId !== userId) {
        return res.status(400).json({
          code: 400,
          message: '该手机号已被其他用户使用',
          data: null
        });
      }
      
      // 更新手机号关联
      if (user.phone) {
        // 移除旧手机号关联
        await redisClient.del(`phone:${user.phone}`);
      }
      
      // 添加新手机号关联
      await redisClient.set(`phone:${phone}`, userId);
    }
    
    // Update user data
    if (nickname) user.nickname = nickname;
    if (avatar) user.avatar = avatar;
    if (phone) user.phone = phone;
    if (email) user.email = email;
    
    // Save updated user
    await redisClient.hSet('users', username, JSON.stringify(user));
    
    return res.status(200).json({
      code: 200,
      message: '更新成功',
      data: {
        userId: user.userId,
        nickname: user.nickname,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    return res.status(500).json({
      code: 500,
      message: '服务器错误',
      data: null
    });
  }
};

// Upload avatar
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        code: 400,
        message: '未上传文件',
        data: null
      });
    }
    
    // Get file URL
    const fileUrl = `/uploads/user/${req.file.filename}`;
    
    return res.status(200).json({
      code: 200,
      message: '上传成功',
      data: {
        url: fileUrl
      }
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    return res.status(500).json({
      code: 500,
      message: '服务器错误',
      data: null
    });
  }
};

// User logout
exports.logout = async (req, res) => {
  // In a real app, we might want to invalidate the token
  // For this implementation, we'll just return success
  
  return res.status(200).json({
    code: 200,
    message: '登出成功'
  });
};