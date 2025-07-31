const axios = require('axios');
const apiConfig = require('./config/api');

async function testOrderDisplay() {
  try {
    console.log('🧪 测试订单显示数据...\n');
    
    // 创建测试用户
    console.log('🔐 创建测试用户...');
    const registerResponse = await axios.post(`${apiConfig.getApiUrl('/user/register')}`, {
      username: 'testuser_display',
      password: '123456',
      nickname: '显示测试用户'
    });
    
    // 登录获取token
    const loginResponse = await axios.post(`${apiConfig.getApiUrl('/user/login')}`, {
      username: 'testuser_display',
      password: '123456'
    });
    
    const authToken = loginResponse.data.data.token;
    console.log('✅ 登录成功，获取到token');
    
    // 测试获取订单列表
    console.log('\n📋 测试获取订单列表...');
    const response = await axios.get(`${apiConfig.getApiUrl('/order/goods-list')}?status=all&page=1&pageSize=10`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    if (response.data.code === 200) {
      console.log('✅ 获取订单列表成功');
      console.log(`   总数: ${response.data.data.total}`);
      console.log(`   订单数量: ${response.data.data.list.length}`);
      
      // 显示每个订单的详细信息
      response.data.data.list.forEach((order, index) => {
        console.log(`\n📦 订单 ${index + 1}:`);
        console.log(`   订单号: ${order.orderNumber}`);
        console.log(`   状态: ${order.statusText}`);
        console.log(`   总金额: ¥${order.totalAmount}`);
        console.log(`   商品金额: ¥${order.goodsAmount}`);
        console.log(`   运费: ¥${order.shippingFee}`);
        console.log(`   创建时间: ${order.createTime}`);
        
        if (order.address) {
          console.log(`   收货人: ${order.address.name}`);
          console.log(`   电话: ${order.address.phone}`);
          console.log(`   地址: ${order.address.province}${order.address.city}${order.address.district}${order.address.detailAddress}`);
        }
        
        if (order.goods && order.goods.length > 0) {
          console.log(`   商品列表:`);
          order.goods.forEach((item, itemIndex) => {
            console.log(`     ${itemIndex + 1}. ${item.name}`);
            console.log(`        规格: ${item.specs}`);
            console.log(`        价格: ¥${item.price}`);
            console.log(`        数量: ${item.quantity}`);
            console.log(`        小计: ¥${item.subtotal}`);
            console.log(`        图片: ${item.image}`);
          });
        } else {
          console.log(`   ⚠️ 没有商品数据`);
        }
      });
      
      // 检查数据完整性
      console.log('\n🔍 数据完整性检查:');
      let hasIssues = false;
      
      response.data.data.list.forEach((order, index) => {
        const issues = [];
        
        if (!order.orderNumber) issues.push('订单号缺失');
        if (!order.statusText) issues.push('状态文本缺失');
        if (order.totalAmount === null || order.totalAmount === undefined) issues.push('总金额缺失');
        if (!order.goods || order.goods.length === 0) issues.push('商品列表为空');
        
        if (issues.length > 0) {
          console.log(`   订单 ${index + 1} 问题: ${issues.join(', ')}`);
          hasIssues = true;
        } else {
          console.log(`   订单 ${index + 1}: ✅ 数据完整`);
        }
      });
      
      if (!hasIssues) {
        console.log('\n🎉 所有订单数据完整，前端应该能正常显示！');
      } else {
        console.log('\n⚠️ 发现数据问题，需要进一步修复');
      }
      
    } else {
      console.error('❌ 获取订单列表失败:', response.data.message);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
  }
}

testOrderDisplay(); 