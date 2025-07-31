const Insurance = require('../models/Insurance');
const Policy = require('../models/Policy');
const { getRedisClient } = require('../config/redis');
const path = require('path');

const redisClient = getRedisClient();

// 添加一个辅助函数来检查连接状态
const ensureConnection = async () => {
  if (!redisClient.isOpen) {
    console.log('Redis client not connected, attempting to connect...');
    await redisClient.connect();
    console.log('Redis client connected');
  }
};

/**
 * @desc    Get insurance products
 * @route   GET /api/insurance/products
 * @access  Public
 */
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
    
    // 模拟保险产品数据
    const products = [];
    for (let i = 0; i < pageSize; i++) {
      products.push({
        id: `product_${i + 1}`,
        name: `宠物保险产品${i + 1}`,
        company: ['太平洋保险', '平安保险', '人保财险'][i % 3],
        coverage: `全面保障宠物意外伤害和疾病医疗费用`,
        price: Math.floor(Math.random() * 1000) + 500,
        originalPrice: Math.floor(Math.random() * 1200) + 800,
        petTypes: petType ? [petType] : ['dog', 'cat'],
        type: ['medical', 'accident', 'comprehensive'][i % 3],
        image: `https://picsum.photos/300/200?random=${i + 1000}`,
        tags: ['热门', '性价比', '全面保障'].slice(0, Math.floor(Math.random() * 3) + 1),
        period: '1年',
        rating: (4.0 + Math.random()).toFixed(1),
        salesCount: Math.floor(Math.random() * 2000) + 100
      });
    }

    res.status(200).json({
      code: 200,
      message: '获取成功',
      data: {
        list: products,
        total: 100,
        hasMore: page * pageSize < 100
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

/**
 * @desc    Get insurance product details
 * @route   GET /api/insurance/products/:productId
 * @access  Public
 */
exports.getProductDetail = async (req, res) => {
  try {
    await ensureConnection();
    
    const { productId } = req.params;
    
    const plan = await Insurance.getPlanById(planId);
    
    if (!plan) {
      return res.status(404).json({
        code: 404,
        message: '保险计划不存在',
        data: null
      });
    }
    
    res.status(200).json({
      code: 200,
      message: 'success',
      data: plan
    });
  } catch (error) {
    console.error('Error getting insurance plan:', error);
    res.status(500).json({
      code: 500,
      message: '获取保险计划详情失败',
      data: null
    });
  }
};

/**
 * @desc    Get user's insurance policies
 * @route   GET /api/insurance/policies
 * @access  Private
 */
exports.getPolicies = async (req, res) => {
  try {
    const { status, page = 1, pageSize = 10 } = req.query;
    
    // Get policies with optional status filter
    const policies = await Policy.getByUserId(req.user.id, { status });
    
    // Apply pagination
    const startIndex = (page - 1) * pageSize;
    const endIndex = page * pageSize;
    const paginatedPolicies = policies.slice(startIndex, endIndex);
    
    res.status(200).json({
      code: 200,
      message: 'success',
      data: {
        total: policies.length,
        items: paginatedPolicies
      }
    });
  } catch (error) {
    console.error('Error getting policies:', error);
    res.status(500).json({
      code: 500,
      message: '获取保单列表失败',
      data: null
    });
  }
};

/**
 * @desc    Get policy details
 * @route   GET /api/insurance/policy/:policyId
 * @access  Private
 */
exports.getPolicyById = async (req, res) => {
  try {
    const { policyId } = req.params;
    
    const policy = await Policy.getById(policyId);
    
    if (!policy) {
      return res.status(404).json({
        code: 404,
        message: '保单不存在',
        data: null
      });
    }
    
    // Check if user owns this policy
    if (policy.userId !== req.user.id) {
      return res.status(403).json({
        code: 403,
        message: '无权访问该保单信息',
        data: null
      });
    }
    
    // Get claims for this policy
    const claims = await Policy.getClaims(policyId);
    
    // Add claims to policy response
    const policyWithClaims = {
      ...policy,
      claimHistory: claims
    };
    
    res.status(200).json({
      code: 200,
      message: 'success',
      data: policyWithClaims
    });
  } catch (error) {
    console.error('Error getting policy:', error);
    res.status(500).json({
      code: 500,
      message: '获取保单详情失败',
      data: null
    });
  }
};

/**
 * @desc    Create a new insurance policy
 * @route   POST /api/insurance/create-policy
 * @access  Private
 */
exports.createPolicy = async (req, res) => {
  try {
    const { planId, petId, startDate, period, ownerInfo } = req.body;
    
    // Validate required fields
    if (!planId || !petId) {
      return res.status(400).json({
        code: 400,
        message: '保险计划ID和宠物ID不能为空',
        data: null
      });
    }
    
    // Check if insurance plan exists
    const insurancePlan = await Insurance.getPlanById(planId);
    if (!insurancePlan) {
      return res.status(404).json({
        code: 404,
        message: '保险计划不存在',
        data: null
      });
    }
    
    // Create policy data
    const policyData = {
      userId: req.user.id,
      planId,
      planName: insurancePlan.name,
      planDescription: insurancePlan.description,
      petId,
      startDate: startDate || new Date().toISOString(),
      period: period || '1year',
      price: insurancePlan.price,
      coverage: insurancePlan.coverage,
      ownerInfo: ownerInfo || {
        name: req.user.username,
        phone: req.user.phone,
        email: req.user.email
      }
    };
    
    // Calculate end date based on period
    const startDateObj = new Date(policyData.startDate);
    let endDateObj;
    
    if (period === '6months') {
      endDateObj = new Date(startDateObj);
      endDateObj.setMonth(endDateObj.getMonth() + 6);
    } else if (period === '3months') {
      endDateObj = new Date(startDateObj);
      endDateObj.setMonth(endDateObj.getMonth() + 3);
    } else {
      // Default to 1 year
      endDateObj = new Date(startDateObj);
      endDateObj.setFullYear(endDateObj.getFullYear() + 1);
    }
    
    policyData.endDate = endDateObj.toISOString();
    
    // Create policy
    const policy = await Policy.create(policyData);
    
    res.status(200).json({
      code: 200,
      message: '创建成功',
      data: {
        policyId: policy.id,
        amount: policy.price,
        paymentUrl: `/api/payment/pay?type=insurance&id=${policy.id}` // Mock payment URL
      }
    });
  } catch (error) {
    console.error('Error creating policy:', error);
    res.status(500).json({
      code: 500,
      message: '创建保单失败',
      data: null
    });
  }
};

/**
 * @desc    Cancel an insurance policy
 * @route   PUT /api/insurance/cancel-policy/:policyId
 * @access  Private
 */
exports.cancelPolicy = async (req, res) => {
  try {
    const { policyId } = req.params;
    const { reason } = req.body;
    
    if (!reason) {
      return res.status(400).json({
        code: 400,
        message: '取消原因不能为空',
        data: null
      });
    }
    
    const policy = await Policy.getById(policyId);
    
    if (!policy) {
      return res.status(404).json({
        code: 404,
        message: '保单不存在',
        data: null
      });
    }
    
    // Check if user owns this policy
    if (policy.userId !== req.user.id) {
      return res.status(403).json({
        code: 403,
        message: '无权取消该保单',
        data: null
      });
    }
    
    // Check if policy can be canceled (only pending or active)
    if (!['pending', 'active'].includes(policy.status)) {
      return res.status(400).json({
        code: 400,
        message: '该保单状态不允许取消',
        data: null
      });
    }
    
    // Calculate refund amount (simplified logic - in real app would be more complex)
    let refundAmount = 0;
    
    if (policy.status === 'active') {
      const startDate = new Date(policy.startDate);
      const endDate = new Date(policy.endDate);
      const now = new Date();
      
      // Calculate what percentage of the policy period has been used
      const totalDuration = endDate - startDate;
      const usedDuration = now - startDate;
      const unusedPercentage = 1 - (usedDuration / totalDuration);
      
      // Apply a minimum 10% cancellation fee
      refundAmount = Math.max(0, policy.price * unusedPercentage * 0.9);
      refundAmount = Math.round(refundAmount * 100) / 100; // Round to 2 decimal places
    }
    
    // Update policy status
    await Policy.update(policyId, {
      status: 'cancelled',
      cancellationReason: reason,
      cancellationDate: new Date().toISOString()
    });
    
    res.status(200).json({
      code: 200,
      message: '取消成功',
      data: {
        refundAmount
      }
    });
  } catch (error) {
    console.error('Error canceling policy:', error);
    res.status(500).json({
      code: 500,
      message: '取消保单失败',
      data: null
    });
  }
};

/**
 * @desc    Submit an insurance claim
 * @route   POST /api/insurance/submit-claim
 * @access  Private
 */
exports.submitClaim = async (req, res) => {
  try {
    const { policyId, amount, reason, date, description } = req.body;
    
    // Check for required fields
    if (!policyId || !amount || !reason || !date) {
      return res.status(400).json({
        code: 400,
        message: '保单ID、理赔金额、理赔原因和事件日期不能为空',
        data: null
      });
    }
    
    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        code: 400,
        message: '请上传理赔相关证明文件',
        data: null
      });
    }
    
    // Check if policy exists
    const policy = await Policy.getById(policyId);
    
    if (!policy) {
      return res.status(404).json({
        code: 404,
        message: '保单不存在',
        data: null
      });
    }
    
    // Check if user owns this policy
    if (policy.userId !== req.user.id) {
      return res.status(403).json({
        code: 403,
        message: '无权为该保单提交理赔',
        data: null
      });
    }
    
    // Check if policy is active
    if (policy.status !== 'active') {
      return res.status(400).json({
        code: 400,
        message: '只有生效中的保单才能提交理赔',
        data: null
      });
    }
    
    // Check if claim date is within policy period
    const claimDate = new Date(date);
    const startDate = new Date(policy.startDate);
    const endDate = new Date(policy.endDate);
    
    if (claimDate < startDate || claimDate > endDate) {
      return res.status(400).json({
        code: 400,
        message: '理赔日期必须在保单有效期内',
        data: null
      });
    }
    
    // Check if claim amount is within coverage
    if (parseFloat(amount) > parseFloat(policy.coverage)) {
      return res.status(400).json({
        code: 400,
        message: '理赔金额超过保障额度',
        data: null
      });
    }
    
    // Create file URLs for uploaded documents
    const documents = req.files.map(file => {
      return `/uploads/claims/${file.filename}`;
    });
    
    // Create claim data
    const claimData = {
      userId: req.user.id,
      policyId,
      policyName: policy.planName,
      amount: parseFloat(amount),
      reason,
      date,
      description: description || '',
      documents
    };
    
    // Create claim in database
    const claim = await Insurance.createClaim(claimData);
    
    // Add claim to policy's claims
    await Policy.addClaim(policyId, claim.id);
    
    res.status(200).json({
      code: 200,
      message: '提交成功',
      data: {
        claimId: claim.id,
        status: claim.status
      }
    });
  } catch (error) {
    console.error('Error submitting claim:', error);
    res.status(500).json({
      code: 500,
      message: '提交理赔申请失败',
      data: null
    });
  }
};

/**
 * @desc    Get user's insurance claims
 * @route   GET /api/insurance/claims
 * @access  Private
 */
exports.getClaims = async (req, res) => {
  try {
    const { policyId, status, page = 1, pageSize = 10 } = req.query;
    
    // Get claims with filters
    const claims = await Insurance.getUserClaims(req.user.id, { policyId, status });
    
    // Apply pagination
    const startIndex = (page - 1) * pageSize;
    const endIndex = page * pageSize;
    const paginatedClaims = claims.slice(startIndex, endIndex);
    
    res.status(200).json({
      code: 200,
      message: 'success',
      data: {
        total: claims.length,
        items: paginatedClaims
      }
    });
  } catch (error) {
    console.error('Error getting claims:', error);
    res.status(500).json({
      code: 500,
      message: '获取理赔列表失败',
      data: null
    });
  }
};

/**
 * @desc    Get claim details
 * @route   GET /api/insurance/claim/:claimId
 * @access  Private
 */
exports.getClaimById = async (req, res) => {
  try {
    const { claimId } = req.params;
    
    const claim = await Insurance.getClaimById(claimId);
    
    if (!claim) {
      return res.status(404).json({
        code: 404,
        message: '理赔申请不存在',
        data: null
      });
    }
    
    // Check if user owns this claim
    if (claim.userId !== req.user.id) {
      return res.status(403).json({
        code: 403,
        message: '无权访问该理赔申请',
        data: null
      });
    }
    
    res.status(200).json({
      code: 200,
      message: 'success',
      data: claim
    });
  } catch (error) {
    console.error('Error getting claim:', error);
    res.status(500).json({
      code: 500,
      message: '获取理赔详情失败',
      data: null
    });
  }
};

/**
 * @desc    Get insurance recommendations
 * @route   GET /api/insurance/recommendations
 * @access  Public/Private
 */
exports.getRecommendations = async (req, res) => {
  try {
    let petType, age, breed;
    
    // If user is logged in, we can try to get their pet info
    if (req.user) {
      // Logic to get user's pet would go here
      // For now, we'll just use query params if provided
      petType = req.query.petType;
      age = req.query.age;
      breed = req.query.breed;
    } else {
      // For non-logged in users, require parameters
      petType = req.query.petType;
      age = req.query.age;
      breed = req.query.breed;
      
      if (!petType || !age) {
        return res.status(400).json({
          code: 400,
          message: '未登录用户需提供宠物类型和年龄',
          data: null
        });
      }
    }
    
    // Get all plans
    const allPlans = await Insurance.getPlans();
    
    // Filter and score plans based on pet info
    let recommendedPlans = allPlans;
    
    if (petType) {
      recommendedPlans = recommendedPlans.filter(plan => 
        plan.petTypes.includes(petType.toLowerCase())
      );
    }
    
    if (age) {
      // Define age ranges
      const ageNum = parseInt(age);
      let ageRange;
      
      if (ageNum < 2) ageRange = 'puppy';
      else if (ageNum > 8) ageRange = 'senior';
      else ageRange = 'adult';
      
      // Filter plans suitable for the age range
      recommendedPlans = recommendedPlans.filter(plan =>
        plan.ageRange.includes(ageRange)
      );
      
      // Sort plans by relevance to age
      recommendedPlans = recommendedPlans.sort((a, b) => {
        const aHasExactAge = a.ageRange.includes(ageRange);
        const bHasExactAge = b.ageRange.includes(ageRange);
        
        if (aHasExactAge && !bHasExactAge) return -1;
        if (!aHasExactAge && bHasExactAge) return 1;
        return 0;
      });
    }
    
    // Add recommendation reason
    recommendedPlans = recommendedPlans.map(plan => {
      let reason = '';
      
      if (petType && plan.petTypes.includes(petType.toLowerCase())) {
        reason += `适合${petType}的保险计划。`;
      }
      
      if (age) {
        const ageNum = parseInt(age);
        if (ageNum < 2 && plan.ageRange.includes('puppy')) {
          reason += '特别适合幼龄宠物。';
        } else if (ageNum > 8 && plan.ageRange.includes('senior')) {
          reason += '特别适合老年宠物。';
        } else if (ageNum >= 2 && ageNum <= 8 && plan.ageRange.includes('adult')) {
          reason += '适合成年宠物。';
        }
      }
      
      if (breed && plan.description.toLowerCase().includes(breed.toLowerCase())) {
        reason += `包含适合${breed}的特殊保障。`;
      }
      
      if (!reason) {
        reason = '综合性保障方案';
      }
      
      return {
        id: plan.id,
        name: plan.name,
        description: plan.description,
        category: plan.category,
        price: plan.price,
        coverage: plan.coverage,
        features: plan.features || [],
        recommendation_reason: reason
      };
    });
    
    // Limit to top recommendations
    const topRecommendations = recommendedPlans.slice(0, 5);
    
    res.status(200).json({
      code: 200,
      message: 'success',
      data: topRecommendations
    });
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({
      code: 500,
      message: '获取保险推荐失败',
      data: null
    });
  }
};

/**
 * @desc    Upload insurance document
 * @route   POST /api/insurance/upload-document
 * @access  Private
 */
exports.uploadDocument = async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        code: 400,
        message: '未上传文件',
        data: null
      });
    }
    
    const { type, policyId, claimId, description } = req.body;
    
    // Check document type
    if (!type || !['policy', 'claim', 'medical', 'other'].includes(type)) {
      return res.status(400).json({
        code: 400,
        message: '文件类型无效',
        data: null
      });
    }
    
    // If policy or claim ID is provided, verify ownership
    if (policyId) {
      const policy = await Policy.getById(policyId);
      
      if (!policy) {
        return res.status(404).json({
          code: 404,
          message: '保单不存在',
          data: null
        });
      }
      
      if (policy.userId !== req.user.id) {
        return res.status(403).json({
          code: 403,
          message: '无权为该保单上传文件',
          data: null
        });
      }
    }
    
    if (claimId) {
      const claim = await Insurance.getClaimById(claimId);
      
      if (!claim) {
        return res.status(404).json({
          code: 404,
          message: '理赔申请不存在',
          data: null
        });
      }
      
      if (claim.userId !== req.user.id) {
        return res.status(403).json({
          code: 403,
          message: '无权为该理赔申请上传文件',
          data: null
        });
      }
    }
    
    // Get file details
    const documentUrl = `/uploads/insurance/${req.file.filename}`;
    
    // In a real app, you would store document info in database
    const documentId = Date.now().toString();
    
    res.status(200).json({
      code: 200,
      message: '上传成功',
      data: {
        url: documentUrl,
        documentId
      }
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({
      code: 500,
      message: '上传文件失败',
      data: null
    });
  }
}; 