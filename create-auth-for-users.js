const { connectRedis, getRedisClient } = require('./config/redis');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

async function createAuthForUsers() {
  try {
    await connectRedis();
    const redisClient = getRedisClient();
    
    console.log('🔐 为用户创建认证数据...\n');
    
    // 为第一个用户创建认证数据
    const userId1 = '50c46d41-c7a0-4539-a3cd-cac94c64eb54';
    const username1 = 'user1';
    const password1 = '123456';
    
    console.log(`👤 创建用户1认证数据...`);
    console.log(`   用户ID: ${userId1}`);
    console.log(`   用户名: ${username1}`);
    
    const hashedPassword1 = await bcrypt.hash(password1, 10);
    const authData1 = {
      userId: userId1,
      username: username1,
      password: hashedPassword1,
      nickname: '用户1',
      createTime: new Date().toISOString()
    };
    
    await redisClient.set(`auth:${username1}`, JSON.stringify(authData1));
    console.log('   ✅ 用户1认证数据创建成功');
    
    // 为第二个用户创建认证数据
    const userId2 = '6890634e-5d08-4745-89bf-3fef7c16b4dd';
    const username2 = 'user2';
    const password2 = '123456';
    
    console.log(`\n👤 创建用户2认证数据...`);
    console.log(`   用户ID: ${userId2}`);
    console.log(`   用户名: ${username2}`);
    
    const hashedPassword2 = await bcrypt.hash(password2, 10);
    const authData2 = {
      userId: userId2,
      username: username2,
      password: hashedPassword2,
      nickname: '用户2',
      createTime: new Date().toISOString()
    };
    
    await redisClient.set(`auth:${username2}`, JSON.stringify(authData2));
    console.log('   ✅ 用户2认证数据创建成功');
    
    console.log('\n🎉 用户认证数据创建完成！');
    console.log('\n💡 现在可以使用以下账号登录测试订单显示:');
    console.log('   用户名: user1, 密码: 123456');
    console.log('   用户名: user2, 密码: 123456');
    
  } catch (error) {
    console.error('❌ 创建失败:', error);
  }
}

createAuthForUsers(); 