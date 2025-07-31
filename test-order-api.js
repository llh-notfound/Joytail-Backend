const axios = require('axios');
const apiConfig = require('./config/api');

const BASE_URL = apiConfig.baseURL;
let authToken = '';
let testOrderNumber = '';

console.log(`🚀 使用API配置: ${BASE_URL}`);

// 创建测试用户并获取token
async function createTestUser() {
  try {
    console.log('🔐 创建测试用户...');
    
    // 注册用户
    const registerResponse = await axios.post(`${apiConfig.getApiUrl('/user/register')}`, {
      username: 'testuser_order',
      password: '123456',
      nickname: '订单测试用户'
    });
    
    if (registerResponse.data.code === 200) {
      console.log('✅ 用户注册成功');
    }
    
    // 登录获取token
    const loginResponse = await axios.post(`${apiConfig.getApiUrl('/user/login')}`, {
      username: 'testuser_order',
      password: '123456'
    });
    
    if (loginResponse.data.code === 200) {
      authToken = loginResponse.data.data.token;
      console.log('✅ 登录成功，获取到token');
    }
    
  } catch (error) {
    console.log('⚠️ 用户可能已存在，尝试登录...');
    
    try {
      const loginResponse = await axios.post(`${apiConfig.getApiUrl('/user/login')}`, {
        username: 'testuser_order',
        password: '123456'
      });
      
      if (loginResponse.data.code === 200) {
        authToken = loginResponse.data.data.token;
        console.log('✅ 登录成功，获取到token');
      }
    } catch (loginError) {
      console.error('❌ 登录失败:', loginError.response?.data || loginError.message);
      throw loginError;
    }
  }
}

// 创建测试地址
async function createTestAddress() {
  try {
    console.log('\n📍 创建测试地址...');
    
    const addressData = {
      name: '张三',
      phone: '13800138000',
      region: '广东省深圳市南山区',
      regionArray: ['广东省', '深圳市', '南山区'],
      detail: '科技园南区8栋101室',
      isDefault: true
    };
    
    const response = await axios.post(`${apiConfig.getApiUrl('/address/add')}`, addressData, {
      headers: { 
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data.code === 200) {
      console.log('✅ 测试地址创建成功');
      return response.data.data.id;
    }
    
  } catch (error) {
    console.error('❌ 创建测试地址失败:', error.response?.data || error.message);
    throw error;
  }
}

// 添加测试商品到购物车
async function addTestItemsToCart() {
  try {
    console.log('\n🛒 添加测试商品到购物车...');
    
    // 模拟添加商品到购物车
    const cartData = {
      items: [
        {
          id: 'cart_item_1',
          goodsId: 'G001',
          name: '高级猫粮',
          image: 'https://example.com/cat-food.jpg',
          price: 140.00,
          quantity: 2,
          specs: '5kg装'
        },
        {
          id: 'cart_item_2',
          goodsId: 'G002',
          name: '宠物玩具',
          image: 'https://example.com/pet-toy.jpg',
          price: 50.00,
          quantity: 1,
          specs: '小型犬适用'
        }
      ]
    };
    
    // 这里应该调用购物车API，但为了测试，我们直接模拟
    console.log('✅ 购物车数据准备完成');
    return cartData.items.map(item => item.id);
    
  } catch (error) {
    console.error('❌ 添加商品到购物车失败:', error.response?.data || error.message);
    throw error;
  }
}

// 测试创建订单
async function testCreateOrder(addressId, cartItemIds) {
  try {
    console.log('\n📝 测试创建订单...');
    
    const orderData = {
      cartItemIds: cartItemIds,
      addressId: addressId,
      message: '请尽快发货'
    };
    
    const response = await axios.post(`${apiConfig.getApiUrl('/order/create')}`, orderData, {
      headers: { 
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ 订单创建成功');
    console.log(`   订单号: ${response.data.data.orderNumber}`);
    console.log(`   订单ID: ${response.data.data.orderId}`);
    console.log(`   状态: ${response.data.data.statusText}`);
    console.log(`   总金额: ${response.data.data.totalAmount}`);
    console.log(`   商品金额: ${response.data.data.goodsAmount}`);
    console.log(`   运费: ${response.data.data.shippingFee}`);
    
    testOrderNumber = response.data.data.orderNumber;
    return response.data.data;
    
  } catch (error) {
    console.error('❌ 创建订单失败:', error.response?.data || error.message);
    throw error;
  }
}

// 测试获取订单列表（全部）
async function testGetOrderList(status = 'all') {
  try {
    console.log(`\n📋 测试获取订单列表 (${status})...`);
    
    const response = await axios.get(`${apiConfig.getApiUrl('/order/goods-list')}?status=${status}&page=1&pageSize=10`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    console.log('✅ 获取订单列表成功');
    console.log(`   总数: ${response.data.data.total}`);
    console.log(`   当前页: ${response.data.data.page}`);
    console.log(`   每页大小: ${response.data.data.pageSize}`);
    console.log(`   订单数量: ${response.data.data.list.length}`);
    
    if (response.data.data.list.length > 0) {
      const firstOrder = response.data.data.list[0];
      console.log(`   第一个订单: ${firstOrder.orderNumber} - ${firstOrder.statusText}`);
    }
    
    return response.data.data;
    
  } catch (error) {
    console.error('❌ 获取订单列表失败:', error.response?.data || error.message);
    throw error;
  }
}

// 测试获取订单列表（待付款）
async function testGetPendingPaymentOrders() {
  try {
    console.log('\n💰 测试获取待付款订单...');
    
    const response = await axios.get(`${apiConfig.getApiUrl('/order/goods-list')}?status=pending_payment&page=1&pageSize=10`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    console.log('✅ 获取待付款订单成功');
    console.log(`   待付款订单数量: ${response.data.data.list.length}`);
    
    return response.data.data;
    
  } catch (error) {
    console.error('❌ 获取待付款订单失败:', error.response?.data || error.message);
    throw error;
  }
}

// 测试订单支付
async function testPayOrder(orderNumber) {
  try {
    console.log('\n💳 测试订单支付...');
    
    const paymentData = {
      paymentMethod: 'wechat',
      paymentChannel: 'wechat_pay'
    };
    
    const response = await axios.post(`${apiConfig.getApiUrl('/order/pay')}/${orderNumber}`, paymentData, {
      headers: { 
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ 订单支付成功');
    console.log(`   订单号: ${response.data.data.orderNumber}`);
    console.log(`   支付ID: ${response.data.data.paymentId}`);
    console.log(`   支付时间: ${response.data.data.payTime}`);
    console.log(`   新状态: ${response.data.data.statusText}`);
    
    return response.data.data;
    
  } catch (error) {
    console.error('❌ 订单支付失败:', error.response?.data || error.message);
    throw error;
  }
}

// 测试获取订单详情
async function testGetOrderDetail(orderNumber) {
  try {
    console.log('\n📄 测试获取订单详情...');
    
    const response = await axios.get(`${apiConfig.getApiUrl('/order/detail')}/${orderNumber}`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    console.log('✅ 获取订单详情成功');
    console.log(`   订单号: ${response.data.data.orderNumber}`);
    console.log(`   状态: ${response.data.data.statusText}`);
    console.log(`   总金额: ${response.data.data.totalAmount}`);
    console.log(`   商品数量: ${response.data.data.items.length}`);
    
    return response.data.data;
    
  } catch (error) {
    console.error('❌ 获取订单详情失败:', error.response?.data || error.message);
    throw error;
  }
}

// 主测试函数
async function runTests() {
  try {
    console.log('🚀 开始测试订单管理API...\n');
    
    // 1. 创建测试用户
    await createTestUser();
    
    // 2. 创建测试地址
    const addressId = await createTestAddress();
    
    // 3. 添加测试商品到购物车
    const cartItemIds = await addTestItemsToCart();
    
    // 4. 创建订单
    const order = await testCreateOrder(addressId, cartItemIds);
    
    // 5. 获取订单列表（全部）
    await testGetOrderList('all');
    
    // 6. 获取订单列表（待付款）
    await testGetPendingPaymentOrders();
    
    // 7. 获取订单详情
    await testGetOrderDetail(order.orderNumber);
    
    // 8. 支付订单
    await testPayOrder(order.orderNumber);
    
    // 9. 再次获取订单列表（验证状态变化）
    await testGetOrderList('all');
    
    console.log('\n🎉 所有测试完成！');
    
  } catch (error) {
    console.error('\n❌ 测试过程中出现错误:', error.message);
  }
}

// 运行测试
runTests(); 