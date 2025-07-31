const axios = require('axios');
const apiConfig = require('./config/api');

console.log('🌐 API配置已加载 - 环境:', apiConfig.environment, ', BaseURL:', apiConfig.baseURL);

async function testOrderCreationFixed() {
  try {
    console.log('🧪 测试修复后的订单创建逻辑...');
    
    // 1. 创建测试用户
    console.log('🔐 创建测试用户...');
    const registerResponse = await axios.post(`${apiConfig.baseURL}/user/register`, {
      username: 'testuser_creation',
      password: '123456',
      email: 'test_creation@example.com'
    });
    
    if (registerResponse.data.code === 200) {
      console.log('✅ 用户注册成功');
    } else {
      console.log('⚠️ 用户可能已存在，尝试登录...');
    }
    
    // 2. 登录获取token
    const loginResponse = await axios.post(`${apiConfig.baseURL}/user/login`, {
      username: 'testuser_creation',
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
    
    // 4. 创建测试订单
    console.log('📝 创建测试订单...');
    const orderResponse = await axios.post(`${apiConfig.baseURL}/order/create`, {
      cartItemIds: ['test_item_1', 'test_item_2'],
      addressId: addressId,
      message: '测试订单创建'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (orderResponse.data.code !== 200) {
      console.log('❌ 创建订单失败:', orderResponse.data);
      return;
    }
    
    console.log('✅ 订单创建成功');
    const orderNumber = orderResponse.data.data.orderNumber;
    console.log('   订单号:', orderNumber);
    console.log('   状态:', orderResponse.data.data.status);
    console.log('   总金额:', orderResponse.data.data.totalAmount);
    
    // 5. 验证订单数据完整性
    console.log('🔍 验证订单数据完整性...');
    const listResponse = await axios.get(`${apiConfig.baseURL}/order/goods-list?status=all&page=1&pageSize=10`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (listResponse.data.code === 200) {
      const orders = listResponse.data.data.list;
      const newOrder = orders.find(order => order.orderNumber === orderNumber);
      
      if (newOrder) {
        console.log('📦 新创建订单的数据结构:');
        console.log('   订单号:', newOrder.orderNumber);
        console.log('   状态:', newOrder.status, newOrder.statusText);
        console.log('   总金额:', newOrder.totalAmount);
        console.log('   商品金额:', newOrder.goodsAmount);
        console.log('   运费:', newOrder.shippingFee);
        
        // 检查前端期望的字段
        console.log('\n🔍 检查前端期望字段:');
        
        if (newOrder.addressInfo) {
          console.log('   ✅ addressInfo 存在');
          console.log('      receiver:', newOrder.addressInfo.receiver);
          console.log('      phone:', newOrder.addressInfo.phone);
          console.log('      address:', newOrder.addressInfo.address);
        } else {
          console.log('   ❌ addressInfo 缺失');
        }
        
        if (newOrder.goodsInfo && Array.isArray(newOrder.goodsInfo)) {
          console.log(`   ✅ goodsInfo 存在，商品数量: ${newOrder.goodsInfo.length}`);
          newOrder.goodsInfo.forEach((item, index) => {
            console.log(`     商品${index + 1}: ${item.name} - ¥${item.price} x ${item.quantity}`);
          });
        } else {
          console.log('   ❌ goodsInfo 缺失或格式错误');
        }
        
        // 数据完整性检查
        console.log('\n🔍 数据完整性检查:');
        let isComplete = true;
        
        if (!newOrder.addressInfo || !newOrder.addressInfo.receiver || !newOrder.addressInfo.phone) {
          console.log('   ❌ 地址信息不完整');
          isComplete = false;
        }
        
        if (!newOrder.goodsInfo || newOrder.goodsInfo.length === 0) {
          console.log('   ❌ 商品信息缺失');
          isComplete = false;
        }
        
        if (newOrder.totalAmount <= 0) {
          console.log('   ❌ 订单金额异常');
          isComplete = false;
        }
        
        if (isComplete) {
          console.log('   ✅ 订单数据完整，前端应该能正常显示！');
        } else {
          console.log('   ⚠️ 订单数据不完整，需要进一步修复');
        }
        
      } else {
        console.log('❌ 未找到新创建的订单');
      }
    } else {
      console.log('❌ 获取订单列表失败:', listResponse.data);
    }
    
    console.log('\n🎉 测试完成！');
    
  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error.response?.data || error.message);
  }
}

testOrderCreationFixed(); 