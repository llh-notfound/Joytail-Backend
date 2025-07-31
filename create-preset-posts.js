const { getRedisClient } = require('./config/redis');
const { v4: uuidv4 } = require('uuid');

const redisClient = getRedisClient();

// 预设用户信息
const presetUsers = [
  {
    userId: 'user_1',
    username: '柴犬麻麻',
    avatar: '/uploads/community-users/shiba-mama.jpg'
  },
  {
    userId: 'user_2', 
    username: '橘猫爸爸',
    avatar: '/uploads/community-users/orange-cat-papa.jpg'
  },
  {
    userId: 'user_3',
    username: '金毛主人', 
    avatar: '/uploads/community-users/golden-owner.jpg'
  },
  {
    userId: 'user_4',
    username: '布偶猫奴',
    avatar: '/uploads/community-users/ragdoll-slave.jpg'
  },
  {
    userId: 'user_5',
    username: '哈士奇铲屎官',
    avatar: '/uploads/community-users/husky-scooper.jpg'
  },
  {
    userId: 'user_0',
    username: '加菲猫管家',
    avatar: '/uploads/community-users/garfield-butler.jpg'
  }
];

// 预设帖子数据
const presetPosts = [
  // 橘猫爸爸的帖子
  {
    userId: 'user_2',
    content: '今天我家橘猫又在我工作的时候霸占了我的键盘，还一脸无辜地看着我。这货绝对是故意的！😅 #橘猫日常 #工作被干扰',
    images: [
      'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=400&h=300&fit=crop'
    ],
    tags: ['橘猫日常', '工作被干扰', '萌宠日常'],
    likesCount: 128,
    commentsCount: 23,
    collectsCount: 15
  },
  {
    userId: 'user_2',
    content: '橘猫的体重又涨了，医生说需要控制饮食。但是看到它可怜巴巴的眼神，我又心软了...大家有什么好的减肥方法推荐吗？#橘猫减肥 #宠物健康',
    images: [
      'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=300&fit=crop'
    ],
    tags: ['橘猫减肥', '宠物健康', '新手养宠'],
    likesCount: 89,
    commentsCount: 31,
    collectsCount: 12
  },
  {
    userId: 'user_2',
    content: '橘猫今天学会了新技能 - 开冰箱门！我回家发现冰箱门开着，里面的鱼不见了...这智商也太高了吧！😂 #橘猫智商 #萌宠日常',
    images: [
      'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=400&h=300&fit=crop'
    ],
    tags: ['橘猫智商', '萌宠日常', '宠物趣事'],
    likesCount: 256,
    commentsCount: 45,
    collectsCount: 28
  },
  
  // 柴犬麻麻的帖子
  {
    userId: 'user_1',
    content: '今天带柴柴去公园玩，它遇到了一只小柴犬，两个小家伙玩得可开心了！柴犬的社交能力真的超强～ #柴犬日常 #萌宠社交',
    images: [
      'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300&fit=crop'
    ],
    tags: ['柴犬日常', '萌宠社交', '遛狗日记'],
    likesCount: 156,
    commentsCount: 28,
    collectsCount: 19
  },
  {
    userId: 'user_1',
    content: '柴柴今天学会了新口令"握手"，虽然动作还不太标准，但是已经很棒了！训练狗狗真的需要很多耐心呢 #柴犬训练 #新手养宠',
    images: [
      'https://images.unsplash.com/photo-1546527868-ccb7ee7dfa6a?w=400&h=300&fit=crop'
    ],
    tags: ['柴犬训练', '新手养宠', '宠物教育'],
    likesCount: 98,
    commentsCount: 15,
    collectsCount: 8
  },
  
  // 金毛主人的帖子
  {
    userId: 'user_3',
    content: '金毛今天在湖边游泳，玩得可开心了！金毛真的是天生的游泳健将，在水里游得比我还快 #金毛游泳 #户外活动',
    images: [
      'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1546527868-ccb7ee7dfa6a?w=400&h=300&fit=crop'
    ],
    tags: ['金毛游泳', '户外活动', '萌宠日常'],
    likesCount: 203,
    commentsCount: 34,
    collectsCount: 25
  },
  
  // 布偶猫奴的帖子
  {
    userId: 'user_4',
    content: '布偶猫今天特别粘人，一直在我身边蹭来蹭去。这种被需要的感觉真的很温暖～布偶猫真的是最温柔的猫咪品种之一 #布偶猫 #萌宠日常',
    images: [
      'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=400&h=300&fit=crop'
    ],
    tags: ['布偶猫', '萌宠日常', '宠物陪伴'],
    likesCount: 167,
    commentsCount: 29,
    collectsCount: 18
  },
  
  // 哈士奇铲屎官的帖子
  {
    userId: 'user_5',
    content: '哈士奇今天又拆家了！我出门买个菜的时间，沙发就被它拆了...但是看到它无辜的眼神，我又不忍心骂它了 #哈士奇拆家 #萌宠日常',
    images: [
      'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=400&h=300&fit=crop'
    ],
    tags: ['哈士奇拆家', '萌宠日常', '宠物趣事'],
    likesCount: 312,
    commentsCount: 67,
    collectsCount: 42
  },
  
  // 加菲猫管家的帖子
  {
    userId: 'user_0',
    content: '加菲猫今天特别懒，一整天都在沙发上睡觉。这种慵懒的样子真的很治愈呢～ #加菲猫 #萌宠日常',
    images: [
      'https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=400&h=300&fit=crop'
    ],
    tags: ['加菲猫', '萌宠日常', '宠物陪伴'],
    likesCount: 134,
    commentsCount: 22,
    collectsCount: 16
  }
];

// 预设评论数据
const presetComments = [
  {
    content: '橘猫真的太可爱了！我家也有一只橘猫，也是这样的性格 😊',
    userId: 'user_1'
  },
  {
    content: '哈哈，橘猫的智商确实很高，我家橘猫也会开抽屉！',
    userId: 'user_4'
  },
  {
    content: '柴犬真的很活泼呢，看起来玩得很开心！',
    userId: 'user_3'
  },
  {
    content: '金毛游泳的样子太帅了！天生的游泳健将！',
    userId: 'user_5'
  },
  {
    content: '布偶猫真的很温柔，我家也有一只，特别粘人',
    userId: 'user_2'
  },
  {
    content: '哈士奇拆家是日常了，但是真的很可爱 😂',
    userId: 'user_0'
  },
  {
    content: '加菲猫睡觉的样子太治愈了，我也想养一只！',
    userId: 'user_1'
  }
];

async function createPresetPosts() {
  try {
    await redisClient.connect();
    
    console.log('🎭 开始创建预设帖子数据...\n');
    
    // 创建预设用户
    for (const user of presetUsers) {
      await redisClient.hSet('users', user.username, JSON.stringify({
        userId: user.userId,
        username: user.username,
        nickname: user.username,
        avatar: user.avatar,
        memberLevel: 'normal',
        points: 0,
        coupons: 0,
        createdAt: Date.now()
      }));
      console.log(`✅ 创建用户: ${user.username}`);
    }
    
    // 创建预设帖子
    for (let i = 0; i < presetPosts.length; i++) {
      const post = presetPosts[i];
      const postId = uuidv4();
      const now = Date.now() - (i * 3600000); // 每个帖子间隔1小时
      
      // 保存帖子数据
      await redisClient.hSet(`post:${postId}`, {
        id: postId,
        userId: post.userId,
        content: post.content,
        images: JSON.stringify(post.images),
        tags: JSON.stringify(post.tags),
        likesCount: post.likesCount.toString(),
        commentsCount: post.commentsCount.toString(),
        collectsCount: post.collectsCount.toString(),
        status: '1',
        createdAt: now.toString()
      });
      
      // 添加到时间线
      await redisClient.zAdd('posts:timeline', { score: now, value: postId });
      
      // 添加到热度排序
      const hotScore = post.likesCount + post.commentsCount + post.collectsCount;
      await redisClient.zAdd('posts:hot', { score: hotScore, value: postId });
      
      // 添加到用户发布列表
      await redisClient.zAdd(`user:${post.userId}:posts`, { score: now, value: postId });
      
      console.log(`✅ 创建帖子: ${post.content.substring(0, 30)}...`);
      
      // 为每个帖子添加一些评论
      const commentCount = Math.min(post.commentsCount, presetComments.length);
      for (let j = 0; j < commentCount; j++) {
        const comment = presetComments[j];
        const commentId = uuidv4();
        const commentTime = now + (j * 60000); // 评论间隔1分钟
        
        // 保存评论数据
        await redisClient.hSet(`comment:${commentId}`, {
          id: commentId,
          postId,
          userId: comment.userId,
          content: comment.content,
          createdAt: commentTime.toString()
        });
        
        // 添加到帖子评论列表
        await redisClient.zAdd(`post:${postId}:comments`, { score: commentTime, value: commentId });
        
        // 添加到用户评论列表
        await redisClient.zAdd(`user:${comment.userId}:comments`, { score: commentTime, value: postId });
      }
      
      // 模拟一些点赞和收藏
      const likeUsers = presetUsers.slice(0, Math.min(post.likesCount, presetUsers.length));
      for (let k = 0; k < likeUsers.length; k++) {
        const likeTime = now + (k * 30000); // 点赞间隔30秒
        await redisClient.zAdd(`user:${likeUsers[k].userId}:likes`, { score: likeTime, value: postId });
      }
      
      const collectUsers = presetUsers.slice(0, Math.min(post.collectsCount, presetUsers.length));
      for (let k = 0; k < collectUsers.length; k++) {
        const collectTime = now + (k * 45000); // 收藏间隔45秒
        await redisClient.zAdd(`user:${collectUsers[k].userId}:collects`, { score: collectTime, value: postId });
      }
    }
    
    console.log('\n🎉 预设帖子数据创建完成！');
    console.log(`📊 统计信息:`);
    console.log(`   - 创建用户: ${presetUsers.length} 个`);
    console.log(`   - 创建帖子: ${presetPosts.length} 条`);
    console.log(`   - 创建评论: ${presetPosts.reduce((sum, post) => sum + post.commentsCount, 0)} 条`);
    
    await redisClient.disconnect();
  } catch (error) {
    console.error('❌ 创建预设帖子失败:', error);
  }
}

createPresetPosts(); 