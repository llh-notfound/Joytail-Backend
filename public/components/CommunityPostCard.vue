<template>
  <div class="post-card">
    <!-- 用户信息 -->
    <div class="post-header">
      <img 
        :src="post.avatar" 
        :alt="post.username" 
        class="avatar"
      />
      <div class="user-info">
        <h4>{{ post.username }}</h4>
        <p>{{ formatTime(post.publishTime) }}</p>
      </div>
    </div>

    <!-- 动态内容 -->
    <div class="post-content">
      <p>{{ post.content }}</p>
      
      <!-- 图片列表 -->
      <div v-if="post.images && post.images.length > 0" class="post-images">
        <img 
          v-for="(image, index) in post.images"
          :key="index"
          :src="image" 
          :alt="`动态图片${index + 1}`"
          class="post-image"
        />
      </div>
      
      <!-- 标签 -->
      <div v-if="post.tags && post.tags.length > 0" class="post-tags">
        <span 
          v-for="(tag, index) in post.tags"
          :key="index" 
          class="tag"
        >
          #{{ tag }}
        </span>
      </div>
    </div>

    <!-- 互动栏 -->
    <div class="petpal-interaction-bar">
      <div class="petpal-interaction-left">
        <!-- 点赞按钮 -->
        <button 
          :class="['petpal-btn', { 'liked': isLiked }]"
          @click="handleLike"
          :disabled="loading"
        >
          <i class="petpal-icon petpal-heart-outline"></i>
          <span class="petpal-count">{{ likesCount }}</span>
        </button>

        <!-- 收藏按钮 -->
        <button 
          :class="['petpal-btn', { 'collected': isCollected }]"
          @click="handleCollect"
          :disabled="loading"
        >
          <i class="petpal-icon petpal-bookmark-outline"></i>
          <span class="petpal-count">{{ collectsCount }}</span>
        </button>

        <!-- 评论按钮 -->
        <button 
          class="petpal-btn comment"
          @click="$emit('comment', post.id)"
        >
          <i class="petpal-icon petpal-comment-outline"></i>
          <span class="petpal-count">{{ post.comments }}</span>
        </button>
      </div>

      <div class="petpal-interaction-right">
        <!-- 分享按钮 -->
        <button class="petpal-btn" @click="$emit('share', post.id)">
          <i class="petpal-icon petpal-share"></i>
        </button>

        <!-- 更多操作 -->
        <button class="petpal-btn" @click="$emit('more', post.id)">
          <i class="petpal-icon petpal-more"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'CommunityPostCard',
  props: {
    post: {
      type: Object,
      required: true
    }
  },
  emits: ['like', 'collect', 'comment', 'share', 'more'],
  setup(props, { emit }) {
    const loading = ref(false)
    const isLiked = ref(props.post.isLiked)
    const isCollected = ref(props.post.isCollected)
    const likesCount = ref(props.post.likes)
    const collectsCount = ref(props.post.collects)

    // 格式化时间
    const formatTime = (timeString) => {
      return new Date(timeString).toLocaleString()
    }

    // 处理点赞
    const handleLike = async () => {
      if (loading.value) return
      loading.value = true

      try {
        const response = await fetch(`/api/community/posts/${props.post.id}/like`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        })

        const data = await response.json()
        
        if (data.code === 200) {
          isLiked.value = data.data.isLiked
          likesCount.value = data.data.likesCount
          
          // 触发父组件事件
          emit('like', props.post.id, data.data)
        }
      } catch (error) {
        console.error('点赞操作失败:', error)
      } finally {
        loading.value = false
      }
    }

    // 处理收藏
    const handleCollect = async () => {
      if (loading.value) return
      loading.value = true

      try {
        const response = await fetch(`/api/community/posts/${props.post.id}/collect`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        })

        const data = await response.json()
        
        if (data.code === 200) {
          isCollected.value = data.data.isCollected
          collectsCount.value = data.data.collectsCount
          
          // 触发父组件事件
          emit('collect', props.post.id, data.data)
        }
      } catch (error) {
        console.error('收藏操作失败:', error)
      } finally {
        loading.value = false
      }
    }

    return {
      loading,
      isLiked,
      isCollected,
      likesCount,
      collectsCount,
      formatTime,
      handleLike,
      handleCollect
    }
  }
}
</script>

<style scoped>
@import url('/css/petpal-icons.css');

.post-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin: 16px 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.post-card:hover {
  transform: translateY(-2px);
}

.post-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 12px;
  object-fit: cover;
}

.user-info h4 {
  margin: 0;
  color: #333;
  font-size: 14px;
  font-weight: 600;
}

.user-info p {
  margin: 2px 0 0 0;
  color: #666;
  font-size: 12px;
}

.post-content {
  margin-bottom: 16px;
}

.post-content p {
  margin: 0 0 12px 0;
  line-height: 1.6;
  color: #333;
}

.post-images {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 8px;
  margin: 12px 0;
}

.post-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.post-image:hover {
  transform: scale(1.02);
}

.post-tags {
  margin: 12px 0;
}

.tag {
  display: inline-block;
  background: #e3f2fd;
  color: #1976d2;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  margin-right: 8px;
  margin-bottom: 4px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .post-card {
    margin: 12px 0;
    padding: 16px;
  }
  
  .post-images {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  }
  
  .post-image {
    height: 120px;
  }
}
</style>
