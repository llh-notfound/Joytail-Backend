const { connectRedis, getRedisClient } = require('./config/redis');

async function debugOrderData() {
  try {
    await connectRedis();
    const redisClient = getRedisClient();
    
    console.log('🔍 调试订单数据...\n');
    
    // 获取所有订单键
    const orderKeys = await redisClient.keys('order:*');
    console.log(`📋 找到 ${orderKeys.length} 个订单`);
    
    for (const orderKey of orderKeys) {
      console.log(`\n📦 订单键: ${orderKey}`);
      const orderData = await redisClient.get(orderKey);
      
      if (orderData) {
        const order = JSON.parse(orderData);
        console.log('   订单号:', order.orderNumber);
        console.log('   状态:', order.status, order.statusText);
        console.log('   总金额:', order.totalAmount);
        console.log('   商品金额:', order.goodsAmount);
        console.log('   运费:', order.shippingFee);
        console.log('   创建时间:', order.createTime);
        
        if (order.items && order.items.length > 0) {
          console.log('   商品列表:');
          order.items.forEach((item, index) => {
            console.log(`     ${index + 1}. ${item.name}`);
            console.log(`        规格: ${item.specs}`);
            console.log(`        价格: ¥${item.price}`);
            console.log(`        数量: ${item.quantity}`);
            console.log(`        小计: ¥${item.subtotal}`);
            console.log(`        图片: ${item.image}`);
          });
        } else {
          console.log('   ⚠️ 没有商品数据');
        }
        
        if (order.address) {
          console.log('   收货地址:');
          console.log(`     姓名: ${order.address.name}`);
          console.log(`     电话: ${order.address.phone}`);
          console.log(`     地址: ${order.address.province}${order.address.city}${order.address.district}${order.address.detailAddress}`);
        }
      }
    }
    
    // 检查用户订单列表
    const userKeys = await redisClient.keys('user:*:orders');
    console.log(`\n👥 找到 ${userKeys.length} 个用户的订单列表`);
    
    for (const userKey of userKeys) {
      console.log(`\n📋 用户订单列表: ${userKey}`);
      const orderNumbers = await redisClient.lRange(userKey, 0, -1);
      console.log('   订单号列表:', orderNumbers);
    }
    
  } catch (error) {
    console.error('❌ 调试失败:', error);
  }
}

debugOrderData(); 