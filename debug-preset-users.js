const { getRedisClient } = require('./config/redis');

const redisClient = getRedisClient();

async function debugPresetUsers() {
  try {
    await redisClient.connect();
    
    console.log('🔍 检查预设用户数据...\n');
    
    // 获取所有用户
    const users = await redisClient.hGetAll('users');
    console.log(`📊 总用户数: ${Object.keys(users).length}`);
    
    // 检查每个预设用户
    for (const [username, userJson] of Object.entries(users)) {
      console.log(`\n👤 用户: ${username}`);
      try {
        const user = JSON.parse(userJson);
        console.log(`   📄 用户数据:`, user);
        console.log(`   🆔 用户ID: ${user.userId}`);
        console.log(`   📝 用户名: ${user.username}`);
        console.log(`   🖼️ 头像: ${user.avatar}`);
      } catch (error) {
        console.log(`   ❌ 解析用户数据失败: ${error.message}`);
        console.log(`   📄 原始数据: ${userJson}`);
      }
    }
    
    // 检查橘猫爸爸的帖子
    console.log('\n🐱 检查橘猫爸爸的帖子:');
    const timelinePosts = await redisClient.zRange('posts:timeline', 0, -1, { REV: true });
    
    for (const postId of timelinePosts.slice(0, 5)) {
      const postData = await redisClient.hGetAll(`post:${postId}`);
      if (postData.userId === 'user_2') {
        console.log(`\n   帖子ID: ${postId}`);
        console.log(`   用户ID: ${postData.userId}`);
        console.log(`   内容: ${postData.content.substring(0, 50)}...`);
        
        // 查找对应的用户信息
        const userInfo = users[Object.keys(users).find(key => {
          try {
            const user = JSON.parse(users[key]);
            return user.userId === 'user_2';
          } catch (e) {
            return false;
          }
        })];
        
        if (userInfo) {
          const user = JSON.parse(userInfo);
          console.log(`   👤 找到用户: ${user.username}`);
          console.log(`   🖼️ 头像: ${user.avatar}`);
        } else {
          console.log(`   ❌ 未找到用户信息`);
        }
      }
    }
    
    await redisClient.disconnect();
  } catch (error) {
    console.error('❌ 调试预设用户失败:', error);
  }
}

debugPresetUsers(); 