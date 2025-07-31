const axios = require('axios');

const BASE_URL = 'http://localhost:8080/api';

async function testOrangeCatPosts() {
  try {
    console.log('🐱 测试橘猫爸爸预设帖子...\n');
    
    // 1. 获取动态列表
    console.log('1. 获取动态列表:');
    const response = await axios.get(`${BASE_URL}/community/posts?type=recommend&page=1&pageSize=10`);
    
    if (response.data.code === 200) {
      console.log(`   ✅ 获取成功，总数: ${response.data.data.total}`);
      console.log(`   📄 当前页: ${response.data.data.list.length} 条`);
      
      // 查找橘猫爸爸的帖子
      const orangeCatPosts = response.data.data.list.filter(post => 
        post.username === '橘猫爸爸' || post.content.includes('橘猫')
      );
      
      console.log(`\n🐱 找到橘猫爸爸的帖子: ${orangeCatPosts.length} 条`);
      
      orangeCatPosts.forEach((post, index) => {
        console.log(`\n   帖子 ${index + 1}:`);
        console.log(`   📝 内容: ${post.content.substring(0, 50)}...`);
        console.log(`   👤 作者: ${post.username}`);
        console.log(`   ❤️ 点赞: ${post.likes}`);
        console.log(`   💬 评论: ${post.comments}`);
        console.log(`   ⭐ 收藏: ${post.collects}`);
        console.log(`   🏷️ 标签: ${post.tags.join(', ')}`);
        console.log(`   🖼️ 图片: ${post.images.length} 张`);
      });
      
      // 2. 测试获取橘猫爸爸的帖子详情
      if (orangeCatPosts.length > 0) {
        const firstPost = orangeCatPosts[0];
        console.log(`\n2. 获取帖子详情 (${firstPost.id}):`);
        
        const detailResponse = await axios.get(`${BASE_URL}/community/posts/${firstPost.id}`);
        
        if (detailResponse.data.code === 200) {
          const postDetail = detailResponse.data.data;
          console.log(`   ✅ 获取详情成功`);
          console.log(`   📝 完整内容: ${postDetail.content}`);
          console.log(`   👤 作者: ${postDetail.username}`);
          console.log(`   🖼️ 头像: ${postDetail.avatar}`);
          console.log(`   🏷️ 标签: ${postDetail.tags.join(', ')}`);
        } else {
          console.log(`   ❌ 获取详情失败: ${detailResponse.data.message}`);
        }
        
        // 3. 测试获取评论列表
        console.log(`\n3. 获取评论列表:`);
        const commentsResponse = await axios.get(`${BASE_URL}/community/posts/${firstPost.id}/comments?page=1&pageSize=10`);
        
        if (commentsResponse.data.code === 200) {
          console.log(`   ✅ 获取评论成功，总数: ${commentsResponse.data.data.total}`);
          console.log(`   📄 当前页: ${commentsResponse.data.data.list.length} 条`);
          
          commentsResponse.data.data.list.forEach((comment, index) => {
            console.log(`   💬 评论 ${index + 1}: ${comment.content} (by ${comment.username})`);
          });
        } else {
          console.log(`   ❌ 获取评论失败: ${commentsResponse.data.message}`);
        }
      }
      
      // 4. 测试获取我的内容 - 橘猫爸爸的发布
      console.log(`\n4. 获取橘猫爸爸的发布内容:`);
      const myPostsResponse = await axios.get(`${BASE_URL}/community/my?type=posts&page=1&pageSize=5`, {
        headers: { 
          'Authorization': 'Bearer test-token-for-orange-cat',
          'Content-Type': 'application/json'
        }
      });
      
      if (myPostsResponse.data.code === 200) {
        console.log(`   ✅ 获取我的发布成功，总数: ${myPostsResponse.data.data.total}`);
        console.log(`   📄 当前页: ${myPostsResponse.data.data.list.length} 条`);
      } else {
        console.log(`   ❌ 获取我的发布失败: ${myPostsResponse.data.message}`);
      }
      
    } else {
      console.log(`❌ 获取动态列表失败: ${response.data.message}`);
    }
    
    console.log('\n🎉 橘猫爸爸预设帖子测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    if (error.response) {
      console.error('   错误详情:', error.response.data);
    }
  }
}

testOrangeCatPosts(); 