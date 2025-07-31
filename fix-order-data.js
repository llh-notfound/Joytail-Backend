const { connectRedis, getRedisClient } = require('./config/redis');

async function fixOrderData() {
  try {
    await connectRedis();
    const redisClient = getRedisClient();
    
    console.log('🔧 修复订单数据...\n');
    
    // 获取所有订单键
    const orderKeys = await redisClient.keys('order:*');
    console.log(`📋 找到 ${orderKeys.length} 个订单`);
    
    for (const orderKey of orderKeys) {
      console.log(`\n📦 处理订单: ${orderKey}`);
      const orderData = await redisClient.get(orderKey);
      
      if (orderData) {
        const order = JSON.parse(orderData);
        let needsUpdate = false;
        
        // 检查并修复商品数据
        if (order.items && order.items.length > 0) {
          for (const item of order.items) {
            // 修复商品名称
            if (!item.name || item.name === 'undefined') {
              item.name = '商品信息缺失';
              needsUpdate = true;
            }
            
            // 修复价格
            if (item.price === null || item.price === undefined) {
              item.price = 0;
              needsUpdate = true;
            }
            
            // 修复小计
            if (item.subtotal === null || item.subtotal === undefined) {
              item.subtotal = parseFloat((item.price * item.quantity).toFixed(2));
              needsUpdate = true;
            }
            
            // 修复图片
            if (!item.image || item.image === 'undefined') {
              item.image = 'https://via.placeholder.com/100x100?text=商品图片';
              needsUpdate = true;
            }
            
            // 修复规格
            if (!item.specs || item.specs === 'undefined') {
              item.specs = '默认规格';
              needsUpdate = true;
            }
          }
        }
        
        // 修复总金额和商品金额
        if (order.totalAmount === null || order.totalAmount === undefined) {
          const calculatedTotal = order.items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
          order.totalAmount = calculatedTotal;
          order.goodsAmount = calculatedTotal;
          needsUpdate = true;
        }
        
        // 修复地址信息
        if (order.address) {
          if (!order.address.name || order.address.name === 'undefined') {
            order.address.name = '收货人';
            needsUpdate = true;
          }
          
          if (!order.address.phone || order.address.phone === 'undefined') {
            order.address.phone = '13800138000';
            needsUpdate = true;
          }
          
          // 修复地址字段
          const addressFields = ['province', 'city', 'district', 'detailAddress'];
          for (const field of addressFields) {
            if (!order.address[field] || order.address[field] === 'undefined') {
              order.address[field] = '';
              needsUpdate = true;
            }
          }
        }
        
        // 如果需要更新，保存修复后的数据
        if (needsUpdate) {
          await redisClient.set(orderKey, JSON.stringify(order));
          console.log('   ✅ 订单数据已修复');
          
          // 显示修复后的数据
          console.log('   修复后的商品信息:');
          order.items.forEach((item, index) => {
            console.log(`     ${index + 1}. ${item.name} - ¥${item.price} x ${item.quantity} = ¥${item.subtotal}`);
          });
          console.log(`   总金额: ¥${order.totalAmount}`);
        } else {
          console.log('   ✅ 订单数据正常，无需修复');
        }
      }
    }
    
    console.log('\n🎉 订单数据修复完成！');
    
  } catch (error) {
    console.error('❌ 修复失败:', error);
  }
}

fixOrderData(); 