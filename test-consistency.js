const axios = require('axios');

async function testConsistency() {
  try {
    console.log('🔍 测试社区动态内容一致性...\n');
    
    // 1. 获取动态列表
    console.log('1. 获取动态列表（前6条）...');
    const listResponse = await axios.get('http://localhost:8080/api/community/posts?type=recommend&page=1&pageSize=6');
    const posts = listResponse.data.data.list;
    
    console.log(`✅ 获取到 ${posts.length} 条动态\n`);
    
    let successCount = 0;
    let totalCount = 0;
    
    // 2. 测试每个动态的详情一致性
    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      
      // 只测试mock帖子
      if (!post.id.includes('mock_post_')) {
        console.log(`📋 跳过真实帖子: ${post.id}`);
        continue;
      }
      
      totalCount++;
      console.log(`📋 测试动态 ${i + 1}: ${post.id}`);
      console.log(`   列表内容: "${post.content.substring(0, 50)}..."`);
      console.log(`   作者: ${post.username}`);
      console.log(`   标签: [${post.tags.join(', ')}]`);
      
      // 获取详情
      try {
        const detailResponse = await axios.get(`http://localhost:8080/api/community/posts/${post.id}`);
        const detail = detailResponse.data.data;
        
        console.log(`   详情内容: "${detail.content.substring(0, 50)}..."`);
        console.log(`   详情作者: ${detail.username}`);
        console.log(`   详情标签: [${detail.tags.join(', ')}]`);
        
        // 检查一致性
        const contentMatch = post.content === detail.content;
        const usernameMatch = post.username === detail.username;
        const tagsMatch = JSON.stringify(post.tags) === JSON.stringify(detail.tags);
        
        console.log(`   内容一致性: ${contentMatch ? '✅' : '❌'}`);
        console.log(`   作者一致性: ${usernameMatch ? '✅' : '❌'}`);
        console.log(`   标签一致性: ${tagsMatch ? '✅' : '❌'}`);
        
        if (contentMatch && usernameMatch && tagsMatch) {
          console.log(`   🎉 完全一致！`);
          successCount++;
        } else {
          console.log(`   ⚠️  发现不一致！`);
        }
        
      } catch (detailError) {
        console.log(`   ❌ 详情请求失败: ${detailError.message}`);
      }
      
      console.log(''); // 空行分隔
    }
    
    console.log(`\n📊 测试结果总结:`);
    console.log(`   测试的mock帖子: ${totalCount}`);
    console.log(`   一致性通过: ${successCount}`);
    console.log(`   成功率: ${totalCount > 0 ? ((successCount / totalCount) * 100).toFixed(1) : 0}%`);
    
    if (successCount === totalCount && totalCount > 0) {
      console.log(`\n🎉 所有测试通过！内容一致性问题已完全解决！`);
    } else {
      console.log(`\n⚠️  还有 ${totalCount - successCount} 个帖子存在不一致问题`);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testConsistency();
