# PetPal 社区API开发清单 - 后端必读

## 🎯 核心目标
前端已完成，需要后端实现12个API接口支持宠物社区功能。

## 📋 API开发清单

### ✅ 必需实现的接口（按优先级）

#### 🔥 高优先级（核心功能）
1. **GET /api/community/posts** - 动态列表
   - 支持 type=recommend/latest
   - 返回用户信息+动态内容+互动数据
   
2. **POST /api/community/posts** - 发布动态
   - 接收 content + images + tags
   - 需要JWT认证
   
3. **POST /api/community/posts/{id}/like** - 点赞切换
   - 返回最新点赞状态和数量
   
4. **POST /api/community/posts/{id}/collect** - 收藏切换
   - 返回最新收藏状态和数量

#### 🔶 中优先级（互动功能）
5. **GET /api/community/posts/{id}** - 动态详情
6. **GET /api/community/posts/{id}/comments** - 评论列表
7. **POST /api/community/posts/{id}/comments** - 发表评论
8. **GET /api/community/my** - 我的内容管理

#### 🔷 低优先级（管理功能）
9. **DELETE /api/community/posts/{id}** - 删除动态
10. **PUT /api/community/posts/{id}** - 编辑动态
11. **DELETE /api/community/comments/{id}** - 删除评论
12. **DELETE /api/community/my/{type}/{id}** - 删除互动记录

## 🗄️ 快速数据库设计

```sql
-- 动态表
CREATE TABLE community_posts (
  id VARCHAR(32) PRIMARY KEY,
  user_id VARCHAR(32) NOT NULL,
  content TEXT,
  images JSON,
  likes_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  collects_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 点赞表
CREATE TABLE community_likes (
  post_id VARCHAR(32),
  user_id VARCHAR(32),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY (post_id, user_id)
);

-- 收藏表
CREATE TABLE community_collects (
  post_id VARCHAR(32),
  user_id VARCHAR(32),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY (post_id, user_id)
);

-- 评论表
CREATE TABLE community_comments (
  id VARCHAR(32) PRIMARY KEY,
  post_id VARCHAR(32) NOT NULL,
  user_id VARCHAR(32) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 📝 关键响应格式

### 动态列表响应
```json
{
  "code": 200,
  "data": {
    "list": [
      {
        "id": "post_123",
        "userId": "user_456",
        "username": "柴犬麻麻",
        "avatar": "头像URL",
        "content": "动态内容",
        "images": ["图片URL数组"],
        "publishTime": "2024-01-15T10:30:00Z",
        "likes": 328,
        "comments": 56,
        "collects": 23,
        "isLiked": false,
        "isCollected": false
      }
    ],
    "hasMore": true
  }
}
```

### 点赞/收藏响应
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "isLiked": true,      // 新状态
    "likesCount": 329     // 新数量
  }
}
```

## 🔧 技术要点

### 认证
- 使用JWT Token
- Header: `Authorization: Bearer {token}`
- 从token中获取userId

### 分页
- page: 页码，从1开始
- pageSize: 每页数量，默认10
- hasMore: 是否有更多数据

### 图片处理
- 前端会上传图片到OSS后传递URL
- 后端只需存储URL字符串
- 建议JSON格式存储图片数组

### 性能优化
- 动态列表查询需要关联用户表
- 点赞/收藏状态需要左联查询当前用户
- 建议添加Redis缓存热门内容

## 🚀 最小化实现策略

### 第一阶段：基础功能（1-2天）
- 实现接口1-4（列表+发布+点赞+收藏）
- 基础数据库表设计
- JWT认证中间件

### 第二阶段：完整功能（2-3天）
- 实现接口5-8（详情+评论+个人中心）
- 添加缓存机制
- 性能优化

### 第三阶段：管理功能（1天）
- 实现接口9-12（删除+编辑）
- 权限验证
- 最终测试

## 🧪 测试建议

### API测试用例
```bash
# 1. 获取动态列表
GET /api/community/posts?type=recommend&page=1&pageSize=10

# 2. 发布动态
POST /api/community/posts
{
  "content": "测试动态",
  "images": ["http://example.com/img.jpg"]
}

# 3. 点赞动态
POST /api/community/posts/post_123/like

# 4. 查看动态详情
GET /api/community/posts/post_123
```

### 前端集成测试
前端已完成开发，具备Mock数据回退机制：
- API成功时显示真实数据
- API失败时使用Mock数据确保用户体验
- 所有功能均可离线演示

## 📞 联系方式

有任何接口实现问题，请及时沟通：
- API字段格式确认
- 数据库设计讨论  
- 性能优化建议
- 前后端联调测试

## 🎯 预期成果

完成后将得到：
✅ 功能完整的宠物社区平台
✅ 类似小红书的现代化UI设计
✅ 支持发布、点赞、评论、收藏等社交功能
✅ 多端适配（H5+小程序+APP）
✅ 专业的宠物主题社区

**目标时间**: 5-7天完成全部接口开发
