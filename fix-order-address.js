const { connectRedis, getRedisClient } = require('./config/redis');

async function fixOrderAddress() {
  try {
    await connectRedis();
    const redisClient = getRedisClient();
    
    console.log('🏠 修复订单地址信息...\n');
    
    // 获取所有订单键
    const orderKeys = await redisClient.keys('order:*');
    console.log(`📋 找到 ${orderKeys.length} 个订单`);
    
    for (const orderKey of orderKeys) {
      console.log(`\n📦 处理订单: ${orderKey}`);
      const orderData = await redisClient.get(orderKey);
      
      if (orderData) {
        const order = JSON.parse(orderData);
        let needsUpdate = false;
        
        // 修复地址信息
        if (order.address) {
          // 为没有完整地址信息的订单添加默认地址
          if (!order.address.province || order.address.province === '') {
            order.address.province = '广东省';
            needsUpdate = true;
          }
          
          if (!order.address.city || order.address.city === '') {
            order.address.city = '深圳市';
            needsUpdate = true;
          }
          
          if (!order.address.district || order.address.district === '') {
            order.address.district = '南山区';
            needsUpdate = true;
          }
          
          if (!order.address.detailAddress || order.address.detailAddress === '') {
            order.address.detailAddress = '科技园南区8栋101室';
            needsUpdate = true;
          }
          
          // 确保姓名和电话不为空
          if (!order.address.name || order.address.name === '') {
            order.address.name = '收货人';
            needsUpdate = true;
          }
          
          if (!order.address.phone || order.address.phone === '') {
            order.address.phone = '13800138000';
            needsUpdate = true;
          }
        }
        
        // 如果需要更新，保存修复后的数据
        if (needsUpdate) {
          await redisClient.set(orderKey, JSON.stringify(order));
          console.log('   ✅ 订单地址信息已修复');
          console.log(`   收货人: ${order.address.name}`);
          console.log(`   电话: ${order.address.phone}`);
          console.log(`   地址: ${order.address.province}${order.address.city}${order.address.district}${order.address.detailAddress}`);
        } else {
          console.log('   ✅ 订单地址信息正常，无需修复');
        }
      }
    }
    
    console.log('\n🎉 订单地址信息修复完成！');
    
  } catch (error) {
    console.error('❌ 修复失败:', error);
  }
}

fixOrderAddress(); 