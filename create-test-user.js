const redis = require('redis');
const jwt = require('jsonwebtoken');
const client = redis.createClient();

const JWT_SECRET = 'petpal-secret-key-should-be-environment-variable'; // 应该与你的应用配置一致

async function createTestUser() {
  try {
    await client.connect();
    console.log('Connected to Redis');
    
    const userId = 'user123';
    
    // 创建测试用户
    const userData = {
      id: userId,
      username: 'testuser',
      phone: '13800001234',
      email: 'test@example.com',
      avatar: '/images/default-avatar.jpg',
      createTime: new Date().toISOString()
    };
    
    await client.set(`user:${userId}`, JSON.stringify(userData));
    console.log('Created test user');
    
    // 生成JWT令牌
    const token = jwt.sign(
      { userId: userId, username: 'testuser' }, 
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    console.log('Generated JWT token:');
    console.log(token);
    console.log('');
    console.log('You can use this token in the Authorization header:');
    console.log('Authorization: Bearer ' + token);
    
    await client.disconnect();
    console.log('Test user setup complete');
  } catch (error) {
    console.error('Error:', error);
  }
}

createTestUser();
