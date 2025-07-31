const { connectRedis, getRedisClient } = require('./config/redis');

async function cleanupTestUserPosts() {
  await connectRedis();
  const redisClient = getRedisClient();
  
  console.log('🧹 清理testuser的多余帖子...\n');
  
  try {
    const testUserId = '0530787f-cbb9-4e10-9dec-7308245af0d7'; // testuser的userId
    
    // 获取testuser的所有帖子ID
    const userPosts = await redisClient.zRange(`user:${testUserId}:posts`, 0, -1);
    console.log(`📊 testuser的帖子数: ${userPosts.length}`);
    
    if (userPosts.length <= 1) {
      console.log('✅ testuser的帖子数量已经合适，无需清理');
      return;
    }
    
    // 保留第一个帖子，删除其余的
    const postsToDelete = userPosts.slice(1); // 从第二个开始删除
    const postToKeep = userPosts[0];
    
    console.log(`📝 保留帖子: ${postToKeep}`);
    console.log(`🗑️ 删除帖子: ${postsToDelete.length} 个`);
    
    let deletedCount = 0;
    
    for (const postId of postsToDelete) {
      try {
        // 获取帖子详情
        const postData = await redisClient.hGetAll(`post:${postId}`);
        
        // 删除帖子详情
        await redisClient.del(`post:${postId}`);
        
        // 从时间线中删除
        await redisClient.zRem('posts:timeline', postId);
        
        // 从热门帖子中删除
        await redisClient.zRem('posts:hot', postId);
        
        // 从用户帖子列表中删除
        await redisClient.zRem(`user:${testUserId}:posts`, postId);
        
        // 删除相关的点赞、收藏、评论数据
        await redisClient.del(`post:${postId}:likes`);
        await redisClient.del(`post:${postId}:collects`);
        await redisClient.del(`post:${postId}:comments`);
        
        // 删除评论详情
        const comments = await redisClient.zRange(`post:${postId}:comments`, 0, -1);
        for (const commentId of comments) {
          await redisClient.del(`comment:${commentId}`);
        }
        
        deletedCount++;
        console.log(`   ✅ 删除帖子: ${postId}`);
        
      } catch (error) {
        console.log(`   ❌ 删除帖子失败 ${postId}: ${error.message}`);
      }
    }
    
    console.log(`\n🎉 清理完成！`);
    console.log(`   📊 删除了 ${deletedCount} 个帖子`);
    console.log(`   📝 保留了 1 个帖子: ${postToKeep}`);
    
    // 验证清理结果
    const remainingPosts = await redisClient.zRange(`user:${testUserId}:posts`, 0, -1);
    console.log(`   ✅ 剩余帖子数: ${remainingPosts.length}`);
    
  } catch (error) {
    console.error('❌ 清理失败:', error);
  }
}

cleanupTestUserPosts(); 