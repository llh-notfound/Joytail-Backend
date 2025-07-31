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
        termsImage: '/public/images/insurance/pingan/保险条款.jpg',
        claimProcessImage: '/public/images/insurance/pingan/理赔指引.jpg',
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
        termsImage: null, // 暂无图片
        claimProcessImage: null, // 暂无图片
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
        termsImage: null, // 暂无图片
        claimProcessImage: null, // 暂无图片
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
        termsImage: null, // 暂无图片
        claimProcessImage: null, // 暂无图片
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
    
    // 真实保险产品详情数据
    const productDetails = {
      'product_1': {
        id: 'product_1',
        name: '中国平安爱宠意外险',
        company: '中国平安',
        coverage: '专注意外伤害保障，涵盖意外医疗、意外伤残、意外身故',
        price: 477,
        originalPrice: 699,
        petTypes: ['狗', '猫', '其他'],
        type: 'accident',
        image: '/public/images/insurance/pingan/平安爱宠意外险-封面.jpg',
        termsImage: '/public/images/insurance/pingan/保险条款.jpg',
        claimProcessImage: '/public/images/insurance/pingan/理赔指引.jpg',
        tags: ['意外专保', '平安品牌', '高性价比'],
        period: '1年',
        rating: 4.7,
        salesCount: 8500,
        description: '中国平安专业承保，专注宠物意外伤害保障，为您的爱宠提供全方位意外保护。',
        coverageDetails: [
          {
            item: '意外伤害医疗',
            limit: '5万',
            description: '因意外事故导致的医疗费用报销'
          },
          {
            item: '意外伤残',
            limit: '10万',
            description: '意外导致的伤残给付'
          },
          {
            item: '意外身故',
            limit: '10万',
            description: '意外身故给付'
          }
        ],
        terms: [
          {
            title: '投保须知',
            content: '1. 宠物年龄需在3个月至8岁之间\n2. 需提供宠物健康证明\n3. 意外险无等待期，次日生效'
          },
          {
            title: '保障范围',
            content: '专保意外伤害，包括交通事故、跌落、咬伤、烫伤等各类意外事故。'
          }
        ],
        claimProcess: [
          {
            step: 1,
            title: '报案',
            description: '24小时内联系平安客服报案'
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
            description: '审核通过后3个工作日内赔付'
          }
        ],
        faqs: [
          {
            question: '意外险是否有等待期？',
            answer: '意外险无等待期，保单生效次日即可享受保障。'
          },
          {
            question: '哪些情况不在保障范围内？',
            answer: '疾病、先天性疾病、预防性治疗等不在意外险保障范围内。'
          }
        ]
      },
      'product_2': {
        id: 'product_2',
        name: '蚂蚁保x国泰产险宠物意外医疗保险',
        company: '国泰产险',
        coverage: '意外伤害医疗费用保障，包含门诊、住院、手术费用',
        price: 60,
        originalPrice: 100,
        petTypes: ['狗', '猫'],
        type: 'accident',
        image: '/public/images/insurance/mayibao/蚂蚁保-封面.jpg',
        termsImage: null,
        claimProcessImage: null,
        tags: ['蚂蚁保', '医疗保障', '互联网保险'],
        period: '1年',
        rating: 4.6,
        salesCount: 6200,
        description: '蚂蚁保联合国泰产险推出，专业意外医疗保障，线上理赔便捷高效。',
        coverageDetails: [
          {
            item: '意外医疗费用',
            limit: '8万',
            description: '意外导致的门诊、住院医疗费用'
          },
          {
            item: '意外手术费用',
            limit: '5万',
            description: '因意外需要手术的费用报销'
          },
          {
            item: '住院津贴',
            limit: '每日200元',
            description: '意外导致住院的津贴补偿'
          }
        ],
        terms: [
          {
            title: '投保须知',
            content: '1. 宠物年龄2个月至10岁\n2. 需上传宠物照片和健康证明\n3. 意外医疗无等待期'
          },
          {
            title: '保障范围',
            content: '意外伤害导致的医疗费用，包括诊疗费、药费、手术费、住院费等。'
          }
        ],
        claimProcess: [
          {
            step: 1,
            title: '在线报案',
            description: '支付宝蚂蚁保小程序一键报案'
          },
          {
            step: 2,
            title: '上传材料',
            description: '拍照上传医疗票据和病历'
          },
          {
            step: 3,
            title: 'AI审核',
            description: 'AI智能审核，快速处理'
          },
          {
            step: 4,
            title: '快速赔付',
            description: '最快当日到账'
          }
        ],
        faqs: [
          {
            question: '如何快速理赔？',
            answer: '通过支付宝蚂蚁保小程序，可以实现在线报案、材料上传和理赔跟踪。'
          },
          {
            question: '报销比例是多少？',
            answer: '在指定医院就诊，经社保报销后按80%比例报销；未经社保按60%报销。'
          }
        ]
      },
      'product_3': {
        id: 'product_3',
        name: '安心养-宠物责任险',
        company: '安心保险',
        coverage: '宠物造成第三方人身伤亡或财产损失的责任保障',
        price: 100,
        originalPrice: 199,
        petTypes: ['狗', '猫'],
        type: 'liability',
        image: '/public/images/insurance/anxinyang/安心养-封面.jpg',
        termsImage: null,
        claimProcessImage: null,
        tags: ['责任保障', '第三方', '社会责任'],
        period: '1年',
        rating: 4.5,
        salesCount: 3400,
        description: '专业第三方责任保障，保障宠物对他人造成的人身伤害和财产损失，让养宠更安心。',
        coverageDetails: [
          {
            item: '第三方人身伤害',
            limit: '20万',
            description: '宠物造成他人人身伤害的医疗费用和伤残赔偿'
          },
          {
            item: '第三方财产损失',
            limit: '5万',
            description: '宠物造成他人财产损失的赔偿'
          },
          {
            item: '法律费用',
            limit: '2万',
            description: '因责任事故产生的诉讼费用'
          }
        ],
        terms: [
          {
            title: '投保须知',
            content: '1. 需要宠物登记证明\n2. 宠物需已接种疫苗\n3. 保险期间需依法养宠'
          },
          {
            title: '保障范围',
            content: '保障宠物对第三方造成的人身伤害和财产损失，不包括宠物自身的医疗费用。'
          }
        ],
        claimProcess: [
          {
            step: 1,
            title: '事故报案',
            description: '事故发生后立即联系安心保险报案'
          },
          {
            step: 2,
            title: '现场处理',
            description: '配合保险公司进行现场勘查'
          },
          {
            step: 3,
            title: '责任认定',
            description: '等待相关部门责任认定结果'
          },
          {
            step: 4,
            title: '赔偿处理',
            description: '根据责任比例进行赔偿'
          }
        ],
        faqs: [
          {
            question: '什么情况下保险公司会赔付？',
            answer: '当您的宠物对第三方造成人身伤害或财产损失，且您需要承担法律责任时。'
          },
          {
            question: '免赔额是多少？',
            answer: '本产品设有200元免赔额，超出部分按保险条款赔付。'
          }
        ]
      },
      'product_4': {
        id: 'product_4',
        name: '平安爱宠保障卡-宠物责任险',
        company: '中国平安',
        coverage: '宠物侵权责任保障，含人身伤害和财产损失赔偿',
        price: 500,
        originalPrice: 699,
        petTypes: ['狗', '猫'],
        type: 'liability',
        image: '/public/images/insurance/pingan-card/平安爱宠保障卡-封面.jpg',
        termsImage: null,
        claimProcessImage: null,
        tags: ['平安品牌', '责任险', '保障卡'],
        period: '1年',
        rating: 4.8,
        salesCount: 5600,
        description: '中国平安爱宠保障卡，提供全面的宠物责任保障，包含法律援助服务。',
        coverageDetails: [
          {
            item: '第三方人身伤害',
            limit: '30万',
            description: '宠物咬伤、抓伤他人的医疗和赔偿费用'
          },
          {
            item: '第三方财产损失',
            limit: '10万',
            description: '宠物损坏他人财物的赔偿费用'
          },
          {
            item: '法律援助',
            limit: '5万',
            description: '提供专业法律咨询和援助服务'
          }
        ],
        terms: [
          {
            title: '投保须知',
            content: '1. 宠物需在当地相关部门登记\n2. 按时接种疫苗并持有有效证明\n3. 遵守当地养犬管理规定'
          },
          {
            title: '保障范围',
            content: '保障范围广泛，涵盖宠物对第三方的各类侵权责任，并提供专业法律援助。'
          }
        ],
        claimProcess: [
          {
            step: 1,
            title: '立即报案',
            description: '事故发生后第一时间拨打平安客服电话'
          },
          {
            step: 2,
            title: '专业处理',
            description: '平安理赔专员协助处理事故'
          },
          {
            step: 3,
            title: '法律支持',
            description: '必要时提供法律援助服务'
          },
          {
            step: 4,
            title: '快速赔付',
            description: '责任明确后快速理赔到账'
          }
        ],
        faqs: [
          {
            question: '平安爱宠卡有什么特色服务？',
            answer: '除基础责任保障外，还提供24小时法律咨询热线和专业法律援助服务。'
          },
          {
            question: '保障额度如何设定？',
            answer: '人身伤害最高30万，财产损失最高10万，在同类产品中保障额度较高。'
          }
        ]
      }
    };

    const product = productDetails[productId];
    
    if (!product) {
      return res.status(404).json({
        code: 404,
        message: '保险产品不存在',
        data: null
      });
    }

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
    const userId = req.user.id || req.user.userId;
    
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
    const userId = req.user.id || req.user.userId;
    
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
    const userId = req.user.id || req.user.userId;
    
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
    const userId = req.user.id || req.user.userId;
    
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
    const userId = req.user.id || req.user.userId;
    
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
    const userId = req.user.id || req.user.userId;
    
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
    const userId = req.user.id || req.user.userId;
    
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
    const userId = req.user.id || req.user.userId;
    
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

// 获取保险常见问题
exports.getFAQ = async (req, res) => {
  try {
    await ensureConnection();
    
    const { category } = req.query;
    
    // 模拟保险常见问题数据
    const allFaqs = [
      {
        id: 'faq_1',
        category: 'purchase',
        question: '如何购买宠物保险？',
        answer: '您可以通过我们的App选择适合的保险产品，填写宠物信息和个人信息，完成支付即可。整个流程简单便捷，通常5分钟内即可完成。'
      },
      {
        id: 'faq_2',
        category: 'purchase',
        question: '什么年龄的宠物可以购买保险？',
        answer: '一般来说，宠物年龄需在3个月至8岁之间。具体年龄要求可能因产品而异，建议查看具体产品的投保须知。'
      },
      {
        id: 'faq_3',
        category: 'coverage',
        question: '保险涵盖哪些疾病和治疗？',
        answer: '我们的保险涵盖意外伤害、疾病医疗、手术费用等。具体保障范围请查看产品详情页面的保障条款。'
      },
      {
        id: 'faq_4',
        category: 'coverage',
        question: '是否有等待期？',
        answer: '是的，保险通常有30天等待期。在等待期内发生的疾病，保险公司不承担赔偿责任。意外伤害一般无等待期。'
      },
      {
        id: 'faq_5',
        category: 'claim',
        question: '理赔需要什么材料？',
        answer: '理赔需要提供：1)医疗发票和费用清单 2)病历和诊断证明 3)检查报告 4)保单复印件 5)身份证明等。'
      },
      {
        id: 'faq_6',
        category: 'claim',
        question: '理赔多长时间能到账？',
        answer: '一般情况下，资料齐全且审核通过后，理赔款会在3-5个工作日内到账。复杂案例可能需要更长时间。'
      },
      {
        id: 'faq_7',
        category: 'claim',
        question: '如何申请理赔？',
        answer: '您可以通过App在线提交理赔申请，上传相关材料照片，我们的客服会及时跟进处理。也可以拨打客服电话申请。'
      },
      {
        id: 'faq_8',
        category: 'policy',
        question: '如何查看我的保单？',
        answer: '登录App后，在"我的保单"页面可以查看所有保单信息，包括保障详情、理赔记录等。'
      },
      {
        id: 'faq_9',
        category: 'policy',
        question: '可以取消保单吗？',
        answer: '可以的。您可以在App中申请取消保单。根据取消时间和保单条款，可能会收取一定的手续费。'
      },
      {
        id: 'faq_10',
        category: 'policy',
        question: '保单到期后如何续保？',
        answer: '保单到期前，我们会提前通知您。您可以选择自动续保或手动续保，保障不中断。'
      }
    ];
    
    // 根据分类筛选
    const faqs = category ? allFaqs.filter(faq => faq.category === category) : allFaqs;
    
    // 按分类整理FAQ
    const faqsByCategory = {
      purchase: [],
      coverage: [],
      claim: [],
      policy: []
    };
    
    faqs.forEach(faq => {
      if (faqsByCategory[faq.category]) {
        faqsByCategory[faq.category].push({
          id: faq.id,
          question: faq.question,
          answer: faq.answer
        });
      }
    });

    res.status(200).json({
      code: 200,
      message: '获取成功',
      data: {
        categories: [
          {
            id: 'purchase',
            name: '购买相关',
            faqs: faqsByCategory.purchase
          },
          {
            id: 'coverage',
            name: '保障范围',
            faqs: faqsByCategory.coverage
          },
          {
            id: 'claim',
            name: '理赔相关',
            faqs: faqsByCategory.claim
          },
          {
            id: 'policy',
            name: '保单管理',
            faqs: faqsByCategory.policy
          }
        ]
      }
    });

  } catch (error) {
    console.error('获取保险FAQ失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      data: null
    });
  }
};

// 上传保险条款图片
exports.uploadTermsImage = async (req, res) => {
  try {
    await ensureConnection();
    
    const { productId } = req.params;
    
    if (!req.file) {
      return res.status(400).json({
        code: 400,
        message: '请上传有效的图片文件',
        data: null
      });
    }

    // 验证产品是否存在
    const validProductIds = ['product_1', 'product_2', 'product_3', 'product_4'];
    if (!validProductIds.includes(productId)) {
      return res.status(404).json({
        code: 404,
        message: '保险产品不存在',
        data: null
      });
    }

    // 构建图片URL
    const imageUrl = `/uploads/${req.file.filename}`;

    // 这里可以添加数据库更新逻辑
    // 暂时返回成功响应
    res.status(200).json({
      code: 200,
      message: '上传成功',
      data: {
        imageUrl
      }
    });

  } catch (error) {
    console.error('上传保险条款图片失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      data: null
    });
  }
};

// 上传理赔流程图片
exports.uploadClaimProcessImage = async (req, res) => {
  try {
    await ensureConnection();
    
    const { productId } = req.params;
    
    if (!req.file) {
      return res.status(400).json({
        code: 400,
        message: '请上传有效的图片文件',
        data: null
      });
    }

    // 验证产品是否存在
    const validProductIds = ['product_1', 'product_2', 'product_3', 'product_4'];
    if (!validProductIds.includes(productId)) {
      return res.status(404).json({
        code: 404,
        message: '保险产品不存在',
        data: null
      });
    }

    // 构建图片URL
    const imageUrl = `/uploads/${req.file.filename}`;

    // 这里可以添加数据库更新逻辑
    // 暂时返回成功响应
    res.status(200).json({
      code: 200,
      message: '上传成功',
      data: {
        imageUrl
      }
    });

  } catch (error) {
    console.error('上传理赔流程图片失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      data: null
    });
  }
};
