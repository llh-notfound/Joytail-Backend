const axios = require('axios');
const apiConfig = require('./config/api');

async function testOrderDisplaySimple() {
  try {
    console.log('🧪 简单测试订单显示...\n');
    
    // 尝试登录用户1
    console.log('🔐 尝试登录用户1...');
    const loginResponse = await axios.post(`${apiConfig.getApiUrl('/user/login')}`, {
      username: 'user1',
      password: '123456'
    });
    
    if (loginResponse.data.code === 200) {
      const authToken = loginResponse.data.data.token;
      console.log('✅ 登录成功 (user1)');
      
      // 测试获取订单列表
      console.log('\n📋 测试获取订单列表...');
      const response = await axios.get(`${apiConfig.getApiUrl('/order/goods-list')}?status=all&page=1&pageSize=10`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      if (response.data.code === 200) {
        console.log('✅ 获取订单列表成功');
        console.log(`   总数: ${response.data.data.total}`);
        console.log(`   订单数量: ${response.data.data.list.length}`);
        
        if (response.data.data.list.length > 0) {
          console.log('\n📦 订单详情:');
          response.data.data.list.forEach((order, index) => {
            console.log(`\n   订单 ${index + 1}:`);
            console.log(`     订单号: ${order.orderNumber}`);
            console.log(`     状态: ${order.statusText}`);
            console.log(`     总金额: ¥${order.totalAmount}`);
            console.log(`     商品数量: ${order.goods ? order.goods.length : 0}`);
            
            if (order.goods && order.goods.length > 0) {
              console.log(`     商品列表:`);
              order.goods.forEach((item, itemIndex) => {
                console.log(`       ${itemIndex + 1}. ${item.name} - ¥${item.price} x ${item.quantity}`);
              });
            }
          });
          
          console.log('\n🎉 订单数据完整，前端应该能正常显示！');
        } else {
          console.log('⚠️ 该用户没有订单数据');
        }
      } else {
        console.error('❌ 获取订单列表失败:', response.data.message);
      }
    } else {
      console.log('❌ 用户1登录失败，尝试用户2...');
      
      const loginResponse2 = await axios.post(`${apiConfig.getApiUrl('/user/login')}`, {
        username: 'user2',
        password: '123456'
      });
      
      if (loginResponse2.data.code === 200) {
        const authToken2 = loginResponse2.data.data.token;
        console.log('✅ 登录成功 (user2)');
        
        // 测试获取订单列表
        console.log('\n📋 测试获取订单列表...');
        const response2 = await axios.get(`${apiConfig.getApiUrl('/order/goods-list')}?status=all&page=1&pageSize=10`, {
          headers: { 'Authorization': `Bearer ${authToken2}` }
        });
        
        if (response2.data.code === 200) {
          console.log('✅ 获取订单列表成功');
          console.log(`   总数: ${response2.data.data.total}`);
          console.log(`   订单数量: ${response2.data.data.list.length}`);
          
          if (response2.data.data.list.length > 0) {
            console.log('\n📦 订单详情:');
            response2.data.data.list.forEach((order, index) => {
              console.log(`\n   订单 ${index + 1}:`);
              console.log(`     订单号: ${order.orderNumber}`);
              console.log(`     状态: ${order.statusText}`);
              console.log(`     总金额: ¥${order.totalAmount}`);
              console.log(`     商品数量: ${order.goods ? order.goods.length : 0}`);
              
              if (order.goods && order.goods.length > 0) {
                console.log(`     商品列表:`);
                order.goods.forEach((item, itemIndex) => {
                  console.log(`       ${itemIndex + 1}. ${item.name} - ¥${item.price} x ${item.quantity}`);
                });
              }
            });
            
            console.log('\n🎉 订单数据完整，前端应该能正常显示！');
          } else {
            console.log('⚠️ 该用户没有订单数据');
          }
        } else {
          console.error('❌ 获取订单列表失败:', response2.data.message);
        }
      } else {
        console.error('❌ 两个用户都登录失败');
      }
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
  }
}

testOrderDisplaySimple(); 