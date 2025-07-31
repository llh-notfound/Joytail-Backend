const { connectRedis, getRedisClient } = require('./config/redis');

async function debugOrderSubmission() {
  try {
    await connectRedis();
    const redisClient = getRedisClient();
    
    console.log('🔍 调试订单提交失败原因...\n');
    
    // 模拟前端请求参数
    const userId = '3d276ea2-f2ff-416b-bd60-d210050f9258'; // 从日志中看到的用户ID
    const addressId = 'A_1753969387989_qbqofd0a9';
    const cartItemIds = ['cart_item_1']; // 假设的购物车项ID
    
    console.log('📋 请求参数:');
    console.log('   用户ID:', userId);
    console.log('   地址ID:', addressId);
    console.log('   购物车项ID:', cartItemIds);
    
    // 1. 检查地址是否存在
    console.log('\n📍 检查地址信息...');
    const addressKey = `address:${userId}:${addressId}`;
    const addressData = await redisClient.get(addressKey);
    
    if (!addressData) {
      console.log('❌ 地址不存在 - 这是失败的原因！');
      console.log('   地址键:', addressKey);
      
      // 检查该用户的所有地址
      const userAddresses = await redisClient.keys(`address:${userId}:*`);
      console.log('   该用户的所有地址键:', userAddresses);
      
      if (userAddresses.length > 0) {
        console.log('   可用的地址ID:');
        for (const addrKey of userAddresses) {
          const addrData = await redisClient.get(addrKey);
          if (addrData) {
            const addr = JSON.parse(addrData);
            console.log(`     ${addrKey.split(':')[2]} - ${addr.name} (${addr.phone})`);
          }
        }
      }
    } else {
      const address = JSON.parse(addressData);
      console.log('✅ 地址存在');
      console.log('   收货人:', address.name);
      console.log('   电话:', address.phone);
      console.log('   地址:', address.region + address.detail);
      
      // 检查地址信息完整性
      if (!address.name || !address.phone) {
        console.log('❌ 地址信息不完整 - 这是失败的原因！');
        console.log('   姓名:', address.name);
        console.log('   电话:', address.phone);
      } else {
        console.log('✅ 地址信息完整');
      }
    }
    
    // 2. 检查购物车数据
    console.log('\n🛒 检查购物车数据...');
    const cartKey = `cart:${userId}`;
    const cartData = await redisClient.get(cartKey);
    
    if (!cartData) {
      console.log('❌ 购物车为空 - 将使用测试数据');
      
      // 检查测试数据
      const testItems = [
        {
          id: 'cart_item_1',
          goodsId: 'G001',
          name: '皇家ROYAL CANNIN 成猫通用猫粮',
          image: 'https://example.com/cat-food.jpg',
          price: 156.80,
          quantity: 2,
          specs: '5kg'
        }
      ];
      
      console.log('   测试商品数据:');
      for (const item of testItems) {
        console.log(`     ${item.name} - ¥${item.price} x ${item.quantity}`);
        
        // 检查商品信息完整性
        if (!item.name || !item.price || item.price <= 0) {
          console.log('❌ 商品信息不完整或价格异常 - 这是失败的原因！');
          console.log('   名称:', item.name);
          console.log('   价格:', item.price);
        } else {
          console.log('✅ 商品信息完整');
        }
      }
    } else {
      const cart = JSON.parse(cartData);
      console.log('✅ 购物车数据存在');
      console.log('   购物车商品数量:', cart.items ? cart.items.length : 0);
      
      if (cart.items) {
        for (const item of cart.items) {
          console.log(`     ${item.name} - ¥${item.price} x ${item.quantity}`);
          
          // 检查商品信息完整性
          if (!item.name || !item.price || item.price <= 0) {
            console.log('❌ 商品信息不完整或价格异常 - 这是失败的原因！');
          } else {
            console.log('✅ 商品信息完整');
          }
        }
      }
    }
    
    // 3. 检查用户认证数据
    console.log('\n👤 检查用户认证数据...');
    const authKeys = await redisClient.keys('auth:*');
    const userAuth = authKeys.find(key => {
      const authData = redisClient.get(key);
      if (authData) {
        const auth = JSON.parse(authData);
        return auth.userId === userId;
      }
      return false;
    });
    
    if (userAuth) {
      console.log('✅ 用户认证数据存在');
    } else {
      console.log('❌ 用户认证数据不存在 - 这可能是失败的原因！');
    }
    
    console.log('\n🎯 总结可能的失败原因:');
    console.log('1. 地址ID不存在或地址信息不完整');
    console.log('2. 购物车商品信息不完整或价格异常');
    console.log('3. 用户认证问题');
    
  } catch (error) {
    console.error('❌ 调试过程中出现错误:', error);
  }
}

debugOrderSubmission(); 