const { connectRedis, getRedisClient } = require('./config/redis');

async function checkAuthUsers() {
  try {
    await connectRedis();
    const redisClient = getRedisClient();
    
    console.log('👥 检查用户认证数据...\n');
    
    // 检查用户认证数据
    const authKeys = await redisClient.keys('auth:*');
    console.log(`📋 找到 ${authKeys.length} 个认证相关键`);
    
    for (const authKey of authKeys) {
      console.log(`\n🔑 认证键: ${authKey}`);
      const authData = await redisClient.get(authKey);
      if (authData) {
        try {
          const auth = JSON.parse(authData);
          console.log(`   用户ID: ${auth.userId}`);
          console.log(`   用户名: ${auth.username}`);
          console.log(`   创建时间: ${auth.createTime}`);
        } catch (e) {
          console.log(`   数据格式: ${typeof authData}`);
        }
      }
    }
    
    // 检查用户订单列表
    console.log('\n📋 检查用户订单列表...');
    const orderUserKeys = await redisClient.keys('user:*:orders');
    console.log(`📋 找到 ${orderUserKeys.length} 个用户订单列表`);
    
    for (const orderUserKey of orderUserKeys) {
      console.log(`\n🔑 用户订单: ${orderUserKey}`);
      const orderNumbers = await redisClient.lRange(orderUserKey, 0, -1);
      console.log(`   订单数量: ${orderNumbers.length}`);
      console.log(`   订单号: ${orderNumbers.join(', ')}`);
    }
    
  } catch (error) {
    console.error('❌ 检查失败:', error);
  }
}

checkAuthUsers(); 