const { getRedisClient } = require('../config/redis');
const { v4: uuidv4 } = require('uuid');

/**
 * Insurance class represents the model for insurance plans and policies
 */
class Insurance {
  /**
   * Get all insurance plans from Redis
   * @param {Object} options - Filter options
   * @returns {Promise<Array>} Array of insurance plans
   */
  static async getPlans(options = {}) {
    const client = getRedisClient();
    
    try {
      const planKeys = await client.keys('insurance:plan:*');
      
      if (!planKeys.length) {
        // 如果没有保险计划数据，添加一些测试数据
        await this.createSamplePlans();
        return this.getPlans(options);
      }
      
      const plans = [];
      for (const key of planKeys) {
        const planData = await client.get(key);
        if (planData) {
          const plan = JSON.parse(planData);
          
          // Apply filters if provided
          if (options.petType && !plan.petTypes.includes(options.petType)) continue;
          if (options.category && plan.category !== options.category) continue;
          if (options.ageRange && !plan.ageRange.some(range => range === options.ageRange)) continue;
          
          plans.push(plan);
        }
      }
      
      return plans;
    } catch (error) {
      console.error('Error getting insurance plans:', error);
      return [];
    }
  }
  
  /**
   * Create sample insurance plans for testing
   * @private
   */
  static async createSamplePlans() {
    const client = getRedisClient();
    
    const samplePlans = [
      {
        id: 'plan1',
        name: '宠物基础医疗保险',
        description: '为您的宠物提供基础医疗保障，包括常见疾病和意外伤害。',
        category: 'health',
        petTypes: ['狗', '猫'],
        ageRange: ['puppy', 'adult'],
        price: 199,
        coverage: 5000,
        period: '1year',
        features: ['基础医疗', '意外伤害', '疾病治疗']
      },
      {
        id: 'plan2',
        name: '宠物综合保险',
        description: '全面保障您宠物的健康，包括疾病、意外和第三方责任。',
        category: 'comprehensive',
        petTypes: ['狗', '猫', '其他'],
        ageRange: ['puppy', 'adult', 'senior'],
        price: 299,
        coverage: 10000,
        period: '1year',
        features: ['综合医疗', '意外伤害', '第三方责任', '手术保障']
      },
      {
        id: 'plan3',
        name: '宠物老年关爱计划',
        description: '专为老年宠物设计的保险计划，提供更完善的慢性病保障。',
        category: 'health',
        petTypes: ['狗', '猫'],
        ageRange: ['senior'],
        price: 399,
        coverage: 15000,
        period: '1year',
        features: ['老年专属', '慢性病保障', '手术保障', '住院津贴']
      }
    ];
    
    for (const plan of samplePlans) {
      await client.set(`insurance:plan:${plan.id}`, JSON.stringify(plan));
      console.log(`Sample plan created: ${plan.name}`);
    }
  }
  
  /**
   * Get a specific insurance plan by ID
   * @param {String} planId - The plan ID
   * @returns {Promise<Object|null>} Insurance plan object or null if not found
   */
  static async getPlanById(planId) {
    try {
      const client = getRedisClient();
      const planData = await client.get(`insurance:plan:${planId}`);
      return planData ? JSON.parse(planData) : null;
    } catch (error) {
      console.error('Error getting plan by ID:', error);
      return null;
    }
  }
  
  /**
   * Get all policies for a user
   * @param {String} userId - User ID
   * @param {Object} options - Filter options
   * @returns {Promise<Array>} Array of insurance policies
   */
  static async getUserPolicies(userId, options = {}) {
    try {
      const client = getRedisClient();
      const policyKeys = await client.keys(`insurance:policy:*:user:${userId}`);
      
      if (!policyKeys.length) return [];
      
      const policies = [];
      for (const key of policyKeys) {
        const policyData = await client.get(key);
        if (policyData) {
          const policy = JSON.parse(policyData);
          
          // Apply status filter if provided
          if (options.status && policy.status !== options.status) continue;
          
          policies.push(policy);
        }
      }
      
      return policies;
    } catch (error) {
      console.error('Error getting user policies:', error);
      return [];
    }
  }
  
  /**
   * Get a specific policy by ID
   * @param {String} policyId - Policy ID
   * @returns {Promise<Object|null>} Policy object or null if not found
   */
  static async getPolicyById(policyId) {
    try {
      const client = getRedisClient();
      const policyKeys = await client.keys(`insurance:policy:${policyId}:*`);
      
      if (!policyKeys.length) return null;
      
      const policyData = await client.get(policyKeys[0]);
      return policyData ? JSON.parse(policyData) : null;
    } catch (error) {
      console.error('Error getting policy by ID:', error);
      return null;
    }
  }
  
  /**
   * Create a new insurance policy
   * @param {Object} policyData - Policy data
   * @returns {Promise<Object>} Created policy
   */
  static async createPolicy(policyData) {
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
      
      await client.set(
        `insurance:policy:${policyId}:user:${policyData.userId}`,
        JSON.stringify(policy)
      );
      
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
  static async updatePolicy(policyId, updateData) {
    try {
      const policy = await this.getPolicyById(policyId);
      
      if (!policy) return null;
      
      const client = getRedisClient();
      const updatedPolicy = {
        ...policy,
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      
      await client.set(
        `insurance:policy:${policyId}:user:${policy.userId}`,
        JSON.stringify(updatedPolicy)
      );
      
      return updatedPolicy;
    } catch (error) {
      console.error('Error updating policy:', error);
      return null;
    }
  }
  
  /**
   * Get all claims for a user
   * @param {String} userId - User ID
   * @param {Object} options - Filter options
   * @returns {Promise<Array>} Array of claims
   */
  static async getUserClaims(userId, options = {}) {
    try {
      const client = getRedisClient();
      const claimKeys = await client.keys(`insurance:claim:*:user:${userId}`);
      
      if (!claimKeys.length) return [];
      
      const claims = [];
      for (const key of claimKeys) {
        const claimData = await client.get(key);
        if (claimData) {
          const claim = JSON.parse(claimData);
          
          // Apply filters if provided
          if (options.policyId && claim.policyId !== options.policyId) continue;
          if (options.status && claim.status !== options.status) continue;
          
          claims.push(claim);
        }
      }
      
      return claims;
    } catch (error) {
      console.error('Error getting user claims:', error);
      return [];
    }
  }
  
  /**
   * Get a specific claim by ID
   * @param {String} claimId - Claim ID
   * @returns {Promise<Object|null>} Claim object or null if not found
   */
  static async getClaimById(claimId) {
    try {
      const client = getRedisClient();
      const claimKeys = await client.keys(`insurance:claim:${claimId}:*`);
      
      if (!claimKeys.length) return null;
      
      const claimData = await client.get(claimKeys[0]);
      return claimData ? JSON.parse(claimData) : null;
    } catch (error) {
      console.error('Error getting claim by ID:', error);
      return null;
    }
  }
  
  /**
   * Create a new claim
   * @param {Object} claimData - Claim data
   * @returns {Promise<Object>} Created claim
   */
  static async createClaim(claimData) {
    try {
      const client = getRedisClient();
      const claimId = uuidv4();
      
      const claim = {
        id: claimId,
        ...claimData,
        status: 'pending',
        submittedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await client.set(
        `insurance:claim:${claimId}:user:${claimData.userId}`,
        JSON.stringify(claim)
      );
      
      return claim;
    } catch (error) {
      console.error('Error creating claim:', error);
      throw error;
    }
  }
  
  /**
   * Update a claim
   * @param {String} claimId - Claim ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object|null>} Updated claim or null if not found
   */
  static async updateClaim(claimId, updateData) {
    try {
      const claim = await this.getClaimById(claimId);
      
      if (!claim) return null;
      
      const client = getRedisClient();
      const updatedClaim = {
        ...claim,
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      
      await client.set(
        `insurance:claim:${claimId}:user:${claim.userId}`,
        JSON.stringify(updatedClaim)
      );
      
      return updatedClaim;
    } catch (error) {
      console.error('Error updating claim:', error);
      return null;
    }
  }
}

module.exports = Insurance; 