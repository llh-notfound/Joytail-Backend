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
    
    // 生成模拟动态数据
    const totalPosts = 100; // 模拟总数
    
    for (let i = 0; i < pageSizeNum && (pageNum - 1) * pageSizeNum + i < totalPosts; i++) {
      const postIndex = (pageNum - 1) * pageSizeNum + i;
      const postId = generateId('post');
      const authorId = `user_${(postIndex % 20) + 1}`;
      const userInfo = await getUserInfo(authorId);
      
      // 模拟宠物相关内容
      const petContents = [
        '今天带我家柴柴去公园玩，遇到了好多小伙伴！',
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
      
      posts.push({
        id: postId,
        userId: authorId,
        username: userInfo.username,
        avatar: userInfo.avatar,
        content: petContents[postIndex % petContents.length],
        images: [
          `https://picsum.photos/400/600?random=${postIndex * 3 + 1}`,
          `https://picsum.photos/400/400?random=${postIndex * 3 + 2}`
        ].slice(0, Math.random() > 0.3 ? 2 : 1),
        publishTime: new Date(Date.now() - postIndex * 3600000).toISOString(),
        likes: Math.floor(Math.random() * 500) + 10,
        comments: Math.floor(Math.random() * 100) + 1,
        collects: Math.floor(Math.random() * 80) + 1,
        isLiked: userId ? Math.random() > 0.7 : false,
        isCollected: userId ? Math.random() > 0.8 : false,
        tags: tags[postIndex % tags.length]
      });
    }

    // 排序逻辑
    if (type === 'latest') {
      posts.sort((a, b) => new Date(b.publishTime) - new Date(a.publishTime));
    } else {
      // recommend: 按热度排序 (点赞数 + 评论数 + 收藏数)
      posts.sort((a, b) => (b.likes + b.comments + b.collects) - (a.likes + a.comments + a.collects));
    }

    res.status(200).json({
      code: 200,
      message: "success",
      data: {
        list: posts,
        total: totalPosts,
        hasMore: pageNum * pageSizeNum < totalPosts
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

  } catch (error) {
    console.error('获取动态列表失败:', error);
    res.status(500).json({
      code: 500,
      message: "服务器内部错误",
      data: null
    });
  }
};

// 发布社区动态
exports.createPost = async (req, res) => {
  try {
    await ensureConnection();
    
    const { content, images = [] } = req.body;
    const { userId } = req.user;
    
    if (!content && (!images || images.length === 0)) {
      return res.status(400).json({
        code: 400,
        message: "动态内容和图片不能同时为空",
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

    const postId = `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const postData = {
      id: postId,
      userId,
      content: content || '',
      images: images || [],
      publishTime: new Date().toISOString(),
      likes: 0,
      comments: 0,
      collects: 0,
      status: 'published'
    };

    // 保存动态数据
    await redisClient.set(`post:${postId}`, JSON.stringify(postData));
    
    // 添加到用户动态列表
    const userPostsKey = `user:${userId}:posts`;
    await redisClient.lPush(userPostsKey, postId);

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

// 获取动态详情
exports.getPostDetail = async (req, res) => {
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
    
    // 获取发布者信息
    const userKey = `user:${post.userId}`;
    const userData = await redisClient.hGet('users', userKey) || '{}';
    const user = JSON.parse(userData);
    
    // 检查当前用户是否点赞和收藏
    const likeKey = `post:${postId}:likes`;
    const collectKey = `post:${postId}:collects`;
    const isLiked = await redisClient.sIsMember(likeKey, userId);
    const isCollected = await redisClient.sIsMember(collectKey, userId);

    const result = {
      id: post.id,
      userId: post.userId,
      username: user.nickname || user.username || '匿名用户',
      avatar: user.avatar || '',
      content: post.content,
      images: post.images,
      publishTime: post.publishTime,
      likes: post.likes || 0,
      comments: post.comments || 0,
      collects: post.collects || 0,
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

// 点赞/取消点赞动态
exports.toggleLike = async (req, res) => {
  try {
    await ensureConnection();
    
    const { postId } = req.params;
    const { userId } = req.user;
    
    // 检查动态是否存在
    const postData = await redisClient.get(`post:${postId}`);
    if (!postData) {
      return res.status(404).json({
        code: 404,
        message: "动态不存在",
        data: null
      });
    }

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
    
    // 更新动态的点赞数
    const post = JSON.parse(postData);
    post.likes = likesCount;
    await redisClient.set(`post:${postId}`, JSON.stringify(post));

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

// 收藏/取消收藏动态
exports.toggleCollect = async (req, res) => {
  try {
    await ensureConnection();
    
    const { postId } = req.params;
    const { userId } = req.user;
    
    // 检查动态是否存在
    const postData = await redisClient.get(`post:${postId}`);
    if (!postData) {
      return res.status(404).json({
        code: 404,
        message: "动态不存在",
        data: null
      });
    }

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
    
    // 更新动态的收藏数
    const post = JSON.parse(postData);
    post.collects = collectsCount;
    await redisClient.set(`post:${postId}`, JSON.stringify(post));

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

// 获取动态评论列表
exports.getComments = async (req, res) => {
  try {
    await ensureConnection();
    
    const { postId } = req.params;
    const { page = 1, pageSize = 20 } = req.query;
    
    // 检查动态是否存在
    const postData = await redisClient.get(`post:${postId}`);
    if (!postData) {
      return res.status(404).json({
        code: 404,
        message: "动态不存在",
        data: null
      });
    }

    // 模拟评论数据
    const comments = [];
    for (let i = 0; i < Math.min(pageSize, 5); i++) {
      comments.push({
        id: `comment_${Date.now()}_${i}`,
        userId: `user_${i + 1}`,
        username: `用户${i + 1}`,
        avatar: `https://picsum.photos/50/50?random=${i + 200}`,
        content: `这是一条评论内容 ${i + 1}`,
        createTime: new Date(Date.now() - i * 1800000).toISOString()
      });
    }

    res.status(200).json({
      code: 200,
      message: "success",
      data: {
        list: comments,
        total: 15,
        hasMore: page * pageSize < 15
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

// 发表动态评论
exports.createComment = async (req, res) => {
  try {
    await ensureConnection();
    
    const { postId } = req.params;
    const { content } = req.body;
    const { userId } = req.user;
    
    if (!content || content.trim() === '') {
      return res.status(400).json({
        code: 400,
        message: "评论内容不能为空",
        data: null
      });
    }

    // 检查动态是否存在
    const postData = await redisClient.get(`post:${postId}`);
    if (!postData) {
      return res.status(404).json({
        code: 404,
        message: "动态不存在",
        data: null
      });
    }

    const commentId = `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const commentData = {
      id: commentId,
      postId,
      userId,
      content: content.trim(),
      createTime: new Date().toISOString()
    };

    // 保存评论数据
    await redisClient.set(`comment:${commentId}`, JSON.stringify(commentData));
    
    // 添加到动态评论列表
    const commentsKey = `post:${postId}:comments`;
    await redisClient.lPush(commentsKey, commentId);
    
    // 更新动态的评论数
    const post = JSON.parse(postData);
    const commentsCount = await redisClient.lLen(commentsKey);
    post.comments = commentsCount;
    await redisClient.set(`post:${postId}`, JSON.stringify(post));

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

// 删除动态评论
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
    
    // 检查权限
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

// 获取我的社区内容
exports.getMyContent = async (req, res) => {
  try {
    await ensureConnection();
    
    const { type, page = 1, pageSize = 10 } = req.query;
    const { userId } = req.user;
    
    let result = { list: [], total: 0, hasMore: false };
    
    switch (type) {
      case 'posts':
        // 我的发布
        const userPostsKey = `user:${userId}:posts`;
        const postIds = await redisClient.lRange(userPostsKey, 0, -1);
        
        const posts = [];
        for (const postId of postIds.slice((page - 1) * pageSize, page * pageSize)) {
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
              collects: post.collects || 0
            });
          }
        }
        
        result = {
          list: posts,
          total: postIds.length,
          hasMore: page * pageSize < postIds.length
        };
        break;
        
      case 'likes':
      case 'collects':
      case 'comments':
        // 模拟互动记录数据
        const mockData = [];
        for (let i = 0; i < Math.min(pageSize, 5); i++) {
          const record = {
            id: `${type}_${Date.now()}_${i}`,
            postId: `post_${i}`,
            title: `动态标题 ${i + 1}`,
            summary: `这是动态摘要内容 ${i + 1}`,
            coverImage: `https://picsum.photos/200/200?random=${i + 300}`,
            interactTime: new Date(Date.now() - i * 3600000).toISOString()
          };
          
          if (type === 'comments') {
            record.comment = `我的评论内容 ${i + 1}`;
          }
          
          mockData.push(record);
        }
        
        result = {
          list: mockData,
          total: 10,
          hasMore: page * pageSize < 10
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

// 删除我的动态
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
    
    // 检查权限
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

// 编辑我的动态
exports.updatePost = async (req, res) => {
  try {
    await ensureConnection();
    
    const { postId } = req.params;
    const { content, images } = req.body;
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
    
    // 检查权限
    if (post.userId !== userId) {
      return res.status(403).json({
        code: 403,
        message: "无权编辑该动态",
        data: null
      });
    }

    // 更新动态内容
    if (content !== undefined) post.content = content;
    if (images !== undefined) post.images = images;
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

module.exports = exports;
