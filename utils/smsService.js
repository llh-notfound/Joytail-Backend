const { getRedisClient } = require('../config/redis');

/**
 * SMS Service
 * 
 * 注意：这是一个模拟的短信服务，实际生产环境需要接入真实的短信服务商API
 * 在生产环境中，您需要：
 * 1. 注册短信服务商账号（如阿里云、腾讯云等）
 * 2. 申请短信签名和模板
 * 3. 使用对应SDK发送短信
 */

// 验证码有效期（秒）
const CODE_EXPIRE_TIME = 300; // 5分钟

// 同一手机号发送频率限制（秒）
const SEND_FREQUENCY_LIMIT = 60; // 1分钟

// 短信验证码长度
const CODE_LENGTH = 6;

// 随机生成验证码
const generateVerificationCode = (length = CODE_LENGTH) => {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += Math.floor(Math.random() * 10);
  }
  return code;
};

/**
 * 发送短信验证码
 * @param {string} phone 手机号
 * @param {string} type 验证码类型 (login - 登录验证, register - 注册验证)
 * @returns {Promise<{success: boolean, message: string, code?: string}>}
 */
exports.sendVerificationCode = async (phone, type = 'login') => {
  try {
    const redisClient = getRedisClient();
    
    // 检查该手机号发送频率
    const lastSendTimeKey = `sms:frequency:${phone}`;
    const lastSendTime = await redisClient.get(lastSendTimeKey);
    
    if (lastSendTime) {
      const elapsedTime = Math.floor(Date.now() / 1000) - parseInt(lastSendTime);
      if (elapsedTime < SEND_FREQUENCY_LIMIT) {
        return {
          success: false,
          message: `发送过于频繁，请${SEND_FREQUENCY_LIMIT - elapsedTime}秒后再试`
        };
      }
    }
    
    // 生成验证码
    const verificationCode = generateVerificationCode();
    
    // 保存验证码到Redis
    const codeKey = `sms:code:${type}:${phone}`;
    await redisClient.set(codeKey, verificationCode, { EX: CODE_EXPIRE_TIME });
    
    // 更新发送时间
    await redisClient.set(lastSendTimeKey, Math.floor(Date.now() / 1000), { EX: SEND_FREQUENCY_LIMIT });
    
    // 实际环境中，这里应该调用SMS服务商API发送短信
    console.log(`【PetPal】验证码: ${verificationCode}，用于${type === 'login' ? '登录' : '注册'}验证，${CODE_EXPIRE_TIME/60}分钟内有效，请勿泄露。`);
    
    return {
      success: true,
      message: '验证码发送成功',
      // 注意：实际环境中不应该返回验证码，这里是为了方便测试
      code: verificationCode
    };
  } catch (error) {
    console.error('Send verification code error:', error);
    return {
      success: false,
      message: '发送验证码失败'
    };
  }
};

/**
 * 验证短信验证码
 * @param {string} phone 手机号
 * @param {string} code 验证码
 * @param {string} type 验证码类型 (login - 登录验证, register - 注册验证)
 * @returns {Promise<boolean>}
 */
exports.verifyCode = async (phone, code, type = 'login') => {
  try {
    const redisClient = getRedisClient();
    
    const codeKey = `sms:code:${type}:${phone}`;
    const savedCode = await redisClient.get(codeKey);
    
    if (!savedCode) {
      return false; // 验证码不存在或已过期
    }
    
    const isValid = savedCode === code;
    
    if (isValid) {
      // 验证成功后，删除验证码，防止重复使用
      await redisClient.del(codeKey);
    }
    
    return isValid;
  } catch (error) {
    console.error('Verify code error:', error);
    return false;
  }
};

/**
 * 检查手机号是否已注册
 * @param {string} phone 手机号
 * @returns {Promise<{exists: boolean, userId?: string, username?: string}>}
 */
exports.checkPhoneExists = async (phone) => {
  try {
    const redisClient = getRedisClient();
    
    // 查找手机号关联的用户
    const phoneKey = `phone:${phone}`;
    const userId = await redisClient.get(phoneKey);
    
    if (!userId) {
      return { exists: false };
    }
    
    // 获取用户名
    const username = await redisClient.hGet('userIds', userId);
    
    return {
      exists: true,
      userId,
      username
    };
  } catch (error) {
    console.error('Check phone exists error:', error);
    return { exists: false };
  }
}; 