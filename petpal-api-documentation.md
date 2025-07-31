# PetPal API 接口文档

## 📋 版本更新历史

| 版本 | 更新日期 | 更新内容 |
|------|----------|----------|
| v2.3.0 | 2025-07-12 | **医疗功能重构**: 从"在线问诊"调整为"医院广告位展示"，新增医院列表、详情、点击统计API |
| v2.2.0 | 2025-07-11 | **保险功能增强**: 优化保险产品筛选、保单管理、理赔流程API，修复数据格式问题 |
| v2.1.0 | 2025-07-10 | **商品筛选升级**: 完善商品筛选功能，新增价格区间、品牌、分类等多维度筛选API |
| v2.0.0 | 2025-07-09 | **架构优化**: 统一API响应格式，完善错误处理，增强安全认证机制 |

## 🎯 概述

本文档详细描述了PetPal宠物管家应用的所有后端接口，包括请求方式、参数格式、返回值等信息。

### ✨ 最新功能亮点
- **🏥 医院广告位**: 专业宠物医院推荐展示，支持地理位置排序
- **🛡️ 保险产品**: 完整的宠物保险投保、理赔、管理流程
- **🛍️ 智能购物**: 多维度商品筛选，个性化推荐
- **🐾 社区互动**: 宠物社区分享、交流、专家咨询

### 🔧 基础信息

- **API根地址**: `https://udrvmlsoncfg.sealosbja.site`
- **基础URL**: `/api`
- **响应格式**: JSON
- **认证方式**: JWT (Bearer Token)
- **数据库**: Redis
- **前端框架**: uni-app + Vue 3
- **API版本**: v2.3.0

### 🏗️ 技术架构

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   uni-app前端   │───▶│   后端API服务   │───▶│   Redis数据库   │
│  (Vue 3 + TS)   │    │  (RESTful API)  │    │   (缓存+存储)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                        │                        │
         │                        │                        │
    ┌────▼────┐              ┌────▼────┐              ┌────▼────┐
    │ 页面组件 │              │ 业务逻辑 │              │ 数据模型 │
    │ 状态管理 │              │ 中间件  │              │ 索引优化 │
    └─────────┘              └─────────┘              └─────────┘
```

### 🎯 核心特性

- **🔄 智能降级**: API失败时自动降级到Mock数据
- **📱 响应式**: 支持多端适配 (iOS/Android/H5)
- **🔒 安全认证**: JWT + Token刷新机制
- **📊 数据分析**: 用户行为统计和业务数据监控
- **⚡ 高性能**: Redis缓存 + 分页加载
- **🛡️ 容错处理**: 完善的错误处理和重试机制

### 通用响应格式

所有API返回的JSON数据都遵循以下格式:

```json
{
  "code": 200,       // 状态码，200表示成功，其他表示错误
  "message": "xxx",  // 响应消息
  "data": {}         // 响应数据，可能是对象或数组
}
```

### 通用错误码

| 错误码 | 说明 |
|-------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权（未登录或token无效） |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

### 🔐 认证方式

大多数API需要在请求头中包含JWT令牌:

```
Authorization: Bearer {token}
```

## 🚀 快速开始

### 1. 环境准备
```bash
# 克隆项目
git clone [项目地址]

# 安装依赖
npm install

# 配置API地址
# 编辑 src/utils/config.js
export const API_BASE_URL = 'https://udrvmlsoncfg.sealosbja.site/api'
```

### 2. 基础调用示例
```javascript
// 导入API工具
import { request } from '@/utils/request.js'

// 获取商品列表
const getGoodsList = async () => {
  try {
    const response = await request({
      url: '/goods/list',
      method: 'GET',
      params: {
        category: '猫粮',
        page: 1,
        pageSize: 10
      }
    });
    console.log('商品列表:', response.data);
  } catch (error) {
    console.error('请求失败:', error);
  }
};
```

### 3. 认证流程
```javascript
// 用户登录
const login = async (username, password) => {
  const response = await request({
    url: '/user/login',
    method: 'POST',
    data: { username, password }
  });
  
  // 保存token
  uni.setStorageSync('token', response.data.token);
  return response.data;
};
```

### 4. 测试工具
使用内置测试工具验证API功能：
```javascript
// 导入测试工具
import { testAllAPIs } from '@/utils/apiTest.js'

// 运行全面测试
testAllAPIs();
```

## 📑 目录

1. [用户管理相关接口](#用户管理相关接口) - 注册、登录、个人信息管理
2. [宠物管理相关接口](#宠物管理相关接口) - 宠物档案、健康记录管理  
3. [商品相关接口](#商品相关接口) - 商品浏览、搜索、筛选、详情
4. [购物车相关接口](#购物车相关接口) - 购物车管理、结算
5. [订单相关接口](#订单相关接口) - 订单创建、支付、物流跟踪
6. [地址管理接口](#地址管理接口) - 收货地址增删改查
7. [账户工具接口](#账户工具接口) - 积分、优惠券、钱包管理
8. [宠物社区相关接口](#宠物社区相关接口) - 动态发布、互动、关注
9. [宠物保险相关接口](#宠物保险相关接口) - 🆕 保险产品、投保、理赔
10. [宠物医疗相关接口](#宠物医疗相关接口) - 🔄 医院广告位展示（已重构）
11. [咨询服务相关接口](#咨询服务相关接口) - 专家咨询、在线客服
12. [其他接口](#其他接口) - 反馈、帮助、系统配置

### 🔥 重点更新接口
- **医疗接口** (第10节): 从问诊转为医院广告位，支持地理位置筛选
- **保险接口** (第9节): 完整保险流程，多产品类型支持
- **商品接口** (第3节): 智能筛选，价格区间，品牌分类

---

## 用户管理相关接口

### 1. 用户注册

- **接口URL**: `/api/user/register`
- **请求方式**: POST
- **请求头**: 无需认证
- **请求参数**:

  ```json
  {
    "username": "string",  // 用户名，必填
    "password": "string",  // 密码，必填，最少6位
    "phone": "string",     // 手机号，选填
    "email": "string"      // 邮箱，选填
  }
  ```

- **成功响应**:

  ```json
  {
    "code": 200,
    "message": "注册成功",
    "data": {
      "userId": "string",
      "token": "string",
      "isNewUser": true
    }
  }
  ```

- **失败响应**:

  ```json
  {
    "code": 400,
    "message": "用户名已存在",
    "data": null
  }
  ```

  或

  ```json
  {
    "code": 400,
    "message": "密码长度不能少于6位",
    "data": null
  }
  ```

### 2. 用户登录

- **接口URL**: `/api/user/login`
- **请求方式**: POST
- **请求头**: 无需认证
- **请求参数**:

  ```json
  {
    "username": "string",  // 用户名/手机号/邮箱，必填
    "password": "string"   // 密码，必填
  }
  ```

- **成功响应**:

  ```json
  {
    "code": 200,
    "message": "登录成功",
    "data": {
      "userId": "string",
      "token": "string",
      "nickname": "string",
      "avatar": "string",
      "memberLevel": "string",
      "petAvatar": "string"
    }
  }
  ```

- **失败响应**:

  ```json
  {
    "code": 401,
    "message": "用户名或密码错误",
    "data": null
  }
  ```

### 3. 微信登录

- **接口URL**: `/api/user/wxlogin`
- **请求方式**: POST
- **请求头**: 无需认证
- **请求参数**:

  ```json
  {
    "code": "string",  // 微信临时登录凭证，必填
    "userInfo": {      // 用户信息对象，选填
      "nickName": "string",
      "avatarUrl": "string",
      "gender": "number"
    }
  }
  ```

- **成功响应**:

  ```json
  {
    "code": 200,
    "message": "登录成功",
    "data": {
      "userId": "string",
      "token": "string",
      "isNewUser": true  // 是否为新用户
    }
  }
  ```

- **失败响应**:

  ```json
  {
    "code": 400,
    "message": "微信登录凭证不能为空",
    "data": null
  }
  ```

### 4. 获取用户信息

- **接口URL**: `/api/user/info`
- **请求方式**: GET
- **请求头**: 需要认证

  ```
  Authorization: Bearer {token}
  ```

- **请求参数**: 无

- **成功响应**:

  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "userId": "string",
      "nickname": "string",
      "avatar": "string",
      "memberLevel": "string",
      "petAvatar": "string",
      "phone": "string",
      "email": "string",
      "points": "number",
      "coupons": "number"
    }
  }
  ```

- **失败响应**:

  ```json
  {
    "code": 401,
    "message": "未授权，请先登录",
    "data": null
  }
  ```

  或

  ```json
  {
    "code": 404,
    "message": "用户不存在",
    "data": null
  }
  ```

### 5. 修改用户信息

- **接口URL**: `/api/user/update`
- **请求方式**: PUT
- **请求头**: 需要认证

  ```
  Authorization: Bearer {token}
  ```

- **请求参数**:

  ```json
  {
    "nickname": "string",  // 昵称，选填
    "avatar": "string",    // 头像URL，选填
    "phone": "string",     // 手机号，选填
    "email": "string"      // 邮箱，选填
  }
  ```

- **成功响应**:

  ```json
  {
    "code": 200,
    "message": "更新成功",
    "data": {
      "userId": "string",
      "nickname": "string",
      "avatar": "string"
    }
  }
  ```

- **失败响应**:

  ```json
  {
    "code": 401,
    "message": "未授权，请先登录",
    "data": null
  }
  ```

  或

  ```json
  {
    "code": 400,
    "message": "昵称长度应为2-20位",
    "data": null
  }
  ```

### 6. 上传用户头像

- **接口URL**: `/api/user/upload-avatar`
- **请求方式**: POST
- **请求头**: 需要认证

  ```
  Authorization: Bearer {token}
  Content-Type: multipart/form-data
  ```

- **请求参数**:

  ```
  file: (二进制文件)  // 头像图片文件，必填
  ```

- **成功响应**:

  ```json
  {
    "code": 200,
    "message": "上传成功",
    "data": {
      "url": "string"  // 头像URL
    }
  }
  ```

- **失败响应**:

  ```json
  {
    "code": 400,
    "message": "未上传文件",
    "data": null
  }
  ```

  或

  ```json
  {
    "code": 400,
    "message": "不支持的文件类型，仅支持JPG、PNG、GIF和WEBP格式",
    "data": null
  }
  ```

### 7. 用户登出

- **接口URL**: `/api/user/logout`
- **请求方式**: POST
- **请求头**: 需要认证

  ```
  Authorization: Bearer {token}
  ```

- **请求参数**: 无

- **成功响应**:

  ```json
  {
    "code": 200,
    "message": "登出成功"
  }
  ```

- **失败响应**:

  ```json
  {
    "code": 401,
    "message": "未授权，请先登录",
    "data": null
  }
  ```

---

## 宠物管理相关接口

### 1. 获取宠物列表

- **接口URL**: `/api/pet/list`
- **请求方式**: GET
- **请求头**: 需要认证

  ```
  Authorization: Bearer {token}
  ```

- **请求参数**: 无

- **成功响应**:

  ```json
  {
    "code": 200,
    "message": "success",
    "data": [
      {
        "id": "string",
        "name": "string",
        "avatar": "string",
        "type": "string",
        "breed": "string",
        "age": "number",
        "gender": "string",
        "weight": "number",
        "vaccines": ["string"],
        "health": "string"
      }
    ]
  }
  ```

- **失败响应**:

  ```json
  {
    "code": 401,
    "message": "未授权，请先登录",
    "data": null
  }
  ```

### 2. 获取宠物详情

- **接口URL**: `/api/pet/detail/{petId}`
- **请求方式**: GET
- **请求头**: 需要认证

  ```
  Authorization: Bearer {token}
  ```

- **请求参数**: 无

- **成功响应**:

  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "id": "string",
      "name": "string",
      "avatar": "string",
      "type": "string",
      "breed": "string",
      "age": "number",
      "gender": "string",
      "weight": "number",
      "vaccines": ["string"],
      "health": "string"
    }
  }
  ```

- **失败响应**:

  ```json
  {
    "code": 401,
    "message": "未授权，请先登录",
    "data": null
  }
  ```

  或

  ```json
  {
    "code": 404,
    "message": "宠物不存在",
    "data": null
  }
  ```

  或

  ```json
  {
    "code": 403,
    "message": "无权访问该宠物信息",
    "data": null
  }
  ```

### 3. 新增宠物

- **接口URL**: `/api/pet/add`
- **请求方式**: POST
- **请求头**: 需要认证

  ```
  Authorization: Bearer {token}
  ```

- **请求参数**:

  ```json
  {
    "name": "string",       // 宠物名称，必填
    "avatar": "string",     // 宠物头像URL，选填
    "type": "string",       // 宠物类型，必填
    "breed": "string",      // 宠物品种，必填
    "age": "number",        // 宠物年龄，必填
    "gender": "string",     // 宠物性别，必填
    "weight": "number",     // 宠物体重，必填
    "vaccines": ["string"], // 疫苗接种情况，选填
    "health": "string"      // 健康状况，选填
  }
  ```

- **成功响应**:

  ```json
  {
    "code": 200,
    "message": "添加成功",
    "data": {
      "id": "string",
      "name": "string"
    }
  }
  ```

- **失败响应**:

  ```json
  {
    "code": 401,
    "message": "未授权，请先登录",
    "data": null
  }
  ```

  或

  ```json
  {
    "code": 400,
    "message": "宠物名称不能为空",
    "data": null
  }
  ```

### 4. 更新宠物信息

- **接口URL**: `/api/pet/update/{petId}`
- **请求方式**: PUT
- **请求头**: 需要认证

  ```
  Authorization: Bearer {token}
  ```

- **请求参数**:

  ```json
  {
    "name": "string",       // 宠物名称，选填
    "avatar": "string",     // 宠物头像URL，选填
    "type": "string",       // 宠物类型，选填
    "breed": "string",      // 宠物品种，选填
    "age": "number",        // 宠物年龄，选填
    "gender": "string",     // 宠物性别，选填
    "weight": "number",     // 宠物体重，选填
    "vaccines": ["string"], // 疫苗接种情况，选填
    "health": "string"      // 健康状况，选填
  }
  ```

- **成功响应**:

  ```json
  {
    "code": 200,
    "message": "更新成功"
  }
  ```

- **失败响应**:

  ```json
  {
    "code": 401,
    "message": "未授权，请先登录",
    "data": null
  }
  ```

  或

  ```json
  {
    "code": 404,
    "message": "宠物不存在",
    "data": null
  }
  ```

  或

  ```json
  {
    "code": 403,
    "message": "无权修改该宠物信息",
    "data": null
  }
  ```

### 5. 删除宠物

- **接口URL**: `/api/pet/delete/{petId}`
- **请求方式**: DELETE
- **请求头**: 需要认证

  ```
  Authorization: Bearer {token}
  ```

- **请求参数**: 无

- **成功响应**:

  ```json
  {
    "code": 200,
    "message": "删除成功"
  }
  ```

- **失败响应**:

  ```json
  {
    "code": 401,
    "message": "未授权，请先登录",
    "data": null
  }
  ```

  或

  ```json
  {
    "code": 404,
    "message": "宠物不存在",
    "data": null
  }
  ```

  或

  ```json
  {
    "code": 403,
    "message": "无权删除该宠物信息",
    "data": null
  }
  ```

### 6. 上传宠物头像

- **接口URL**: `/api/pet/upload-avatar`
- **请求方式**: POST
- **请求头**: 需要认证

  ```
  Authorization: Bearer {token}
  Content-Type: multipart/form-data
  ```

- **请求参数**:

  ```
  file: (二进制文件)  // 宠物头像图片文件，必填
  ```

- **成功响应**:

  ```json
  {
    "code": 200,
    "message": "上传成功",
    "data": {
      "url": "string"  // 头像URL
    }
  }
  ```

- **失败响应**:

  ```json
  {
    "code": 400,
    "message": "未上传文件",
    "data": null
  }
  ```

  或

  ```json
  {
    "code": 400,
    "message": "不支持的文件类型，仅支持JPG、PNG、GIF和WEBP格式",
    "data": null
  }
  ```

---

## 商品相关接口

**商品分类说明**: 
支持的商品分类包括：`猫粮`、`狗粮`、`玩具`、`零食`、`护毛素`、`猫砂`、`除臭剂`、`沐浴露`

### 1. 获取商品列表

- **接口URL**: `/api/goods/list`
- **请求方式**: GET
- **请求头**: 无需认证
- **请求参数**:

  ```
  category: string (可选，商品类别，支持值: 猫粮/狗粮/玩具/零食/护毛素/猫砂/除臭剂/沐浴露)
  brand: string (可选，品牌)
  keyword: string (可选，搜索关键词)
  minPrice: number (可选，最低价格)
  maxPrice: number (可选，最高价格)
  sortBy: string (可选，排序方式: price_asc/price_desc/sales_desc)
  page: number (可选，默认1)
  pageSize: number (可选，默认10)
  ```

- **成功响应**:

  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "total": "number",
      "items": [
        {
          "id": "number",
          "name": "string",
          "price": "number",
          "sales": "number",
          "image": "string",
          "brand": "string",
          "category": "string"
        }
      ]
    }
  }
  ```

- **失败响应**:

  ```json
  {
    "code": 400,
    "message": "参数错误",
    "data": null
  }
  ```

### 2. 获取商品详情

- **接口URL**: `/api/goods/detail/{goodsId}`
- **请求方式**: GET
- **请求头**: 无需认证
- **请求参数**: 无

- **成功响应**:

  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "id": "number",
      "name": "string",
      "price": "number",
      "sales": "number",
      "brand": "string",
      "category": "string",  // 商品分类，可能值: 猫粮/狗粮/玩具/零食/护毛素/猫砂/除臭剂/沐浴露
      "brief": "string",
      "images": ["string"],
      "specs": ["string"],
      "stock": "number",
      "description": "string"
    }
  }
  ```

- **失败响应**:

  ```json
  {
    "code": 404,
    "message": "商品不存在",
    "data": null
  }
  ```

### 3. 获取热门商品

- **接口URL**: `/api/goods/hot`
- **请求方式**: GET
- **请求头**: 无需认证
- **请求参数**:

  ```
  limit: number (可选，默认5)
  ```

- **成功响应**:

  ```json
  {
    "code": 200,
    "message": "success",
    "data": [
      {
        "id": "number",
        "name": "string",
        "price": "number",
        "sales": "number",
        "image": "string",
        "brand": "string",
        "category": "string"
      }
    ]
  }
  ```

### 4. 商品搜索

- **接口URL**: `/api/goods/search`
- **请求方式**: GET
- **请求头**: 无需认证
- **请求参数**:

  ```
  keyword: string (搜索关键词，必填)
  page: number (可选，默认1)
  pageSize: number (可选，默认10)
  ```

- **成功响应**:

  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "total": "number",
      "items": [
        {
          "id": "number",
          "name": "string",
          "price": "number",
          "sales": "number",
          "image": "string",
          "brand": "string",
          "category": "string"
        }
      ]
    }
  }
  ```

- **失败响应**:

  ```json
  {
    "code": 400,
    "message": "关键词不能为空",
    "data": null
  }
  ```

---

## 购物车相关接口

### 1. 获取购物车列表

- **接口URL**: `/api/cart/list`
- **请求方式**: GET
- **请求头**: 需要认证

  ```
  Authorization: Bearer {token}
  ```

- **请求参数**: 无

- **成功响应**:

  ```json
  {
    "code": 200,
    "message": "success",
    "data": [
      {
        "id": "string",
        "name": "string",
        "price": "number",
        "quantity": "number",
        "total": "number",
        "image": "string"
      }
    ]
  }
  ```

- **失败响应**:

  ```json
  {
    "code": 401,
    "message": "未授权，请先登录",
    "data": null
  }
  ```

### 2. 添加商品到购物车

- **接口URL**: `/api/cart/add`
- **请求方式**: POST
- **请求头**: 需要认证

  ```
  Authorization: Bearer {token}
  ```

- **请求参数**:

  ```json
  {
    "goodsId": "string",  // 商品ID，必填
    "quantity": "number"  // 数量，必填
  }
  ```

- **成功响应**:

  ```json
  {
    "code": 200,
    "message": "添加成功"
  }
  ```

- **失败响应**:

  ```json
  {
    "code": 401,
    "message": "未授权，请先登录",
    "data": null
  }
  ```

### 3. 更新购物车商品数量

- **接口URL**: `/api/cart/update`
- **请求方式**: PUT
- **请求头**: 需要认证

  ```
  Authorization: Bearer {token}
  ```

- **请求参数**:

  ```json
  {
    "goodsId": "string",  // 商品ID，必填
    "quantity": "number"  // 数量，必填
  }
  ```

- **成功响应**:

  ```json
  {
    "code": 200,
    "message": "更新成功"
  }
  ```

- **失败响应**:

  ```json
  {
    "code": 401,
    "message": "未授权，请先登录",
    "data": null
  }
  ```

### 4. 删除购物车商品

- **接口URL**: `/api/cart/delete`
- **请求方式**: DELETE
- **请求头**: 需要认证

  ```
  Authorization: Bearer {token}
  ```

- **请求参数**:

  ```json
  {
    "goodsId": "string"  // 商品ID，必填
  }
  ```

- **成功响应**:

  ```json
  {
    "code": 200,
    "message": "删除成功"
  }
  ```

- **失败响应**:

  ```json
  {
    "code": 401,
    "message": "未授权，请先登录",
    "data": null
  }
  ```

---

## 订单相关接口

### 1. 获取订单列表

- **接口URL**: `/api/order/list`
- **请求方式**: GET
- **请求头**: 需要认证

  ```
  Authorization: Bearer {token}
  ```

- **请求参数**: 无

- **成功响应**:

  ```json
  {
    "code": 200,
    "message": "success",
    "data": [
      {
        "id": "string",
        "status": "string",
        "total": "number",
        "createdAt": "string"
      }
    ]
  }
  ```

- **失败响应**:

  ```json
  {
    "code": 401,
    "message": "未授权，请先登录",
    "data": null
  }
  ```

### 2. 获取订单详情

- **接口URL**: `/api/order/detail/{orderId}`
- **请求方式**: GET
- **请求头**: 需要认证

  ```
  Authorization: Bearer {token}
  ```

- **请求参数**: 无

- **成功响应**:

  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "id": "string",
      "status": "string",
      "total": "number",
      "createdAt": "string",
      "items": [
        {
          "id": "string",
          "name": "string",
          "price": "number",
          "quantity": "number",
          "total": "number"
        }
      ]
    }
  }
  ```

- **失败响应**:

  ```json
  {
    "code": 401,
    "message": "未授权，请先登录",
    "data": null
  }
  ```

  或

  ```json
  {
    "code": 404,
    "message": "订单不存在",
    "data": null
  }
  ```

### 3. 创建订单

- **接口URL**: `/api/order/create`
- **请求方式**: POST
- **请求头**: 需要认证

  ```
  Authorization: Bearer {token}
  ```

- **请求参数**:

  ```json
  {
    "goodsIds": ["string"],  // 商品ID数组，必填
    "addressId": "string"   // 地址ID，必填
  }
  ```

- **成功响应**:

  ```json
  {
    "code": 200,
    "message": "创建成功",
    "data": {
      "id": "string"
    }
  }
  ```

- **失败响应**:

  ```json
  {
    "code": 401,
    "message": "未授权，请先登录",
    "data": null
  }
  ```

  或

  ```json
  {
    "code": 400,
    "message": "商品ID不能为空",
    "data": null
  }
  ```

  或

  ```json
  {
    "code": 400,
    "message": "地址ID不能为空",
    "data": null
  }
  ```

### 4. 取消订单

- **接口URL**: `/api/order/cancel/{orderId}`
- **请求方式**: PUT
- **请求头**: 需要认证

  ```
  Authorization: Bearer {token}
  ```

- **请求参数**: 无

- **成功响应**:

  ```json
  {
    "code": 200,
    "message": "取消成功"
  }
  ```

- **失败响应**:

  ```json
  {
    "code": 401,
    "message": "未授权，请先登录",
    "data": null
  }
  ```

  或

  ```json
  {
    "code": 404,
    "message": "订单不存在",
    "data": null
  }
  ```

### 5. 确认收货

- **接口URL**: `/api/order/confirm/{orderId}`
- **请求方式**: PUT
- **请求头**: 需要认证

  ```
  Authorization: Bearer {token}
  ```

- **请求参数**: 无

- **成功响应**:

  ```json
  {
    "code": 200,
    "message": "确认收货成功"
  }
  ```

- **失败响应**:

  ```json
  {
    "code": 401,
    "message": "未授权，请先登录",
    "data": null
  }
  ```

  或

  ```json
  {
    "code": 404,
    "message": "订单不存在",
    "data": null
  }
  ```

---

## 地址管理接口

### 1. 获取地址列表

- **接口URL**: `/api/address/list`
- **请求方式**: GET
- **请求头**: 需要认证

  ```
  Authorization: Bearer {token}
  ```

- **请求参数**: 无

- **成功响应**:

  ```json
  {
    "code": 200,
    "message": "success",
    "data": [
      {
        "id": "string",
        "name": "string",
        "phone": "string",
        "address": "string"
      }
    ]
  }
  ```

- **失败响应**:

  ```json
  {
    "code": 401,
    "message": "未授权，请先登录",
    "data": null
  }
  ```

### 2. 获取地址详情

- **接口URL**: `/api/address/detail/{addressId}`
- **请求方式**: GET
- **请求头**: 需要认证

  ```
  Authorization: Bearer {token}
  ```

- **请求参数**: 无

- **成功响应**:

  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "id": "string",
      "name": "string",
      "phone": "string",
      "address": "string"
    }
  }
  ```

- **失败响应**:

  ```json
  {
    "code": 401,
    "message": "未授权，请先登录",
    "data": null
  }
  ```

  或

  ```json
  {
    "code": 404,
    "message": "地址不存在",
    "data": null
  }
  ```

### 3. 新增地址

- **接口URL**: `/api/address/add`
- **请求方式**: POST
- **请求头**: 需要认证

  ```
  Authorization: Bearer {token}
  ```

- **请求参数**:

  ```json
  {
    "name": "string",  // 收货人姓名，必填
    "phone": "string",  // 手机号，必填
    "address": "string"  // 地址，必填
  }
  ```

- **成功响应**:

  ```json
  {
    "code": 200,
    "message": "添加成功"
  }
  ```

- **失败响应**:

  ```json
  {
    "code": 401,
    "message": "未授权，请先登录",
    "data": null
  }
  ```

### 4. 修改地址

- **接口URL**: `/api/address/update`
- **请求方式**: PUT
- **请求头**: 需要认证

  ```
  Authorization: Bearer {token}
  ```

- **请求参数**:

  ```json
  {
    "id": "string",  // 地址ID，必填
    "name": "string",  // 收货人姓名，选填
    "phone": "string",  // 手机号，选填
    "address": "string"  // 地址，选填
  }
  ```

- **成功响应**:

  ```json
  {
    "code": 200,
    "message": "更新成功"
  }
  ```

- **失败响应**:

  ```json
  {
    "code": 401,
    "message": "未授权，请先登录",
    "data": null
  }
  ```

### 5. 删除地址

- **接口URL**: `/api/address/delete/{addressId}`
- **请求方式**: DELETE
- **请求头**: 需要认证

  ```
  Authorization: Bearer {token}
  ```

- **请求参数**: 无

- **成功响应**:

  ```json
  {
    "code": 200,
    "message": "删除成功"
  }
  ```

- **失败响应**:

  ```json
  {
    "code": 401,
    "message": "未授权，请先登录",
    "data": null
  }
  ```

  或

  ```json
  {
    "code": 404,
    "message": "地址不存在",
    "data": null
  }
  ```

---

## 账户工具接口

### 1. 获取账户信息

- **接口URL**: `/api/account/info`
- **请求方式**: GET
- **请求头**: 需要认证

  ```
  Authorization: Bearer {token}
  ```

- **请求参数**: 无

- **成功响应**:

  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "userId": "string",
      "nickname": "string",
      "avatar": "string",
      "memberLevel": "string",
      "petAvatar": "string",
      "phone": "string",
      "email": "string",
      "points": "number",
      "coupons": "number"
    }
  }
  ```

- **失败响应**:

  ```json
  {
    "code": 401,
    "message": "未授权，请先登录",
    "data": null
  }
  ```

### 2. 修改账户信息

- **接口URL**: `/api/account/update`
- **请求方式**: PUT
- **请求头**: 需要认证

  ```
  Authorization: Bearer {token}
  ```

- **请求参数**:

  ```json
  {
    "nickname": "string",  // 昵称，选填
    "avatar": "string",    // 头像URL，选填
    "phone": "string",     // 手机号，选填
    "email": "string"      // 邮箱，选填
  }
  ```

- **成功响应**:

  ```json
  {
    "code": 200,
    "message": "更新成功",
    "data": {
      "userId": "string",
      "nickname": "string",
      "avatar": "string"
    }
  }
  ```

- **失败响应**:

  ```json
  {
    "code": 401,
    "message": "未授权，请先登录",
    "data": null
  }
  ```

  或

  ```json
  {
    "code": 400,
    "message": "昵称长度应为2-20位",
    "data": null
  }
  ```

### 3. 上传账户头像

- **接口URL**: `/api/account/upload-avatar`
- **请求方式**: POST
- **请求头**: 需要认证

  ```
  Authorization: Bearer {token}
  Content-Type: multipart/form-data
  ```

- **请求参数**:

  ```
  file: (二进制文件)  // 头像图片文件，必填
  ```

- **成功响应**:

  ```json
  {
    "code": 200,
    "message": "上传成功",
    "data": {
      "url": "string"  // 头像URL
    }
  }
  ```

- **失败响应**:

  ```json
  {
    "code": 400,
    "message": "未上传文件",
    "data": null
  }
  ```

  或

  ```json
  {
    "code": 400,
    "message": "不支持的文件类型，仅支持JPG、PNG、GIF和WEBP格式",
    "data": null
  }
  ```

### 4. 获取账户余额

- **接口URL**: `/api/account/balance`
- **请求方式**: GET
- **请求头**: 需要认证

  ```
  Authorization: Bearer {token}
  ```

- **请求参数**: 无

- **成功响应**:

  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "balance": "number"
    }
  }
  ```

- **失败响应**:

  ```json
  {
    "code": 401,
    "message": "未授权，请先登录",
    "data": null
  }
  ```

### 5. 获取账户积分

- **接口URL**: `/api/account/points`
- **请求方式**: GET
- **请求头**: 需要认证

  ```
  Authorization: Bearer {token}
  ```

- **请求参数**: 无

- **成功响应**:

  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "points": "number"
    }
  }
  ```

- **失败响应**:

  ```json
  {
    "code": 401,
    "message": "未授权，请先登录",
    "data": null
  }
  ```

### 6. 获取账户优惠券

- **接口URL**: `/api/account/coupons`
- **请求方式**: GET
- **请求头**: 需要认证

  ```
  Authorization: Bearer {token}
  ```

- **请求参数**: 无

- **成功响应**:

  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "coupons": "number"
    }
  }
  ```

- **失败响应**:

  ```json
  {
    "code": 401,
    "message": "未授权，请先登录",
    "data": null
  }
  ```

### 7. 获取账户交易记录

- **接口URL**: `/api/account/transactions`
- **请求方式**: GET
- **请求头**: 需要认证

  ```
  Authorization: Bearer {token}
  ```

- **请求参数**:

  ```json
  {
    "page": "number",  // 页码，可选，默认1
    "pageSize": "number"  // 每页数量，可选，默认10
  }
  ```

- **成功响应**:

  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "total": "number",
      "items": [
        {
          "id": "string",
          "amount": "number",
          "type": "string",
          "createdAt": "string"
        }
      ]
    }
  }
  ```

- **失败响应**:

  ```json
  {
    "code": 401,
    "message": "未授权，请先登录",
    "data": null
  }
  ```

### 8. 获取账户推荐人

- **接口URL**: `/api/account/referrer`
- **请求方式**: GET
- **请求头**: 需要认证

  ```
  Authorization: Bearer {token}
  ```

- **请求参数**: 无

- **成功响应**:

  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "referrer": "string"
    }
  }
  ```

- **失败响应**:

  ```json
  {
    "code": 401,
    "message": "未授权，请先登录",
    "data": null
  }
  ```

### 9. 获取账户推荐人列表

- **接口URL**: `/api/account/referrers`
- **请求方式**: GET
- **请求头**: 需要认证

  ```
  Authorization: Bearer {token}
  ```

- **请求参数**:

  ```json
  {
    "page": "number",  // 页码，可选，默认1
    "pageSize": "number"  // 每页数量，可选，默认10
  }
  ```

- **成功响应**:

  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "total": "number",
      "items": [
        {
          "id": "string",
          "name": "string",
          "avatar": "string"
        }
      ]
    }
  }
  ```

- **失败响应**:

  ```json
  {
    "code": 401,
    "message": "未授权，请先登录",
    "data": null
  }
  ```

### 10. 获取账户推荐人关系

- **接口URL**: `/api/account/referrer-relation`
- **请求方式**: GET
- **请求头**: 需要认证

  ```
  Authorization: Bearer {token}
  ```

- **请求参数**: 无

- **成功响应**:

  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "relation": "string"
    }
  }
  ```

- **失败响应**:

  ```json
  {
    "code": 401,
    "message": "未授权，请先登录",
    "data": null
  }
  ```

### 11. 获取账户推荐人关系列表

- **接口URL**: `/api/account/referrer-relations`
- **请求方式**: GET
- **请求头**: 需要认证

  ```
  Authorization: Bearer {token}
  ```

- **请求参数**:

  ```json
  {
    "page": "number",  // 页码，可选，默认1
    "pageSize": "number"  // 每页数量，可选，默认10
  }
  ```

- **成功响应**:

  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "total": "number",
      "items": [
        {
          "id": "string",
          "name": "string",
          "avatar": "string"
        }
      ]
    }
  }
  ```

- **失败响应**:

  ```json
  {
    "code": 401,
    "message": "未授权，请先登录",
    "data": null
  }
  ```

### 12. 获取账户推荐人关系详情

- **接口URL**: `/api/account/referrer-relation-detail`
- **请求方式**: GET
- **请求头**: 需要认证

  ```
  Authorization: Bearer {token}
  ```

- **请求参数**:

  ```json
  {
    "id": "string"  // 关系ID，必填
  }
  ```

- **成功响应**:

  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "relation": "string"
    }
  }
  ```

- **失败响应**:

  ```json
  {
    "code": 401,
    "message": "未授权，请先登录",
    "data": null
  }
  ```

### 13. 获取账户推荐人关系详情列表

- **接口URL**: `/api/account/referrer-relation-details`
- **请求方式**: GET
- **请求头**: 需要认证

  ```
  Authorization: Bearer {token}
  ```

- **请求参数**:

  ```json
  {
    "page": "number",  // 页码，可选，默认1
    "pageSize": "number"  // 每页数量，可选，默认10
  }
  ```

- **成功响应**:

  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "total": "number",
      "items": [
        {
          "id": "string",
          "name": "string",
          "avatar": "string"
        }
      ]
    }
  }
  ```

- **失败响应**:

  ```json
  {
    "code": 401,
    "message": "未授权，请先登录",
    "data": null
  }
  ```

---

## 宠物社区相关接口

### 1. 获取社区动态列表

- **接口URL**: `/api/community/posts`
- **请求方式**: GET
- **请求头**: 需要认证

  ```
  Authorization: Bearer {token}
  ```

- **请求参数**:

  ```json
  {
    "type": "string",      // 内容类型：recommend-推荐，latest-最新，默认为recommend
    "page": "number",      // 页码，默认为1
    "pageSize": "number"   // 每页数量，默认为10
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
          "id": "string",           // 动态ID
          "userId": "string",       // 发布者用户ID
          "username": "string",     // 发布者昵称
          "avatar": "string",       // 发布者头像
          "content": "string",      // 动态内容
          "images": ["string"],     // 图片URL数组
          "publishTime": "string",  // 发布时间
          "likes": "number",        // 点赞数
          "comments": "number",     // 评论数
          "collects": "number",     // 收藏数
          "isLiked": "boolean",     // 当前用户是否已点赞
          "isCollected": "boolean"  // 当前用户是否已收藏
        }
      ],
      "total": "number",            // 总条数
      "hasMore": "boolean"          // 是否还有更多数据
    }
  }
  ```

- **失败响应**:

  ```json
  {
    "code": 401,
    "message": "未授权，请先登录",
    "data": null
  }
  ```

### 2. 发布社区动态

- **接口URL**: `/api/community/posts`
- **请求方式**: POST
- **请求头**: 需要认证

  ```
  Authorization: Bearer {token}
  ```

- **请求参数**:

  ```json
  {
    "content": "string",    // 动态内容，必填（内容和图片至少有一个）
    "images": ["string"]    // 图片URL数组，选填，最多9张
  }
  ```

- **成功响应**:

  ```json
  {
    "code": 200,
    "message": "发布成功",
    "data": {
      "postId": "string"    // 新发布的动态ID
    }
  }
  ```

- **失败响应**:

  ```json
  {
    "code": 401,
    "message": "未授权，请先登录",
    "data": null
  }
  ```

  或

  ```json
  {
    "code": 400,
    "message": "动态内容和图片不能同时为空",
    "data": null
  }
  ```

### 3. 获取动态详情

- **接口URL**: `/api/community/posts/{postId}`
- **请求方式**: GET
- **请求头**: 需要认证

  ```
  Authorization: Bearer {token}
  ```

- **请求参数**: 无

- **成功响应**:

  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "id": "string",           // 动态ID
      "userId": "string",       // 发布者用户ID
      "username": "string",     // 发布者昵称
      "avatar": "string",       // 发布者头像
      "content": "string",      // 动态内容
      "images": ["string"],     // 图片URL数组
      "publishTime": "string",  // 发布时间
      "likes": "number",        // 点赞数
      "comments": "number",     // 评论数
      "collects": "number",     // 收藏数
      "isLiked": "boolean",     // 当前用户是否已点赞
      "isCollected": "boolean"  // 当前用户是否已收藏
    }
  }
  ```

- **失败响应**:

  ```json
  {
    "code": 404,
    "message": "动态不存在",
    "data": null
  }
  ```

### 4. 点赞/取消点赞动态

- **接口URL**: `/api/community/posts/{postId}/like`
- **请求方式**: POST
- **请求头**: 需要认证

  ```
  Authorization: Bearer {token}
  ```

- **请求参数**: 无

- **成功响应**:

  ```json
  {
    "code": 200,
    "message": "操作成功",
    "data": {
      "isLiked": "boolean",    // 当前点赞状态
      "likesCount": "number"   // 当前点赞总数
    }
  }
  ```

- **失败响应**:

  ```json
  {
    "code": 404,
    "message": "动态不存在",
    "data": null
  }
  ```

### 5. 收藏/取消收藏动态

- **接口URL**: `/api/community/posts/{postId}/collect`
- **请求方式**: POST
- **请求头**: 需要认证

  ```
  Authorization: Bearer {token}
  ```

- **请求参数**: 无

- **成功响应**:

  ```json
  {
    "code": 200,
    "message": "操作成功",
    "data": {
      "isCollected": "boolean",   // 当前收藏状态
      "collectsCount": "number"   // 当前收藏总数
    }
  }
  ```

- **失败响应**:

  ```json
  {
    "code": 404,
    "message": "动态不存在",
    "data": null
  }
  ```

### 6. 获取动态评论列表

- **接口URL**: `/api/community/posts/{postId}/comments`
- **请求方式**: GET
- **请求头**: 需要认证

  ```
  Authorization: Bearer {token}
  ```

- **请求参数**:

  ```json
  {
    "page": "number",      // 页码，默认为1
    "pageSize": "number"   // 每页数量，默认为20
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
          "id": "string",         // 评论ID
          "userId": "string",     // 评论者用户ID
          "username": "string",   // 评论者昵称
          "avatar": "string",     // 评论者头像
          "content": "string",    // 评论内容
          "createTime": "string"  // 评论时间
        }
      ],
      "total": "number",          // 总条数
      "hasMore": "boolean"        // 是否还有更多数据
    }
  }
  ```

- **失败响应**:

  ```json
  {
    "code": 404,
    "message": "动态不存在",
    "data": null
  }
  ```

### 7. 发表动态评论

- **接口URL**: `/api/community/posts/{postId}/comments`
- **请求方式**: POST
- **请求头**: 需要认证

  ```
  Authorization: Bearer {token}
  ```

- **请求参数**:

  ```json
  {
    "content": "string"   // 评论内容，必填
  }
  ```

- **成功响应**:

  ```json
  {
    "code": 200,
    "message": "评论成功",
    "data": {
      "commentId": "string"   // 新评论ID
    }
  }
  ```

- **失败响应**:

  ```json
  {
    "code": 400,
    "message": "评论内容不能为空",
    "data": null
  }
  ```

### 8. 删除动态评论

- **接口URL**: `/api/community/comments/{commentId}`
- **请求方式**: DELETE
- **请求头**: 需要认证

  ```
  Authorization: Bearer {token}
  ```

- **请求参数**: 无

- **成功响应**:

  ```json
  {
    "code": 200,
    "message": "删除成功"
  }
  ```

- **失败响应**:

  ```json
  {
    "code": 403,
    "message": "无权删除该评论",
    "data": null
  }
  ```

### 9. 获取我的社区内容

- **接口URL**: `/api/community/my`
- **请求方式**: GET
- **请求头**: 需要认证

  ```
  Authorization: Bearer {token}
  ```

- **请求参数**:

  ```json
  {
    "type": "string",      // 内容类型：posts-我的发布，likes-我的点赞，collects-我的收藏，comments-我的评论
    "page": "number",      // 页码，默认为1
    "pageSize": "number"   // 每页数量，默认为10
  }
  ```

- **成功响应**:

  对于 type="posts"（我的发布）:
  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "list": [
        {
          "id": "string",           // 动态ID
          "content": "string",      // 动态内容
          "images": ["string"],     // 图片URL数组
          "publishTime": "string",  // 发布时间
          "likes": "number",        // 点赞数
          "comments": "number",     // 评论数
          "collects": "number"      // 收藏数
        }
      ],
      "total": "number",
      "hasMore": "boolean"
    }
  }
  ```

  对于 type="likes"/"collects"/"comments"（我的点赞/收藏/评论）:
  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "list": [
        {
          "id": "string",           // 互动记录ID
          "postId": "string",       // 原动态ID
          "title": "string",        // 动态标题（截取内容前部分）
          "summary": "string",      // 动态摘要
          "coverImage": "string",   // 封面图片
          "interactTime": "string", // 互动时间
          "comment": "string"       // 评论内容（仅当type=comments时有此字段）
        }
      ],
      "total": "number",
      "hasMore": "boolean"
    }
  }
  ```

- **失败响应**:

  ```json
  {
    "code": 401,
    "message": "未授权，请先登录",
    "data": null
  }
  ```

### 10. 删除我的动态

- **接口URL**: `/api/community/posts/{postId}`
- **请求方式**: DELETE
- **请求头**: 需要认证

  ```
  Authorization: Bearer {token}
  ```

- **请求参数**: 无

- **成功响应**:

  ```json
  {
    "code": 200,
    "message": "删除成功"
  }
  ```

- **失败响应**:

  ```json
  {
    "code": 403,
    "message": "无权删除该动态",
    "data": null
  }
  ```

  或

  ```json
  {
    "code": 404,
    "message": "动态不存在",
    "data": null
  }
  ```

### 11. 编辑我的动态

- **接口URL**: `/api/community/posts/{postId}`
- **请求方式**: PUT
- **请求头**: 需要认证

  ```
  Authorization: Bearer {token}
  ```

- **请求参数**:

  ```json
  {
    "content": "string",    // 动态内容，选填
    "images": ["string"]    // 图片URL数组，选填
  }
  ```

- **成功响应**:

  ```json
  {
    "code": 200,
    "message": "更新成功"
  }
  ```

- **失败响应**:

  ```json
  {
    "code": 403,
    "message": "无权编辑该动态",
    "data": null
  }
  ```

### 12. 删除我的社区互动记录

- **接口URL**: `/api/community/my/{type}/{recordId}`
- **请求方式**: DELETE
- **请求头**: 需要认证

  ```
  Authorization: Bearer {token}
  ```

- **请求参数**: 
  - type: 互动类型（likes/collects/comments）
  - recordId: 记录ID

- **成功响应**:

  ```json
  {
    "code": 200,
    "message": "删除成功"
  }
  ```

- **失败响应**:

  ```json
  {
    "code": 404,
    "message": "记录不存在",
    "data": null
  }
  ```

---

## 宠物保险相关接口

### 1. 获取保险产品列表

- **接口URL**: `/api/insurance/products`
- **请求方式**: GET
- **请求头**: 可选认证（获取个性化推荐时需要）
- **请求参数**:

  ```json
  {
    "page": 1,                    // 页码，默认1
    "pageSize": 10,               // 每页数量，默认10
    "petType": "string",          // 宠物类型：dog/cat/other，可选
    "ageRange": "string",         // 年龄范围：0-1/1-3/3-8/8+，可选
    "priceRange": "string",       // 价格范围：0-500/500-1000/1000-2000/2000+，可选
    "sortBy": "string"            // 排序方式：price_asc/price_desc/popularity/rating，默认popularity
  }
  ```

- **成功响应**:

  ```json
  {
    "code": 200,
    "message": "获取成功",
    "data": {
      "list": [
        {
          "id": "string",
          "name": "string",           // 保险产品名称
          "company": "string",        // 保险公司
          "coverage": "string",       // 保障范围描述
          "price": 899,               // 年保费
          "originalPrice": 1099,      // 原价
          "petTypes": ["dog", "cat"], // 适用宠物类型
          "type": "medical",          // 保险类型：medical/accident/comprehensive/liability
          "image": "string",          // 产品图片URL
          "tags": ["热门", "性价比"], // 标签
          "period": "1年",            // 保障期限
          "rating": 4.8,              // 评分
          "salesCount": 1520          // 销量
        }
      ],
      "total": 100,
      "hasMore": true
    }
  }
  ```

### 2. 获取保险产品详情

- **接口URL**: `/api/insurance/products/{productId}`
- **请求方式**: GET
- **请求头**: 可选认证
- **路径参数**:
  - `productId`: 产品ID

- **成功响应**:

  ```json
  {
    "code": 200,
    "message": "获取成功",
    "data": {
      "id": "string",
      "name": "string",
      "company": "string",
      "coverage": "string",
      "price": 899,
      "originalPrice": 1099,
      "petTypes": ["dog", "cat"],
      "type": "medical",
      "image": "string",
      "tags": ["热门", "性价比"],
      "period": "1年",
      "rating": 4.8,
      "salesCount": 1520,
      "description": "string",      // 详细描述
      "coverageDetails": [          // 保障详情
        {
          "item": "意外伤害",
          "limit": "20万",
          "description": "因意外事故导致的医疗费用"
        }
      ],
      "terms": [                    // 保险条款
        {
          "title": "投保须知",
          "content": "详细条款内容..."
        }
      ],
      "claimProcess": [             // 理赔流程
        {
          "step": 1,
          "title": "报案",
          "description": "48小时内联系客服报案"
        }
      ],
      "faqs": [                     // 常见问题
        {
          "question": "理赔需要什么材料？",
          "answer": "需要提供医疗发票、病历等材料"
        }
      ]
    }
  }
  ```

### 3. 获取保险报价

- **接口URL**: `/api/insurance/quote`
- **请求方式**: POST
- **请求头**: 需要认证
- **请求参数**:

  ```json
  {
    "productId": "string",        // 产品ID，必填
    "petType": "dog",             // 宠物类型，必填
    "petAge": 3,                  // 宠物年龄，必填
    "petBreed": "string",         // 宠物品种，必填
    "isNeutered": true,           // 是否绝育，必填
    "coverageOptions": [          // 保障选项，可选
      {
        "type": "medical",
        "limit": "20万"
      }
    ]
  }
  ```

- **成功响应**:

  ```json
  {
    "code": 200,
    "message": "报价成功",
    "data": {
      "basePrice": 899,            // 基础保费
      "adjustments": [             // 调整项目
        {
          "factor": "age",
          "adjustment": 50,
          "description": "年龄调整"
        }
      ],
      "finalPrice": 949,           // 最终保费
      "validUntil": "2024-01-15T10:00:00Z"  // 报价有效期
    }
  }
  ```

### 4. 购买保险

- **接口URL**: `/api/insurance/purchase`
- **请求方式**: POST
- **请求头**: 需要认证
- **请求参数**:

  ```json
  {
    "productId": "string",        // 产品ID，必填
    "petId": "string",            // 宠物ID，必填
    "coverageOptions": [          // 保障选项，必填
      {
        "type": "medical",
        "limit": "20万"
      }
    ],
    "paymentMethod": "alipay",    // 支付方式：alipay/wechat/card，必填
    "contactInfo": {              // 联系信息，必填
      "name": "string",
      "phone": "string",
      "email": "string"
    }
  }
  ```

- **成功响应**:

  ```json
  {
    "code": 200,
    "message": "购买成功",
    "data": {
      "policyId": "string",       // 保单ID
      "orderNo": "string",        // 订单号
      "paymentUrl": "string"      // 支付链接（如需跳转支付）
    }
  }
  ```

### 5. 获取我的保单列表

- **接口URL**: `/api/insurance/policies/my`
- **请求方式**: GET
- **请求头**: 需要认证
- **请求参数**:

  ```json
  {
    "page": 1,                    // 页码，默认1
    "pageSize": 10,               // 每页数量，默认10
    "status": "string"            // 保单状态：active/expired/cancelled，可选
  }
  ```

- **成功响应**:

  ```json
  {
    "code": 200,
    "message": "获取成功",
    "data": {
      "list": [
        {
          "policyId": "string",
          "productName": "string",
          "company": "string",
          "petName": "string",
          "petType": "dog",
          "status": "active",       // 保单状态：active/expired/cancelled
          "startDate": "2024-01-01",
          "endDate": "2024-12-31",
          "premium": 899,
          "coverageLimit": "20万",
          "claimsUsed": "1万"
        }
      ],
      "total": 5
    }
  }
  ```

### 6. 获取保单详情

- **接口URL**: `/api/insurance/policies/{policyId}`
- **请求方式**: GET
- **请求头**: 需要认证
- **路径参数**:
  - `policyId`: 保单ID

- **成功响应**:

  ```json
  {
    "code": 200,
    "message": "获取成功",
    "data": {
      "policyId": "string",
      "orderNo": "string",
      "productName": "string",
      "company": "string",
      "petInfo": {
        "name": "string",
        "type": "dog",
        "breed": "string",
        "age": 3
      },
      "status": "active",
      "startDate": "2024-01-01",
      "endDate": "2024-12-31",
      "premium": 899,
      "coverageDetails": [
        {
          "item": "意外伤害",
          "limit": "20万",
          "used": "0"
        }
      ],
      "contactInfo": {
        "name": "string",
        "phone": "string",
        "email": "string"
      },
      "claimHistory": [
        {
          "claimId": "string",
          "date": "2024-01-15",
          "amount": 5000,
          "status": "approved",
          "description": "感冒治疗"
        }
      ]
    }
  }
  ```

### 7. 提交理赔申请

- **接口URL**: `/api/insurance/claims`
- **请求方式**: POST
- **请求头**: 需要认证
- **请求参数**:

  ```json
  {
    "policyId": "string",         // 保单ID，必填
    "incidentDate": "2024-01-15", // 事故日期，必填
    "incidentType": "illness",    // 事故类型：accident/illness/surgery，必填
    "description": "string",      // 事故描述，必填
    "claimAmount": 5000,          // 理赔金额，必填
    "documents": [                // 相关文件，必填
      {
        "type": "invoice",        // 文件类型：invoice/medical_record/photo
        "url": "string",          // 文件URL
        "name": "string"          // 文件名
      }
    ],
    "veterinaryInfo": {           // 兽医信息，必填
      "name": "string",
      "hospital": "string",
      "phone": "string",
      "license": "string"
    }
  }
  ```

- **成功响应**:

  ```json
  {
    "code": 200,
    "message": "提交成功",
    "data": {
      "claimId": "string",        // 理赔ID
      "claimNo": "string",        // 理赔编号
      "estimatedDays": 7          // 预计处理天数
    }
  }
  ```

### 8. 获取理赔记录

- **接口URL**: `/api/insurance/claims/my`
- **请求方式**: GET
- **请求头**: 需要认证

  ```
  Authorization: Bearer {token}
  ```

- **请求参数**:

  ```json
  {
    "page": 1,                    // 页码，默认1
    "pageSize": 10,               // 每页数量，默认10
    "status": "string",           // 理赔状态：pending/approved/rejected/processing，可选
    "policyId": "string"          // 保单ID，可选
  }
  ```

- **成功响应**:

  ```json
  {
    "code": 200,
    "message": "获取成功",
    "data": {
      "list": [
        {
          "claimId": "string",
          "claimNo": "string",
          "policyId": "string",
          "productName": "string",
          "incidentDate": "2024-01-15",
          "submitDate": "2024-01-16",
          "amount": 5000,
          "approvedAmount": 4500,
          "status": "approved",     // pending/approved/rejected/processing
          "statusText": "已赔付",
          "description": "感冒治疗",
          "processedDate": "2024-01-20"
        }
      ],
      "total": 3
    }
  }
  ```

### 9. 获取理赔详情

- **接口URL**: `/api/insurance/claims/{claimId}`
- **请求方式**: GET
- **请求头**: 需要认证
- **路径参数**:
  - `claimId`: 理赔ID

- **成功响应**:

  ```json
  {
    "code": 200,
    "message": "获取成功",
    "data": {
      "claimId": "string",
      "claimNo": "string",
      "policyInfo": {
        "policyId": "string",
        "productName": "string",
        "company": "string"
      },
      "incidentDate": "2024-01-15",
      "submitDate": "2024-01-16",
      "incidentType": "illness",
      "description": "感冒治疗",
      "amount": 5000,
      "approvedAmount": 4500,
      "status": "approved",
      "statusText": "已赔付",
      "processedDate": "2024-01-20",
      "documents": [
        {
          "type": "invoice",
          "url": "string",
          "name": "string"
        }
      ],
      "veterinaryInfo": {
       
        "name": "string",
        "hospital": "string",
        "phone": "string"
      },
      "processHistory": [
        {
          "date": "2024-01-16",
          "status": "submitted",
          "description": "理赔申请已提交"
        },
        {
          "date": "2024-01-18",
          "status": "reviewing",
          "description": "正在审核材料"
        },
        {
          "date": "2024-01-20",
          "status": "approved",
          "description": "审核通过，赔款已发放"
        }
      ]
    }
  }
  ```

### 10. 续保

- **接口URL**: `/api/insurance/policies/renew`
- **请求方式**: POST
- **请求头**: 需要认证
- **请求参数**:

  ```json
  {
    "policyId": "string",         // 保单ID，必填
    "coverageOptions": [          // 保障选项，可选（保持原有或修改）
      {
        "type": "medical",
        "limit": "30万"           // 可以调整保障额度
      }
    ],
    "paymentMethod": "alipay"     // 支付方式，必填
  }
  ```

- **成功响应**:

  ```json
  {
    "code": 200,
    "message": "续保成功",
    "data": {
      "newPolicyId": "string",    // 新保单ID
      "orderNo": "string",        // 订单号
      "premium": 899,             // 续保保费
      "startDate": "2025-01-01",  // 新保单开始日期
      "endDate": "2025-12-31",    // 新保单结束日期
      "paymentUrl": "string"      // 支付链接（如需跳转支付）
    }
  }
  ```

### 11. 取消保单

- **接口URL**: `/api/insurance/policies/cancel`
- **请求方式**: POST
- **请求头**: 需要认证
- **请求参数**:

  ```json
  {
    "policyId": "string",         // 保单ID，必填
    "reason": "string",           // 取消原因，必填
    "cancellationType": "immediate" // 取消类型：immediate/end_of_term，必填
  }
  ```

- **成功响应**:

  ```json
  {
    "code": 200,
    "message": "取消成功",
    "data": {
      "refundAmount": 450,        // 退款金额
      "cancelDate": "2024-01-20", // 取消生效日期
      "refundDate": "2024-01-25"  // 预计退款到账日期
    }
  }
  ```

---

## 🏥 宠物医疗相关接口

### 📋 功能概述

**重要变更**: 医疗功能已从"在线问诊"重构为"医院广告位展示"，专注于为用户提供优质宠物医院推荐。

**当前功能**:
- ✅ **医院展示**: 展示合作医院的基本信息和服务
- ✅ **地理筛选**: 基于用户位置的距离排序
- ✅ **搜索功能**: 按医院名称、地址、服务类型搜索
- ✅ **点击统计**: 记录广告位点击数据用于效果分析

**技术特点**:
- 🔓 无需认证的公开接口，便于集成
- 📍 支持GPS定位和距离计算
- 📊 内置数据统计和分析功能
- 🔄 Mock数据降级，确保服务可用性

### 🗂️ 数据库表结构参考

```sql
-- 医院信息表
CREATE TABLE hospitals (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  address TEXT NOT NULL,
  phone VARCHAR(50),
  rating DECIMAL(3,2),
  review_count INT DEFAULT 0,
  services TEXT,
  website VARCHAR(500),
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  ad_position INT,
  click_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 点击统计表
CREATE TABLE hospital_clicks (
  id VARCHAR(50) PRIMARY KEY,
  hospital_id VARCHAR(50),
  source VARCHAR(50),
  user_agent TEXT,
  ip_address VARCHAR(50),
  clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 1. 获取医院广告位列表

- **接口URL**: `/api/medical/hospitals`
- **请求方式**: GET
- **请求头**: 无需认证（公开广告位）
- **请求参数**:

  ```json
  {
    "page": 1,                    // 页码，默认1
    "pageSize": 10,               // 每页数量，默认10
    "keyword": "string",          // 搜索关键词（医院名称或地址），可选
    "city": "string",             // 城市筛选，可选
    "district": "string",         // 区域，可选
    "latitude": 31.2304,          // 纬度，可选（用于距离排序）
    "longitude": 121.4737,        // 经度，可选（用于距离排序）
    "sortBy": "rating"            // 排序方式：rating/name/distance，默认rating
  }
  ```

- **成功响应**:

  ```json
  {
    "code": 200,
    "message": "获取成功",
    "data": {
      "list": [
        {
          "id": "string",
          "name": "香港宠物医院",     // 医院名称
          "address": "香港中环干诺道中200号", // 地址
          "phone": "+852 2234 5678",  // 电话
          "rating": 4.9,              // 评分
          "reviewCount": 520,         // 评价数量
          "services": "内科、外科、急诊、体检", // 服务项目
          "image": "string",          // 医院图片URL
          "website": "string",        // 医院官网地址
          "isRecommended": true,      // 是否推荐医院
          "adPosition": 1,            // 广告位位置
          "clickCount": 1250,         // 点击次数（可选）
          "distance": "1.2km",        // 距离（如提供了位置信息）
          "tags": ["24小时", "专业"],  // 标签
          "workingHours": "09:00-18:00", // 营业时间
          "isOpen": true              // 当前是否营业
        }
      ],
      "total": 50,
      "page": 1,
      "pageSize": 10
    }
  }
  ```

### 2. 获取医院详情

- **接口URL**: `/api/medical/hospitals/{hospitalId}`
- **请求方式**: GET
- **请求头**: 无需认证
- **路径参数**:
  - `hospitalId`: 医院ID

- **成功响应**:

  ```json
  {
    "code": 200,
    "message": "获取成功",
    "data": {
      "id": "string",
      "name": "香港宠物医院",
      "address": "香港中环干诺道中200号",
      "phone": "+852 2234 5678",
      "rating": 4.9,
      "reviewCount": 520,
      "services": "内科、外科、急诊、体检",
      "website": "https://www.hkpethospital.com",
      "images": [                 // 医院图片数组
        "string"
      ],
      "description": "专业的宠物医疗服务机构...",
      "workingHours": {
        "monday": "09:00-18:00",
        "tuesday": "09:00-18:00",
        "wednesday": "09:00-18:00",
        "thursday": "09:00-18:00",
        "friday": "09:00-18:00",
        "saturday": "09:00-17:00",
        "sunday": "10:00-16:00"
      },
      "location": {
        "latitude": 22.2810,
        "longitude": 114.1590
      },
      "facilities": [             // 设施设备
        "X光机", "B超设备", "手术室"
      ],
      "specialties": [            // 专业领域
        "小动物内科", "外科手术", "影像诊断"
      ],
      "isRecommended": true,      // 是否推荐医院
      "adPosition": 1,            // 广告位位置
      "clickCount": 1250          // 点击次数
    }
  }
  ```

### 3. 记录医院广告位点击

- **接口URL**: `/api/medical/hospitals/{hospitalId}/click`
- **请求方式**: POST
- **请求头**: 无需认证
- **路径参数**:
  - `hospitalId`: 医院ID
- **请求参数**:

  ```json
  {
    "source": "list",             // 点击来源：list/detail/homepage
    "userAgent": "string"         // 用户代理信息（可选）
  }
  ```

- **成功响应**:

  ```json
  {
    "code": 200,
    "message": "记录成功",
    "data": {
      "clickCount": 1251          // 更新后的点击次数
    }
  }
  ```

---

**下方接口为扩展功能，当前版本暂不实现**
        "X光机", "B超设备", "手术室"
      ],
      "services": [               // 详细服务列表
        {
          "category": "诊疗服务",
          "items": [
            {
              "name": "常规检查",
              "price": "100-200元",
              "description": "基础健康检查"
            }
          ]
        }
      ],
      "doctors": [                // 医生信息
        {
          "id": "string",
          "name": "string",
          "title": "主治兽医师",
          "specialty": "内科",
          "experience": "10年",
          "image": "string"
        }
      ],
      "workingHours": {
        "monday": "09:00-18:00",
        "tuesday": "09:00-18:00",
        "emergency": "24小时"
      },
      "location": {
        "latitude": 31.2304,
        "longitude": 121.4737
      },
      "reviews": [                // 评价（最新几条）
        {
          "userId": "string",
          "userName": "用户***",
          "rating": 5,
          "content": "服务很好，医生专业",
          "date": "2024-01-15",
          "images": ["string"]
        }
      ]
    }
  }
  ```

### 4. 预约医疗服务（扩展功能）

- **接口URL**: `/api/medical/appointments`
- **请求方式**: POST
- **请求头**: 需要认证
- **请求参数**:

  ```json
  {
    "hospitalId": "string",       // 医疗机构ID，必填
    "doctorId": "string",         // 医生ID，可选
    "serviceType": "checkup",     // 服务类型：checkup/vaccination/surgery/emergency，必填
    "petId": "string",            // 宠物ID，必填
    "appointmentDate": "2024-01-20", // 预约日期，必填
    "appointmentTime": "10:00",   // 预约时间，必填
    "symptoms": "string",         // 症状描述，可选
    "notes": "string",            // 备注，可选
    "contactPhone": "string"      // 联系电话，必填
  }
  ```

- **成功响应**:

  ```json
  {
    "code": 200,
    "message": "预约成功",
    "data": {
      "appointmentId": "string",  // 预约ID
      "appointmentNo": "string",  // 预约编号
      "queueNumber": 15,          // 排队号码
      "estimatedTime": "10:30"    // 预计就诊时间
    }
  }
  ```

### 5. 获取我的预约记录

- **接口URL**: `/api/medical/appointments/my`
- **请求方式**: GET
- **请求头**: 需要认证
- **请求参数**:

  ```json
  {
    "page": 1,                    // 页码，默认1
    "pageSize": 10,               // 每页数量，默认10
    "status": "string"            // 预约状态：pending/confirmed/completed/cancelled，可选
  }
  ```

- **成功响应**:

  ```json
  {
    "code": 200,
    "message": "获取成功",
    "data": {
      "list": [
        {
          "appointmentId": "string",
          "appointmentNo": "string",
          "hospitalName": "string",
          "doctorName": "string",
          "petName": "string",
          "serviceType": "checkup",
          "appointmentDate": "2024-01-20",
          "appointmentTime": "10:00",
          "status": "confirmed",    // pending/confirmed/completed/cancelled
          "statusText": "已确认",
          "symptoms": "string",
          "queueNumber": 15
        }
      ],
      "total": 8
    }
  }
  ```

### 6. 取消预约

- **接口URL**: `/api/medical/appointments/{appointmentId}/cancel`
- **请求方式**: POST
- **请求头**: 需要认证
- **路径参数**:
  - `appointmentId`: 预约ID
- **请求参数**:

  ```json
  {
    "reason": "string"            // 取消原因，可选
  }
  ```

- **成功响应**:

  ```json
  {
    "code": 200,
    "message": "取消成功",
    "data": {
      "refundAmount": 0           // 退款金额（如有预付费）
    }
  }
  ```

### 7. 获取医疗记录

- **接口URL**: `/api/medical/records`
- **请求方式**: GET
- **请求头**: 需要认证
- **请求参数**:

  ```json
  {
    "petId": "string",            // 宠物ID，可选
    "page": 1,                    // 页码，默认1
    "pageSize": 10,               // 每页数量，默认10
    "startDate": "2024-01-01",    // 开始日期，可选
    "endDate": "2024-12-31"       // 结束日期，可选
  }
  ```

- **成功响应**:

  ```json
  {
    "code": 200,
    "message": "获取成功",
    "data": {
      "list": [
        {
          "recordId": "string",
          "appointmentId": "string",
          "petName": "string",
          "hospitalName": "string",
          "doctorName": "string",
          "visitDate": "2024-01-20",
          "diagnosis": "string",    // 诊断结果
          "treatment": "string",    // 治疗方案
          "medications": [          // 用药记录
            {
              "name": "消炎药",
              "dosage": "每日2次",
              "duration": "7天"
            }
          ],
          "cost": 350,              // 费用
          "nextVisit": "2024-01-27", // 复诊日期
          "notes": "string",        // 医生备注
          "attachments": [          // 附件（化验单、X光片等）
            {
              "type": "lab_report",
              "url": "string",
              "name": "blood_test.pdf"
            }
          ]
        }
      ],
      "total": 15
    }
  }
  ```

### 8. 获取疫苗记录

- **接口URL**: `/api/medical/vaccinations`
- **请求方式**: GET
- **请求头**: 需要认证
- **请求参数**:

  ```json
  {
    "petId": "string",            // 宠物ID，必填
    "page": 1,                    // 页码，默认1
    "pageSize": 10                // 每页数量，默认10
  }
  ```

- **成功响应**:

  ```json
  {
    "code": 200,
    "message": "获取成功",
    "data": {
      "list": [
        {
          "vaccinationId": "string",
          "vaccineName": "狂犬疫苗",
          "brand": "瑞辉",
          "batchNumber": "20240101",
          "vaccinationDate": "2024-01-15",
          "expiryDate": "2025-01-15",
          "nextDueDate": "2025-01-15",
          "hospitalName": "string",
          "doctorName": "string",
          "cost": 120,
          "certificate": "string",   // 疫苗证书URL
          "notes": "string"
        }
      ],
      "total": 6,
      "upcoming": [                 // 即将到期的疫苗
        {
          "vaccineName": "狂犬疫苗",
          "dueDate": "2024-02-15",
          "daysLeft": 15
        }
      ]
    }
  }
  ```

### 9. 添加疫苗记录

- **接口URL**: `/api/medical/vaccinations`
- **请求方式**: POST
- **请求头**: 需要认证
- **请求参数**:

  ```json
  {
    "petId": "string",            // 宠物ID，必填
    "vaccineName": "string",      // 疫苗名称，必填
    "brand": "string",            // 品牌，可选
    "batchNumber": "string",      // 批次号，可选
    "vaccinationDate": "2024-01-15", // 接种日期，必填
    "expiryDate": "2025-01-15",   // 有效期至，可选
    "nextDueDate": "2025-01-15",  // 下次接种日期，可选
    "hospitalName": "string",     // 医院名称，可选
    "doctorName": "string",       // 医生姓名，可选
    "cost": 120,                  // 费用，可选
    "certificate": "string",      // 疫苗证书URL，可选
    "notes": "string"             // 备注，可选
  }
  ```

- **成功响应**:

  ```json
  {
    "code": 200,
    "message": "添加成功",
    "data": {
      "vaccinationId": "string"
    }
  }
  ```

---

## 咨询服务相关接口

### 1. 获取在线咨询服务列表

- **接口URL**: `/api/consult/services`
- **请求方式**: GET
- **请求头**: 可选认证
- **请求参数**:

  ```json
  {
    "type": "string",             // 咨询类型：health/behavior/nutrition/emergency，可选
    "specialty": "string",        // 专业领域：dog/cat/exotic/all，可选
    "sortBy": "rating"            // 排序方式：rating/price/experience，默认rating
  }
  ```

- **成功响应**:

  ```json
  {
    "code": 200,
    "message": "获取成功",
    "data": {
      "list": [
        {
          "doctorId": "string",
          "name": "string",         // 医生姓名
          "title": "高级兽医师",    // 职称
          "hospital": "string",     // 所属医院
          "specialty": ["犬科", "猫科"], // 专业领域
          "experience": "15年",     // 从业经验
          "rating": 4.9,            // 评分
          "reviewCount": 1520,      // 咨询次数
          "avatar": "string",       // 头像
          "description": "string",  // 个人简介
          "consultPrice": 50,       // 图文咨询价格
          "videoPrice": 100,        // 视频咨询价格
          "responseTime": "5分钟内", // 平均响应时间
          "isOnline": true,         // 是否在线
          "consultTypes": ["text", "video"] // 支持的咨询方式
        }
      ]
    }
  }
  ```

### 2. 获取医生详情

- **接口URL**: `/api/consult/doctors/{doctorId}`
- **请求方式**: GET
- **请求头**: 可选认证
- **路径参数**:
  - `doctorId`: 医生ID

- **成功响应**:

  ```json
  {
    "code": 200,
    "message": "获取成功",
    "data": {
      "doctorId": "string",
      "name": "string",
      "title": "高级兽医师",
      "hospital": "string",
      "department": "内科",
      "specialty": ["犬科", "猫科"],
      "experience": "15年",
      "rating": 4.9,
      "reviewCount": 1520,
      "avatar": "string",
      "description": "string",
      "education": [              // 教育背景
        {
          "degree": "兽医学博士",
          "school": "中国农业大学",
          "year": "2008"
        }
      ],
      "certifications": [        // 资质证书
        "执业兽医师资格证",
        "小动物内科专科医师"
      ],
      "consultPrice": 50,
      "videoPrice": 100,
      "responseTime": "5分钟内",
      "isOnline": true,
      "workingHours": "09:00-18:00",
      "consultTypes": ["text", "video"],
      "goodAt": [                // 擅长领域
        "宠物内科疾病诊治",
        "营养健康管理",
        "疫苗接种指导"
      ],
      "recentReviews": [         // 最近评价
        {
          "userId": "string",
          "userName": "用户***",
          "rating": 5,
          "content": "服务很好，医生专业",
          "date": "2024-01-15"
        }
      ]
    }
  }
  ```

### 3. 发起咨询

- **接口URL**: `/api/consult/sessions`
- **请求方式**: POST
- **请求头**: 需要认证
- **请求参数**:

  ```json
  {
    "doctorId": "string",         // 医生ID，必填
    "type": "text",               // 咨询类型：text/video，必填
    "petId": "string",            // 宠物ID，必填
    "problem": "string",          // 问题描述，必填
    "symptoms": [                 // 症状（可选）
      "食欲不振", "精神萎靡"
    ],
    "images": ["string"],         // 相关图片，可选
    "urgency": "normal"           // 紧急程度：normal/urgent/emergency，默认normal
  }
  ```

- **成功响应**:

  ```json
  {
    "code": 200,
    "message": "咨询发起成功",
    "data": {
      "sessionId": "string",      // 咨询会话ID
      "orderId": "string",        // 订单ID
      "estimatedTime": "5分钟",   // 预计响应时间
      "paymentRequired": true,    // 是否需要支付
      "amount": 50,               // 咨询费用
      "paymentUrl": "string"      // 支付链接（如需支付）
    }
  }
  ```

### 4. 获取我的咨询记录

- **接口URL**: `/api/consult/sessions/my`
- **请求方式**: GET
- **请求头**: 需要认证
- **请求参数**:

  ```json
  {
    "page": 1,                    // 页码，默认1
    "pageSize": 10,               // 每页数量，默认10
    "status": "string"            // 状态：waiting/ongoing/completed/cancelled，可选
  }
  ```

- **成功响应**:

  ```json
  {
    "code": 200,
    "message": "获取成功",
    "data": {
      "list": [
        {
          "sessionId": "string",
          "orderId": "string",
          "doctorName": "string",
          "doctorAvatar": "string",
          "petName": "string",
          "type": "text",
          "problem": "string",
          "status": "completed",    // waiting/ongoing/completed/cancelled
          "statusText": "已完成",
          "createTime": "2024-01-15T10:00:00Z",
          "lastMessageTime": "2024-01-15T11:30:00Z",
          "duration": "1小时30分钟",
          "rating": 5,              // 用户评分（如已评价）
          "amount": 50
        }
      ],
      "total": 12
    }
  }
  ```

### 5. 获取咨询会话详情

- **接口URL**: `/api/consult/sessions/{sessionId}`
- **请求方式**: GET
- **请求头**: 需要认证
- **路径参数**:
  - `sessionId`: 会话ID

- **成功响应**:

  ```json
  {
    "code": 200,
    "message": "获取成功",
    "data": {
      "sessionId": "string",
      "orderId": "string",
      "doctorInfo": {
        "doctorId": "string",
        "name": "string",
        "title": "高级兽医师",
        "avatar": "string",
        "hospital": "string"
      },
      "petInfo": {
        "petId": "string",
        "name": "string",
        "type": "dog",
        "breed": "金毛",
        "age": 3
      },
      "type": "text",
      "problem": "string",
      "symptoms": ["食欲不振"],
      "status": "completed",
      "createTime": "2024-01-15T10:00:00Z",
      "endTime": "2024-01-15T11:30:00Z",
      "amount": 50,
      "messages": [               // 消息记录
        {
          "messageId": "string",
          "sender": "user",       // user/doctor
          "type": "text",         // text/image/audio
          "content": "string",
          "timestamp": "2024-01-15T10:05:00Z",
          "isRead": true
        }
      ],
      "prescription": {           // 处方建议（如有）
        "medications": [
          {
            "name": "宠物消炎药",
            "dosage": "每日2次，每次半片",
            "duration": "7天"
          }
        ],
        "advice": "建议多休息，观察48小时",
        "followUp": "如症状持续请及时就医"
      },
      "rating": 5,                // 用户评分
      "review": "医生很专业"      // 用户评价
    }
  }
  ```

### 6. 发送消息

- **接口URL**: `/api/consult/sessions/{sessionId}/messages`
- **请求方式**: POST
- **请求头**: 需要认证
- **路径参数**:
  - `sessionId`: 会话ID
- **请求参数**:

  ```json
  {
    "type": "text",               // 消息类型：text/image/audio，必填
    "content": "string",          // 消息内容，必填
    "url": "string"               // 媒体文件URL（图片/音频时需要）
  }
  ```

- **成功响应**:

  ```json
  {
    "code": 200,
    "message": "发送成功",
    "data": {
      "messageId": "string",
      "timestamp": "2024-01-15T10:05:00Z"
    }
  }
  ```

### 7. 结束咨询

- **接口URL**: `/api/consult/sessions/{sessionId}/end`
- **请求方式**: POST
- **请求头**: 需要认证
- **路径参数**:
  - `sessionId`: 会话ID

- **成功响应**:

  ```json
  {
    "code": 200,
    "message": "咨询已结束",
    "data": {
      "duration": "1小时30分钟",
      "canRate": true             // 是否可以评价
    }
  }
  ```

### 8. 咨询评价

- **接口URL**: `/api/consult/sessions/{sessionId}/rating`
- **请求方式**: POST
- **请求头**: 需要认证
- **路径参数**:
  - `sessionId`: 会话ID
- **请求参数**:

  ```json
  {
    "rating": 5,                  // 评分：1-5，必填
    "review": "string",           // 评价内容，可选
    "tags": [                     // 评价标签，可选
      "专业", "耐心", "及时"
    ]
  }
  ```

- **成功响应**:

  ```json
  {
    "code": 200,
    "message": "评价成功",
    "data": {
      "ratingId": "string"
    }
  }
  ```

---

## 其他接口

### 1. 上传图片

- **接口URL**: `/api/common/upload-image`
- **请求方式**: POST
- **请求头**: 需要认证

  ```
  Authorization: Bearer {token}
  Content-Type: multipart/form-data
  ```

- **请求参数**:

  ```
  file: (二进制文件)  // 图片文件，必填
  type: string (可选，图片用途：user, pet, goods, etc.)
  ```

- **成功响应**:

  ```json
  {
    "code": 200,
    "message": "上传成功",
    "data": {
      "url": "string"  // 图片URL
    }
  }
  ```

- **失败响应**:

  ```json
  {
    "code": 400,
    "message": "未上传文件",
    "data": null
  }
  ```

  或

  ```json
  {
    "code": 400,
    "message": "不支持的文件类型，仅支持JPG、PNG、GIF和WEBP格式",
    "data": null
  }
  ```

### 2. 获取用户协议

- **接口URL**: `/api/common/user-policy`
- **请求方式**: GET
- **请求头**: 无需认证
- **请求参数**: 无

- **成功响应**:

  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "content": "string"  // 用户协议内容
    }
  }
  ```

### 3. 获取隐私政策

- **接口URL**: `/api/common/privacy-policy`
- **请求方式**: GET
- **请求头**: 无需认证
- **请求参数**: 无

- **成功响应**:

  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "content": "string"  // 隐私政策内容
    }
  }
  ```

### 4. 意见反馈

- **接口URL**: `/api/feedback/submit`
- **请求方式**: POST
- **请求头**: 需要认证

  ```
  Authorization: Bearer {token}
  ```

- **请求参数**:

  ```json
  {
    "type": "string",     // 反馈类型，必填
    "content": "string",  // 反馈内容，必填
    "images": ["string"]  // 图片URL数组，选填
  }
  ```

- **成功响应**:

  ```json
  {
    "code": 200,
    "message": "提交成功",
    "data": {
      "id": "string"  // 反馈ID
    }
  }
  ```

- **失败响应**:

  ```json
  {
    "code": 401,
    "message": "未授权，请先登录",
    "data": null
  }
  ```

  或

  ```json
  {
    "code": 400,
    "message": "反馈内容不能为空",
    "data": null
  }
  ```

---

## 📊 v2.3.0 更新总结

### 🏥 医疗功能重构 (重大更新)

**变更内容**:
- **功能转型**: 从"在线问诊"调整为"医院广告位展示"
- **新增接口**: 3个核心API接口
  - `GET /api/medical/hospitals` - 医院列表
  - `GET /api/medical/hospitals/{id}` - 医院详情  
  - `POST /api/medical/hospitals/{id}/click` - 点击统计

**技术特点**:
- ✅ 无需认证的公开广告位
- ✅ 支持地理位置排序
- ✅ 支持搜索和筛选
- ✅ 点击统计和数据分析

**前端集成**:
- 文件: `/src/pages/medical/index.vue`
- API: `/src/utils/api/medical.js`
- 特性: Mock数据降级、错误处理

### 🛡️ 保险功能增强

**核心接口**:
- 保险产品列表和详情
- 投保流程和保单管理
- 理赔申请和进度查询
- 多维度筛选和个性化推荐

**数据完整性**:
- 完整的保险产品信息结构
- 标准化的理赔流程
- 规范的错误处理机制

### 🛍️ 商品筛选优化

**筛选维度**:
- 商品分类：猫粮、狗粮、玩具、零食等
- 价格区间：支持自定义范围
- 品牌筛选：多品牌支持
- 排序方式：价格、销量、评分

## 🔧 开发指导

### API调用最佳实践

1. **统一错误处理**:
   ```javascript
   try {
     const response = await api.request();
     return response.data;
   } catch (error) {
     // 统一错误处理逻辑
     handleApiError(error);
   }
   ```

2. **分页数据处理**:
   ```javascript
   const params = {
     page: 1,
     pageSize: 10,
     // 其他筛选参数
   };
   ```

3. **认证Token管理**:
   ```javascript
   // 请求头中包含认证信息
   headers: {
     'Authorization': `Bearer ${token}`
   }
   ```

### 数据格式规范

1. **日期时间**: ISO 8601格式 (`2025-07-12T10:30:00Z`)
2. **货币金额**: 数字类型，单位为分
3. **图片URL**: 完整的HTTP/HTTPS地址
4. **分页信息**: 统一使用 `page`、`pageSize`、`total`

### 测试验证

使用以下文件进行API测试:
- `/src/utils/apiTest.js` - 主要API测试入口
- `/insurance-api-test.js` - 保险功能专项测试
- `/price-filter-verification.js` - 筛选功能验证

### 部署注意事项

1. **环境配置**: 确保API根地址配置正确
2. **数据库**: Redis配置和连接池设置
3. **安全性**: JWT密钥和HTTPS证书
4. **监控**: API调用量和错误率监控

---

## 📞 技术支持

如有API对接问题，请参考以下资源：
- **医院模块**: `PetPal-医院模块前端对接API文档.md`
- **保险功能**: `PetPal-保险功能后端对齐指导.md`
- **商品筛选**: `PetPal-后端筛选功能对齐文档.md`

**最后更新**: 2025年7月13日  
**文档版本**: v2.4.0  
**API兼容性**: 向下兼容v2.x版本