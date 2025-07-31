const express = require('express');
const router = express.Router();
const { 
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
} = require('../controllers/communityController');
const auth = require('../middleware/auth');

// 1. 获取社区动态列表
router.get('/posts', async (req, res) => {
  try {
    const { type = 'recommend', page = 1, pageSize = 10 } = req.query;
    const userId = req.user ? req.user.userId : null;

    if (!['recommend', 'latest'].includes(type)) {
      return res.status(400).json({
        code: 400,
        message: 'Invalid type parameter'
      });
    }

    const data = await getCommunityPosts(type, parseInt(page), parseInt(pageSize), userId);
    
    res.json({
      code: 200,
      message: 'success',
      data
    });
  } catch (error) {
    console.error('Error in GET /community/posts:', error);
    res.status(500).json({
      code: 500,
      message: 'Internal server error'
    });
  }
});

// 2. 发布社区动态
router.post('/posts', auth, async (req, res) => {
  try {
    const { content, images = [], tags = [] } = req.body;
    const userId = req.user.userId;

    const result = await publishPost(userId, content, images, tags);
    
    res.json({
      code: 200,
      message: '发布成功',
      data: {
        postId: result.postId
      }
    });
  } catch (error) {
    console.error('Error in POST /community/posts:', error);
    res.status(400).json({
      code: 400,
      message: error.message || '发布失败'
    });
  }
});

// 3. 获取动态详情
router.get('/posts/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user ? req.user.userId : null;

    const data = await getPostDetail(postId, userId);
    
    res.json({
      code: 200,
      message: 'success',
      data
    });
  } catch (error) {
    console.error('Error in GET /community/posts/:postId:', error);
    if (error.message === '动态不存在') {
      res.status(404).json({
        code: 404,
        message: '动态不存在'
      });
    } else {
      res.status(500).json({
        code: 500,
        message: 'Internal server error'
      });
    }
  }
});

// 4. 点赞/取消点赞动态
router.post('/posts/:postId/like', auth, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;

    const result = await togglePostLike(userId, postId);
    
    res.json({
      code: 200,
      message: '操作成功',
      data: {
        isLiked: result.isLiked,
        likesCount: result.likesCount
      }
    });
  } catch (error) {
    console.error('Error in POST /community/posts/:postId/like:', error);
    if (error.message === '动态不存在') {
      res.status(404).json({
        code: 404,
        message: '动态不存在'
      });
    } else {
      res.status(500).json({
        code: 500,
        message: 'Internal server error'
      });
    }
  }
});

// 5. 收藏/取消收藏动态
router.post('/posts/:postId/collect', auth, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;

    const result = await togglePostCollect(userId, postId);
    
    res.json({
      code: 200,
      message: '操作成功',
      data: {
        isCollected: result.isCollected,
        collectsCount: result.collectsCount
      }
    });
  } catch (error) {
    console.error('Error in POST /community/posts/:postId/collect:', error);
    if (error.message === '动态不存在') {
      res.status(404).json({
        code: 404,
        message: '动态不存在'
      });
    } else {
      res.status(500).json({
        code: 500,
        message: 'Internal server error'
      });
    }
  }
});

// 6. 获取动态评论列表
router.get('/posts/:postId/comments', async (req, res) => {
  try {
    const { postId } = req.params;
    const { page = 1, pageSize = 20 } = req.query;

    const data = await getPostComments(postId, parseInt(page), parseInt(pageSize));
    
    res.json({
      code: 200,
      message: 'success',
      data
    });
  } catch (error) {
    console.error('Error in GET /community/posts/:postId/comments:', error);
    res.status(500).json({
      code: 500,
      message: 'Internal server error'
    });
  }
});

// 7. 发表动态评论
router.post('/posts/:postId/comments', auth, async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user.userId;

    const result = await publishComment(userId, postId, content);
    
    res.json({
      code: 200,
      message: '评论成功',
      data: {
        commentId: result.commentId
      }
    });
  } catch (error) {
    console.error('Error in POST /community/posts/:postId/comments:', error);
    res.status(400).json({
      code: 400,
      message: error.message || '评论失败'
    });
  }
});

// 8. 删除动态评论
router.delete('/comments/:commentId', auth, async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.userId;

    await deleteComment(userId, commentId);
    
    res.json({
      code: 200,
      message: '删除成功'
    });
  } catch (error) {
    console.error('Error in DELETE /community/comments/:commentId:', error);
    if (error.message === '评论不存在') {
      res.status(404).json({
        code: 404,
        message: '评论不存在'
      });
    } else if (error.message === '没有权限删除此评论') {
      res.status(403).json({
        code: 403,
        message: '没有权限删除此评论'
      });
    } else {
      res.status(500).json({
        code: 500,
        message: 'Internal server error'
      });
    }
  }
});

// 9. 获取我的社区内容
router.get('/my', auth, async (req, res) => {
  try {
    const { type, page = 1, pageSize = 10 } = req.query;
    const userId = req.user.userId;

    if (!['posts', 'likes', 'collects', 'comments'].includes(type)) {
      return res.status(400).json({
        code: 400,
        message: 'Invalid content type'
      });
    }

    const data = await getMyCommunityContent(userId, type, parseInt(page), parseInt(pageSize));
    
    res.json({
      code: 200,
      message: 'success',
      data: {
        list: data.list || [],
        total: data.total || 0,
        hasMore: data.hasMore || false
      }
    });
  } catch (error) {
    console.error('Error in GET /community/my:', error);
    res.status(500).json({
      code: 500,
      message: 'Internal server error'
    });
  }
});

// 10. 删除我的动态
router.delete('/posts/:postId', auth, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;

    await deletePost(userId, postId);
    
    res.json({
      code: 200,
      message: '删除成功'
    });
  } catch (error) {
    console.error('Error in DELETE /community/posts/:postId:', error);
    if (error.message === '动态不存在') {
      res.status(404).json({
        code: 404,
        message: '动态不存在'
      });
    } else if (error.message === '没有权限删除此动态') {
      res.status(403).json({
        code: 403,
        message: '没有权限删除此动态'
      });
    } else {
      res.status(500).json({
        code: 500,
        message: 'Internal server error'
      });
    }
  }
});

// 11. 编辑我的动态
router.put('/posts/:postId', auth, async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, images = [], tags = [] } = req.body;
    const userId = req.user.userId;

    await editPost(userId, postId, content, images, tags);
    
    res.json({
      code: 200,
      message: '更新成功'
    });
  } catch (error) {
    console.error('Error in PUT /community/posts/:postId:', error);
    if (error.message === '动态不存在') {
      res.status(404).json({
        code: 404,
        message: '动态不存在'
      });
    } else if (error.message === '没有权限编辑此动态') {
      res.status(403).json({
        code: 403,
        message: '没有权限编辑此动态'
      });
    } else {
      res.status(400).json({
        code: 400,
        message: error.message || '更新失败'
      });
    }
  }
});

// 12. 删除我的社区互动记录
router.delete('/my/:type/:recordId', auth, async (req, res) => {
  try {
    const { type, recordId } = req.params;
    const userId = req.user.userId;

    if (!['likes', 'collects', 'comments'].includes(type)) {
      return res.status(400).json({
        code: 400,
        message: 'Invalid interaction type'
      });
    }

    await deleteMyInteraction(userId, type, recordId);
    
    res.json({
      code: 200,
      message: '删除成功'
    });
  } catch (error) {
    console.error('Error in DELETE /community/my/:type/:recordId:', error);
    res.status(400).json({
      code: 400,
      message: error.message || '删除失败'
    });
  }
});

// 获取用户互动统计
router.get('/my/stats', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const data = await getMyCommunityStats(userId);
    
    res.json({
      code: 200,
      message: 'success',
      data
    });
  } catch (error) {
    console.error('Error in GET /community/my/stats:', error);
    res.status(500).json({
      code: 500,
      message: 'Internal server error'
    });
  }
});

module.exports = router;