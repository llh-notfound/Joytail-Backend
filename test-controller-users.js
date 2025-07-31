const { getCommunityPosts, getPostDetail, getPostComments } = require('./controllers/communityController');

async function testControllerUsers() {
  try {
    console.log('🧪 测试控制器用户信息获取...\n');
    
    // 1. 测试获取动态列表
    console.log('1. 测试获取动态列表:');
    const postsResult = await getCommunityPosts('recommend', 1, 5, null);
    console.log(`   总数: ${postsResult.total}`);
    console.log(`   列表长度: ${postsResult.list.length}`);
    
    // 查找橘猫爸爸的帖子
    const orangeCatPosts = postsResult.list.filter(post => post.userId === 'user_2');
    console.log(`   橘猫爸爸的帖子: ${orangeCatPosts.length} 条`);
    
    if (orangeCatPosts.length > 0) {
      const firstPost = orangeCatPosts[0];
      console.log(`   第一个帖子:`);
      console.log(`   - 用户ID: ${firstPost.userId}`);
      console.log(`   - 用户名: ${firstPost.username}`);
      console.log(`   - 头像: ${firstPost.avatar}`);
      console.log(`   - 内容: ${firstPost.content.substring(0, 50)}...`);
    }
    
    // 2. 测试获取帖子详情
    if (orangeCatPosts.length > 0) {
      console.log('\n2. 测试获取帖子详情:');
      const postDetail = await getPostDetail(orangeCatPosts[0].id, null);
      console.log(`   用户ID: ${postDetail.userId}`);
      console.log(`   用户名: ${postDetail.username}`);
      console.log(`   头像: ${postDetail.avatar}`);
      console.log(`   内容: ${postDetail.content.substring(0, 50)}...`);
    }
    
    // 3. 测试获取评论列表
    if (orangeCatPosts.length > 0) {
      console.log('\n3. 测试获取评论列表:');
      const commentsResult = await getPostComments(orangeCatPosts[0].id, 1, 5);
      console.log(`   评论总数: ${commentsResult.total}`);
      console.log(`   评论列表长度: ${commentsResult.list.length}`);
      
      commentsResult.list.forEach((comment, index) => {
        console.log(`   评论 ${index + 1}:`);
        console.log(`   - 用户ID: ${comment.userId}`);
        console.log(`   - 用户名: ${comment.username}`);
        console.log(`   - 头像: ${comment.avatar}`);
        console.log(`   - 内容: ${comment.content}`);
      });
    }
    
    console.log('\n✅ 控制器用户信息测试完成');
    
  } catch (error) {
    console.error('❌ 控制器用户信息测试失败:', error);
  }
}

testControllerUsers(); 