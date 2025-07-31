# PetPal 保险模块图片化展示 API 文档

## 背景

我们需要将保险条款说明和理赔流程从文字形式改为图片形式展示，以提供更加直观、美观的用户体验。本文档描述了与此功能相关的API接口和数据模型变更。

## API 概览

### 新增接口

1. `POST /api/insurance/products/{productId}/terms-image` - 上传保险条款图片
2. `POST /api/insurance/products/{productId}/claim-process-image` - 上传理赔流程图片

### 更新接口

1. `GET /api/insurance/products/{productId}` - 获取保险产品详情（添加图片字段）
2. `GET /api/insurance/products` - 获取保险产品列表（添加图片字段）

## 数据模型变更

在保险产品模型中添加以下字段：

```json
{
  "termsImage": "string", // 保险条款图片URL
  "claimProcessImage": "string" // 理赔流程图片URL
}
```

## 接口详情

### 1. 上传保险条款图片

**接口URL**: `/api/insurance/products/{productId}/terms-image`

**请求方法**: `POST`

**请求头**:
- `Content-Type`: `multipart/form-data`
- `Authorization`: `Bearer {token}`（需要管理员权限）

**路径参数**:
- `productId`: 保险产品ID

**请求参数**:
- `termsImage`: 图片文件（必须）

**响应示例**:

```json
{
  "code": 200,
  "message": "上传成功",
  "data": {
    "imageUrl": "/uploads/insurance/terms/product_1_terms.jpg"
  }
}
```

**错误响应**:

```json
{
  "code": 400,
  "message": "请上传有效的图片文件",
  "data": null
}
```

```json
{
  "code": 404,
  "message": "保险产品不存在",
  "data": null
}
```

```json
{
  "code": 401,
  "message": "未授权访问",
  "data": null
}
```

### 2. 上传理赔流程图片

**接口URL**: `/api/insurance/products/{productId}/claim-process-image`

**请求方法**: `POST`

**请求头**:
- `Content-Type`: `multipart/form-data`
- `Authorization`: `Bearer {token}`（需要管理员权限）

**路径参数**:
- `productId`: 保险产品ID

**请求参数**:
- `claimProcessImage`: 图片文件（必须）

**响应示例**:

```json
{
  "code": 200,
  "message": "上传成功",
  "data": {
    "imageUrl": "/uploads/insurance/claims/product_1_claim.jpg"
  }
}
```

**错误响应**: 与上传保险条款图片接口相同

### 3. 获取保险产品详情（更新）

**接口URL**: `/api/insurance/products/{productId}`

**请求方法**: `GET`

**路径参数**:
- `productId`: 保险产品ID

**响应示例**:

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "id": 1,
    "name": "宠物综合医疗保险",
    "coverage": "意外伤害、常见疾病、手术费用",
    "price": 899,
    "originalPrice": 1099,
    "petTypes": ["犬类", "猫类"],
    "type": "医疗险",
    "image": "/uploads/insurance/products/pet_medical.jpg",
    "termsImage": "/uploads/insurance/terms/product_1_terms.jpg",
    "claimProcessImage": "/uploads/insurance/claims/product_1_claim.jpg",
    "period": "1年",
    "company": "安心保险",
    "websiteUrl": "https://www.example.com/insurance/pet-medical",
    "terms": [], // 保留字段，但可以为空数组，兼容旧版本
    "claimProcess": [], // 保留字段，但可以为空数组，兼容旧版本
    "faqs": [
      {
        "question": "宠物需要做体检才能投保吗？",
        "answer": "是的，首次投保需要提供近3个月内的宠物体检报告，以确认宠物健康状况。"
      }
    ]
  }
}
```

### 4. 获取保险产品列表（更新）

**接口URL**: `/api/insurance/products`

**请求方法**: `GET`

**查询参数**:
- `page`: 页码（默认: 1）
- `pageSize`: 每页数量（默认: 10）
- `type`: 保险类型
- `petType`: 宠物类型
- `priceRange`: 价格范围
- `sortBy`: 排序方式

**响应示例**:

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "total": 4,
    "page": 1,
    "pageSize": 10,
    "list": [
      {
        "id": 1,
        "name": "宠物综合医疗保险",
        "coverage": "意外伤害、常见疾病、手术费用",
        "price": 899,
        "originalPrice": 1099,
        "petTypes": ["犬类", "猫类"],
        "type": "医疗险",
        "image": "/uploads/insurance/products/pet_medical.jpg",
        "termsImage": "/uploads/insurance/terms/product_1_terms.jpg",
        "claimProcessImage": "/uploads/insurance/claims/product_1_claim.jpg",
        "period": "1年",
        "company": "安心保险"
      },
      // 更多产品...
    ]
  }
}
```

## 后端实现指南

### 1. 数据库表结构修改

在保险产品表中添加两个新字段:

```sql
ALTER TABLE insurance_products
ADD COLUMN terms_image VARCHAR(255) COMMENT '保险条款图片路径',
ADD COLUMN claim_process_image VARCHAR(255) COMMENT '理赔流程图片路径';
```

### 2. 文件上传处理

1. **文件存储路径**:
   - 保险条款图片: `/uploads/insurance/terms/`
   - 理赔流程图片: `/uploads/insurance/claims/`

2. **文件命名规则**:
   - 建议格式: `product_{productId}_terms.{ext}` 和 `product_{productId}_claim.{ext}`
   - 其中 `{productId}` 是保险产品ID，`{ext}` 是文件扩展名（jpg、png等）

3. **安全考虑**:
   - 验证文件类型和大小
   - 只允许管理员上传图片
   - 限制文件大小，推荐最大为5MB
   - 检查文件MIME类型，只接受图片（image/jpeg, image/png, image/webp）

### 3. 接口实现

1. **上传接口**:
   - 使用multipart/form-data处理文件上传
   - 验证用户权限（管理员）
   - 验证产品ID是否有效
   - 处理并保存上传的图片
   - 更新数据库中的图片路径
   - 返回图片URL

2. **获取接口**:
   - 更新现有的产品详情和列表接口
   - 确保返回新增的图片字段

### 4. 向下兼容考虑

为了兼容旧版本的前端应用，可以：
1. 保留原有的`terms`和`claimProcess`字段，即使为空
2. 提供默认的图片，用于未设置图片的产品
3. 逐步淘汰旧版本的文字展示方式

## 图片规范建议

为了确保最佳的用户体验，建议图片满足以下要求：

1. **保险条款图片**:
   - 推荐宽度: 750px（手机屏幕宽度）
   - 高度: 根据内容调整，建议不超过3000px
   - 格式: PNG或JPG，推荐使用WebP提高加载速度
   - 文件大小: 建议不超过500KB

2. **理赔流程图片**:
   - 推荐宽度: 750px
   - 高度: 建议不超过2000px
   - 格式: 同上
   - 文件大小: 同上

3. **内容建议**:
   - 文字大小适中，确保在手机上清晰可读
   - 使用简洁明了的图标和流程图
   - 颜色与应用整体风格一致
   - 图片底部可以添加公司品牌标识

## 开发工作计划

1. **数据库更新**: 1天
2. **文件上传接口开发**: 1-2天
3. **产品接口更新**: 1天
4. **测试与调试**: 1-2天
5. **文档更新**: 0.5天

总计工作量: 4.5-6.5天

## 注意事项

1. 为确保图片加载性能，建议进行图片压缩和优化
2. 考虑实现图片CDN加速以提高加载速度
3. 实现图片上传进度显示功能，提升用户体验
4. 在图片上传失败时提供友好的错误提示
5. 考虑为图片添加水印功能，保护公司知识产权

---

*文档版本: v1.0*  
*更新日期: 2025年7月23日*
