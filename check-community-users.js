const { connectRedis, getRedisClient } = require('./config/redis');

async function checkCommunityUsers() {
  try {
    await connectRedis();
    const redisClient = getRedisClient();
    
    console.log('🔍 检查社区用户数据...\n');
    
    // 1. 检查认证用户
    console.log('👤 认证用户列表:');
    const authKeys = await redisClient.keys('auth:*');
    console.log(`   认证用户数量: ${authKeys.length}`);
    
    for (const key of authKeys) {
      const authData = await redisClient.get(key);
      if (authData) {
        const auth = JSON.parse(authData);
        console.log(`   ${auth.username} (ID: ${auth.userId})`);
      }
    }
    
    // 2. 检查社区用户数据
    console.log('\n👥 社区用户数据:');
    const userKeys = await redisClient.keys('user:*');
    console.log(`   用户相关键数量: ${userKeys.length}`);
    
    const userPostsKeys = userKeys.filter(key => key.includes(':posts'));
    console.log(`   有帖子的用户数量: ${userPostsKeys.length}`);
    
    for (const key of userPostsKeys) {
      const userId = key.split(':')[1];
      const posts = await redisClient.zRange(key, 0, -1);
      console.log(`   用户 ${userId}: ${posts.length} 个帖子`);
    }
    
    // 3. 检查所有帖子
    console.log('\n📝 所有帖子统计:');
    const allPostKeys = await redisClient.keys('post:*');
    console.log(`   帖子数据键数量: ${allPostKeys.length}`);
    
    // 4. 检查社区时间线
    console.log('\n📋 社区时间线:');
    const communityPosts = await redisClient.zRange('community:posts', 0, -1);
    console.log(`   社区时间线帖子数: ${communityPosts.length}`);
    
    if (communityPosts.length > 0) {
      console.log('   前5个帖子ID:');
      for (let i = 0; i < Math.min(5, communityPosts.length); i++) {
        const postId = communityPosts[i];
        const postData = await redisClient.get(`post:${postId}`);
        if (postData) {
          const post = JSON.parse(postData);
          console.log(`     ${i + 1}. ${postId} - ${post.title || '无标题'} (用户: ${post.userId})`);
        }
      }
    }
    
    // 5. 查找包含"llh"的用户
    console.log('\n🔍 查找包含"llh"的用户:');
    const llhRelatedKeys = userKeys.filter(key => key.includes('llh'));
    console.log(`   包含"llh"的键数量: ${llhRelatedKeys.length}`);
    
    for (const key of llhRelatedKeys) {
      console.log(`   ${key}`);
    }
    
  } catch (error) {
    console.error('❌ 检查过程中出现错误:', error);
  }
}

checkCommunityUsers(); 