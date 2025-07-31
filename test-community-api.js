#!/usr/bin/env node
// 社区API测试脚本

const axios = require('axios');

const BASE_URL = 'http://localhost:8080/api';
let authToken = null;

// 测试用户登录获取token
async function login() {
  try {
    const response = await axios.post(`${BASE_URL}/user/login`, {
      username: 'testuser',
      password: '123456'
    });
    
    if (response.data.code === 200) {
      authToken = response.data.data.token;
      console.log('✅ 登录成功，获取到token');
      return true;
    } else {
      console.log('❌ 登录失败:', response.data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ 登录请求失败:', error.message);
    return false;
  }
}

// 创建测试用户
async function createTestUser() {
  try {
    const response = await axios.post(`${BASE_URL}/user/register`, {
      username: 'testuser',
      password: '123456',
      nickname: '测试用户'
    });
    
    if (response.data.code === 200) {
      console.log('✅ 创建测试用户成功');
      return true;
    } else {
      console.log('⚠️ 用户可能已存在:', response.data.message);
      return true;
    }
  } catch (error) {
    console.log('⚠️ 创建用户失败:', error.message);
    return false;
  }
}

// 测试发布动态
async function testPublishPost() {
  try {
    const response = await axios.post(`${BASE_URL}/community/posts`, {
      content: '这是一条测试动态，分享我家宠物的日常！🐕',
      images: [
        'https://example.com/pet1.jpg',
        'https://example.com/pet2.jpg'
      ],
      tags: ['萌宠日常', '新手养宠']
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.data.code === 200) {
      console.log('✅ 发布动态成功:', response.data.data.postId);
      return response.data.data.postId;
    } else {
      console.log('❌ 发布动态失败:', response.data.message);
      return null;
    }
  } catch (error) {
    console.log('❌ 发布动态请求失败:', error.message);
    if (error.response) {
      console.log('   错误详情:', error.response.data);
    }
    return null;
  }
}

// 测试获取动态列表
async function testGetPosts() {
  try {
    const response = await axios.get(`${BASE_URL}/community/posts?type=recommend&page=1&pageSize=5`);
    
    if (response.data.code === 200) {
      console.log('✅ 获取动态列表成功');
      console.log(`   总数: ${response.data.data.total}`);
      console.log(`   当前页: ${response.data.data.list.length} 条`);
      return response.data.data.list.length > 0 ? response.data.data.list[0].id : null;
    } else {
      console.log('❌ 获取动态列表失败:', response.data.message);
      return null;
    }
  } catch (error) {
    console.log('❌ 获取动态列表请求失败:', error.message);
    return null;
  }
}

// 测试获取动态详情
async function testGetPostDetail(postId) {
  if (!postId) return;
  
  try {
    const response = await axios.get(`${BASE_URL}/community/posts/${postId}`);
    
    if (response.data.code === 200) {
      console.log('✅ 获取动态详情成功');
      console.log(`   内容: ${response.data.data.content.substring(0, 50)}...`);
      console.log(`   点赞数: ${response.data.data.likes}`);
      console.log(`   评论数: ${response.data.data.comments}`);
    } else {
      console.log('❌ 获取动态详情失败:', response.data.message);
    }
  } catch (error) {
    console.log('❌ 获取动态详情请求失败:', error.message);
  }
}

// 测试点赞功能
async function testLikePost(postId) {
  if (!postId) return;
  
  try {
    const response = await axios.post(`${BASE_URL}/community/posts/${postId}/like`, {}, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.data.code === 200) {
      console.log('✅ 点赞操作成功');
      console.log(`   点赞状态: ${response.data.data.isLiked ? '已点赞' : '未点赞'}`);
      console.log(`   点赞数: ${response.data.data.likesCount}`);
    } else {
      console.log('❌ 点赞操作失败:', response.data.message);
    }
  } catch (error) {
    console.log('❌ 点赞请求失败:', error.message);
  }
}

// 测试收藏功能
async function testCollectPost(postId) {
  if (!postId) return;
  
  try {
    const response = await axios.post(`${BASE_URL}/community/posts/${postId}/collect`, {}, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.data.code === 200) {
      console.log('✅ 收藏操作成功');
      console.log(`   收藏状态: ${response.data.data.isCollected ? '已收藏' : '未收藏'}`);
      console.log(`   收藏数: ${response.data.data.collectsCount}`);
    } else {
      console.log('❌ 收藏操作失败:', response.data.message);
    }
  } catch (error) {
    console.log('❌ 收藏请求失败:', error.message);
  }
}

// 测试发表评论
async function testPublishComment(postId) {
  if (!postId) return;
  
  try {
    const response = await axios.post(`${BASE_URL}/community/posts/${postId}/comments`, {
      content: '这条动态很棒！看起来宠物很开心呢！😊'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.data.code === 200) {
      console.log('✅ 发表评论成功:', response.data.data.commentId);
      return response.data.data.commentId;
    } else {
      console.log('❌ 发表评论失败:', response.data.message);
      return null;
    }
  } catch (error) {
    console.log('❌ 发表评论请求失败:', error.message);
    return null;
  }
}

// 测试获取评论列表
async function testGetComments(postId) {
  if (!postId) return;
  
  try {
    const response = await axios.get(`${BASE_URL}/community/posts/${postId}/comments?page=1&pageSize=10`);
    
    if (response.data.code === 200) {
      console.log('✅ 获取评论列表成功');
      console.log(`   评论总数: ${response.data.data.total}`);
      console.log(`   当前页: ${response.data.data.list.length} 条`);
    } else {
      console.log('❌ 获取评论列表失败:', response.data.message);
    }
  } catch (error) {
    console.log('❌ 获取评论列表请求失败:', error.message);
  }
}

// 测试获取我的内容
async function testGetMyContent() {
  try {
    const response = await axios.get(`${BASE_URL}/community/my?type=posts&page=1&pageSize=5`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.data.code === 200) {
      console.log('✅ 获取我的内容成功');
      console.log(`   我的发布: ${response.data.data.total} 条`);
      console.log(`   当前页: ${response.data.data.list.length} 条`);
    } else {
      console.log('❌ 获取我的内容失败:', response.data.message);
    }
  } catch (error) {
    console.log('❌ 获取我的内容请求失败:', error.message);
  }
}

// 测试获取我的统计
async function testGetMyStats() {
  try {
    const response = await axios.get(`${BASE_URL}/community/my/stats`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.data.code === 200) {
      console.log('✅ 获取我的统计成功');
      console.log(`   发布: ${response.data.data.posts} 条`);
      console.log(`   点赞: ${response.data.data.likes} 条`);
      console.log(`   收藏: ${response.data.data.collects} 条`);
      console.log(`   评论: ${response.data.data.comments} 条`);
    } else {
      console.log('❌ 获取我的统计失败:', response.data.message);
    }
  } catch (error) {
    console.log('❌ 获取我的统计请求失败:', error.message);
  }
}

// 主测试函数
async function runTests() {
  console.log('🚀 开始测试社区API...\n');
  
  // 1. 创建测试用户
  await createTestUser();
  
  // 2. 登录获取token
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('❌ 无法获取认证token，测试终止');
    return;
  }
  
  // 3. 测试发布动态
  const postId = await testPublishPost();
  
  // 4. 测试获取动态列表
  const listPostId = await testGetPosts();
  
  // 5. 测试获取动态详情
  await testGetPostDetail(postId || listPostId);
  
  // 6. 测试点赞功能
  await testLikePost(postId || listPostId);
  
  // 7. 测试收藏功能
  await testCollectPost(postId || listPostId);
  
  // 8. 测试发表评论
  await testPublishComment(postId || listPostId);
  
  // 9. 测试获取评论列表
  await testGetComments(postId || listPostId);
  
  // 10. 测试获取我的内容
  await testGetMyContent();
  
  // 11. 测试获取我的统计
  await testGetMyStats();
  
  console.log('\n🎉 社区API测试完成！');
}

// 运行测试
runTests().catch(console.error);
