const jwt = require('jsonwebtoken');
const config = require('./config/jwt');

// 创建测试用户token
const testUser = {
  userId: 'test_user_123',
  id: 'test_user_123', // 兼容两种格式
  phone: '13800138000',
  username: '测试用户',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24小时后过期
};

const token = jwt.sign(testUser, config.secret);
console.log('测试用户Token:', token);

// 验证token有效性
try {
  const decoded = jwt.verify(token, config.secret);
  console.log('Token验证成功:', decoded);
} catch (error) {
  console.error('Token验证失败:', error.message);
}
