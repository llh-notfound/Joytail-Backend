const { connectRedis, getRedisClient } = require('./config/redis');

async function checkGoodsData() {
  try {
    await connectRedis();
    const redisClient = getRedisClient();
    
    console.log('🔍 检查商品数据...\n');
    
    // 获取所有商品键
    const goodsKeys = await redisClient.keys('goods:*');
    console.log(`📋 找到 ${goodsKeys.length} 个商品`);
    
    if (goodsKeys.length === 0) {
      console.log('❌ 没有商品数据，需要初始化');
      return;
    }
    
    console.log('\n📦 商品列表:');
    for (const key of goodsKeys) {
      const goodsData = await redisClient.get(key);
      if (goodsData) {
        const goods = JSON.parse(goodsData);
        console.log(`   ${goods.id}: ${goods.name} - ¥${goods.price}`);
      }
    }
    
    // 检查特定的商品ID
    console.log('\n🔍 检查特定商品ID:');
    const testIds = ['goods_001', 'goods_002', 'G001', 'G002'];
    
    for (const id of testIds) {
      const goodsData = await redisClient.get(`goods:${id}`);
      if (goodsData) {
        const goods = JSON.parse(goodsData);
        console.log(`   ✅ ${id}: ${goods.name} - ¥${goods.price}`);
      } else {
        console.log(`   ❌ ${id}: 不存在`);
      }
    }
    
  } catch (error) {
    console.error('❌ 检查商品数据失败:', error);
  }
}

checkGoodsData(); 