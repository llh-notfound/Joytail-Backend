// React组件示例 - PetPal社区动态卡片
import React, { useState } from 'react';
import './petpal-icons.css'; // 引入图标样式

const CommunityPostCard = ({ post, onLike, onCollect, onComment }) => {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [isCollected, setIsCollected] = useState(post.isCollected);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [collectsCount, setCollectsCount] = useState(post.collects);
  const [loading, setLoading] = useState(false);

  // 处理点赞
  const handleLike = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const response = await fetch(`/api/community/posts/${post.id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.code === 200) {
        setIsLiked(data.data.isLiked);
        setLikesCount(data.data.likesCount);
        
        // 触发父组件回调
        onLike && onLike(post.id, data.data);
      }
    } catch (error) {
      console.error('点赞操作失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 处理收藏
  const handleCollect = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const response = await fetch(`/api/community/posts/${post.id}/collect`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.code === 200) {
        setIsCollected(data.data.isCollected);
        setCollectsCount(data.data.collectsCount);
        
        // 触发父组件回调
        onCollect && onCollect(post.id, data.data);
      }
    } catch (error) {
      console.error('收藏操作失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="post-card">
      {/* 用户信息 */}
      <div className="post-header">
        <img 
          src={post.avatar} 
          alt={post.username} 
          className="avatar"
        />
        <div className="user-info">
          <h4>{post.username}</h4>
          <p>{new Date(post.publishTime).toLocaleString()}</p>
        </div>
      </div>

      {/* 动态内容 */}
      <div className="post-content">
        <p>{post.content}</p>
        
        {/* 图片列表 */}
        {post.images && post.images.length > 0 && (
          <div className="post-images">
            {post.images.map((image, index) => (
              <img 
                key={index}
                src={image} 
                alt={`动态图片${index + 1}`}
                className="post-image"
              />
            ))}
          </div>
        )}
        
        {/* 标签 */}
        {post.tags && post.tags.length > 0 && (
          <div className="post-tags">
            {post.tags.map((tag, index) => (
              <span key={index} className="tag">#{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* 互动栏 */}
      <div className="petpal-interaction-bar">
        <div className="petpal-interaction-left">
          {/* 点赞按钮 */}
          <button 
            className={`petpal-btn ${isLiked ? 'liked' : ''}`}
            onClick={handleLike}
            disabled={loading}
          >
            <i className="petpal-icon petpal-heart-outline"></i>
            <span className="petpal-count">{likesCount}</span>
          </button>

          {/* 收藏按钮 */}
          <button 
            className={`petpal-btn ${isCollected ? 'collected' : ''}`}
            onClick={handleCollect}
            disabled={loading}
          >
            <i className="petpal-icon petpal-bookmark-outline"></i>
            <span className="petpal-count">{collectsCount}</span>
          </button>

          {/* 评论按钮 */}
          <button 
            className="petpal-btn comment"
            onClick={() => onComment && onComment(post.id)}
          >
            <i className="petpal-icon petpal-comment-outline"></i>
            <span className="petpal-count">{post.comments}</span>
          </button>
        </div>

        <div className="petpal-interaction-right">
          {/* 分享按钮 */}
          <button className="petpal-btn">
            <i className="petpal-icon petpal-share"></i>
          </button>

          {/* 更多操作 */}
          <button className="petpal-btn">
            <i className="petpal-icon petpal-more"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommunityPostCard;
