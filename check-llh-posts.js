const { connectRedis, getRedisClient } = require('./config/redis');

async function checkLlhPosts() {
  try {
    await connectRedis();
    const redisClient = getRedisClient();
    
    console.log('🔍 检查用户llh的帖子情况...\n');
    
    // 1. 查找用户llh的ID
    console.log('👤 查找用户llh...');
    const authKeys = await redisClient.keys('auth:*');
    let llhUserId = null;
    
    for (const key of authKeys) {
      const authData = await redisClient.get(key);
      if (authData) {
        const auth = JSON.parse(authData);
        if (auth.username === 'llh') {
          llhUserId = auth.userId;
          console.log(`✅ 找到用户llh，用户ID: ${llhUserId}`);
          break;
        }
      }
    }
    
    if (!llhUserId) {
      console.log('❌ 未找到用户llh');
      return;
    }
    
    // 2. 检查用户llh的帖子
    console.log('\n📋 检查用户llh的帖子...');
    const userPostsKey = `user:${llhUserId}:posts`;
    const userPosts = await redisClient.zRange(userPostsKey, 0, -1);
    
    console.log(`📝 用户llh共有 ${userPosts.length} 个帖子`);
    
    if (userPosts.length > 0) {
      console.log('\n📦 帖子列表:');
      for (let i = 0; i < userPosts.length; i++) {
        const postId = userPosts[i];
        const postData = await redisClient.get(`post:${postId}`);
        
        if (postData) {
          const post = JSON.parse(postData);
          console.log(`   ${i + 1}. ${postId}`);
          console.log(`      标题: ${post.title || '无标题'}`);
          console.log(`      内容: ${post.content ? post.content.substring(0, 100) + '...' : '无内容'}`);
          console.log(`      时间: ${post.createTime}`);
          console.log(`      状态: ${post.status || '正常'}`);
          console.log('');
        } else {
          console.log(`   ${i + 1}. ${postId} (数据不存在)`);
        }
      }
    }
    
    // 3. 检查社区帖子总数
    console.log('\n📊 社区统计信息:');
    const communityPosts = await redisClient.zRange('community:posts', 0, -1);
    console.log(`   社区总帖子数: ${communityPosts.length}`);
    
    const hotPosts = await redisClient.zRange('community:hot_posts', 0, -1);
    console.log(`   热门帖子数: ${hotPosts.length}`);
    
    // 4. 检查llh帖子在社区中的占比
    const llhPostsInCommunity = communityPosts.filter(postId => userPosts.includes(postId));
    console.log(`   llh帖子在社区中的数量: ${llhPostsInCommunity.length}`);
    
    if (communityPosts.length > 0) {
      const percentage = ((llhPostsInCommunity.length / communityPosts.length) * 100).toFixed(2);
      console.log(`   llh帖子占比: ${percentage}%`);
    }
    
  } catch (error) {
    console.error('❌ 检查过程中出现错误:', error);
  }
}

checkLlhPosts(); 