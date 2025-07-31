const { getRedisClient } = require('./config/redis');

const redisClient = getRedisClient();

async function debugRedis() {
  try {
    await redisClient.connect();
    
    console.log('🔍 检查Redis数据...\n');
    
    // 检查时间线
    const timelinePosts = await redisClient.zRange('posts:timeline', 0, -1, { REV: true });
    console.log('📅 时间线帖子数量:', timelinePosts.length);
    console.log('📅 时间线帖子IDs:', timelinePosts);
    
    // 检查热度排序
    const hotPosts = await redisClient.zRange('posts:hot', 0, -1, { REV: true });
    console.log('🔥 热度排序帖子数量:', hotPosts.length);
    console.log('🔥 热度排序帖子IDs:', hotPosts);
    
    // 检查第一个帖子的详细信息
    if (timelinePosts.length > 0) {
      const firstPostId = timelinePosts[0];
      console.log(`\n📝 第一个帖子详情 (${firstPostId}):`);
      const postData = await redisClient.hGetAll(`post:${firstPostId}`);
      console.log('   帖子数据:', postData);
      
      // 检查评论
      const comments = await redisClient.zRange(`post:${firstPostId}:comments`, 0, -1, { REV: true });
      console.log(`   评论数量: ${comments.length}`);
      if (comments.length > 0) {
        const commentData = await redisClient.hGetAll(`comment:${comments[0]}`);
        console.log('   第一个评论:', commentData);
      }
    }
    
    // 测试分页逻辑
    console.log('\n📄 测试分页逻辑:');
    const pageSize = 5;
    const offset = 0;
    const pagePosts = await redisClient.zRange('posts:timeline', offset, offset + pageSize - 1, { REV: true });
    console.log(`   分页结果 (offset=${offset}, pageSize=${pageSize}):`, pagePosts);
    
    // 检查用户数据
    const users = await redisClient.hGetAll('users');
    console.log('\n👥 用户数量:', Object.keys(users).length);
    
    // 检查特定用户的帖子
    if (Object.keys(users).length > 0) {
      const firstUser = Object.keys(users)[0];
      const userData = JSON.parse(users[firstUser]);
      console.log(`\n👤 用户 ${firstUser} 的帖子:`);
      
      // 检查用户相关的所有键
      const userId = userData.userId;
      console.log(`   用户ID: ${userId}`);
      
      // 检查用户发布列表
      try {
        const userPosts = await redisClient.zRange(`user:${userId}:posts`, 0, -1, { REV: true });
        console.log(`   用户发布数量: ${userPosts.length}`);
        console.log(`   用户发布IDs: ${userPosts}`);
      } catch (error) {
        console.log(`   ❌ 用户发布列表错误: ${error.message}`);
      }
      
      // 检查用户点赞列表
      try {
        const userLikes = await redisClient.zRange(`user:${userId}:likes`, 0, -1, { REV: true });
        console.log(`   用户点赞数量: ${userLikes.length}`);
        console.log(`   用户点赞IDs: ${userLikes}`);
      } catch (error) {
        console.log(`   ❌ 用户点赞列表错误: ${error.message}`);
      }
      
      // 检查用户收藏列表
      try {
        const userCollects = await redisClient.zRange(`user:${userId}:collects`, 0, -1, { REV: true });
        console.log(`   用户收藏数量: ${userCollects.length}`);
        console.log(`   用户收藏IDs: ${userCollects}`);
      } catch (error) {
        console.log(`   ❌ 用户收藏列表错误: ${error.message}`);
      }
      
      // 检查用户评论列表
      try {
        const userComments = await redisClient.zRange(`user:${userId}:comments`, 0, -1, { REV: true });
        console.log(`   用户评论数量: ${userComments.length}`);
        console.log(`   用户评论IDs: ${userComments}`);
      } catch (error) {
        console.log(`   ❌ 用户评论列表错误: ${error.message}`);
      }
      
      // 检查第二个用户
      if (Object.keys(users).length > 1) {
        const secondUser = Object.keys(users)[1];
        const secondUserData = JSON.parse(users[secondUser]);
        console.log(`\n👤 用户 ${secondUser} 的帖子:`);
        
        const secondUserId = secondUserData.userId;
        console.log(`   用户ID: ${secondUserId}`);
        
        // 检查第二个用户发布列表
        try {
          const secondUserPosts = await redisClient.zRange(`user:${secondUserId}:posts`, 0, -1, { REV: true });
          console.log(`   用户发布数量: ${secondUserPosts.length}`);
          console.log(`   用户发布IDs: ${secondUserPosts}`);
        } catch (error) {
          console.log(`   ❌ 用户发布列表错误: ${error.message}`);
          
          // 检查这个键存储的是什么类型的数据
          try {
            const keyType = await redisClient.type(`user:${secondUserId}:posts`);
            console.log(`   🔍 键类型: ${keyType}`);
            
            if (keyType === 'string') {
              const stringValue = await redisClient.get(`user:${secondUserId}:posts`);
              console.log(`   📄 字符串值: ${stringValue}`);
            } else if (keyType === 'hash') {
              const hashValue = await redisClient.hGetAll(`user:${secondUserId}:posts`);
              console.log(`   📋 Hash值: ${JSON.stringify(hashValue)}`);
            } else if (keyType === 'list') {
              const listValue = await redisClient.lRange(`user:${secondUserId}:posts`, 0, -1);
              console.log(`   📝 List值: ${JSON.stringify(listValue)}`);
            }
          } catch (typeError) {
            console.log(`   ❌ 检查键类型失败: ${typeError.message}`);
          }
        }
        
        // 检查第二个用户点赞列表
        try {
          const secondUserLikes = await redisClient.zRange(`user:${secondUserId}:likes`, 0, -1, { REV: true });
          console.log(`   用户点赞数量: ${secondUserLikes.length}`);
          console.log(`   用户点赞IDs: ${secondUserLikes}`);
        } catch (error) {
          console.log(`   ❌ 用户点赞列表错误: ${error.message}`);
        }
      }
    }
    
    await redisClient.disconnect();
  } catch (error) {
    console.error('❌ 调试Redis失败:', error);
  }
}

debugRedis(); 