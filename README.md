# PetPal Backend

基于 Node.js 和 Redis 的宠物应用后端 API 服务。

## 技术栈

- Node.js
- Express.js
- Redis
- JWT 认证
- Multer (文件上传)

## 项目结构

```
petpal-backend/
│
├── config/           # 配置文件
│   ├── redis.js      # Redis 配置
│   └── jwt.js        # JWT 配置
│
├── controllers/      # 控制器
│   ├── userController.js
│   ├── petController.js
│   └── ...
│
├── middleware/       # 中间件
│   └── auth.js       # 认证中间件
│
├── routes/           # 路由
│   ├── userRoutes.js
│   ├── petRoutes.js
│   └── ...
│
├── uploads/          # 上传文件目录
│
├── utils/            # 工具函数
│   └── fileUpload.js # 文件上传工具
│
├── app.js            # 应用入口文件
└── package.json      # 项目依赖
```

## 安装和运行

### 前提条件

- Node.js 14+
- Redis 服务器

### 安装依赖

```bash
npm install
```

### 运行项目

```bash
# 开发环境
npm run dev

# 生产环境
npm start
```

## API 文档

详细的 API 文档请参考 [api.md](api.md)。

### 主要 API 路径

- 用户相关: `/api/user/*`
- 宠物相关: `/api/pet/*`
- 商品相关: `/api/goods/*`
- 购物车相关: `/api/cart/*`
- 订单相关: `/api/order/*`
- 地址相关: `/api/address/*`

## 数据库

项目使用 Redis 作为数据库，连接字符串:

```
redis://default:q647bjz2@petpal-db-redis.ns-t2fco94u.svc:6379
```

## 授权和认证

API 使用基于 JWT 的认证机制。大多数端点需要在请求头中包含一个有效的 JWT 令牌:

```
Authorization: Bearer <token>
``` 