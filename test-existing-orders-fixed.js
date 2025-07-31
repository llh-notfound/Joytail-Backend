const axios = require('axios');
const apiConfig = require('./config/api');

console.log('🌐 API配置已加载 - 环境:', apiConfig.environment, ', BaseURL:', apiConfig.baseURL);

async function testExistingOrdersFixed() {
  try {
    console.log('🧪 测试修复后的API对现有订单的处理...');
    
    // 使用现有的用户登录
    console.log('🔐 登录现有用户...');
    const loginResponse = await axios.post(`${apiConfig.baseURL}/user/login`, {
      username: 'user1',
      password: '123456'
    });
    
    if (loginResponse.data.code !== 200) {
      console.log('❌ 登录失败，尝试其他用户...');
      const loginResponse2 = await axios.post(`${apiConfig.baseURL}/user/login`, {
        username: 'user2',
        password: '123456'
      });
      
      if (loginResponse2.data.code !== 200) {
        throw new Error('所有测试用户登录失败');
      }
      
      var token = loginResponse2.data.data.token;
      console.log('✅ 用户2登录成功');
    } else {
      var token = loginResponse.data.data.token;
      console.log('✅ 用户1登录成功');
    }
    
    // 测试获取订单列表
    console.log('📋 测试获取订单列表...');
    const listResponse = await axios.get(`${apiConfig.baseURL}/order/goods-list?status=all&page=1&pageSize=10`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (listResponse.data.code === 200) {
      console.log('✅ 获取订单列表成功');
      console.log('📊 数据结构分析:');
      
      const orders = listResponse.data.data.list;
      console.log(`📋 找到 ${orders.length} 个订单`);
      
      if (orders.length > 0) {
        orders.forEach((order, index) => {
          console.log(`\n📦 订单 ${index + 1}:`);
          console.log('   订单号:', order.orderNumber);
          console.log('   状态:', order.status, order.statusText);
          console.log('   总金额:', order.totalAmount);
          console.log('   商品金额:', order.goodsAmount);
          console.log('   运费:', order.shippingFee);
          
          // 检查前端期望的字段
          if (order.addressInfo) {
            console.log('   ✅ addressInfo 存在');
            console.log('      receiver:', order.addressInfo.receiver);
            console.log('      phone:', order.addressInfo.phone);
            console.log('      address:', order.addressInfo.address);
          } else {
            console.log('   ❌ addressInfo 缺失');
          }
          
          if (order.goodsInfo && Array.isArray(order.goodsInfo)) {
            console.log(`   ✅ goodsInfo 存在，商品数量: ${order.goodsInfo.length}`);
            order.goodsInfo.forEach((item, itemIndex) => {
              console.log(`     商品${itemIndex + 1}: ${item.name} - ¥${item.price} x ${item.quantity}`);
            });
          } else {
            console.log('   ❌ goodsInfo 缺失或格式错误');
          }
          
          // 检查是否还有旧的字段
          if (order.address) {
            console.log('   ⚠️ 旧字段 address 仍然存在');
          }
          
          if (order.goods) {
            console.log('   ⚠️ 旧字段 goods 仍然存在');
          }
          
          if (order.items) {
            console.log('   ⚠️ 旧字段 items 仍然存在');
          }
        });
        
        // 数据完整性检查
        console.log('\n🔍 数据完整性检查:');
        let allComplete = true;
        
        orders.forEach((order, index) => {
          if (!order.addressInfo || !order.goodsInfo || order.goodsInfo.length === 0) {
            console.log(`   ❌ 订单 ${index + 1} (${order.orderNumber}) 数据不完整`);
            allComplete = false;
          }
        });
        
        if (allComplete) {
          console.log('   ✅ 所有订单数据完整，前端应该能正常显示！');
        } else {
          console.log('   ⚠️ 部分订单数据不完整，但API格式已修复');
        }
        
      } else {
        console.log('⚠️ 没有找到订单数据');
      }
    } else {
      console.log('❌ 获取订单列表失败:', listResponse.data);
    }
    
    console.log('\n🎉 测试完成！');
    
  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error.response?.data || error.message);
  }
}

testExistingOrdersFixed(); 