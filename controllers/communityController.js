const { getRedisClient } = require('../config/redis');
const { v4: uuidv4 } = require('uuid');

const redisClient = getRedisClient();

// 添加一个辅助函数来检查连接状态
const ensureConnection = async () => {
  if (!redisClient.isOpen) {
    console.log('Redis client not connected, attempting to connect...');
    await redisClient.connect();
    console.log('Redis client connected');
  }
};

// 1. 获取社区动态列表
async function getCommunityPosts(type = 'recommend', page = 1, pageSize = 10, userId = null) {
  try {
    await ensureConnection();
    
    const offset = (page - 1) * pageSize;
    let list = [];
    let total = 0;

    // 获取预设用户信息
    const users = await redisClient.hGetAll('users');
    const presetUsers = {};
    for (const [username, userJson] of Object.entries(users)) {
      const user = JSON.parse(userJson);
      presetUsers[user.userId] = user;
    }

    if (type === 'latest') {
      // 最新动态：按发布时间倒序
      const postIds = await redisClient.zRange('posts:timeline', offset, offset + pageSize - 1, { REV: true });
      total = await redisClient.zCard('posts:timeline');
      
      for (const postId of postIds) {
        const postData = await redisClient.hGetAll(`post:${postId}`);
        if (postData && Object.keys(postData).length > 0 && postData.status !== '0') {
          // 获取作者信息 - 优先使用预设用户
          let authorData = presetUsers[postData.userId];
          if (!authorData) {
            authorData = await redisClient.hGetAll(`user:${postData.userId}`);
          }
          
          // 检查当前用户是否已点赞/收藏
          let isLiked = false;
          let isCollected = false;
          if (userId) {
            isLiked = await redisClient.zScore(`user:${userId}:likes`, postId) !== null;
            isCollected = await redisClient.zScore(`user:${userId}:collects`, postId) !== null;
          }
          
          list.push({
            id: postId,
            userId: postData.userId,
            username: authorData?.nickname || authorData?.username || 'Unknown',
            avatar: authorData?.avatar || '',
            content: postData.content || '',
            images: JSON.parse(postData.images || '[]'),
            publishTime: postData.createdAt,
            likes: parseInt(postData.likesCount || '0'),
            comments: parseInt(postData.commentsCount || '0'),
            collects: parseInt(postData.collectsCount || '0'),
            isLiked,
            isCollected,
            tags: JSON.parse(postData.tags || '[]')
          });
        }
      }
    } else {
      // 推荐动态：按热度排序（点赞数+评论数+收藏数）
      const postIds = await redisClient.zRange('posts:hot', offset, offset + pageSize - 1, { REV: true });
      total = await redisClient.zCard('posts:hot');
      
      for (const postId of postIds) {
        const postData = await redisClient.hGetAll(`post:${postId}`);
        if (postData && Object.keys(postData).length > 0 && postData.status !== '0') {
          // 获取作者信息 - 优先使用预设用户
          let authorData = presetUsers[postData.userId];
          if (!authorData) {
            authorData = await redisClient.hGetAll(`user:${postData.userId}`);
          }
          
          let isLiked = false;
          let isCollected = false;
          if (userId) {
            isLiked = await redisClient.zScore(`user:${userId}:likes`, postId) !== null;
            isCollected = await redisClient.zScore(`user:${userId}:collects`, postId) !== null;
          }
          
          list.push({
            id: postId,
            userId: postData.userId,
            username: authorData?.nickname || authorData?.username || 'Unknown',
            avatar: authorData?.avatar || '',
            content: postData.content || '',
            images: JSON.parse(postData.images || '[]'),
            publishTime: postData.createdAt,
            likes: parseInt(postData.likesCount || '0'),
            comments: parseInt(postData.commentsCount || '0'),
            collects: parseInt(postData.collectsCount || '0'),
            isLiked,
            isCollected,
            tags: JSON.parse(postData.tags || '[]')
          });
        }
      }
    }

    return {
      list,
      total,
      hasMore: offset + list.length < total
    };
  } catch (error) {
    console.error('Error in getCommunityPosts:', error);
    return {
      list: [],
      total: 0,
      hasMore: false
    };
  }
}

// 2. 发布社区动态
async function publishPost(userId, content, images = [], tags = []) {
  try {
    await ensureConnection();
    
    // 验证内容
    if (!content && (!images || images.length === 0)) {
      throw new Error('内容和图片至少有一个不能为空');
    }
    
    if (content && content.length > 500) {
      throw new Error('内容长度不能超过500字符');
    }
    
    if (images && images.length > 9) {
      throw new Error('图片数量不能超过9张');
    }
    
    const postId = uuidv4();
    const now = Date.now();
    
    // 保存动态数据
    await redisClient.hSet(`post:${postId}`, {
      id: postId,
      userId,
      content: content || '',
      images: JSON.stringify(images),
      tags: JSON.stringify(tags),
      likesCount: '0',
      commentsCount: '0',
      collectsCount: '0',
      status: '1',
      createdAt: now.toString()
    });
    
    // 添加到时间线
    await redisClient.zAdd('posts:timeline', { score: now, value: postId });
    
    // 添加到热度排序（初始热度为0）
    await redisClient.zAdd('posts:hot', { score: 0, value: postId });
    
    // 添加到用户发布列表
    await redisClient.zAdd(`user:${userId}:posts`, { score: now, value: postId });
    
    return { postId };
  } catch (error) {
    console.error('Error in publishPost:', error);
    throw error;
  }
}

// 3. 获取动态详情
async function getPostDetail(postId, userId = null) {
  try {
    await ensureConnection();
    
    const postData = await redisClient.hGetAll(`post:${postId}`);
    if (!postData || Object.keys(postData).length === 0) {
      throw new Error('动态不存在');
    }
    
    // 获取作者信息 - 支持预设用户
    let authorData = null;
    const users = await redisClient.hGetAll('users');
    
    // 查找预设用户
    for (const [username, userJson] of Object.entries(users)) {
      const user = JSON.parse(userJson);
      if (user.userId === postData.userId) {
        authorData = user;
        break;
      }
    }
    
    // 如果没有找到预设用户，尝试从用户哈希获取
    if (!authorData) {
      authorData = await redisClient.hGetAll(`user:${postData.userId}`);
    }
    
    let isLiked = false;
    let isCollected = false;
    if (userId) {
      isLiked = await redisClient.zScore(`user:${userId}:likes`, postId) !== null;
      isCollected = await redisClient.zScore(`user:${userId}:collects`, postId) !== null;
    }
    
    return {
      id: postId,
      userId: postData.userId,
      username: authorData?.nickname || authorData?.username || 'Unknown',
      avatar: authorData?.avatar || '',
      content: postData.content || '',
      images: JSON.parse(postData.images || '[]'),
      publishTime: postData.createdAt,
      likes: parseInt(postData.likesCount || '0'),
      comments: parseInt(postData.commentsCount || '0'),
      collects: parseInt(postData.collectsCount || '0'),
      isLiked,
      isCollected,
      tags: JSON.parse(postData.tags || '[]')
    };
  } catch (error) {
    console.error('Error in getPostDetail:', error);
    throw error;
  }
}

// 4. 点赞/取消点赞动态
async function togglePostLike(userId, postId) {
  try {
    await ensureConnection();
    
    const postData = await redisClient.hGetAll(`post:${postId}`);
    if (!postData || Object.keys(postData).length === 0) {
      throw new Error('动态不存在');
    }
    
    const isLiked = await redisClient.zScore(`user:${userId}:likes`, postId) !== null;
    const currentLikes = parseInt(postData.likesCount || '0');
    
    if (isLiked) {
      // 取消点赞
      await redisClient.zRem(`user:${userId}:likes`, postId);
      await redisClient.hSet(`post:${postId}`, 'likesCount', (currentLikes - 1).toString());
      await redisClient.zIncrBy('posts:hot', -1, postId);
      
      return {
        isLiked: false,
        likesCount: currentLikes - 1
      };
    } else {
      // 添加点赞
      await redisClient.zAdd(`user:${userId}:likes`, { score: Date.now(), value: postId });
      await redisClient.hSet(`post:${postId}`, 'likesCount', (currentLikes + 1).toString());
      await redisClient.zIncrBy('posts:hot', 1, postId);
      
      return {
        isLiked: true,
        likesCount: currentLikes + 1
      };
    }
  } catch (error) {
    console.error('Error in togglePostLike:', error);
    throw error;
  }
}

// 5. 收藏/取消收藏动态
async function togglePostCollect(userId, postId) {
  try {
    await ensureConnection();
    
    const postData = await redisClient.hGetAll(`post:${postId}`);
    if (!postData || Object.keys(postData).length === 0) {
      throw new Error('动态不存在');
    }
    
    const isCollected = await redisClient.zScore(`user:${userId}:collects`, postId) !== null;
    const currentCollects = parseInt(postData.collectsCount || '0');
    
    if (isCollected) {
      // 取消收藏
      await redisClient.zRem(`user:${userId}:collects`, postId);
      await redisClient.hSet(`post:${postId}`, 'collectsCount', (currentCollects - 1).toString());
      await redisClient.zIncrBy('posts:hot', -1, postId);
      
      return {
        isCollected: false,
        collectsCount: currentCollects - 1
      };
    } else {
      // 添加收藏
      await redisClient.zAdd(`user:${userId}:collects`, { score: Date.now(), value: postId });
      await redisClient.hSet(`post:${postId}`, 'collectsCount', (currentCollects + 1).toString());
      await redisClient.zIncrBy('posts:hot', 1, postId);
      
      return {
        isCollected: true,
        collectsCount: currentCollects + 1
      };
    }
  } catch (error) {
    console.error('Error in togglePostCollect:', error);
    throw error;
  }
}

// 6. 获取动态评论列表
async function getPostComments(postId, page = 1, pageSize = 20) {
  try {
    await ensureConnection();
    
    const offset = (page - 1) * pageSize;
    const commentIds = await redisClient.zRange(`post:${postId}:comments`, offset, offset + pageSize - 1, { REV: true });
    const total = await redisClient.zCard(`post:${postId}:comments`);
    
    // 获取预设用户信息
    const users = await redisClient.hGetAll('users');
    const presetUsers = {};
    for (const [username, userJson] of Object.entries(users)) {
      const user = JSON.parse(userJson);
      presetUsers[user.userId] = user;
    }
    
    const list = [];
    for (const commentId of commentIds) {
      const commentData = await redisClient.hGetAll(`comment:${commentId}`);
      if (commentData && Object.keys(commentData).length > 0 && commentData.status !== '0') {
        // 获取作者信息 - 优先使用预设用户
        let authorData = presetUsers[commentData.userId];
        if (!authorData) {
          authorData = await redisClient.hGetAll(`user:${commentData.userId}`);
        }
        
        list.push({
          id: commentId,
          userId: commentData.userId,
          username: authorData?.nickname || authorData?.username || 'Unknown',
          avatar: authorData?.avatar || '',
          content: commentData.content || '',
          publishTime: commentData.createdAt
        });
      }
    }
    
    return {
      list,
      total,
      hasMore: offset + list.length < total
    };
  } catch (error) {
    console.error('Error in getPostComments:', error);
    return {
      list: [],
      total: 0,
      hasMore: false
    };
  }
}

// 7. 发表动态评论
async function publishComment(userId, postId, content) {
  try {
    await ensureConnection();
    
    if (!content || content.trim().length === 0) {
      throw new Error('评论内容不能为空');
    }
    
    if (content.length > 200) {
      throw new Error('评论长度不能超过200字符');
    }
    
    const postData = await redisClient.hGetAll(`post:${postId}`);
    if (!postData || Object.keys(postData).length === 0) {
      throw new Error('动态不存在');
    }
    
    const commentId = uuidv4();
    const now = Date.now();
    
    // 保存评论数据
    await redisClient.hSet(`comment:${commentId}`, {
      id: commentId,
      postId,
      userId,
      content: content.trim(),
      createdAt: now.toString()
    });
    
    // 添加到动态评论列表
    await redisClient.zAdd(`post:${postId}:comments`, { score: now, value: commentId });
    
    // 添加到用户评论列表
    await redisClient.zAdd(`user:${userId}:comments`, { score: now, value: postId });
    
    // 更新动态评论计数
    const currentComments = parseInt(postData.commentsCount || '0');
    await redisClient.hSet(`post:${postId}`, 'commentsCount', (currentComments + 1).toString());
    await redisClient.zIncrBy('posts:hot', 1, postId);
    
    return { commentId };
  } catch (error) {
    console.error('Error in publishComment:', error);
    throw error;
  }
}

// 8. 删除动态评论
async function deleteComment(userId, commentId) {
  try {
    await ensureConnection();
    
    const commentData = await redisClient.hGetAll(`comment:${commentId}`);
    if (!commentData || Object.keys(commentData).length === 0) {
      throw new Error('评论不存在');
    }
    
    // 验证权限（评论作者或动态作者可删除）
    const postData = await redisClient.hGetAll(`post:${commentData.postId}`);
    if (commentData.userId !== userId && postData.userId !== userId) {
      throw new Error('没有权限删除此评论');
    }
    
    // 软删除评论
    await redisClient.hSet(`comment:${commentId}`, 'status', '0');
    
    // 从评论列表移除
    await redisClient.zRem(`post:${commentData.postId}:comments`, commentId);
    await redisClient.zRem(`user:${commentData.userId}:comments`, commentData.postId);
    
    // 更新动态评论计数
    const currentComments = parseInt(postData.commentsCount || '0');
    await redisClient.hSet(`post:${commentData.postId}`, 'commentsCount', (currentComments - 1).toString());
    await redisClient.zIncrBy('posts:hot', -1, commentData.postId);
    
    return true;
  } catch (error) {
    console.error('Error in deleteComment:', error);
    throw error;
  }
}

// 9. 删除我的动态
async function deletePost(userId, postId) {
  try {
    await ensureConnection();
    
    const postData = await redisClient.hGetAll(`post:${postId}`);
    if (!postData || Object.keys(postData).length === 0) {
      throw new Error('动态不存在');
    }
    
    // 验证权限（仅作者可删除）
    if (postData.userId !== userId) {
      throw new Error('没有权限删除此动态');
    }
    
    // 软删除动态
    await redisClient.hSet(`post:${postId}`, 'status', '0');
    
    // 从各种列表中移除
    await redisClient.zRem('posts:timeline', postId);
    await redisClient.zRem('posts:hot', postId);
    await redisClient.zRem(`user:${userId}:posts`, postId);
    
    return true;
  } catch (error) {
    console.error('Error in deletePost:', error);
    throw error;
  }
}

// 10. 编辑我的动态
async function editPost(userId, postId, content, images = [], tags = []) {
  try {
    await ensureConnection();
    
    const postData = await redisClient.hGetAll(`post:${postId}`);
    if (!postData || Object.keys(postData).length === 0) {
      throw new Error('动态不存在');
    }
    
    // 验证权限（仅作者可编辑）
    if (postData.userId !== userId) {
      throw new Error('没有权限编辑此动态');
    }
    
    // 验证内容
    if (!content && (!images || images.length === 0)) {
      throw new Error('内容和图片至少有一个不能为空');
    }
    
    if (content && content.length > 500) {
      throw new Error('内容长度不能超过500字符');
    }
    
    if (images && images.length > 9) {
      throw new Error('图片数量不能超过9张');
    }
    
    // 更新动态数据
    await redisClient.hSet(`post:${postId}`, {
      content: content || '',
      images: JSON.stringify(images),
      tags: JSON.stringify(tags),
      updatedAt: Date.now().toString()
    });
    
    return true;
  } catch (error) {
    console.error('Error in editPost:', error);
    throw error;
  }
}

// 11. 删除我的社区互动记录
async function deleteMyInteraction(userId, type, recordId) {
  try {
    await ensureConnection();
    
    switch (type) {
      case 'likes':
        await redisClient.zRem(`user:${userId}:likes`, recordId);
        break;
      case 'collects':
        await redisClient.zRem(`user:${userId}:collects`, recordId);
        break;
      case 'comments':
        await redisClient.zRem(`user:${userId}:comments`, recordId);
        break;
      default:
        throw new Error('无效的互动类型');
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteMyInteraction:', error);
    throw error;
  }
}

async function getMyCommunityContent(userId, type, page, pageSize) {
  console.log(`Fetching ${type} for user ${userId}, page ${page}, pageSize ${pageSize}`);
  
  if (!userId) {
    console.error('No userId provided');
    return {
      list: [],
      total: 0,
      hasMore: false
    };
  }

  try {
    await ensureConnection();
    
    const offset = (page - 1) * pageSize;
    let list = [];
    let total = 0;

    switch (type) {
      case 'posts':
        // 获取用户发布的帖子
        const userPostsKey = `user:${userId}:posts`;
        const postIds = await redisClient.zRange(userPostsKey, offset, offset + pageSize - 1, { REV: true });
        total = await redisClient.zCard(userPostsKey);
        
        for (const postId of postIds) {
          const postData = await redisClient.hGetAll(`post:${postId}`);
          if (postData && Object.keys(postData).length > 0) {
            const authorData = await redisClient.hGetAll(`user:${postData.userId}`);
            list.push({
              id: postId,
              content: postData.content || '',
              images: JSON.parse(postData.images || '[]'),
              author: {
                id: postData.userId,
                nickname: authorData.nickname || 'Unknown',
                avatar: authorData.avatar || ''
              },
              interactTime: postData.createdAt,
              likes: parseInt(postData.likesCount || '0'),
              comments: parseInt(postData.commentsCount || '0'),
              collects: parseInt(postData.collectsCount || '0'),
              createdAt: postData.createdAt
            });
          }
        }
        break;

      case 'likes':
        // 获取用户点赞的帖子
        const userLikesKey = `user:${userId}:likes`;
        const likedPostIds = await redisClient.zRange(userLikesKey, offset, offset + pageSize - 1, { REV: true });
        total = await redisClient.zCard(userLikesKey);
        
        for (const postId of likedPostIds) {
          const postData = await redisClient.hGetAll(`post:${postId}`);
          if (postData && Object.keys(postData).length > 0) {
            const authorData = await redisClient.hGetAll(`user:${postData.userId}`);
            const likeTime = await redisClient.zScore(userLikesKey, postId);
            list.push({
              id: postId,
              content: postData.content || '',
              images: JSON.parse(postData.images || '[]'),
              author: {
                id: postData.userId,
                nickname: authorData.nickname || 'Unknown',
                avatar: authorData.avatar || ''
              },
              interactTime: new Date(likeTime).toISOString(),
              likes: parseInt(postData.likesCount || '0'),
              comments: parseInt(postData.commentsCount || '0'),
              collects: parseInt(postData.collectsCount || '0'),
              createdAt: postData.createdAt
            });
          }
        }
        break;

      case 'collects':
        // 获取用户收藏的帖子
        const userCollectsKey = `user:${userId}:collects`;
        const collectedPostIds = await redisClient.zRange(userCollectsKey, offset, offset + pageSize - 1, { REV: true });
        total = await redisClient.zCard(userCollectsKey);
        
        for (const postId of collectedPostIds) {
          const postData = await redisClient.hGetAll(`post:${postId}`);
          if (postData && Object.keys(postData).length > 0) {
            const authorData = await redisClient.hGetAll(`user:${postData.userId}`);
            const collectTime = await redisClient.zScore(userCollectsKey, postId);
            list.push({
              id: postId,
              content: postData.content || '',
              images: JSON.parse(postData.images || '[]'),
              author: {
                id: postData.userId,
                nickname: authorData.nickname || 'Unknown',
                avatar: authorData.avatar || ''
              },
              interactTime: new Date(collectTime).toISOString(),
              likes: parseInt(postData.likesCount || '0'),
              comments: parseInt(postData.commentsCount || '0'),
              collects: parseInt(postData.collectsCount || '0'),
              createdAt: postData.createdAt
            });
          }
        }
        break;

      case 'comments':
        // 获取用户评论的帖子
        const userCommentsKey = `user:${userId}:comments`;
        const commentedPostIds = await redisClient.zRange(userCommentsKey, offset, offset + pageSize - 1, { REV: true });
        total = await redisClient.zCard(userCommentsKey);
        
        for (const postId of commentedPostIds) {
          const postData = await redisClient.hGetAll(`post:${postId}`);
          if (postData && Object.keys(postData).length > 0) {
            const authorData = await redisClient.hGetAll(`user:${postData.userId}`);
            const commentTime = await redisClient.zScore(userCommentsKey, postId);
            // 获取用户对该帖子的评论内容
            const commentData = await redisClient.hGetAll(`comment:${userId}:${postId}`);
            list.push({
              id: postId,
              content: postData.content || '',
              images: JSON.parse(postData.images || '[]'),
              author: {
                id: postData.userId,
                nickname: authorData.nickname || 'Unknown',
                avatar: authorData.avatar || ''
              },
              interactTime: new Date(commentTime).toISOString(),
              commentContent: commentData.content || '',
              likes: parseInt(postData.likesCount || '0'),
              comments: parseInt(postData.commentsCount || '0'),
              collects: parseInt(postData.collectsCount || '0'),
              createdAt: postData.createdAt
            });
          }
        }
        break;

      default:
        throw new Error('Invalid content type');
    }

    return {
      list,
      total,
      hasMore: offset + list.length < total
    };
  } catch (error) {
    console.error('Error in getMyCommunityContent:', error);
    return {
      list: [],
      total: 0,
      hasMore: false
    };
  }
}

async function getMyCommunityStats(userId) {
  if (!userId) {
    console.error('No userId provided');
    return {
      likes: 0,
      collects: 0,
      comments: 0,
      posts: 0
    };
  }

  try {
    await ensureConnection();
    
    const stats = {
      likes: await redisClient.zCard(`user:${userId}:likes`) || 0,
      collects: await redisClient.zCard(`user:${userId}:collects`) || 0,
      comments: await redisClient.zCard(`user:${userId}:comments`) || 0,
      posts: await redisClient.zCard(`user:${userId}:posts`) || 0
    };
    
    return stats;
  } catch (error) {
    console.error('Error in getMyCommunityStats:', error);
    return {
      likes: 0,
      collects: 0,
      comments: 0,
      posts: 0
    };
  }
}

module.exports = {
  getCommunityPosts,
  publishPost,
  getPostDetail,
  togglePostLike,
  togglePostCollect,
  getPostComments,
  publishComment,
  deleteComment,
  deletePost,
  editPost,
  deleteMyInteraction,
  getMyCommunityContent,
  getMyCommunityStats
};