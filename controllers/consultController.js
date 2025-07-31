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

// 获取在线咨询服务列表
exports.getServices = async (req, res) => {
  try {
    await ensureConnection();
    
    const { type, specialty, sortBy = 'rating' } = req.query;
    
    // 模拟咨询服务数据
    const services = [];
    for (let i = 0; i < 10; i++) {
      services.push({
        doctorId: `doctor_${i + 1}`,
        name: `医生${i + 1}`,
        title: ['主治兽医师', '高级兽医师', '副主任医师'][i % 3],
        hospital: `宠物医院${i + 1}`,
        specialty: [['犬科'], ['猫科'], ['犬科', '猫科'], ['异宠科']][i % 4],
        experience: `${5 + (i % 10)}年`,
        rating: (4.0 + Math.random()).toFixed(1),
        reviewCount: Math.floor(Math.random() * 2000) + 100,
        avatar: `https://picsum.photos/100/100?random=${i + 800}`,
        description: `专业从事宠物医疗${5 + (i % 10)}年，擅长宠物内科疾病诊治、营养健康管理等。`,
        consultPrice: Math.floor(Math.random() * 50) + 30,
        videoPrice: Math.floor(Math.random() * 80) + 50,
        responseTime: ['5分钟内', '10分钟内', '15分钟内'][i % 3],
        isOnline: Math.random() > 0.3,
        consultTypes: ['text', 'video']
      });
    }

    res.status(200).json({
      code: 200,
      message: "获取成功",
      data: {
        list: services
      }
    });

  } catch (error) {
    console.error('获取咨询服务列表失败:', error);
    res.status(500).json({
      code: 500,
      message: "服务器内部错误",
      data: null
    });
  }
};

// 获取医生列表
exports.getDoctors = async (req, res) => {
  try {
    await ensureConnection();
    
    const { 
      page = 1, 
      pageSize = 10, 
      specialty, 
      hospital, 
      sortBy = 'rating' 
    } = req.query;
    
    // 模拟医生列表数据
    const doctors = [];
    for (let i = 0; i < pageSize; i++) {
      doctors.push({
        doctorId: `doctor_${i + 1}`,
        name: `医生${i + 1}`,
        title: ['主治兽医师', '高级兽医师', '副主任医师'][i % 3],
        hospital: `宠物医院${i + 1}`,
        specialty: [['犬科'], ['猫科'], ['犬科', '猫科'], ['异宠科']][i % 4],
        experience: `${5 + (i % 10)}年`,
        rating: (4.0 + Math.random()).toFixed(1),
        reviewCount: Math.floor(Math.random() * 2000) + 100,
        avatar: `https://picsum.photos/100/100?random=${i + 800}`,
        description: `专业从事宠物医疗${5 + (i % 10)}年，擅长宠物内科疾病诊治、营养健康管理等。`,
        consultPrice: Math.floor(Math.random() * 50) + 30,
        videoPrice: Math.floor(Math.random() * 80) + 50,
        responseTime: ['5分钟内', '10分钟内', '15分钟内'][i % 3],
        isOnline: Math.random() > 0.3,
        consultTypes: ['text', 'video'],
        goodAt: [
          '宠物内科疾病诊治',
          '营养健康管理',
          '疫苗接种指导'
        ].slice(0, Math.floor(Math.random() * 3) + 1)
      });
    }

    res.status(200).json({
      code: 200,
      message: "获取成功",
      data: {
        list: doctors,
        total: 50,
        hasMore: page * pageSize < 50
      }
    });

  } catch (error) {
    console.error('获取医生列表失败:', error);
    res.status(500).json({
      code: 500,
      message: "服务器内部错误",
      data: null
    });
  }
};

// 获取医生详情
exports.getDoctorDetail = async (req, res) => {
  try {
    await ensureConnection();
    
    const { doctorId } = req.params;
    
    // 模拟医生详情数据
    const doctor = {
      doctorId,
      name: '专家医生',
      title: '高级兽医师',
      hospital: '知名宠物医院',
      department: '内科',
      specialty: ['犬科', '猫科'],
      experience: '15年',
      rating: 4.9,
      reviewCount: 1520,
      avatar: 'https://picsum.photos/150/150?random=900',
      description: '从事宠物医疗行业15年，具有丰富的临床经验，擅长各种宠物疾病的诊断和治疗。',
      education: [
        {
          degree: '兽医学博士',
          school: '中国农业大学',
          year: '2008'
        },
        {
          degree: '兽医学硕士',
          school: '华中农业大学',
          year: '2005'
        }
      ],
      certifications: [
        '执业兽医师资格证',
        '小动物内科专科医师',
        '宠物营养师'
      ],
      consultPrice: 50,
      videoPrice: 100,
      responseTime: '5分钟内',
      isOnline: true,
      workingHours: '09:00-18:00',
      consultTypes: ['text', 'video'],
      goodAt: [
        '宠物内科疾病诊治',
        '营养健康管理',
        '疫苗接种指导',
        '行为问题咨询'
      ],
      recentReviews: [
        {
          userId: 'user_1',
          userName: '用户***',
          rating: 5,
          content: '医生很专业，回复很及时，解答详细',
          date: '2024-01-15'
        },
        {
          userId: 'user_2',
          userName: '用户***',
          rating: 5,
          content: '非常耐心，给出的建议很有用',
          date: '2024-01-14'
        }
      ]
    };

    res.status(200).json({
      code: 200,
      message: "获取成功",
      data: doctor
    });

  } catch (error) {
    console.error('获取医生详情失败:', error);
    res.status(500).json({
      code: 500,
      message: "服务器内部错误",
      data: null
    });
  }
};

// 发起咨询
exports.createSession = async (req, res) => {
  try {
    await ensureConnection();
    
    const {
      doctorId,
      type,
      petId,
      problem,
      symptoms = [],
      images = [],
      urgency = 'normal'
    } = req.body;
    const { userId } = req.user;
    
    if (!doctorId || !type || !petId || !problem) {
      return res.status(400).json({
        code: 400,
        message: "请填写完整的咨询信息",
        data: null
      });
    }

    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const sessionData = {
      sessionId,
      orderId,
      userId,
      doctorId,
      type,
      petId,
      problem,
      symptoms,
      images,
      urgency,
      status: 'waiting',
      createTime: new Date().toISOString(),
      amount: type === 'text' ? 50 : 100
    };

    // 保存咨询会话数据
    await redisClient.set(`session:${sessionId}`, JSON.stringify(sessionData));
    
    // 添加到用户咨询列表
    const userSessionsKey = `user:${userId}:sessions`;
    await redisClient.lPush(userSessionsKey, sessionId);

    res.status(200).json({
      code: 200,
      message: "咨询发起成功",
      data: {
        sessionId,
        orderId,
        estimatedTime: "5分钟",
        paymentRequired: true,
        amount: sessionData.amount,
        paymentUrl: `https://example.com/pay/${orderId}`
      }
    });

  } catch (error) {
    console.error('发起咨询失败:', error);
    res.status(500).json({
      code: 500,
      message: "服务器内部错误",
      data: null
    });
  }
};

// 获取我的咨询记录
exports.getMySessions = async (req, res) => {
  try {
    await ensureConnection();
    
    const { page = 1, pageSize = 10, status } = req.query;
    const { userId } = req.user;
    
    const userSessionsKey = `user:${userId}:sessions`;
    const sessionIds = await redisClient.lRange(userSessionsKey, 0, -1);
    
    const sessions = [];
    for (const sessionId of sessionIds.slice((page - 1) * pageSize, page * pageSize)) {
      const sessionData = await redisClient.get(`session:${sessionId}`);
      if (sessionData) {
        const session = JSON.parse(sessionData);
        
        // 如果指定了状态筛选，跳过不匹配的记录
        if (status && session.status !== status) {
          continue;
        }
        
        sessions.push({
          sessionId: session.sessionId,
          orderId: session.orderId,
          doctorName: `医生${session.doctorId}`,
          doctorAvatar: `https://picsum.photos/50/50?random=${session.doctorId}`,
          petName: `宠物${session.petId}`,
          type: session.type,
          problem: session.problem,
          status: session.status,
          statusText: session.status === 'waiting' ? '等待回复' :
                     session.status === 'ongoing' ? '进行中' :
                     session.status === 'completed' ? '已完成' : '已取消',
          createTime: session.createTime,
          lastMessageTime: session.lastMessageTime || session.createTime,
          duration: session.endTime ? '1小时30分钟' : '-',
          rating: session.rating || null,
          amount: session.amount
        });
      }
    }

    res.status(200).json({
      code: 200,
      message: "获取成功",
      data: {
        list: sessions,
        total: sessionIds.length
      }
    });

  } catch (error) {
    console.error('获取咨询记录失败:', error);
    res.status(500).json({
      code: 500,
      message: "服务器内部错误",
      data: null
    });
  }
};

// 获取咨询会话详情
exports.getSessionDetail = async (req, res) => {
  try {
    await ensureConnection();
    
    const { sessionId } = req.params;
    const { userId } = req.user;
    
    const sessionData = await redisClient.get(`session:${sessionId}`);
    if (!sessionData) {
      return res.status(404).json({
        code: 404,
        message: "咨询会话不存在",
        data: null
      });
    }

    const session = JSON.parse(sessionData);
    
    // 检查权限
    if (session.userId !== userId) {
      return res.status(403).json({
        code: 403,
        message: "无权访问该咨询会话",
        data: null
      });
    }

    // 模拟会话详情数据
    const sessionDetail = {
      sessionId: session.sessionId,
      orderId: session.orderId,
      doctorInfo: {
        doctorId: session.doctorId,
        name: `医生${session.doctorId}`,
        title: '高级兽医师',
        avatar: `https://picsum.photos/100/100?random=${session.doctorId}`,
        hospital: '知名宠物医院'
      },
      petInfo: {
        petId: session.petId,
        name: `宠物${session.petId}`,
        type: 'dog',
        breed: '金毛',
        age: 3
      },
      type: session.type,
      problem: session.problem,
      symptoms: session.symptoms,
      status: session.status,
      createTime: session.createTime,
      endTime: session.endTime || null,
      amount: session.amount,
      messages: [
        {
          messageId: 'msg_1',
          sender: 'user',
          type: 'text',
          content: session.problem,
          timestamp: session.createTime,
          isRead: true
        },
        {
          messageId: 'msg_2',
          sender: 'doctor',
          type: 'text',
          content: '您好，我已经看到您的问题，根据您的描述，建议您先观察宠物的食欲和精神状态。',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          isRead: true
        }
      ],
      prescription: session.status === 'completed' ? {
        medications: [
          {
            name: '宠物消炎药',
            dosage: '每日2次，每次半片',
            duration: '7天'
          }
        ],
        advice: '建议多休息，观察48小时',
        followUp: '如症状持续请及时就医'
      } : null,
      rating: session.rating || null,
      review: session.review || null
    };

    res.status(200).json({
      code: 200,
      message: "获取成功",
      data: sessionDetail
    });

  } catch (error) {
    console.error('获取咨询会话详情失败:', error);
    res.status(500).json({
      code: 500,
      message: "服务器内部错误",
      data: null
    });
  }
};

// 发送消息
exports.sendMessage = async (req, res) => {
  try {
    await ensureConnection();
    
    const { sessionId } = req.params;
    const { type, content, url } = req.body;
    const { userId } = req.user;
    
    if (!type || !content) {
      return res.status(400).json({
        code: 400,
        message: "消息类型和内容不能为空",
        data: null
      });
    }

    // 检查会话是否存在
    const sessionData = await redisClient.get(`session:${sessionId}`);
    if (!sessionData) {
      return res.status(404).json({
        code: 404,
        message: "咨询会话不存在",
        data: null
      });
    }

    const session = JSON.parse(sessionData);
    
    // 检查权限
    if (session.userId !== userId) {
      return res.status(403).json({
        code: 403,
        message: "无权在该会话中发送消息",
        data: null
      });
    }

    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();
    
    const messageData = {
      messageId,
      sessionId,
      sender: 'user',
      type,
      content,
      url: url || null,
      timestamp,
      isRead: false
    };

    // 保存消息数据
    await redisClient.set(`message:${messageId}`, JSON.stringify(messageData));
    
    // 添加到会话消息列表
    const sessionMessagesKey = `session:${sessionId}:messages`;
    await redisClient.rPush(sessionMessagesKey, messageId);
    
    // 更新会话的最后消息时间
    session.lastMessageTime = timestamp;
    await redisClient.set(`session:${sessionId}`, JSON.stringify(session));

    res.status(200).json({
      code: 200,
      message: "发送成功",
      data: {
        messageId,
        timestamp
      }
    });

  } catch (error) {
    console.error('发送消息失败:', error);
    res.status(500).json({
      code: 500,
      message: "服务器内部错误",
      data: null
    });
  }
};

// 结束咨询
exports.endSession = async (req, res) => {
  try {
    await ensureConnection();
    
    const { sessionId } = req.params;
    const { userId } = req.user;
    
    const sessionData = await redisClient.get(`session:${sessionId}`);
    if (!sessionData) {
      return res.status(404).json({
        code: 404,
        message: "咨询会话不存在",
        data: null
      });
    }

    const session = JSON.parse(sessionData);
    
    // 检查权限
    if (session.userId !== userId) {
      return res.status(403).json({
        code: 403,
        message: "无权结束该咨询会话",
        data: null
      });
    }

    // 更新会话状态
    session.status = 'completed';
    session.endTime = new Date().toISOString();
    
    // 计算咨询时长
    const startTime = new Date(session.createTime);
    const endTime = new Date(session.endTime);
    const durationMs = endTime - startTime;
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    const duration = `${hours}小时${minutes}分钟`;
    
    await redisClient.set(`session:${sessionId}`, JSON.stringify(session));

    res.status(200).json({
      code: 200,
      message: "咨询已结束",
      data: {
        duration,
        canRate: true
      }
    });

  } catch (error) {
    console.error('结束咨询失败:', error);
    res.status(500).json({
      code: 500,
      message: "服务器内部错误",
      data: null
    });
  }
};

// 咨询评价
exports.rateSession = async (req, res) => {
  try {
    await ensureConnection();
    
    const { sessionId } = req.params;
    const { rating, review, tags = [] } = req.body;
    const { userId } = req.user;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        code: 400,
        message: "评分必须在1-5之间",
        data: null
      });
    }

    const sessionData = await redisClient.get(`session:${sessionId}`);
    if (!sessionData) {
      return res.status(404).json({
        code: 404,
        message: "咨询会话不存在",
        data: null
      });
    }

    const session = JSON.parse(sessionData);
    
    // 检查权限
    if (session.userId !== userId) {
      return res.status(403).json({
        code: 403,
        message: "无权评价该咨询会话",
        data: null
      });
    }

    // 检查是否已评价
    if (session.rating) {
      return res.status(400).json({
        code: 400,
        message: "该咨询已评价过",
        data: null
      });
    }

    const ratingId = `rating_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 更新会话评价信息
    session.rating = rating;
    session.review = review || '';
    session.tags = tags;
    session.ratingTime = new Date().toISOString();
    
    await redisClient.set(`session:${sessionId}`, JSON.stringify(session));
    
    // 保存评价数据
    const ratingData = {
      ratingId,
      sessionId,
      userId,
      doctorId: session.doctorId,
      rating,
      review: review || '',
      tags,
      createTime: new Date().toISOString()
    };
    
    await redisClient.set(`rating:${ratingId}`, JSON.stringify(ratingData));

    res.status(200).json({
      code: 200,
      message: "评价成功",
      data: {
        ratingId
      }
    });

  } catch (error) {
    console.error('咨询评价失败:', error);
    res.status(500).json({
      code: 500,
      message: "服务器内部错误",
      data: null
    });
  }
};

module.exports = exports;
