const { connectRedis, getRedisClient } = require('./config/redis');

async function checkUsers() {
  try {
    await connectRedis();
    const redisClient = getRedisClient();
    
    console.log('👥 检查用户数据...\n');
    
    // 获取所有用户键
    const userKeys = await redisClient.keys('user:*');
    console.log(`📋 找到 ${userKeys.length} 个用户相关键`);
    
    for (const userKey of userKeys) {
      console.log(`\n🔑 键: ${userKey}`);
      
      if (userKey.includes(':orders')) {
        // 用户订单列表
        const orderNumbers = await redisClient.lRange(userKey, 0, -1);
        console.log(`   订单数量: ${orderNumbers.length}`);
        console.log(`   订单号: ${orderNumbers.join(', ')}`);
      } else if (userKey.includes(':addresses')) {
        // 用户地址列表
        const addressIds = await redisClient.lRange(userKey, 0, -1);
        console.log(`   地址数量: ${addressIds.length}`);
        console.log(`   地址ID: ${addressIds.join(', ')}`);
      } else {
        // 用户信息
        const userData = await redisClient.get(userKey);
        if (userData) {
          try {
            const user = JSON.parse(userData);
            console.log(`   用户名: ${user.username}`);
            console.log(`   昵称: ${user.nickname}`);
            console.log(`   创建时间: ${user.createTime}`);
          } catch (e) {
            console.log(`   数据格式: ${typeof userData}`);
          }
        }
      }
    }
    
    // 检查用户认证数据
    console.log('\n🔐 检查用户认证数据...');
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
    
  } catch (error) {
    console.error('❌ 检查失败:', error);
  }
}

checkUsers(); 