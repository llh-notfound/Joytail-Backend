const express = require('express');
const request = require('supertest');

// 模拟应用
const app = express();
app.use(express.json());

// 模拟认证中间件
const mockAuth = (req, res, next) => {
  req.user = { userId: '0530787f-cbb9-4e10-9dec-7308245af0d7' };
  next();
};

// 导入路由
const communityRoutes = require('./routes/communityRoutes');

// 使用路由
app.use('/api/community', communityRoutes);

async function testRoute() {
  try {
    console.log('🧪 测试路由...\n');
    
    // 测试获取动态列表
    console.log('1. 测试获取动态列表路由:');
    const response = await request(app)
      .get('/api/community/posts?type=recommend&page=1&pageSize=5')
      .expect(200);
    
    console.log('   状态码:', response.status);
    console.log('   响应数据:', {
      code: response.body.code,
      message: response.body.message,
      listLength: response.body.data.list.length,
      total: response.body.data.total,
      hasMore: response.body.data.hasMore
    });
    
    if (response.body.data.list.length > 0) {
      console.log('   第一个动态:', {
        id: response.body.data.list[0].id,
        content: response.body.data.list[0].content.substring(0, 50) + '...'
      });
    }
    
    console.log('\n✅ 路由测试完成');
  } catch (error) {
    console.error('❌ 路由测试失败:', error);
  }
}

testRoute(); 