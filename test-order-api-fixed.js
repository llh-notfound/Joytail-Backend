const axios = require('axios');
const apiConfig = require('./config/api');

console.log('🌐 API配置已加载 - 环境:', apiConfig.environment, ', BaseURL:', apiConfig.baseURL);

async function testFixedOrderAPI() {
  try {
    console.log('🧪 测试修复后的订单API数据格式...');
    
    // 1. 直接登录测试用户
    console.log('🔐 登录测试用户...');
    const loginResponse = await axios.post(`${apiConfig.baseURL}/user/login`, {
      username: 'testuser_fixed',
      password: '123456'
    });
    
    if (loginResponse.data.code !== 200) {
      throw new Error('登录失败: ' + JSON.stringify(loginResponse.data));
    }
    
    const token = loginResponse.data.data.token;
    console.log('✅ 登录成功，获取到token');
    
    // 3. 创建测试地址
    console.log('📍 创建测试地址...');
    const addressResponse = await axios.post(`${apiConfig.baseURL}/address/add`, {
      name: '测试用户',
      phone: '13800138000',
      region: '广东省深圳市南山区',
      regionArray: ['广东省', '深圳市', '南山区'],
      detail: '科技园南区8栋101室',
      isDefault: true
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (addressResponse.data.code === 200) {
      console.log('✅ 测试地址创建成功');
    }
    
    // 4. 创建测试订单
    console.log('📝 创建测试订单...');
    const orderResponse = await axios.post(`${apiConfig.baseURL}/order/create`, {
      cartItemIds: ['test_item_1', 'test_item_2'],
      addressId: addressResponse.data.data.id || 'test_address_1',
      message: '测试订单'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (orderResponse.data.code !== 200) {
      console.log('❌ 创建订单失败:', orderResponse.data);
      return;
    }
    
    console.log('✅ 订单创建成功');
    const orderNumber = orderResponse.data.data.orderNumber;
    
    // 5. 测试获取订单列表
    console.log('📋 测试获取订单列表...');
    const listResponse = await axios.get(`${apiConfig.baseURL}/order/goods-list?status=all&page=1&pageSize=10`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (listResponse.data.code === 200) {
      console.log('✅ 获取订单列表成功');
      console.log('📊 数据结构分析:');
      
      const orders = listResponse.data.data.list;
      if (orders.length > 0) {
        const order = orders[0];
        console.log('\n📦 第一个订单数据结构:');
        console.log('   订单号:', order.orderNumber);
        console.log('   状态:', order.status, order.statusText);
        console.log('   总金额:', order.totalAmount);
        console.log('   商品金额:', order.goodsAmount);
        console.log('   运费:', order.shippingFee);
        
        // 检查前端期望的字段
        console.log('\n🔍 检查前端期望字段:');
        
        // 检查 addressInfo
        if (order.addressInfo) {
          console.log('   ✅ addressInfo 存在');
          console.log('      receiver:', order.addressInfo.receiver);
          console.log('      phone:', order.addressInfo.phone);
          console.log('      address:', order.addressInfo.address);
        } else {
          console.log('   ❌ addressInfo 缺失');
        }
        
        // 检查 goodsInfo
        if (order.goodsInfo && Array.isArray(order.goodsInfo)) {
          console.log('   ✅ goodsInfo 存在，商品数量:', order.goodsInfo.length);
          order.goodsInfo.forEach((item, index) => {
            console.log(`     商品${index + 1}:`);
            console.log(`       id: ${item.id}`);
            console.log(`       name: ${item.name}`);
            console.log(`       image: ${item.image}`);
            console.log(`       specs: ${item.specs}`);
            console.log(`       price: ${item.price}`);
            console.log(`       quantity: ${item.quantity}`);
          });
        } else {
          console.log('   ❌ goodsInfo 缺失或格式错误');
        }
        
        // 检查是否还有旧的字段
        console.log('\n🔍 检查旧字段是否已移除:');
        if (order.address) {
          console.log('   ⚠️ 旧字段 address 仍然存在');
        } else {
          console.log('   ✅ 旧字段 address 已移除');
        }
        
        if (order.goods) {
          console.log('   ⚠️ 旧字段 goods 仍然存在');
        } else {
          console.log('   ✅ 旧字段 goods 已移除');
        }
        
        if (order.items) {
          console.log('   ⚠️ 旧字段 items 仍然存在');
        } else {
          console.log('   ✅ 旧字段 items 已移除');
        }
        
      } else {
        console.log('⚠️ 没有找到订单数据');
      }
    } else {
      console.log('❌ 获取订单列表失败:', listResponse.data);
    }
    
    // 6. 测试获取订单详情
    console.log('\n📄 测试获取订单详情...');
    const detailResponse = await axios.get(`${apiConfig.baseURL}/order/detail/${orderNumber}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (detailResponse.data.code === 200) {
      console.log('✅ 获取订单详情成功');
      const detail = detailResponse.data.data;
      
      console.log('\n📦 订单详情数据结构:');
      console.log('   订单号:', detail.orderNumber);
      console.log('   状态:', detail.status, detail.statusText);
      console.log('   总金额:', detail.totalAmount);
      
      // 检查详情页的字段
      if (detail.addressInfo) {
        console.log('   ✅ 详情页 addressInfo 存在');
      } else {
        console.log('   ❌ 详情页 addressInfo 缺失');
      }
      
      if (detail.goodsInfo && Array.isArray(detail.goodsInfo)) {
        console.log('   ✅ 详情页 goodsInfo 存在，商品数量:', detail.goodsInfo.length);
      } else {
        console.log('   ❌ 详情页 goodsInfo 缺失或格式错误');
      }
      
    } else {
      console.log('❌ 获取订单详情失败:', detailResponse.data);
    }
    
    console.log('\n🎉 测试完成！');
    
  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error.response?.data || error.message);
  }
}

testFixedOrderAPI(); 