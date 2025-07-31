const { getRedisClient } = require('../config/redis');
const { v4: uuidv4 } = require('uuid');

/**
 * Policy class represents the model for insurance policies
 */
class Policy {
  /**
   * Get a specific policy by ID
   * @param {String} policyId - Policy ID
   * @returns {Promise<Object|null>} Policy object or null if not found
   */
  static async getById(policyId) {
    try {
      const client = getRedisClient();
      const policyData = await client.get(`policy:${policyId}`);
      return policyData ? JSON.parse(policyData) : null;
    } catch (error) {
      console.error('Error getting policy by ID:', error);
      return null;
    }
  }
  
  /**
   * Get policies by user ID
   * @param {String} userId - User ID
   * @param {Object} options - Filter options 
   * @returns {Promise<Array>} Array of policy objects
   */
  static async getByUserId(userId, options = {}) {
    try {
      const client = getRedisClient();
      const policyIds = await client.sMembers(`user:${userId}:policies`);
      
      if (!policyIds.length) return [];
      
      const policies = [];
      for (const policyId of policyIds) {
        const policyData = await client.get(`policy:${policyId}`);
        if (policyData) {
          const policy = JSON.parse(policyData);
          
          // Apply filters if provided
          if (options.status && policy.status !== options.status) continue;
          
          policies.push(policy);
        }
      }
      
      return policies;
    } catch (error) {
      console.error('Error getting policies by user ID:', error);
      return [];
    }
  }
  
  /**
   * Create a new policy
   * @param {Object} policyData - Policy data
   * @returns {Promise<Object>} Created policy
   */
  static async create(policyData) {
    try {
      const client = getRedisClient();
      const policyId = uuidv4();
      
      const policy = {
        id: policyId,
        ...policyData,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Store policy in Redis
      await client.set(`policy:${policyId}`, JSON.stringify(policy));
      
      // Add policy to user's policy set
      await client.sAdd(`user:${policyData.userId}:policies`, policyId);
      
      // Add policy to pet's policy set if petId exists
      if (policyData.petId) {
        await client.sAdd(`pet:${policyData.petId}:policies`, policyId);
      }
      
      return policy;
    } catch (error) {
      console.error('Error creating policy:', error);
      throw error;
    }
  }
  
  /**
   * Update a policy
   * @param {String} policyId - Policy ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object|null>} Updated policy or null if not found
   */
  static async update(policyId, updateData) {
    try {
      const policy = await this.getById(policyId);
      
      if (!policy) return null;
      
      const updatedPolicy = {
        ...policy,
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      
      const client = getRedisClient();
      await client.set(`policy:${policyId}`, JSON.stringify(updatedPolicy));
      
      return updatedPolicy;
    } catch (error) {
      console.error('Error updating policy:', error);
      return null;
    }
  }
  
  /**
   * Get claims for a policy
   * @param {String} policyId - Policy ID
   * @returns {Promise<Array>} Array of claim objects
   */
  static async getClaims(policyId) {
    try {
      const client = getRedisClient();
      const claimIds = await client.sMembers(`policy:${policyId}:claims`);
      
      if (!claimIds.length) return [];
      
      const claims = [];
      for (const claimId of claimIds) {
        const claimData = await client.get(`claim:${claimId}`);
        if (claimData) {
          claims.push(JSON.parse(claimData));
        }
      }
      
      return claims;
    } catch (error) {
      console.error('Error getting claims for policy:', error);
      return [];
    }
  }
  
  /**
   * Add a claim to a policy
   * @param {String} policyId - Policy ID
   * @param {String} claimId - Claim ID
   * @returns {Promise<Boolean>} True if successful, false otherwise
   */
  static async addClaim(policyId, claimId) {
    try {
      const policy = await this.getById(policyId);
      
      if (!policy) return false;
      
      const client = getRedisClient();
      await client.sAdd(`policy:${policyId}:claims`, claimId);
      
      return true;
    } catch (error) {
      console.error('Error adding claim to policy:', error);
      return false;
    }
  }
  
  /**
   * Create a sample policy for testing
   * @param {String} userId - User ID
   * @param {String} petId - Pet ID
   * @returns {Promise<Object>} Created sample policy
   */
  static async createSamplePolicy(userId, petId) {
    try {
      // 基础保单数据
      const policyData = {
        userId,
        petId,
        planId: 'plan1',
        planName: '宠物基础医疗保险',
        planDescription: '为您的宠物提供基础医疗保障，包括常见疾病和意外伤害。',
        startDate: new Date().toISOString(),
        period: '1year',
        price: 998,
        coverage: 5000,
        ownerInfo: {
          name: '测试用户',
          phone: '13800138000',
          email: 'test@example.com'
        }
      };
      
      // 计算结束日期
      const startDateObj = new Date(policyData.startDate);
      const endDateObj = new Date(startDateObj);
      endDateObj.setFullYear(endDateObj.getFullYear() + 1);
      policyData.endDate = endDateObj.toISOString();
      
      // 创建保单
      return await this.create(policyData);
    } catch (error) {
      console.error('Error creating sample policy:', error);
      throw error;
    }
  }
}

module.exports = Policy; 