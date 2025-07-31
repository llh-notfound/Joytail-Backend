# PetPal社区模块API修改文档

## 问题描述
当前"我的点赞"、"我的收藏"、"我的评论"模块显示了所有预设的帖子数据，而不是用户实际互动过的帖子。需要修改后端API以支持正确的数据过滤和返回。

## API修改详情

### 1. 获取我的社区内容
```http
GET /community/my
```

#### 请求参数
| 参数名   | 类型   | 必填 | 说明                                           |
|----------|--------|------|------------------------------------------------|
| type     | string | 是   | 内容类型：posts/likes/collects/comments        |
| page     | number | 是   | 页码，从1开始                                  |
| pageSize | number | 是   | 每页数量，默认10                               |

#### 返回数据
```javascript
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [{
      "id": "post_id",
      "content": "帖子内容",
      "images": ["图片URL"],
      "author": {
        "id": "user_id",
        "nickname": "用户昵称",
        "avatar": "头像URL"
      },
      "interactTime": "2024-01-20 12:34:56", // 互动时间
      "commentContent": "评论内容",      // 仅type=comments时包含
      "likes": 10,
      "comments": 5,
      "collects": 3,
      "createdAt": "2024-01-19 10:00:00"
    }],
    "total": 100,
    "hasMore": true
  }
}
```

### 2. 新增API：获取互动统计
```http
GET /community/my/stats
```

#### 请求参数
无

#### 返回数据
```javascript
{
  "code": 200,
  "message": "success",
  "data": {
    "likes": 10,    // 点赞数量
    "collects": 5,  // 收藏数量
    "comments": 8,  // 评论数量
    "posts": 3      // 发帖数量
  }
}
```

## 数据库设计

### 1. 点赞记录表
```sql
CREATE TABLE IF NOT EXISTS post_likes (
  id VARCHAR(32) PRIMARY KEY,
  user_id VARCHAR(32) NOT NULL,
  post_id VARCHAR(32) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (post_id) REFERENCES posts(id),
  INDEX idx_user_post (user_id, post_id),
  INDEX idx_created_at (created_at)
);
```

### 2. 收藏记录表
```sql
CREATE TABLE IF NOT EXISTS post_collections (
  id VARCHAR(32) PRIMARY KEY,
  user_id VARCHAR(32) NOT NULL,
  post_id VARCHAR(32) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (post_id) REFERENCES posts(id),
  INDEX idx_user_post (user_id, post_id),
  INDEX idx_created_at (created_at)
);
```

### 3. 评论记录表
```sql
CREATE TABLE IF NOT EXISTS post_comments (
  id VARCHAR(32) PRIMARY KEY,
  user_id VARCHAR(32) NOT NULL,
  post_id VARCHAR(32) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (post_id) REFERENCES posts(id),
  INDEX idx_user_post (user_id, post_id),
  INDEX idx_created_at (created_at)
);
```

## API实现示例

### 1. 获取我的社区内容
```javascript
async function getMyCommunityContent(userId, type, page, pageSize) {
  let query;
  const offset = (page - 1) * pageSize;

  switch (type) {
    case 'likes':
      query = `
        SELECT 
          p.*,
          pl.created_at as interact_time,
          u.nickname as author_nickname,
          u.avatar as author_avatar
        FROM posts p 
        INNER JOIN post_likes pl ON p.id = pl.post_id 
        INNER JOIN users u ON p.user_id = u.id
        WHERE pl.user_id = ?
        ORDER BY pl.created_at DESC
        LIMIT ? OFFSET ?
      `;
      break;

    case 'collects':
      query = `
        SELECT 
          p.*,
          pc.created_at as interact_time,
          u.nickname as author_nickname,
          u.avatar as author_avatar
        FROM posts p 
        INNER JOIN post_collections pc ON p.id = pc.post_id 
        INNER JOIN users u ON p.user_id = u.id
        WHERE pc.user_id = ?
        ORDER BY pc.created_at DESC
        LIMIT ? OFFSET ?
      `;
      break;

    case 'comments':
      query = `
        SELECT 
          p.*,
          pc.created_at as interact_time,
          pc.content as comment_content,
          u.nickname as author_nickname,
          u.avatar as author_avatar
        FROM posts p 
        INNER JOIN post_comments pc ON p.id = pc.post_id 
        INNER JOIN users u ON p.user_id = u.id
        WHERE pc.user_id = ?
        ORDER BY pc.created_at DESC
        LIMIT ? OFFSET ?
      `;
      break;

    case 'posts':
      query = `
        SELECT 
          p.*,
          p.created_at as interact_time,
          u.nickname as author_nickname,
          u.avatar as author_avatar
        FROM posts p
        INNER JOIN users u ON p.user_id = u.id
        WHERE p.user_id = ?
        ORDER BY p.created_at DESC
        LIMIT ? OFFSET ?
      `;
      break;
  }

  // 执行查询
  const results = await db.query(query, [userId, pageSize, offset]);
  
  // 获取总数
  const countQuery = `SELECT COUNT(*) as total FROM (${query.split('LIMIT')[0]}) as t`;
  const [{ total }] = await db.query(countQuery, [userId]);

  // 处理结果
  const list = results.map(item => ({
    id: item.id,
    content: item.content,
    images: JSON.parse(item.images || '[]'),
    author: {
      id: item.user_id,
      nickname: item.author_nickname,
      avatar: item.author_avatar
    },
    interactTime: item.interact_time,
    commentContent: item.comment_content,
    likes: item.likes_count,
    comments: item.comments_count,
    collects: item.collects_count,
    createdAt: item.created_at
  }));

  return {
    list,
    total,
    hasMore: offset + results.length < total
  };
}
```

### 2. 获取互动统计
```javascript
async function getMyCommunityStats(userId) {
  const queries = {
    likes: 'SELECT COUNT(*) as count FROM post_likes WHERE user_id = ?',
    collects: 'SELECT COUNT(*) as count FROM post_collections WHERE user_id = ?',
    comments: 'SELECT COUNT(*) as count FROM post_comments WHERE user_id = ?',
    posts: 'SELECT COUNT(*) as count FROM posts WHERE user_id = ?'
  };

  const stats = {};
  
  for (const [key, query] of Object.entries(queries)) {
    const [{ count }] = await db.query(query, [userId]);
    stats[key] = count;
  }

  return stats;
}
```

## 性能优化建议

### 1. 索引优化
- 已在表创建时添加了复合索引和单列索引
- 建议根据实际查询情况调整索引

### 2. 缓存策略
```javascript
// Redis缓存示例
const CACHE_KEY_PREFIX = 'community:user:';
const CACHE_EXPIRE = 3600; // 1小时

async function getMyCommunityStats(userId) {
  const cacheKey = `${CACHE_KEY_PREFIX}${userId}:stats`;
  
  // 尝试从缓存获取
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  // 从数据库获取
  const stats = await queryStats(userId);
  
  // 写入缓存
  await redis.setex(cacheKey, CACHE_EXPIRE, JSON.stringify(stats));
  
  return stats;
}
```

### 3. 分页优化
- 使用游标分页代替偏移分页
- 考虑使用预加载技术
- 实现虚拟滚动

## 注意事项

### 1. 数据一致性
- 实现软删除机制
- 添加触发器维护计数
- 定期同步数据

### 2. 安全性
- 添加访问权限验证
- 防止SQL注入
- 添加请求频率限制

### 3. 错误处理
- 实现统一的错误处理机制
- 添加详细的日志记录
- 设置监控告警

## 部署建议

### 1. 数据迁移
```sql
-- 迁移现有数据
INSERT INTO post_likes (user_id, post_id, created_at)
SELECT user_id, post_id, created_at
FROM old_likes_table;
```

### 2. 回滚方案
```sql
-- 回滚表结构
CREATE TABLE backup_post_likes AS SELECT * FROM post_likes;
DROP TABLE post_likes;
```

### 3. 监控指标
- API响应时间
- 数据库查询性能
- 缓存命中率
- 错误率统计

## 测试用例

### 1. 接口测试
```javascript
// 获取我的点赞列表
const response = await fetch('/api/community/my?type=likes&page=1&pageSize=10');
expect(response.status).toBe(200);
expect(response.data.list.length).toBeLessThanOrEqual(10);
```

### 2. 性能测试
```bash
# 使用ab进行压力测试
ab -n 1000 -c 100 http://api.example.com/community/my/stats
```

## 联系方式
如有问题请联系后端开发团队：
- 邮件：backend@petpal.com
- 群组：PetPal后端开发群（123456789）