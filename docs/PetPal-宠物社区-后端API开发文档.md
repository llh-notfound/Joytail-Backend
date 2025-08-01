# PetPal 宠物社区 - 后端API开发文档

## 📋 项目概述

本文档为PetPal宠物社区模块的后端API开发指南。前端已完成开发并具备完整的社区功能，类似小红书/贴吧的宠物主题社区平台。后端需要实现12个核心API接口来支持前端功能。

### 🎯 项目特色
- **专业宠物社区**: 专注宠物主题内容分享
- **现代化UI设计**: 瀑布流布局 + 精美卡片设计
- **完整交互功能**: 发布、点赞、评论、收藏等社交功能
- **用户体验优秀**: 支持下拉刷新、上拉加载、图片预览等
- **API设计合理**: RESTful风格，支持分页、认证等

---

## 🏗️ 技术架构

### 前端技术栈
- **框架**: Vue3 + uni-app (支持H5/小程序/APP)
- **布局**: 瀑布流双列布局
- **状态管理**: Vue3 Composition API
- **网络请求**: uni.request + axios封装
- **图片处理**: uni-app原生图片组件

### 后端技术要求
- **API风格**: RESTful API
- **认证方式**: JWT Token
- **数据格式**: JSON
- **分页**: 支持page/pageSize参数
- **图片存储**: 建议使用OSS/CDN
- **缓存**: 建议Redis缓存热门内容

---

## 📊 数据库设计建议

### 1. 社区动态表 (community_posts)
```sql
CREATE TABLE community_posts (
  id VARCHAR(32) PRIMARY KEY COMMENT '动态ID',
  user_id VARCHAR(32) NOT NULL COMMENT '发布者用户ID',
  content TEXT COMMENT '动态内容',
  images JSON COMMENT '图片URL数组，最多9张',
  tags JSON COMMENT '话题标签数组',
  likes_count INT DEFAULT 0 COMMENT '点赞数量',
  comments_count INT DEFAULT 0 COMMENT '评论数量',
  collects_count INT DEFAULT 0 COMMENT '收藏数量',
  status TINYINT DEFAULT 1 COMMENT '状态：1-正常，0-删除',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '发布时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at),
  INDEX idx_status (status)
) COMMENT '社区动态表';
```

### 2. 动态评论表 (community_comments)
```sql
CREATE TABLE community_comments (
  id VARCHAR(32) PRIMARY KEY COMMENT '评论ID',
  post_id VARCHAR(32) NOT NULL COMMENT '动态ID',
  user_id VARCHAR(32) NOT NULL COMMENT '评论者用户ID',
  content TEXT NOT NULL COMMENT '评论内容',
  reply_to_id VARCHAR(32) COMMENT '回复的评论ID（预留字段）',
  status TINYINT DEFAULT 1 COMMENT '状态：1-正常，0-删除',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '评论时间',
  
  INDEX idx_post_id (post_id),
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
) COMMENT '动态评论表';
```

### 3. 动态点赞表 (community_likes)
```sql
CREATE TABLE community_likes (
  id VARCHAR(32) PRIMARY KEY COMMENT '点赞ID',
  post_id VARCHAR(32) NOT NULL COMMENT '动态ID',
  user_id VARCHAR(32) NOT NULL COMMENT '点赞用户ID',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '点赞时间',
  
  UNIQUE KEY uk_post_user (post_id, user_id),
  INDEX idx_user_id (user_id)
) COMMENT '动态点赞表';
```

### 4. 动态收藏表 (community_collects)
```sql
CREATE TABLE community_collects (
  id VARCHAR(32) PRIMARY KEY COMMENT '收藏ID',
  post_id VARCHAR(32) NOT NULL COMMENT '动态ID',
  user_id VARCHAR(32) NOT NULL COMMENT '收藏用户ID',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '收藏时间',
  
  UNIQUE KEY uk_post_user (post_id, user_id),
  INDEX idx_user_id (user_id)
) COMMENT '动态收藏表';
```

---

## 🔌 API接口详细设计

### 1. 获取社区动态列表

**接口描述**: 获取社区动态列表，支持推荐和最新两种模式

- **URL**: `GET /api/community/posts`
- **认证**: 可选（登录用户可看到个人化的点赞/收藏状态）
- **请求参数**:
```json
{
  "type": "string",      // 类型: "recommend"(推荐) | "latest"(最新)，默认recommend
  "page": "number",      // 页码，默认1
  "pageSize": "number"   // 每页数量，默认10，最大20
}
```

- **成功响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "post_123456",
        "userId": "user_789",
        "username": "柴犬麻麻",
        "avatar": "https://cdn.example.com/avatar.jpg",
        "content": "今天带我家柴柴去公园玩...",
        "images": [
          "https://cdn.example.com/img1.jpg",
          "https://cdn.example.com/img2.jpg"
        ],
        "publishTime": "2024-01-15T10:30:00Z",
        "likes": 328,
        "comments": 56,
        "collects": 23,
        "isLiked": false,      // 当前用户是否已点赞
        "isCollected": false,  // 当前用户是否已收藏
        "tags": ["柴犬日常", "遛狗日记"]
      }
    ],
    "total": 1250,
    "hasMore": true
  }
}
```

- **业务逻辑**:
  - `recommend`: 按热度排序（点赞数+评论数+收藏数权重算法）
  - `latest`: 按发布时间倒序
  - 需要关联用户表获取用户信息
  - 如果用户已登录，需要查询个人点赞/收藏状态

---

### 2. 发布社区动态

**接口描述**: 用户发布新的社区动态

- **URL**: `POST /api/community/posts`
- **认证**: 必需
- **请求参数**:
```json
{
  "content": "分享我家宠物的日常...",
  "images": [
    "https://cdn.example.com/upload/img1.jpg",
    "https://cdn.example.com/upload/img2.jpg"
  ],
  "tags": ["萌宠日常", "新手养宠"]  // 可选，话题标签
}
```

- **成功响应**:
```json
{
  "code": 200,
  "message": "发布成功",
  "data": {
    "postId": "post_123456"
  }
}
```

- **业务逻辑**:
  - 内容和图片至少有一个不为空
  - 图片数量限制：最多9张
  - 内容长度限制：最多500字符
  - 自动提取或验证标签格式
  - 需要内容审核机制（关键词过滤）

---

### 3. 获取动态详情

**接口描述**: 获取指定动态的详细信息

- **URL**: `GET /api/community/posts/{postId}`
- **认证**: 可选
- **请求参数**: 路径参数 `postId`

- **成功响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": "post_123456",
    "userId": "user_789",
    "username": "柴犬麻麻",
    "avatar": "https://cdn.example.com/avatar.jpg",
    "content": "今天带我家柴柴去公园玩...",
    "images": ["https://cdn.example.com/img1.jpg"],
    "publishTime": "2024-01-15T10:30:00Z",
    "likes": 328,
    "comments": 56,
    "collects": 23,
    "isLiked": false,
    "isCollected": false,
    "tags": ["柴犬日常", "遛狗日记"]
  }
}
```

---

### 4. 点赞/取消点赞动态

**接口描述**: 切换动态的点赞状态

- **URL**: `POST /api/community/posts/{postId}/like`
- **认证**: 必需
- **请求参数**: 路径参数 `postId`

- **成功响应**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "isLiked": true,      // 操作后的点赞状态
    "likesCount": 329     // 操作后的点赞总数
  }
}
```

- **业务逻辑**:
  - 如果已点赞则取消，未点赞则添加
  - 更新动态表的点赞计数
  - 可以考虑防刷机制（限制频率）

---

### 5. 收藏/取消收藏动态

**接口描述**: 切换动态的收藏状态

- **URL**: `POST /api/community/posts/{postId}/collect`
- **认证**: 必需
- **请求参数**: 路径参数 `postId`

- **成功响应**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "isCollected": true,   // 操作后的收藏状态
    "collectsCount": 24    // 操作后的收藏总数
  }
}
```

---

### 6. 获取动态评论列表

**接口描述**: 获取指定动态的评论列表

- **URL**: `GET /api/community/posts/{postId}/comments`
- **认证**: 可选
- **请求参数**:
```json
{
  "page": 1,         // 页码，默认1
  "pageSize": 20     // 每页数量，默认20
}
```

- **成功响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "comment_123",
        "userId": "user_456",
        "username": "养猫专家",
        "avatar": "https://cdn.example.com/avatar2.jpg",
        "content": "看起来玩得很开心呢！",
        "publishTime": "2024-01-15T11:30:00Z"
      }
    ],
    "total": 56,
    "hasMore": true
  }
}
```

---

### 7. 发表动态评论

**接口描述**: 对指定动态发表评论

- **URL**: `POST /api/community/posts/{postId}/comments`
- **认证**: 必需
- **请求参数**:
```json
{
  "content": "看起来玩得很开心呢！"
}
```

- **成功响应**:
```json
{
  "code": 200,
  "message": "评论成功",
  "data": {
    "commentId": "comment_123456"
  }
}
```

- **业务逻辑**:
  - 评论内容不能为空
  - 评论长度限制：最多200字符
  - 更新动态表的评论计数
  - 内容审核机制

---

### 8. 删除动态评论

**接口描述**: 删除指定评论（仅评论作者或动态作者可删除）

- **URL**: `DELETE /api/community/comments/{commentId}`
- **认证**: 必需
- **请求参数**: 路径参数 `commentId`

- **成功响应**:
```json
{
  "code": 200,
  "message": "删除成功"
}
```

- **业务逻辑**:
  - 验证删除权限（评论作者或动态作者）
  - 软删除（修改status字段）
  - 更新动态表的评论计数

---

### 9. 获取我的社区内容

**接口描述**: 获取当前用户的社区相关内容

- **URL**: `GET /api/community/my`
- **认证**: 必需
- **请求参数**:
```json
{
  "type": "posts",      // 类型: "posts"(我的发布) | "likes"(我的点赞) | "collects"(我的收藏) | "comments"(我的评论)
  "page": 1,
  "pageSize": 10
}
```

- **成功响应**:

对于 `type="posts"` (我的发布):
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "post_123456",
        "content": "今天带我家柴柴去公园玩...",
        "images": ["https://cdn.example.com/img1.jpg"],
        "publishTime": "2024-01-15T10:30:00Z",
        "likes": 328,
        "comments": 56,
        "collects": 23
      }
    ],
    "total": 45,
    "hasMore": true
  }
}
```

对于 `type="likes|collects|comments"` (我的互动):
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "record_123",      // 互动记录ID
        "postId": "post_456",    // 原动态ID
        "title": "今天带我家柴柴...",     // 动态标题(截取)
        "summary": "第一次见到这么多...", // 动态摘要
        "coverImage": "https://cdn.example.com/img1.jpg",
        "interactTime": "2024-01-15T12:00:00Z",
        "comment": "看起来很开心"  // 仅comments类型有此字段
      }
    ],
    "total": 128,
    "hasMore": true
  }
}
```

---

### 10. 删除我的动态

**接口描述**: 删除用户自己发布的动态

- **URL**: `DELETE /api/community/posts/{postId}`
- **认证**: 必需
- **请求参数**: 路径参数 `postId`

- **成功响应**:
```json
{
  "code": 200,
  "message": "删除成功"
}
```

- **业务逻辑**:
  - 验证所有权（仅作者可删除）
  - 软删除（修改status字段）
  - 可选择是否同时删除相关评论、点赞、收藏记录

---

### 11. 编辑我的动态

**接口描述**: 编辑用户自己发布的动态

- **URL**: `PUT /api/community/posts/{postId}`
- **认证**: 必需
- **请求参数**:
```json
{
  "content": "更新后的动态内容...",
  "images": [
    "https://cdn.example.com/new_img1.jpg"
  ],
  "tags": ["更新的标签"]
}
```

- **成功响应**:
```json
{
  "code": 200,
  "message": "更新成功"
}
```

- **业务逻辑**:
  - 验证所有权（仅作者可编辑）
  - 内容和图片验证规则同发布接口
  - 更新时间戳

---

### 12. 删除我的社区互动记录

**接口描述**: 删除个人的点赞、收藏、评论记录

- **URL**: `DELETE /api/community/my/{type}/{recordId}`
- **认证**: 必需
- **请求参数**: 
  - `type`: 类型 (`likes`/`collects`/`comments`)
  - `recordId`: 记录ID

- **成功响应**:
```json
{
  "code": 200,
  "message": "删除成功"
}
```

---

## 🔒 认证与权限

### JWT Token 格式
```json
{
  "userId": "user_123456",
  "username": "用户昵称",
  "exp": 1640995200
}
```

### 权限验证
- **公开接口**: 动态列表、动态详情、评论列表（可选登录）
- **需要认证**: 发布、点赞、收藏、评论、个人内容管理
- **所有权验证**: 编辑/删除动态、删除评论

---

## 📈 性能优化建议

### 1. 数据库优化
```sql
-- 热门动态查询索引
CREATE INDEX idx_hot_posts ON community_posts(status, created_at, likes_count, comments_count);

-- 用户发布动态索引
CREATE INDEX idx_user_posts ON community_posts(user_id, status, created_at);

-- 点赞状态快速查询
CREATE INDEX idx_like_status ON community_likes(user_id, post_id);
```

### 2. Redis缓存策略
```
# 热门动态列表缓存
community:hot_posts:page:{page} (TTL: 5分钟)

# 动态详情缓存
community:post:{postId} (TTL: 30分钟)

# 用户点赞状态缓存
community:user_likes:{userId} (SET数据结构，TTL: 1小时)

# 动态统计数据缓存
community:post_stats:{postId} (HASH：likes/comments/collects)
```

### 3. 接口性能要求
- **动态列表**: <200ms
- **发布动态**: <500ms
- **点赞/收藏**: <100ms
- **评论发表**: <300ms

---

## 🛠️ 开发建议

### 1. 错误处理
```json
{
  "code": 400,
  "message": "动态内容不能为空",
  "data": null,
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/community/posts"
}
```

### 2. 常见错误码
- `200`: 成功
- `400`: 参数错误
- `401`: 未认证
- `403`: 权限不足
- `404`: 资源不存在
- `429`: 请求过于频繁
- `500`: 服务器内错误

### 3. 内容审核
- 敏感词过滤
- 图片内容检测
- 用户举报机制
- 管理员审核工具

### 4. 图片处理
- 支持多种格式：JPG、PNG、WebP
- 图片压缩和不同尺寸生成
- CDN加速分发
- 防盗链机制

---

## 📝 前端集成说明

### API调用示例
```javascript
// 前端已封装的API方法
import api from '@/utils/api';

// 获取动态列表
const response = await api.community.getCommunityPosts('recommend', 1, 10);

// 发布动态
const response = await api.community.publishPost({
  content: '内容',
  images: ['图片1', '图片2'],
  tags: ['标签1', '标签2']
});

// 点赞动态
const response = await api.community.togglePostLike('postId');
```

### 前端容错机制
- API失败时自动使用Mock数据
- 网络异常时显示友好提示
- 支持离线浏览已缓存内容
- 提供重试机制

---

## 🧪 测试用例建议

### 1. 功能测试
- [ ] 动态发布（文字+图片）
- [ ] 动态列表（推荐/最新）
- [ ] 点赞/取消点赞
- [ ] 收藏/取消收藏
- [ ] 评论发表
- [ ] 个人内容管理

### 2. 边界测试
- [ ] 空内容发布
- [ ] 超长内容发布
- [ ] 图片数量限制
- [ ] 频繁点赞测试
- [ ] 大量评论性能

### 3. 安全测试
- [ ] XSS攻击防护
- [ ] SQL注入防护
- [ ] 未认证访问限制
- [ ] 权限越界测试

---

## 📊 数据统计需求

### 1. 基础统计
- 日活跃用户数
- 每日发布动态数
- 每日互动数（点赞+评论+收藏）
- 热门话题统计

### 2. 用户分析
- 用户发布频率
- 用户互动偏好
- 活跃时间分布
- 流失用户分析

---

## 🎯 总结

这是一个功能完整的宠物社区API设计文档，前端已经完全开发完成并具备以下特色：

### ✅ 已完成功能
- **发布功能**: 支持图文发布、话题标签、字数统计
- **浏览功能**: 瀑布流布局、分类切换、下拉刷新、上拉加载
- **互动功能**: 点赞、评论、收藏，实时数据更新
- **个人中心**: 我的发布、收藏、点赞、评论管理
- **用户体验**: 图片预览、错误处理、Mock数据回退

### 🚀 技术优势
- **多端支持**: H5+小程序+APP
- **性能优化**: 瀑布流+分页加载
- **错误处理**: 完善的容错机制
- **API设计**: RESTful风格，易于实现

### 📋 开发清单
按照本文档实现12个API接口，即可与前端无缝对接，打造一个专业的宠物社区平台。

---

**联系方式**: 如有API实现问题，请及时沟通确认接口细节。

**更新日期**: 2024年1月
