const { getRedisClient } = require('../config/redis');

const redisClient = getRedisClient();

// 确保Redis连接
const ensureConnection = async () => {
  if (!redisClient.isOpen) {
    console.log('Redis client not connected, attempting to connect...');
    await redisClient.connect();
    console.log('Redis client connected');
  }
};

// 生成唯一ID
const generateId = (prefix) => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// 获取用户信息（模拟数据）
const getUserInfo = async (userId) => {
  try {
    // 模拟用户数据，实际应从用户表获取
    const userNames = ['柴犬麻麻', '橘猫爸爸', '金毛主人', '布偶猫奴', '哈士奇铲屎官', '加菲猫管家'];
    const randomIndex = parseInt(userId.slice(-1)) || 0;
    
    return {
      userId,
      username: userNames[randomIndex % userNames.length] || `用户${userId.slice(-3)}`,
      avatar: `https://picsum.photos/100/100?random=${randomIndex + 100}`
    };
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return {
      userId,
      username: '匿名用户',
      avatar: 'https://via.placeholder.com/100x100/cccccc/ffffff?text=匿名'
    };
  }
};

// 1. 获取社区动态列表
exports.getPosts = async (req, res) => {
  try {
    await ensureConnection();
    
    const { type = 'recommend', page = 1, pageSize = 10 } = req.query;
    const userId = req.user?.userId; // 可选认证
    
    // 参数验证
    const pageNum = Math.max(1, parseInt(page));
    const pageSizeNum = Math.min(20, Math.max(1, parseInt(pageSize)));
    
    // 获取所有真实发布的动态
    const allPosts = [];
    
    // 1. 先获取所有真实发布的帖子
    try {
      const postKeys = await redisClient.keys('post:*');
      console.log(`找到 ${postKeys.length} 个可能的帖子键`);
      
      for (const key of postKeys) {
        if (key.includes(':likes') || key.includes(':collects') || key.includes(':comments')) {
          continue; // 跳过统计数据键
        }
        try {
          const postData = await redisClient.get(key);
          if (postData) {
            const post = JSON.parse(postData);
            if (post.status === 'published') {
              console.log(`找到已发布的帖子: ${post.id}`);
              
              // 获取发布者信息
              const userInfo = await getUserInfo(post.userId);
              
              // 检查当前用户的点赞和收藏状态
              let isLiked = false;
              let isCollected = false;
              if (userId) {
                const likeKey = `post:${post.id}:likes`;
                const collectKey = `post:${post.id}:collects`;
                isLiked = await redisClient.sIsMember(likeKey, userId);
                isCollected = await redisClient.sIsMember(collectKey, userId);
              }
              
              allPosts.push({
                id: post.id,
                userId: post.userId,
                username: userInfo.username,
                avatar: userInfo.avatar,
                content: post.content,
                images: post.images || [],
                publishTime: post.publishTime,
                likes: post.likes || 0,
                comments: post.comments || 0,
                collects: post.collects || 0,
                isLiked,
                isCollected,
                tags: post.tags || []
              });
            }
          }
        } catch (parseError) {
          console.error('解析帖子数据失败:', parseError);
        }
      }
    } catch (redisError) {
      console.error('Redis查询失败，使用模拟数据:', redisError);
    }
    
    console.log(`真实帖子数量: ${allPosts.length}`);
    
    // 2. 如果真实帖子太少，补充一些模拟数据
    if (allPosts.length < 10) {
      const mockPostsNeeded = Math.min(10 - allPosts.length, 8);
      
      const petContents = [
        '今天带我家柴柴去公园玩，遇到了好多小伙伴！🐕',
        '我家猫咪又在偷吃小鱼干，被我抓个正着😹',
        '第一次给狗狗洗澡，场面一度失控...',
        '新来的小仓鼠太可爱了，一直在转轮子',
        '我家兔兔学会了新技能：开门！',
        '橘猫又胖了，是时候减肥了',
        '遛狗途中偶遇流浪猫，好想带回家',
        '宠物体检归来，一切正常，安心了'
      ];
      
      const tags = [
        ['柴犬日常', '遛狗'],
        ['猫咪趣事', '萌宠'],
        ['洗澡日记', '狗狗护理'],
        ['仓鼠日常', '小宠物'],
        ['兔兔趣事', '宠物行为'],
        ['橘猫', '减肥计划'],
        ['流浪动物', '救助'],
        ['宠物体检', '健康管理']
      ];
      
      for (let i = 0; i < mockPostsNeeded; i++) {
        const postIndex = allPosts.length + i;
        const mockPostId = `mock_${generateId('post')}`;
        const authorId = `user_${(i % 6) + 1}`;
        const userInfo = await getUserInfo(authorId);
        
        allPosts.push({
          id: mockPostId,
          userId: authorId,
          username: userInfo.username,
          avatar: userInfo.avatar,
          content: petContents[i % petContents.length],
          images: [
            `https://picsum.photos/400/600?random=${postIndex * 3 + 1}`,
            `https://picsum.photos/400/400?random=${postIndex * 3 + 2}`
          ].slice(0, Math.random() > 0.3 ? 2 : 1),
          publishTime: new Date(Date.now() - (postIndex + 1) * 3600000).toISOString(),
          likes: Math.floor(Math.random() * 500) + 10,
          comments: Math.floor(Math.random() * 100) + 1,
          collects: Math.floor(Math.random() * 80) + 1,
          isLiked: userId ? Math.random() > 0.7 : false,
          isCollected: userId ? Math.random() > 0.8 : false,
          tags: tags[i % tags.length]
        });
      }
    }
    
    // 3. 排序逻辑
    if (type === 'latest') {
      allPosts.sort((a, b) => new Date(b.publishTime) - new Date(a.publishTime));
    } else {
      // recommend: 按热度排序 (点赞数 + 评论数 + 收藏数)
      allPosts.sort((a, b) => (b.likes + b.comments + b.collects) - (a.likes + a.comments + a.collects));
    }
    
    // 4. 分页处理
    const startIndex = (pageNum - 1) * pageSizeNum;
    const endIndex = startIndex + pageSizeNum;
    const paginatedPosts = allPosts.slice(startIndex, endIndex);

    res.status(200).json({
      code: 200,
      message: "success",
      data: {
        list: paginatedPosts,
        total: allPosts.length,
        hasMore: endIndex < allPosts.length
      }
    });

  } catch (error) {
    console.error('获取动态列表失败:', error);
    res.status(500).json({
      code: 500,
      message: "服务器内部错误",
      data: null
    });
  }
};

// 2. 发布社区动态
exports.createPost = async (req, res) => {
  try {
    await ensureConnection();
    
    const { content, images = [], tags = [] } = req.body;
    const { userId } = req.user;
    
    console.log('收到发布请求:', { userId, content, images, tags });
    
    // 参数验证
    if (!content && (!images || images.length === 0)) {
      return res.status(400).json({
        code: 400,
        message: "动态内容和图片不能同时为空",
        data: null
      });
    }

    if (content && content.length > 500) {
      return res.status(400).json({
        code: 400,
        message: "动态内容不能超过500个字符",
        data: null
      });
    }

    if (images && images.length > 9) {
      return res.status(400).json({
        code: 400,
        message: "图片最多只能上传9张",
        data: null
      });
    }

    const postId = generateId('post');
    
    const postData = {
      id: postId,
      userId,
      content: content || '',
      images: images || [],
      tags: tags || [],
      publishTime: new Date().toISOString(),
      likes: 0,
      comments: 0,
      collects: 0,
      status: 'published'
    };

    console.log('准备保存帖子数据:', postData);

    // 保存动态数据
    await redisClient.set(`post:${postId}`, JSON.stringify(postData));
    
    // 添加到用户动态列表
    const userPostsKey = `user:${userId}:posts`;
    await redisClient.lPush(userPostsKey, postId);

    console.log('帖子保存成功:', postId);

    res.status(200).json({
      code: 200,
      message: "发布成功",
      data: {
        postId
      }
    });

  } catch (error) {
    console.error('发布动态失败:', error);
    res.status(500).json({
      code: 500,
      message: "服务器内部错误",
      data: null
    });
  }
};

// 3. 获取动态详情
exports.getPostDetail = async (req, res) => {
  try {
    await ensureConnection();
    
    const { postId } = req.params;
    const userId = req.user?.userId;
    
    // 先尝试从Redis获取
    const postData = await redisClient.get(`post:${postId}`);
    let post;
    
    if (postData) {
      post = JSON.parse(postData);
    } else {
      // 如果Redis中没有，生成模拟数据
      const mockPost = {
        id: postId,
        userId: `user_${Math.floor(Math.random() * 20) + 1}`,
        content: '这是一条模拟的动态内容，用于展示动态详情功能。',
        images: [
          'https://picsum.photos/400/600?random=1001',
          'https://picsum.photos/400/400?random=1002'
        ],
        tags: ['模拟标签', '测试内容'],
        publishTime: new Date().toISOString(),
        likes: Math.floor(Math.random() * 500) + 10,
        comments: Math.floor(Math.random() * 100) + 1,
        collects: Math.floor(Math.random() * 80) + 1
      };
      post = mockPost;
    }
    
    // 获取发布者信息
    const userInfo = await getUserInfo(post.userId);
    
    // 检查当前用户是否点赞和收藏
    let isLiked = false;
    let isCollected = false;
    
    if (userId) {
      const likeKey = `post:${postId}:likes`;
      const collectKey = `post:${postId}:collects`;
      isLiked = await redisClient.sIsMember(likeKey, userId);
      isCollected = await redisClient.sIsMember(collectKey, userId);
    }

    const result = {
      id: post.id,
      userId: post.userId,
      username: userInfo.username,
      avatar: userInfo.avatar,
      content: post.content,
      images: post.images,
      publishTime: post.publishTime,
      likes: post.likes || 0,
      comments: post.comments || 0,
      collects: post.collects || 0,
      tags: post.tags || [],
      isLiked,
      isCollected
    };

    res.status(200).json({
      code: 200,
      message: "success",
      data: result
    });

  } catch (error) {
    console.error('获取动态详情失败:', error);
    res.status(500).json({
      code: 500,
      message: "服务器内部错误",
      data: null
    });
  }
};

// 4. 点赞/取消点赞动态
exports.toggleLike = async (req, res) => {
  try {
    await ensureConnection();
    
    const { postId } = req.params;
    const { userId } = req.user;
    
    const likeKey = `post:${postId}:likes`;
    const isLiked = await redisClient.sIsMember(likeKey, userId);
    
    let newLikeStatus;
    let likesCount;
    
    if (isLiked) {
      // 取消点赞
      await redisClient.sRem(likeKey, userId);
      newLikeStatus = false;
      likesCount = await redisClient.sCard(likeKey);
    } else {
      // 点赞
      await redisClient.sAdd(likeKey, userId);
      newLikeStatus = true;
      likesCount = await redisClient.sCard(likeKey);
    }
    
    // 更新动态的点赞数（如果动态存在）
    const postData = await redisClient.get(`post:${postId}`);
    if (postData) {
      const post = JSON.parse(postData);
      post.likes = likesCount;
      await redisClient.set(`post:${postId}`, JSON.stringify(post));
    }

    res.status(200).json({
      code: 200,
      message: "操作成功",
      data: {
        isLiked: newLikeStatus,
        likesCount
      }
    });

  } catch (error) {
    console.error('点赞操作失败:', error);
    res.status(500).json({
      code: 500,
      message: "服务器内部错误",
      data: null
    });
  }
};

// 5. 收藏/取消收藏动态
exports.toggleCollect = async (req, res) => {
  try {
    await ensureConnection();
    
    const { postId } = req.params;
    const { userId } = req.user;
    
    const collectKey = `post:${postId}:collects`;
    const isCollected = await redisClient.sIsMember(collectKey, userId);
    
    let newCollectStatus;
    let collectsCount;
    
    if (isCollected) {
      // 取消收藏
      await redisClient.sRem(collectKey, userId);
      newCollectStatus = false;
      collectsCount = await redisClient.sCard(collectKey);
    } else {
      // 收藏
      await redisClient.sAdd(collectKey, userId);
      newCollectStatus = true;
      collectsCount = await redisClient.sCard(collectKey);
    }
    
    // 更新动态的收藏数（如果动态存在）
    const postData = await redisClient.get(`post:${postId}`);
    if (postData) {
      const post = JSON.parse(postData);
      post.collects = collectsCount;
      await redisClient.set(`post:${postId}`, JSON.stringify(post));
    }

    res.status(200).json({
      code: 200,
      message: "操作成功",
      data: {
        isCollected: newCollectStatus,
        collectsCount
      }
    });

  } catch (error) {
    console.error('收藏操作失败:', error);
    res.status(500).json({
      code: 500,
      message: "服务器内部错误",
      data: null
    });
  }
};

// 6. 获取动态评论列表
exports.getComments = async (req, res) => {
  try {
    await ensureConnection();
    
    const { postId } = req.params;
    const { page = 1, pageSize = 20 } = req.query;
    
    const pageNum = Math.max(1, parseInt(page));
    const pageSizeNum = Math.min(50, Math.max(1, parseInt(pageSize)));
    
    // 生成模拟评论数据
    const comments = [];
    const totalComments = 15; // 模拟总数
    
    const commentContents = [
      '好可爱啊！我家的也是这样',
      '太萌了，忍不住多看几眼',
      '这个表情太搞笑了哈哈哈',
      '我家宠物也有类似的行为',
      '看起来很开心的样子',
      '这是什么品种的？好想养一只',
      '拍得真好，求拍照技巧',
      '满满的爱意，羡慕了'
    ];
    
    for (let i = 0; i < Math.min(pageSizeNum, totalComments - (pageNum - 1) * pageSizeNum); i++) {
      const commentIndex = (pageNum - 1) * pageSizeNum + i;
      if (commentIndex >= totalComments) break;
      
      const commentId = generateId('comment');
      const authorId = `user_${(commentIndex % 10) + 1}`;
      const userInfo = await getUserInfo(authorId);
      
      comments.push({
        id: commentId,
        userId: authorId,
        username: userInfo.username,
        avatar: userInfo.avatar,
        content: commentContents[commentIndex % commentContents.length],
        publishTime: new Date(Date.now() - commentIndex * 1800000).toISOString()
      });
    }

    res.status(200).json({
      code: 200,
      message: "success",
      data: {
        list: comments,
        total: totalComments,
        hasMore: pageNum * pageSizeNum < totalComments
      }
    });

  } catch (error) {
    console.error('获取评论列表失败:', error);
    res.status(500).json({
      code: 500,
      message: "服务器内部错误",
      data: null
    });
  }
};

// 7. 发表动态评论
exports.createComment = async (req, res) => {
  try {
    await ensureConnection();
    
    const { postId } = req.params;
    const { content } = req.body;
    const { userId } = req.user;
    
    // 参数验证
    if (!content || content.trim() === '') {
      return res.status(400).json({
        code: 400,
        message: "评论内容不能为空",
        data: null
      });
    }

    if (content.length > 200) {
      return res.status(400).json({
        code: 400,
        message: "评论内容不能超过200个字符",
        data: null
      });
    }

    const commentId = generateId('comment');
    
    const commentData = {
      id: commentId,
      postId,
      userId,
      content: content.trim(),
      publishTime: new Date().toISOString()
    };

    // 保存评论数据
    await redisClient.set(`comment:${commentId}`, JSON.stringify(commentData));
    
    // 添加到动态评论列表
    const commentsKey = `post:${postId}:comments`;
    await redisClient.lPush(commentsKey, commentId);
    
    // 更新动态的评论数
    const postData = await redisClient.get(`post:${postId}`);
    if (postData) {
      const post = JSON.parse(postData);
      const commentsCount = await redisClient.lLen(commentsKey);
      post.comments = commentsCount;
      await redisClient.set(`post:${postId}`, JSON.stringify(post));
    }

    res.status(200).json({
      code: 200,
      message: "评论成功",
      data: {
        commentId
      }
    });

  } catch (error) {
    console.error('发表评论失败:', error);
    res.status(500).json({
      code: 500,
      message: "服务器内部错误",
      data: null
    });
  }
};

// 8. 删除动态评论
exports.deleteComment = async (req, res) => {
  try {
    await ensureConnection();
    
    const { commentId } = req.params;
    const { userId } = req.user;
    
    const commentData = await redisClient.get(`comment:${commentId}`);
    if (!commentData) {
      return res.status(404).json({
        code: 404,
        message: "评论不存在",
        data: null
      });
    }

    const comment = JSON.parse(commentData);
    
    // 检查权限（仅评论作者可删除）
    if (comment.userId !== userId) {
      return res.status(403).json({
        code: 403,
        message: "无权删除该评论",
        data: null
      });
    }

    // 删除评论数据
    await redisClient.del(`comment:${commentId}`);
    
    // 从动态评论列表中移除
    const commentsKey = `post:${comment.postId}:comments`;
    await redisClient.lRem(commentsKey, 0, commentId);
    
    // 更新动态的评论数
    const postData = await redisClient.get(`post:${comment.postId}`);
    if (postData) {
      const post = JSON.parse(postData);
      const commentsCount = await redisClient.lLen(commentsKey);
      post.comments = Math.max(0, commentsCount);
      await redisClient.set(`post:${comment.postId}`, JSON.stringify(post));
    }

    res.status(200).json({
      code: 200,
      message: "删除成功"
    });

  } catch (error) {
    console.error('删除评论失败:', error);
    res.status(500).json({
      code: 500,
      message: "服务器内部错误",
      data: null
    });
  }
};

// 9. 获取我的社区内容
exports.getMyContent = async (req, res) => {
  try {
    await ensureConnection();
    
    const { type, page = 1, pageSize = 10 } = req.query;
    const { userId } = req.user;
    
    const pageNum = Math.max(1, parseInt(page));
    const pageSizeNum = Math.min(20, Math.max(1, parseInt(pageSize)));
    
    let result = { list: [], total: 0, hasMore: false };
    
    switch (type) {
      case 'posts':
        // 我的发布
        const userPostsKey = `user:${userId}:posts`;
        const postIds = await redisClient.lRange(userPostsKey, 0, -1);
        
        const posts = [];
        const startIndex = (pageNum - 1) * pageSizeNum;
        const endIndex = startIndex + pageSizeNum;
        
        for (const postId of postIds.slice(startIndex, endIndex)) {
          const postData = await redisClient.get(`post:${postId}`);
          if (postData) {
            const post = JSON.parse(postData);
            posts.push({
              id: post.id,
              content: post.content,
              images: post.images,
              publishTime: post.publishTime,
              likes: post.likes || 0,
              comments: post.comments || 0,
              collects: post.collects || 0,
              tags: post.tags || []
            });
          }
        }
        
        result = {
          list: posts,
          total: postIds.length,
          hasMore: endIndex < postIds.length
        };
        break;
        
      case 'likes':
      case 'collects':
      case 'comments':
        // 模拟互动记录数据
        const mockData = [];
        const totalRecords = 25;
        
        const startIdx = (pageNum - 1) * pageSizeNum;
        const endIdx = Math.min(startIdx + pageSizeNum, totalRecords);
        
        for (let i = startIdx; i < endIdx; i++) {
          const record = {
            id: `${type}_${generateId('record')}`,
            postId: `post_${i + 1}`,
            title: `有趣的宠物动态标题 ${i + 1}`,
            summary: `这是第 ${i + 1} 条宠物动态的摘要内容...`,
            coverImage: `https://picsum.photos/200/200?random=${i + 500}`,
            interactTime: new Date(Date.now() - i * 3600000).toISOString()
          };
          
          if (type === 'comments') {
            record.comment = `我对第 ${i + 1} 条动态的评论内容`;
          }
          
          mockData.push(record);
        }
        
        result = {
          list: mockData,
          total: totalRecords,
          hasMore: endIdx < totalRecords
        };
        break;
        
      default:
        return res.status(400).json({
          code: 400,
          message: "无效的内容类型",
          data: null
        });
    }

    res.status(200).json({
      code: 200,
      message: "success",
      data: result
    });

  } catch (error) {
    console.error('获取我的内容失败:', error);
    res.status(500).json({
      code: 500,
      message: "服务器内部错误",
      data: null
    });
  }
};

// 10. 删除我的动态
exports.deletePost = async (req, res) => {
  try {
    await ensureConnection();
    
    const { postId } = req.params;
    const { userId } = req.user;
    
    const postData = await redisClient.get(`post:${postId}`);
    if (!postData) {
      return res.status(404).json({
        code: 404,
        message: "动态不存在",
        data: null
      });
    }

    const post = JSON.parse(postData);
    
    // 检查权限（仅作者可删除）
    if (post.userId !== userId) {
      return res.status(403).json({
        code: 403,
        message: "无权删除该动态",
        data: null
      });
    }

    // 删除动态数据
    await redisClient.del(`post:${postId}`);
    
    // 从用户动态列表中移除
    const userPostsKey = `user:${userId}:posts`;
    await redisClient.lRem(userPostsKey, 0, postId);
    
    // 删除相关的点赞、收藏、评论数据
    await redisClient.del(`post:${postId}:likes`);
    await redisClient.del(`post:${postId}:collects`);
    await redisClient.del(`post:${postId}:comments`);

    res.status(200).json({
      code: 200,
      message: "删除成功"
    });

  } catch (error) {
    console.error('删除动态失败:', error);
    res.status(500).json({
      code: 500,
      message: "服务器内部错误",
      data: null
    });
  }
};

// 11. 编辑我的动态
exports.updatePost = async (req, res) => {
  try {
    await ensureConnection();
    
    const { postId } = req.params;
    const { content, images, tags } = req.body;
    const { userId } = req.user;
    
    const postData = await redisClient.get(`post:${postId}`);
    if (!postData) {
      return res.status(404).json({
        code: 404,
        message: "动态不存在",
        data: null
      });
    }

    const post = JSON.parse(postData);
    
    // 检查权限（仅作者可编辑）
    if (post.userId !== userId) {
      return res.status(403).json({
        code: 403,
        message: "无权编辑该动态",
        data: null
      });
    }

    // 参数验证
    if (!content && (!images || images.length === 0)) {
      return res.status(400).json({
        code: 400,
        message: "动态内容和图片不能同时为空",
        data: null
      });
    }

    if (content && content.length > 500) {
      return res.status(400).json({
        code: 400,
        message: "动态内容不能超过500个字符",
        data: null
      });
    }

    if (images && images.length > 9) {
      return res.status(400).json({
        code: 400,
        message: "图片最多只能上传9张",
        data: null
      });
    }

    // 更新动态内容
    if (content !== undefined) post.content = content;
    if (images !== undefined) post.images = images;
    if (tags !== undefined) post.tags = tags;
    post.updatedAt = new Date().toISOString();

    // 保存更新后的数据
    await redisClient.set(`post:${postId}`, JSON.stringify(post));

    res.status(200).json({
      code: 200,
      message: "更新成功"
    });

  } catch (error) {
    console.error('编辑动态失败:', error);
    res.status(500).json({
      code: 500,
      message: "服务器内部错误",
      data: null
    });
  }
};

// 12. 删除我的社区互动记录
exports.deleteMyInteraction = async (req, res) => {
  try {
    await ensureConnection();
    
    const { type, recordId } = req.params;
    const { userId } = req.user;
    
    // 验证类型
    if (!['likes', 'collects', 'comments'].includes(type)) {
      return res.status(400).json({
        code: 400,
        message: "无效的互动类型",
        data: null
      });
    }

    switch (type) {
      case 'likes':
        // 从所有点赞记录中移除该用户的点赞
        // 这里需要根据recordId解析出postId，或者重新设计数据结构
        // 简化实现：假设recordId格式为 likes_post_{postId}
        const likePostId = recordId.replace('likes_post_', '');
        const likeKey = `post:${likePostId}:likes`;
        await redisClient.sRem(likeKey, userId);
        break;
        
      case 'collects':
        const collectPostId = recordId.replace('collects_post_', '');
        const collectKey = `post:${collectPostId}:collects`;
        await redisClient.sRem(collectKey, userId);
        break;
        
      case 'comments':
        // 删除特定评论
        const commentData = await redisClient.get(`comment:${recordId}`);
        if (commentData) {
          const comment = JSON.parse(commentData);
          if (comment.userId === userId) {
            await redisClient.del(`comment:${recordId}`);
            const commentsKey = `post:${comment.postId}:comments`;
            await redisClient.lRem(commentsKey, 0, recordId);
          }
        }
        break;
    }

    res.status(200).json({
      code: 200,
      message: "删除成功"
    });

  } catch (error) {
    console.error('删除互动记录失败:', error);
    res.status(500).json({
      code: 500,
      message: "服务器内部错误",
      data: null
    });
  }
};

module.exports = exports;
