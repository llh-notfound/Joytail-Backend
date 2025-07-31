const { getRedisClient } = require('../config/redis');
const Insurance = require('../models/Insurance');
const Policy = require('../models/Policy');

const redisClient = getRedisClient();

// 添加一个辅助函数来检查连接状态
const ensureConnection = async () => {
  if (!redisClient.isOpen) {
    console.log('Redis client not connected, attempting to connect...');
    await redisClient.connect();
    console.log('Redis client connected');
  }
};

// 获取保险产品列表
exports.getProducts = async (req, res) => {
  try {
    await ensureConnection();
    
    const { 
      page = 1, 
      pageSize = 10, 
      petType, 
      ageRange, 
      priceRange, 
      sortBy = 'popularity' 
    } = req.query;
    
    // 实际保险产品数据 - 4个产品
    const allProducts = [
      {
        id: 'product_1',
        name: '中国平安爱宠意外险',
        company: '中国平安',
        coverage: '专注意外伤害保障，涵盖意外医疗、意外伤残、意外身故',
        price: 477,
        originalPrice: 699,
        petTypes: ['狗', '猫', '其他'],
        type: 'accident',
        image: '/public/images/insurance/pingan/平安爱宠意外险-封面.jpg',
        tags: ['意外专保', '平安品牌', '高性价比'],
        period: '1年',
        rating: '4.7',
        salesCount: 8500,
        description: '中国平安专业承保，专注宠物意外伤害保障'
      },
      {
        id: 'product_2', 
        name: '蚂蚁保x国泰产险宠物意外医疗保险',
        company: '国泰产险',
        coverage: '意外伤害医疗费用保障，包含门诊、住院、手术费用',
        price: 60,
        originalPrice: 100,
        petTypes: ['狗', '猫'],
        type: 'accident',
        image: '/public/images/insurance/mayibao/蚂蚁保-封面.jpg',
        tags: ['蚂蚁保', '医疗保障', '互联网保险'],
        period: '1年',
        rating: '4.6',
        salesCount: 6200,
        description: '蚂蚁保联合国泰产险推出，专业意外医疗保障'
      },
      {
        id: 'product_3',
        name: '安心养-宠物责任险',
        company: '安心保险',
        coverage: '宠物造成第三方人身伤亡或财产损失的责任保障',
        price: 100,
        originalPrice: 199,
        petTypes: ['狗', '猫'],
        type: 'liability',
        image: '/public/images/insurance/anxinyang/安心养-封面.jpg',
        tags: ['责任保障', '第三方', '社会责任'],
        period: '1年',
        rating: '4.5',
        salesCount: 3400,
        description: '专业第三方责任保障，让养宠更安心'
      },
      {
        id: 'product_4',
        name: '平安爱宠保障卡-宠物责任险',
        company: '中国平安',
        coverage: '宠物侵权责任保障，含人身伤害和财产损失赔偿',
        price: 500,
        originalPrice: 699,
        petTypes: ['狗', '猫'],
        type: 'liability', 
        image: '/public/images/insurance/pingan-card/平安爱宠保障卡-封面.jpg',
        tags: ['平安品牌', '责任险', '保障卡'],
        period: '1年',
        rating: '4.8',
        salesCount: 5600,
        description: '平安爱宠保障卡，全面责任保障服务'
      }
    ];

    // 根据筛选条件过滤产品
    let filteredProducts = allProducts.filter(product => {
      if (petType && !product.petTypes.includes(petType)) return false;
      if (priceRange) {
        const [minPrice, maxPrice] = priceRange.split('-').map(Number);
        if (product.price < minPrice || product.price > maxPrice) return false;
      }
      return true;
    });

    // 排序
    if (sortBy === 'price_asc') {
      filteredProducts.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      filteredProducts.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      filteredProducts.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
    } else {
      // 默认按销量排序
      filteredProducts.sort((a, b) => b.salesCount - a.salesCount);
    }

    // 分页
    const startIndex = (page - 1) * pageSize;
    const products = filteredProducts.slice(startIndex, startIndex + pageSize);

    res.status(200).json({
      code: 200,
      message: '获取成功',
      data: {
        list: products,
        total: filteredProducts.length,
        hasMore: startIndex + pageSize < filteredProducts.length
      }
    });
  } catch (error) {
    console.error('获取保险产品失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      data: null
    });
  }
};

// 获取保险产品详情
exports.getProductDetail = async (req, res) => {
  try {
    await ensureConnection();
    
    const { productId } = req.params;
    
    // 模拟保险产品详情数据
    const product = {
      id: productId,
      name: '全能宠物保险',
      company: '太平洋保险',
      coverage: '全面保障宠物意外伤害和疾病医疗费用',
      price: 477,
      originalPrice: 699,
      petTypes: ['狗', '猫'],
      type: 'comprehensive',
      image: '/public/images/insurance/pingan/平安爱宠意外险-封面.jpg',
      tags: ['热门', '性价比', '全面保障'],
      period: '1年',
      rating: 4.8,
      salesCount: 1520,
      description: '专为宠物设计的全面保险方案，涵盖意外伤害、疾病医疗、手术费用等多项保障。',
      coverageDetails: [
        {
          item: '意外伤害',
          limit: '20万',
          description: '因意外事故导致的医疗费用'
        },
        {
          item: '疾病医疗',
          limit: '15万',
          description: '疾病治疗相关医疗费用'
        },
        {
          item: '手术费用',
          limit: '10万',
          description: '必要手术产生的费用'
        }
      ],
      terms: [
        {
          title: '投保须知',
          content: '1. 宠物年龄需在3个月至8岁之间\n2. 需提供宠物健康证明\n3. 保险生效前有30天等待期'
        },
        {
          title: '保障范围',
          content: '涵盖意外伤害、疾病医疗、手术费用等，具体以保险条款为准。'
        }
      ],
      claimProcess: [
        {
          step: 1,
          title: '报案',
          description: '48小时内联系客服报案'
        },
        {
          step: 2,
          title: '提交材料',
          description: '上传医疗发票、病历等材料'
        },
        {
          step: 3,
          title: '审核',
          description: '专业团队进行材料审核'
        },
        {
          step: 4,
          title: '赔付',
          description: '审核通过后3-5个工作日内赔付'
        }
      ],
      faqs: [
        {
          question: '理赔需要什么材料？',
          answer: '需要提供医疗发票、病历、检查报告等相关材料'
        },
        {
          question: '理赔周期多长？',
          answer: '一般情况下，从提交材料到赔付完成需要5-10个工作日'
        }
      ]
    };

    res.status(200).json({
      code: 200,
      message: '获取成功',
      data: product
    });

  } catch (error) {
    console.error('获取保险产品详情失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      data: null
    });
  }
};

// 获取保险报价
exports.getQuote = async (req, res) => {
  try {
    await ensureConnection();
    
    const {
      productId,
      petType,
      petAge,
      petBreed,
      isNeutered,
      coverageOptions = []
    } = req.body;
    
    if (!productId || !petType || !petAge || !petBreed || isNeutered === undefined) {
      return res.status(400).json({
        code: 400,
        message: '请填写完整的宠物信息',
        data: null
      });
    }

    // 获取产品基准价格
    const allProducts = [
      {
        id: 'product_1',
        price: 477
      },
      {
        id: 'product_2',
        price: 60
      },
      {
        id: 'product_3',
        price: 100
      },
      {
        id: 'product_4',
        price: 500
      }
    ];

    const product = allProducts.find(p => p.id === productId);
    if (!product) {
      return res.status(404).json({
        code: 404,
        message: '产品不存在',
        data: null
      });
    }

    // 模拟报价计算
    const basePrice = product.price;
    const adjustments = [];
    let finalPrice = basePrice;
    
    // 年龄调整
    if (petAge > 5) {
      const adjustment = Math.floor(basePrice * 0.2); // 改为基于基准价格的百分比
      adjustments.push({
        factor: 'age',
        adjustment,
        description: '年龄调整（5岁以上）'
      });
      finalPrice += adjustment;
    }
    
    // 品种调整
    if (petBreed.includes('贵宾') || petBreed.includes('泰迪')) {
      const adjustment = -Math.floor(basePrice * 0.1); // 改为基于基准价格的百分比
      adjustments.push({
        factor: 'breed',
        adjustment,
        description: '品种优惠'
      });
      finalPrice += adjustment;
    }
    
    // 绝育优惠
    if (isNeutered) {
      const adjustment = -Math.floor(basePrice * 0.05); // 改为基于基准价格的百分比
      adjustments.push({
        factor: 'neutered',
        adjustment,
        description: '绝育优惠'
      });
      finalPrice += adjustment;
    }

    res.status(200).json({
      code: 200,
      message: '报价成功',
      data: {
        basePrice,
        adjustments,
        finalPrice,
        validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }
    });

  } catch (error) {
    console.error('获取保险报价失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      data: null
    });
  }
};

// 购买保险
exports.purchase = async (req, res) => {
  try {
    await ensureConnection();
    
    const {
      productId,
      petId,
      coverageOptions,
      paymentMethod,
      contactInfo
    } = req.body;
    const { userId } = req.user;
    
    if (!productId || !petId || !coverageOptions || !paymentMethod || !contactInfo) {
      return res.status(400).json({
        code: 400,
        message: '请填写完整的购买信息',
        data: null
      });
    }

    const policyId = `policy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const orderNo = `INS${Date.now().toString().slice(-8)}`;
    
    // 获取产品价格
    const allProducts = [
      {
        id: 'product_1',
        price: 477
      },
      {
        id: 'product_2',
        price: 60
      },
      {
        id: 'product_3',
        price: 100
      },
      {
        id: 'product_4',
        price: 500
      }
    ];

    const product = allProducts.find(p => p.id === productId);
    const premium = product ? product.price : 60; // 默认使用最基础的价格
    
    const policyData = {
      policyId,
      orderNo,
      userId,
      productId,
      petId,
      coverageOptions,
      paymentMethod,
      contactInfo,
      status: 'pending_payment',
      createTime: new Date().toISOString(),
      premium
    };

    // 保存保单数据
    await redisClient.set(`policy:${policyId}`, JSON.stringify(policyData));
    
    // 添加到用户保单列表
    const userPoliciesKey = `user:${userId}:policies`;
    await redisClient.lPush(userPoliciesKey, policyId);

    res.status(200).json({
      code: 200,
      message: '购买成功',
      data: {
        policyId,
        orderNo,
        paymentUrl: `https://example.com/pay/${orderNo}`
      }
    });

  } catch (error) {
    console.error('购买保险失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      data: null
    });
  }
};

// 获取我的保单列表
exports.getMyPolicies = async (req, res) => {
  try {
    await ensureConnection();
    
    const { page = 1, pageSize = 10, status } = req.query;
    const { userId } = req.user;
    
    const userPoliciesKey = `user:${userId}:policies`;
    const policyIds = await redisClient.lRange(userPoliciesKey, 0, -1);
    
    const policies = [];
    for (const policyId of policyIds.slice((page - 1) * pageSize, page * pageSize)) {
      const policyData = await redisClient.get(`policy:${policyId}`);
      if (policyData) {
        const policy = JSON.parse(policyData);
        
        // 如果指定了状态筛选，跳过不匹配的记录
        if (status && policy.status !== status) {
          continue;
        }
        
        policies.push({
          policyId: policy.policyId,
          productName: `保险产品${policy.productId}`,
          company: '太平洋保险',
          petName: `宠物${policy.petId}`,
          petType: 'dog',
          status: policy.status === 'pending_payment' ? 'pending' : 
                 policy.status === 'active' ? 'active' : 
                 policy.status === 'expired' ? 'expired' : 'cancelled',
          startDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          endDate: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
          premium: policy.premium || 899,
          coverageLimit: '20万',
          claimsUsed: '0'
        });
      }
    }

    res.status(200).json({
      code: 200,
      message: '获取成功',
      data: {
        list: policies,
        total: policyIds.length
      }
    });

  } catch (error) {
    console.error('获取保单列表失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      data: null
    });
  }
};

// 获取保单详情
exports.getPolicyDetail = async (req, res) => {
  try {
    await ensureConnection();
    
    const { policyId } = req.params;
    const { userId } = req.user;
    
    const policyData = await redisClient.get(`policy:${policyId}`);
    if (!policyData) {
      return res.status(404).json({
        code: 404,
        message: '保单不存在',
        data: null
      });
    }

    const policy = JSON.parse(policyData);
    
    // 检查权限
    if (policy.userId !== userId) {
      return res.status(403).json({
        code: 403,
        message: '无权查看该保单',
        data: null
      });
    }

    const policyDetail = {
      policyId: policy.policyId,
      orderNo: policy.orderNo,
      productName: `保险产品${policy.productId}`,
      company: '太平洋保险',
      petInfo: {
        name: `宠物${policy.petId}`,
        type: 'dog',
        breed: '金毛',
        age: 3
      },
      status: policy.status === 'pending_payment' ? 'pending' : 'active',
      startDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      endDate: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
      premium: policy.premium || 899,
      coverageDetails: [
        {
          item: '意外伤害',
          limit: '20万',
          used: '0'
        },
        {
          item: '疾病医疗',
          limit: '15万',
          used: '0'
        }
      ],
      contactInfo: policy.contactInfo,
      claimHistory: []
    };

    res.status(200).json({
      code: 200,
      message: '获取成功',
      data: policyDetail
    });

  } catch (error) {
    console.error('获取保单详情失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      data: null
    });
  }
};

// 提交理赔申请
exports.submitClaim = async (req, res) => {
  try {
    await ensureConnection();
    
    const {
      policyId,
      incidentDate,
      incidentType,
      description,
      claimAmount,
      documents,
      veterinaryInfo
    } = req.body;
    const { userId } = req.user;
    
    if (!policyId || !incidentDate || !incidentType || !description || !claimAmount || !documents || !veterinaryInfo) {
      return res.status(400).json({
        code: 400,
        message: '请填写完整的理赔信息',
        data: null
      });
    }

    // 检查保单是否存在
    const policyData = await redisClient.get(`policy:${policyId}`);
    if (!policyData) {
      return res.status(404).json({
        code: 404,
        message: '保单不存在',
        data: null
      });
    }

    const policy = JSON.parse(policyData);
    
    // 检查权限
    if (policy.userId !== userId) {
      return res.status(403).json({
        code: 403,
        message: '无权为该保单申请理赔',
        data: null
      });
    }

    const claimId = `claim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const claimNo = `C${Date.now().toString().slice(-8)}`;
    
    const claimData = {
      claimId,
      claimNo,
      policyId,
      userId,
      incidentDate,
      incidentType,
      description,
      claimAmount,
      documents,
      veterinaryInfo,
      status: 'pending',
      submitDate: new Date().toISOString()
    };

    // 保存理赔申请数据
    await redisClient.set(`claim:${claimId}`, JSON.stringify(claimData));
    
    // 添加到用户理赔列表
    const userClaimsKey = `user:${userId}:claims`;
    await redisClient.lPush(userClaimsKey, claimId);

    res.status(200).json({
      code: 200,
      message: '提交成功',
      data: {
        claimId,
        claimNo,
        estimatedDays: 7
      }
    });

  } catch (error) {
    console.error('提交理赔申请失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      data: null
    });
  }
};

// 获取理赔记录
exports.getMyClaims = async (req, res) => {
  try {
    await ensureConnection();
    
    const { page = 1, pageSize = 10, status, policyId } = req.query;
    const { userId } = req.user;
    
    const userClaimsKey = `user:${userId}:claims`;
    const claimIds = await redisClient.lRange(userClaimsKey, 0, -1);
    
    const claims = [];
    for (const claimId of claimIds.slice((page - 1) * pageSize, page * pageSize)) {
      const claimData = await redisClient.get(`claim:${claimId}`);
      if (claimData) {
        const claim = JSON.parse(claimData);
        
        // 如果指定了状态或保单筛选，跳过不匹配的记录
        if ((status && claim.status !== status) || (policyId && claim.policyId !== policyId)) {
          continue;
        }
        
        claims.push({
          claimId: claim.claimId,
          claimNo: claim.claimNo,
          policyId: claim.policyId,
          productName: `保险产品${claim.policyId}`,
          incidentDate: claim.incidentDate,
          submitDate: claim.submitDate,
          amount: claim.claimAmount,
          approvedAmount: claim.approvedAmount || 0,
          status: claim.status,
          statusText: claim.status === 'pending' ? '待审核' :
                     claim.status === 'approved' ? '已赔付' :
                     claim.status === 'rejected' ? '被拒绝' : '处理中',
          description: claim.description,
          processedDate: claim.processedDate || null
        });
      }
    }

    res.status(200).json({
      code: 200,
      message: '获取成功',
      data: {
        list: claims,
        total: claimIds.length
      }
    });

  } catch (error) {
    console.error('获取理赔记录失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      data: null
    });
  }
};

// 获取理赔详情
exports.getClaimDetail = async (req, res) => {
  try {
    await ensureConnection();
    
    const { claimId } = req.params;
    const { userId } = req.user;
    
    const claimData = await redisClient.get(`claim:${claimId}`);
    if (!claimData) {
      return res.status(404).json({
        code: 404,
        message: '理赔记录不存在',
        data: null
      });
    }

    const claim = JSON.parse(claimData);
    
    // 检查权限
    if (claim.userId !== userId) {
      return res.status(403).json({
        code: 403,
        message: '无权查看该理赔记录',
        data: null
      });
    }

    const claimDetail = {
      claimId: claim.claimId,
      claimNo: claim.claimNo,
      policyInfo: {
        policyId: claim.policyId,
        productName: `保险产品${claim.policyId}`,
        company: '太平洋保险'
      },
      incidentDate: claim.incidentDate,
      submitDate: claim.submitDate,
      incidentType: claim.incidentType,
      description: claim.description,
      amount: claim.claimAmount,
      approvedAmount: claim.approvedAmount || 0,
      status: claim.status,
      statusText: claim.status === 'pending' ? '待审核' : '已处理',
      processedDate: claim.processedDate || null,
      documents: claim.documents,
      veterinaryInfo: claim.veterinaryInfo,
      processHistory: [
        {
          date: claim.submitDate,
          status: 'submitted',
          description: '理赔申请已提交'
        }
      ]
    };

    res.status(200).json({
      code: 200,
      message: '获取成功',
      data: claimDetail
    });

  } catch (error) {
    console.error('获取理赔详情失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      data: null
    });
  }
};

// 续保
exports.renewPolicy = async (req, res) => {
  try {
    await ensureConnection();
    
    const { policyId, coverageOptions, paymentMethod } = req.body;
    const { userId } = req.user;
    
    if (!policyId || !paymentMethod) {
      return res.status(400).json({
        code: 400,
        message: '请填写完整的续保信息',
        data: null
      });
    }

    // 检查原保单
    const originalPolicyData = await redisClient.get(`policy:${policyId}`);
    if (!originalPolicyData) {
      return res.status(404).json({
        code: 404,
        message: '保单不存在',
        data: null
      });
    }

    const originalPolicy = JSON.parse(originalPolicyData);
    
    // 检查权限
    if (originalPolicy.userId !== userId) {
      return res.status(403).json({
        code: 403,
        message: '无权续保该保单',
        data: null
      });
    }

    const newPolicyId = `policy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const orderNo = `RNW${Date.now().toString().slice(-8)}`;
    
    const newPolicyData = {
      ...originalPolicy,
      policyId: newPolicyId,
      orderNo,
      coverageOptions: coverageOptions || originalPolicy.coverageOptions,
      paymentMethod,
      status: 'pending_payment',
      createTime: new Date().toISOString(),
      renewedFrom: policyId
    };

    // 保存新保单数据
    await redisClient.set(`policy:${newPolicyId}`, JSON.stringify(newPolicyData));

    res.status(200).json({
      code: 200,
      message: '续保成功',
      data: {
        newPolicyId,
        orderNo,
        premium: originalPolicy.premium || 899,
        startDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        endDate: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
        paymentUrl: `https://example.com/pay/${orderNo}`
      }
    });

  } catch (error) {
    console.error('续保失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      data: null
    });
  }
};

// 取消保单
exports.cancelPolicy = async (req, res) => {
  try {
    await ensureConnection();
    
    const { policyId, reason, cancellationType } = req.body;
    const { userId } = req.user;
    
    if (!policyId || !reason || !cancellationType) {
      return res.status(400).json({
        code: 400,
        message: '请填写完整的取消信息',
        data: null
      });
    }

    const policyData = await redisClient.get(`policy:${policyId}`);
    if (!policyData) {
      return res.status(404).json({
        code: 404,
        message: '保单不存在',
        data: null
      });
    }

    const policy = JSON.parse(policyData);
    
    // 检查权限
    if (policy.userId !== userId) {
      return res.status(403).json({
        code: 403,
        message: '无权取消该保单',
        data: null
      });
    }

    // 更新保单状态
    policy.status = 'cancelled';
    policy.cancelReason = reason;
    policy.cancellationType = cancellationType;
    policy.cancelDate = new Date().toISOString();
    
    await redisClient.set(`policy:${policyId}`, JSON.stringify(policy));

    // 计算退款金额（简化计算）
    const refundAmount = cancellationType === 'immediate' ? 
      Math.floor((policy.premium || 899) * 0.5) : 0;

    res.status(200).json({
      code: 200,
      message: '取消成功',
      data: {
        refundAmount,
        cancelDate: policy.cancelDate.split('T')[0],
        refundDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0]
      }
    });

  } catch (error) {
    console.error('取消保单失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      data: null
    });
  }
};

module.exports = exports;
