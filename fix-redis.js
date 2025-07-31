const { getRedisClient } = require('./config/redis');

const redisClient = getRedisClient();

async function fixRedis() {
  try {
    await redisClient.connect();
    
    console.log('🔧 修复Redis数据类型错误...\n');
    
    // 检查并修复第二个用户的发布列表
    const problematicKey = 'user:50c46d41-c7a0-4539-a3cd-cac94c64eb54:posts';
    
    try {
      const keyType = await redisClient.type(problematicKey);
      console.log(`🔍 键 ${problematicKey} 的类型: ${keyType}`);
      
      if (keyType === 'list') {
        console.log('❌ 发现错误的List类型，正在修复...');
        
        // 获取List中的值
        const listValues = await redisClient.lRange(problematicKey, 0, -1);
        console.log(`📝 List中的值: ${JSON.stringify(listValues)}`);
        
        // 删除错误的键
        await redisClient.del(problematicKey);
        console.log('🗑️ 已删除错误的键');
        
        // 重新创建为Sorted Set
        if (listValues.length > 0) {
          const now = Date.now();
          for (const postId of listValues) {
            await redisClient.zAdd(problematicKey, { score: now, value: postId });
          }
          console.log('✅ 已重新创建为Sorted Set');
        }
      } else {
        console.log('✅ 键类型正确，无需修复');
      }
    } catch (error) {
      console.log(`❌ 检查键类型失败: ${error.message}`);
    }
    
    // 验证修复结果
    try {
      const fixedValues = await redisClient.zRange(problematicKey, 0, -1, { REV: true });
      console.log(`✅ 修复后，Sorted Set中的值: ${JSON.stringify(fixedValues)}`);
    } catch (error) {
      console.log(`❌ 验证修复失败: ${error.message}`);
    }
    
    await redisClient.disconnect();
    console.log('\n🎉 Redis修复完成！');
  } catch (error) {
    console.error('❌ 修复Redis失败:', error);
  }
}

fixRedis(); 