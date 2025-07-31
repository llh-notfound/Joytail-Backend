const { getRedisClient } = require('../config/redis');

const redisClient = getRedisClient();

// 添加一个辅助函数来检查连接状态
const ensureConnection = async () => {
  if (!redisClient.isOpen) {
    console.log('Redis client not connected, attempting to connect...');
    await redisClient.connect();
    console.log('Redis client connected');
  }
};

// 获取账户信息
exports.getAccountInfo = async (req, res) => {
  try {
    await ensureConnection();
    
    const { userId } = req.user;
    
    // 获取用户基本信息
    const userData = await redisClient.hGet('users', `user:${userId}`) || 
                     await redisClient.get(`user:id:${userId}`);
    
    if (!userData) {
      return res.status(404).json({
        code: 404,
        message: "用户不存在",
        data: null
      });
    }

    const user = JSON.parse(userData);
    
    // 获取账户额外信息
    const accountInfo = {
      userId: user.userId,
      nickname: user.nickname || user.username,
      avatar: user.avatar || '',
      memberLevel: user.memberLevel || 'basic',
      petAvatar: user.petAvatar || '',
      phone: user.phone || '',
      email: user.email || '',
      points: user.points || 0,
      coupons: user.coupons || 0
    };

    res.status(200).json({
      code: 200,
      message: "success",
      data: accountInfo
    });

  } catch (error) {
    console.error('获取账户信息失败:', error);
    res.status(500).json({
      code: 500,
      message: "服务器内部错误",
      data: null
    });
  }
};

// 修改账户信息
exports.updateAccount = async (req, res) => {
  try {
    await ensureConnection();
    
    const { userId } = req.user;
    const { nickname, avatar, phone, email } = req.body;
    
    // 获取当前用户信息
    const userData = await redisClient.hGet('users', `user:${userId}`) || 
                     await redisClient.get(`user:id:${userId}`);
    
    if (!userData) {
      return res.status(404).json({
        code: 404,
        message: "用户不存在",
        data: null
      });
    }

    const user = JSON.parse(userData);
    
    // 验证昵称长度
    if (nickname && (nickname.length < 2 || nickname.length > 20)) {
      return res.status(400).json({
        code: 400,
        message: "昵称长度应为2-20位",
        data: null
      });
    }

    // 更新用户信息
    if (nickname) user.nickname = nickname;
    if (avatar) user.avatar = avatar;
    if (phone) user.phone = phone;
    if (email) user.email = email;
    
    user.updatedAt = new Date().toISOString();

    // 保存更新后的数据
    await redisClient.hSet('users', `user:${userId}`, JSON.stringify(user));
    if (user.username) {
      await redisClient.hSet('users', user.username, JSON.stringify(user));
    }
    await redisClient.set(`user:id:${userId}`, JSON.stringify(user));

    res.status(200).json({
      code: 200,
      message: "更新成功",
      data: {
        userId: user.userId,
        nickname: user.nickname,
        avatar: user.avatar
      }
    });

  } catch (error) {
    console.error('更新账户信息失败:', error);
    res.status(500).json({
      code: 500,
      message: "服务器内部错误",
      data: null
    });
  }
};

// 上传账户头像
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        code: 400,
        message: '未上传文件',
        data: null
      });
    }
    
    // 检查文件类型
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        code: 400,
        message: '不支持的文件类型，仅支持JPG、PNG、GIF和WEBP格式',
        data: null
      });
    }
    
    // 获取文件URL
    const fileUrl = `/uploads/avatars/${req.file.filename}`;
    
    res.status(200).json({
      code: 200,
      message: '上传成功',
      data: {
        url: fileUrl
      }
    });
  } catch (error) {
    console.error('上传头像失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      data: null
    });
  }
};

// 获取账户余额
exports.getBalance = async (req, res) => {
  try {
    await ensureConnection();
    
    const { userId } = req.user;
    
    // 模拟余额数据
    const balance = Math.floor(Math.random() * 10000) + 1000;

    res.status(200).json({
      code: 200,
      message: "success",
      data: {
        balance
      }
    });

  } catch (error) {
    console.error('获取账户余额失败:', error);
    res.status(500).json({
      code: 500,
      message: "服务器内部错误",
      data: null
    });
  }
};

// 获取账户积分
exports.getPoints = async (req, res) => {
  try {
    await ensureConnection();
    
    const { userId } = req.user;
    
    const userData = await redisClient.get(`user:id:${userId}`);
    const user = userData ? JSON.parse(userData) : { points: 0 };

    res.status(200).json({
      code: 200,
      message: "success",
      data: {
        points: user.points || 0
      }
    });

  } catch (error) {
    console.error('获取账户积分失败:', error);
    res.status(500).json({
      code: 500,
      message: "服务器内部错误",
      data: null
    });
  }
};

// 获取账户交易记录
exports.getTransactions = async (req, res) => {
  try {
    await ensureConnection();
    
    const { page = 1, pageSize = 10 } = req.query;
    const { userId } = req.user;
    
    // 模拟交易记录数据
    const transactions = [];
    for (let i = 0; i < Math.min(pageSize, 5); i++) {
      transactions.push({
        id: `transaction_${Date.now()}_${i}`,
        type: ['income', 'expense'][i % 2],
        amount: Math.floor(Math.random() * 1000) + 100,
        description: ['充值', '购买商品', '积分兑换', '退款'][i % 4],
        date: new Date(Date.now() - i * 86400000).toISOString(),
        status: 'completed'
      });
    }

    res.status(200).json({
      code: 200,
      message: "success",
      data: {
        total: 20,
        items: transactions
      }
    });

  } catch (error) {
    console.error('获取交易记录失败:', error);
    res.status(500).json({
      code: 500,
      message: "服务器内部错误",
      data: null
    });
  }
};

// 获取账户推荐人
exports.getReferrer = async (req, res) => {
  try {
    await ensureConnection();
    
    const { userId } = req.user;
    
    // 模拟推荐人数据
    const referrer = 'user_referrer_123';

    res.status(200).json({
      code: 200,
      message: "success",
      data: {
        referrer
      }
    });

  } catch (error) {
    console.error('获取推荐人失败:', error);
    res.status(500).json({
      code: 500,
      message: "服务器内部错误",
      data: null
    });
  }
};

// 获取账户推荐人列表
exports.getReferrers = async (req, res) => {
  try {
    await ensureConnection();
    
    const { page = 1, pageSize = 10 } = req.query;
    const { userId } = req.user;
    
    // 模拟推荐人列表数据
    const referrers = [];
    for (let i = 0; i < Math.min(pageSize, 3); i++) {
      referrers.push({
        id: `referrer_${i + 1}`,
        nickname: `推荐人${i + 1}`,
        avatar: `https://picsum.photos/50/50?random=${i + 1100}`
      });
    }

    res.status(200).json({
      code: 200,
      message: "success",
      data: {
        total: 5,
        items: referrers
      }
    });

  } catch (error) {
    console.error('获取推荐人列表失败:', error);
    res.status(500).json({
      code: 500,
      message: "服务器内部错误",
      data: null
    });
  }
};

// 获取账户推荐人关系
exports.getReferrerRelation = async (req, res) => {
  try {
    await ensureConnection();
    
    const { userId } = req.user;
    
    // 模拟推荐关系数据
    const relation = 'direct';

    res.status(200).json({
      code: 200,
      message: "success",
      data: {
        relation
      }
    });

  } catch (error) {
    console.error('获取推荐关系失败:', error);
    res.status(500).json({
      code: 500,
      message: "服务器内部错误",
      data: null
    });
  }
};

// 获取账户推荐人关系列表
exports.getReferrerRelations = async (req, res) => {
  try {
    await ensureConnection();
    
    const { page = 1, pageSize = 10 } = req.query;
    const { userId } = req.user;
    
    // 模拟推荐关系列表数据
    const relations = [];
    for (let i = 0; i < Math.min(pageSize, 3); i++) {
      relations.push({
        id: `relation_${i + 1}`,
        nickname: `关系人${i + 1}`,
        avatar: `https://picsum.photos/50/50?random=${i + 1200}`,
        relation: ['direct', 'indirect'][i % 2]
      });
    }

    res.status(200).json({
      code: 200,
      message: "success",
      data: {
        total: 8,
        items: relations
      }
    });

  } catch (error) {
    console.error('获取推荐关系列表失败:', error);
    res.status(500).json({
      code: 500,
      message: "服务器内部错误",
      data: null
    });
  }
};

// 获取账户推荐人关系详情
exports.getReferrerRelationDetail = async (req, res) => {
  try {
    await ensureConnection();
    
    const { id } = req.query;
    const { userId } = req.user;
    
    if (!id) {
      return res.status(400).json({
        code: 400,
        message: "关系ID不能为空",
        data: null
      });
    }

    // 模拟推荐关系详情数据
    const relationDetail = 'direct_referral';

    res.status(200).json({
      code: 200,
      message: "success",
      data: {
        relation: relationDetail
      }
    });

  } catch (error) {
    console.error('获取推荐关系详情失败:', error);
    res.status(500).json({
      code: 500,
      message: "服务器内部错误",
      data: null
    });
  }
};

// 获取账户推荐人关系详情列表
exports.getReferrerRelationDetails = async (req, res) => {
  try {
    await ensureConnection();
    
    const { page = 1, pageSize = 10 } = req.query;
    const { userId } = req.user;
    
    // 模拟推荐关系详情列表数据
    const relationDetails = [];
    for (let i = 0; i < Math.min(pageSize, 3); i++) {
      relationDetails.push({
        id: `detail_${i + 1}`,
        nickname: `详情人${i + 1}`,
        avatar: `https://picsum.photos/50/50?random=${i + 1300}`,
        relationDetail: 'detailed_connection'
      });
    }

    res.status(200).json({
      code: 200,
      message: "success",
      data: {
        total: 6,
        items: relationDetails
      }
    });

  } catch (error) {
    console.error('获取推荐关系详情列表失败:', error);
    res.status(500).json({
      code: 500,
      message: "服务器内部错误",
      data: null
    });
  }
};

module.exports = exports;
