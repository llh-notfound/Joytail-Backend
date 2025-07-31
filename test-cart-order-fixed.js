const axios = require('axios');
const apiConfig = require('./config/api');

console.log('🌐 API配置已加载 - 环境:', apiConfig.environment, ', BaseURL:', apiConfig.baseURL);

async function testCartOrderFlow() {
  try {
    console.log('🧪 测试购物车到订单的完整流程...');
    
    // 1. 创建测试用户
    console.log('🔐 创建测试用户...');
    const registerResponse = await axios.post(`${apiConfig.baseURL}/user/register`, {
      username: 'testuser_cart',
      password: '123456',
      email: 'test_cart@example.com'
    });
    
    if (registerResponse.data.code === 200) {
      console.log('✅ 用户注册成功');
    } else {
      console.log('⚠️ 用户可能已存在，尝试登录...');
    }
    
    // 2. 登录获取token
    const loginResponse = await axios.post(`${apiConfig.baseURL}/user/login`, {
      username: 'testuser_cart',
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
      name: '测试收货人',
      phone: '13800138000',
      region: '广东省深圳市南山区',
      regionArray: ['广东省', '深圳市', '南山区'],
      detail: '科技园南区8栋101室',
      isDefault: true
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (addressResponse.data.code !== 200) {
      throw new Error('创建地址失败: ' + JSON.stringify(addressResponse.data));
    }
    
    console.log('✅ 测试地址创建成功');
    const addressId = addressResponse.data.data.id;
    
    // 4. 添加商品到购物车
    console.log('🛒 添加商品到购物车...');
    const addToCartResponse = await axios.post(`${apiConfig.baseURL}/cart/add`, {
      goodsId: 'goods_001', // 使用一个存在的商品ID
      quantity: 2,
      specs: '5kg装'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (addToCartResponse.data.code !== 200) {
      console.log('⚠️ 添加商品到购物车失败，使用测试数据:', addToCartResponse.data);
    } else {
      console.log('✅ 添加商品到购物车成功');
    }
    
    // 5. 获取购物车列表
    console.log('📋 获取购物车列表...');
    const cartResponse = await axios.get(`${apiConfig.baseURL}/cart/list`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (cartResponse.data.code === 200) {
      console.log('✅ 获取购物车列表成功');
      const cartItems = cartResponse.data.data;
      console.log(`   购物车商品数量: ${cartItems.length}`);
      
      if (cartItems.length > 0) {
        console.log('   购物车商品:');
        cartItems.forEach((item, index) => {
          console.log(`     ${index + 1}. ${item.name} - ¥${item.price} x ${item.quantity}`);
        });
        
        // 6. 创建订单
        console.log('📝 创建订单...');
        const cartItemIds = cartItems.map(item => item.id);
        const orderResponse = await axios.post(`${apiConfig.baseURL}/order/create`, {
          cartItemIds: cartItemIds,
          addressId: addressId,
          message: '测试订单创建'
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (orderResponse.data.code === 200) {
          console.log('✅ 订单创建成功');
          console.log('   订单号:', orderResponse.data.data.orderNumber);
          console.log('   状态:', orderResponse.data.data.status);
          console.log('   总金额:', orderResponse.data.data.totalAmount);
          
          // 7. 验证订单数据
          console.log('🔍 验证订单数据...');
          const listResponse = await axios.get(`${apiConfig.baseURL}/order/goods-list?status=all&page=1&pageSize=10`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (listResponse.data.code === 200) {
            const orders = listResponse.data.data.list;
            const newOrder = orders.find(order => order.orderNumber === orderResponse.data.data.orderNumber);
            
            if (newOrder) {
              console.log('📦 新创建订单的数据结构:');
              console.log('   订单号:', newOrder.orderNumber);
              console.log('   状态:', newOrder.status, newOrder.statusText);
              console.log('   总金额:', newOrder.totalAmount);
              
              if (newOrder.addressInfo) {
                console.log('   ✅ addressInfo 存在');
                console.log('      receiver:', newOrder.addressInfo.receiver);
                console.log('      phone:', newOrder.addressInfo.phone);
              }
              
              if (newOrder.goodsInfo && Array.isArray(newOrder.goodsInfo)) {
                console.log(`   ✅ goodsInfo 存在，商品数量: ${newOrder.goodsInfo.length}`);
                newOrder.goodsInfo.forEach((item, index) => {
                  console.log(`     商品${index + 1}: ${item.name} - ¥${item.price} x ${item.quantity}`);
                });
              }
              
              console.log('🎉 购物车到订单流程测试成功！');
            } else {
              console.log('❌ 未找到新创建的订单');
            }
          } else {
            console.log('❌ 获取订单列表失败:', listResponse.data);
          }
        } else {
          console.log('❌ 创建订单失败:', orderResponse.data);
        }
      } else {
        console.log('⚠️ 购物车为空，无法测试订单创建');
      }
    } else {
      console.log('❌ 获取购物车列表失败:', cartResponse.data);
    }
    
  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error.response?.data || error.message);
  }
}

testCartOrderFlow(); 