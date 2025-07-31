// PetPal 宠物社区预设用户头像代码更新

// 🔧 需要修改的文件：/home/devbox/project/controllers/communityController.js
// 📍 修改位置：getUserInfo 函数（约第38-42行）

// 📋 原始代码：
/*
return {
  userId,
  username: `用户${userId.slice(-6)}`,
  avatar: `https://picsum.photos/100/100?random=${userId.slice(-2)}`
};
*/

// ✅ 修改后的代码：
const getUserInfo = async (userId) => {
  try {
    // 先尝试通过userId获取username
    const username = await redisClient.hGet('userIds', userId);
    
    if (username) {
      // 从用户表获取完整用户信息
      const userData = await redisClient.hGet('users', username);
      if (userData) {
        const user = JSON.parse(userData);
        return {
          userId,
          username: user.nickname || user.username || '匿名用户',
          avatar: user.avatar || getPresetUserAvatar(userId)
        };
      }
    }
    
    // 如果找不到用户信息，返回预设用户信息
    return getPresetUserInfo(userId);
    
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return {
      userId,
      username: '匿名用户',
      avatar: 'https://via.placeholder.com/100x100/cccccc/ffffff?text=匿名'
    };
  }
};

// 📝 新增函数：获取预设用户信息
const getPresetUserInfo = (userId) => {
  const userNames = [
    '加菲猫管家',    // index 0
    '柴犬麻麻',      // index 1  
    '橘猫爸爸',      // index 2
    '金毛主人',      // index 3
    '布偶猫奴',      // index 4
    '哈士奇铲屎官'   // index 5
  ];
  
  const randomIndex = parseInt(userId.slice(-1)) || 0;
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  
  return {
    userId,
    username: userNames[randomIndex % userNames.length] || `用户${userId.slice(-3)}`,
    avatar: getPresetUserAvatar(userId)
  };
};

// 📝 新增函数：获取预设用户头像
const getPresetUserAvatar = (userId) => {
  const avatarFiles = [
    'garfield-butler.jpg',    // index 0 - 加菲猫管家
    'shiba-mama.jpg',         // index 1 - 柴犬麻麻
    'orange-cat-papa.jpg',    // index 2 - 橘猫爸爸
    'golden-owner.jpg',       // index 3 - 金毛主人
    'ragdoll-slave.jpg',      // index 4 - 布偶猫奴
    'husky-scooper.jpg'       // index 5 - 哈士奇铲屎官
  ];
  
  const randomIndex = parseInt(userId.slice(-1)) || 0;
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  const fileName = avatarFiles[randomIndex % avatarFiles.length];
  
  // 检查文件是否存在，如果不存在则使用默认头像
  const fs = require('fs');
  const path = require('path');
  const filePath = path.join(__dirname, '../uploads/community-users', fileName);
  
  if (fs.existsSync(filePath)) {
    return `${baseUrl}/uploads/community-users/${fileName}`;
  } else {
    // 如果头像文件不存在，使用带用户名首字的占位图
    const username = ['加菲猫管家', '柴犬麻麻', '橘猫爸爸', '金毛主人', '布偶猫奴', '哈士奇铲屎官'][randomIndex % 6];
    const firstChar = encodeURIComponent(username.charAt(0));
    return `https://via.placeholder.com/100x100/4285f4/ffffff?text=${firstChar}`;
  }
};

// 🔄 部署步骤：
// 1. 上传6个头像文件到 /home/devbox/project/uploads/community-users/
// 2. 修改 /home/devbox/project/controllers/communityController.js 文件
// 3. 重启服务器：npm run dev
// 4. 测试API：GET /api/community/posts

// 📝 需要的头像文件列表：
const requiredAvatars = [
  {
    filename: 'garfield-butler.jpg',
    username: '加菲猫管家', 
    description: '与橘色猫咪的温馨合照'
  },
  {
    filename: 'shiba-mama.jpg',
    username: '柴犬麻麻',
    description: '年轻女性与柴犬的亲密照片'
  },
  {
    filename: 'orange-cat-papa.jpg', 
    username: '橘猫爸爸',
    description: '中年男性与橘猫的搞笑合照'
  },
  {
    filename: 'golden-owner.jpg',
    username: '金毛主人', 
    description: '与金毛犬的户外活动照片'
  },
  {
    filename: 'ragdoll-slave.jpg',
    username: '布偶猫奴',
    description: '与布偶猫的高质量写真照'
  },
  {
    filename: 'husky-scooper.jpg',
    username: '哈士奇铲屎官',
    description: '与哈士奇的日常生活照'
  }
];

// 🎯 预期效果：
// - 社区动态中的预设用户将显示真实头像
// - 提升用户体验和内容可信度
// - 增强宠物社区的温馨氛围
