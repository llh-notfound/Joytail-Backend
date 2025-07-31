const { getCommunityPosts, getPostComments } = require('./controllers/communityController');

async function testController() {
  try {
    console.log('🧪 测试控制器函数...\n');
    
    // 测试获取动态列表
    console.log('1. 测试获取动态列表:');
    const postsResult = await getCommunityPosts('recommend', 1, 5, null);
    console.log('   结果:', {
      listLength: postsResult.list.length,
      total: postsResult.total,
      hasMore: postsResult.hasMore
    });
    
    if (postsResult.list.length > 0) {
      console.log('   第一个动态:', {
        id: postsResult.list[0].id,
        content: postsResult.list[0].content.substring(0, 50) + '...',
        likes: postsResult.list[0].likes,
        comments: postsResult.list[0].comments
      });
      
      // 测试获取评论列表
      console.log('\n2. 测试获取评论列表:');
      const commentsResult = await getPostComments(postsResult.list[0].id, 1, 5);
      console.log('   结果:', {
        listLength: commentsResult.list.length,
        total: commentsResult.total,
        hasMore: commentsResult.hasMore
      });
    }
    
    console.log('\n✅ 控制器测试完成');
  } catch (error) {
    console.error('❌ 控制器测试失败:', error);
  }
}

testController(); 