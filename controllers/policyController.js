const Policy = require('../models/Policy');
const Insurance = require('../models/Insurance');

/**
 * @desc    Get all policies for a user
 * @route   GET /api/policy/list
 * @access  Private
 */
exports.getUserPolicies = async (req, res) => {
  try {
    const { status, petId, page = 1, pageSize = 10 } = req.query;
    
    // Get policies with filters
    let policies = await Policy.getByUserId(req.user.id, { status });
    
    // Apply petId filter if provided
    if (petId) {
      policies = policies.filter(policy => policy.petId === petId);
    }
    
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
 * @desc    Get policy by ID
 * @route   GET /api/policy/:id
 * @access  Private
 */
exports.getPolicyById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const policy = await Policy.getById(id);
    
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
    const claims = await Policy.getClaims(id);
    
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
 * @desc    Create a new policy
 * @route   POST /api/policy/create
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
 * @desc    Cancel a policy
 * @route   PUT /api/policy/:id/cancel
 * @access  Private
 */
exports.cancelPolicy = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    if (!reason) {
      return res.status(400).json({
        code: 400,
        message: '取消原因不能为空',
        data: null
      });
    }
    
    const policy = await Policy.getById(id);
    
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
    await Policy.update(id, {
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
 * @desc    Get policy's claims
 * @route   GET /api/policy/:id/claims
 * @access  Private
 */
exports.getPolicyClaims = async (req, res) => {
  try {
    const { id } = req.params;
    
    const policy = await Policy.getById(id);
    
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
    const claims = await Policy.getClaims(id);
    
    res.status(200).json({
      code: 200,
      message: 'success',
      data: claims
    });
  } catch (error) {
    console.error('Error getting policy claims:', error);
    res.status(500).json({
      code: 500,
      message: '获取保单理赔记录失败',
      data: null
    });
  }
};

/**
 * @desc    Renew a policy
 * @route   POST /api/policy/:id/renew
 * @access  Private
 */
exports.renewPolicy = async (req, res) => {
  try {
    const { id } = req.params;
    const { period } = req.body;
    
    const policy = await Policy.getById(id);
    
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
        message: '无权续保该保单',
        data: null
      });
    }
    
    // Get insurance plan for this policy
    const insurancePlan = await Insurance.getPlanById(policy.planId);
    
    if (!insurancePlan) {
      return res.status(404).json({
        code: 404,
        message: '保险计划不存在',
        data: null
      });
    }
    
    // Create renewal policy data
    const renewalData = {
      userId: req.user.id,
      planId: policy.planId,
      planName: insurancePlan.name,
      planDescription: insurancePlan.description,
      petId: policy.petId,
      startDate: new Date().toISOString(),
      period: period || policy.period,
      price: insurancePlan.price,
      coverage: insurancePlan.coverage,
      ownerInfo: policy.ownerInfo,
      isRenewal: true,
      previousPolicyId: policy.id
    };
    
    // Calculate end date based on period
    const startDateObj = new Date(renewalData.startDate);
    let endDateObj;
    
    if (renewalData.period === '6months') {
      endDateObj = new Date(startDateObj);
      endDateObj.setMonth(endDateObj.getMonth() + 6);
    } else if (renewalData.period === '3months') {
      endDateObj = new Date(startDateObj);
      endDateObj.setMonth(endDateObj.getMonth() + 3);
    } else {
      // Default to 1 year
      endDateObj = new Date(startDateObj);
      endDateObj.setFullYear(endDateObj.getFullYear() + 1);
    }
    
    renewalData.endDate = endDateObj.toISOString();
    
    // Create policy
    const renewalPolicy = await Policy.create(renewalData);
    
    res.status(200).json({
      code: 200,
      message: '续保成功',
      data: {
        policyId: renewalPolicy.id,
        amount: renewalPolicy.price,
        paymentUrl: `/api/payment/pay?type=insurance&id=${renewalPolicy.id}` // Mock payment URL
      }
    });
  } catch (error) {
    console.error('Error renewing policy:', error);
    res.status(500).json({
      code: 500,
      message: '续保失败',
      data: null
    });
  }
}; 