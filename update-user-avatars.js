const { getRedisClient } = require('./config/redis');

const redisClient = getRedisClient();

// 新的头像映射
const avatarMapping = {
  'user_0': '/uploads/community-users/user6_avatar.jpg',  // 加菲猫管家
  'user_1': '/uploads/community-users/user1_avatar.jpg',  // 柴犬麻麻
  'user_2': '/uploads/community-users/user2_avatar.jpg',  // 橘猫爸爸
  'user_3': '/uploads/community-users/user3_avatar.jpg',  // 金毛主人
  'user_4': '/uploads/community-users/user4_avatar.jpg',  // 布偶猫奴
  'user_5': '/uploads/community-users/user5_avatar.jpg'   // 哈士奇铲屎官
};

async function updateUserAvatars() {
  try {
    await redisClient.connect();
    
    console.log('🖼️ 开始更新用户头像...\n');
    
    // 获取所有用户
    const users = await redisClient.hGetAll('users');
    console.log(`📊 总用户数: ${Object.keys(users).length}`);
    
    let updatedCount = 0;
    
    // 更新预设用户的头像
    for (const [username, userJson] of Object.entries(users)) {
      try {
        const user = JSON.parse(userJson);
        
        // 检查是否是预设用户
        if (avatarMapping[user.userId]) {
          const oldAvatar = user.avatar;
          const newAvatar = avatarMapping[user.userId];
          
          // 更新头像
          user.avatar = newAvatar;
          
          // 保存更新后的用户数据
          await redisClient.hSet('users', username, JSON.stringify(user));
          
          console.log(`✅ 更新用户 ${user.username} (${user.userId}):`);
          console.log(`   📸 旧头像: ${oldAvatar}`);
          console.log(`   📸 新头像: ${newAvatar}`);
          
          updatedCount++;
        }
      } catch (error) {
        console.log(`❌ 更新用户 ${username} 失败: ${error.message}`);
      }
    }
    
    console.log(`\n🎉 头像更新完成！`);
    console.log(`📊 统计信息:`);
    console.log(`   - 更新用户数: ${updatedCount} 个`);
    console.log(`   - 预设用户总数: ${Object.keys(avatarMapping).length} 个`);
    
    // 重新获取用户数据来验证更新结果
    console.log(`\n🔍 验证更新结果:`);
    const updatedUsers = await redisClient.hGetAll('users');
    for (const [username, userJson] of Object.entries(updatedUsers)) {
      try {
        const user = JSON.parse(userJson);
        if (avatarMapping[user.userId]) {
          console.log(`   👤 ${user.username}: ${user.avatar}`);
        }
      } catch (error) {
        // 忽略非预设用户
      }
    }
    
    await redisClient.disconnect();
  } catch (error) {
    console.error('❌ 更新用户头像失败:', error);
  }
}

updateUserAvatars(); 