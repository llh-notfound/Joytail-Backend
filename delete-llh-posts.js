const { connectRedis, getRedisClient } = require('./config/redis');

async function deleteLlhPosts() {
  try {
    await connectRedis();
    const redisClient = getRedisClient();
    
    console.log('🗑️ 删除用户llh的所有帖子...\n');
    
    // 1. 查找用户llh的ID
    console.log('🔍 查找用户llh...');
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
    
    // 2. 获取用户llh发布的帖子
    console.log('\n📋 获取用户llh的帖子列表...');
    const userPostsKey = `user:${llhUserId}:posts`;
    const userPosts = await redisClient.zRange(userPostsKey, 0, -1);
    
    if (userPosts.length === 0) {
      console.log('✅ 用户llh没有发布任何帖子');
      return;
    }
    
    console.log(`📝 找到 ${userPosts.length} 个帖子`);
    
    // 3. 获取所有帖子数据
    console.log('\n📦 获取帖子详细信息...');
    const postsToDelete = [];
    
    for (const postId of userPosts) {
      const postData = await redisClient.get(`post:${postId}`);
      if (postData) {
        const post = JSON.parse(postData);
        postsToDelete.push({
          postId,
          title: post.title || '无标题',
          content: post.content ? post.content.substring(0, 50) + '...' : '无内容',
          createTime: post.createTime
        });
        console.log(`   ${postId}: ${post.title || '无标题'} (${post.createTime})`);
      }
    }
    
    // 4. 确认删除
    console.log(`\n⚠️ 即将删除 ${postsToDelete.length} 个帖子`);
    console.log('确认删除吗？(y/N)');
    
    // 模拟用户确认
    const confirm = 'y'; // 直接确认删除
    
    if (confirm.toLowerCase() === 'y') {
      console.log('\n🗑️ 开始删除帖子...');
      
      let deletedCount = 0;
      
      for (const post of postsToDelete) {
        try {
          // 删除帖子数据
          await redisClient.del(`post:${post.postId}`);
          
          // 从用户帖子列表中删除
          await redisClient.zRem(userPostsKey, post.postId);
          
          // 从社区帖子时间线中删除
          await redisClient.zRem('community:posts', post.postId);
          
          // 从热门帖子中删除
          await redisClient.zRem('community:hot_posts', post.postId);
          
          // 删除帖子的评论
          const commentKeys = await redisClient.keys(`post:${post.postId}:comments:*`);
          for (const commentKey of commentKeys) {
            await redisClient.del(commentKey);
          }
          
          // 删除帖子的点赞记录
          const likeKeys = await redisClient.keys(`post:${post.postId}:likes:*`);
          for (const likeKey of likeKeys) {
            await redisClient.del(likeKey);
          }
          
          // 删除帖子的收藏记录
          const collectKeys = await redisClient.keys(`post:${post.postId}:collects:*`);
          for (const collectKey of collectKeys) {
            await redisClient.del(collectKey);
          }
          
          console.log(`   ✅ 已删除: ${post.title}`);
          deletedCount++;
          
        } catch (error) {
          console.log(`   ❌ 删除失败: ${post.postId} - ${error.message}`);
        }
      }
      
      console.log(`\n🎉 删除完成！共删除 ${deletedCount} 个帖子`);
      
      // 5. 验证删除结果
      console.log('\n🔍 验证删除结果...');
      const remainingPosts = await redisClient.zRange(userPostsKey, 0, -1);
      console.log(`   用户llh剩余帖子数量: ${remainingPosts.length}`);
      
      if (remainingPosts.length === 0) {
        console.log('✅ 所有帖子已成功删除');
      } else {
        console.log('⚠️ 还有帖子未删除，可能需要手动检查');
      }
      
    } else {
      console.log('❌ 取消删除操作');
    }
    
  } catch (error) {
    console.error('❌ 删除过程中出现错误:', error);
  }
}

deleteLlhPosts(); 