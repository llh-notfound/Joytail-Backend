# PetPal 订单管理API对接文档

## 📋 概述

本文档描述了PetPal宠物用品订单管理系统的API接口规范，目前仅实现"全部"和"待付款"功能，其他功能标记为"开发中"。

## 🔗 基础信息

- **基础URL**: `http://localhost:8080`
- **API前缀**: `/api`
- **认证方式**: Bearer Token
- **数据格式**: JSON

## 📝 API接口列表

### 1. 创建订单

**接口地址**: `POST /api/order/create`

**请求参数**:
```json
{
  "cartItemIds": ["1", "2", "3"],
  "addressId": "A001",
  "message": "请尽快发货"
}
```

**参数说明**:
- `cartItemIds`: 购物车项ID数组（必填）
- `addressId`: 收货地址ID（必填）
- `message`: 订单留言（可选）

**响应示例**:
```json
{
  "code": 200,
  "message": "订单创建成功",
  "data": {
    "orderNumber": "ORD202412010001",
    "orderId": "12345",
    "status": "pending_payment",
    "statusText": "待付款",
    "createTime": "2024-12-01 10:30:00",
    "totalAmount": 299.00,
    "goodsAmount": 280.00,
    "shippingFee": 19.00,
    "address": {
      "id": "A001",
      "name": "张三",
      "phone": "13800138000",
      "province": "广东省",
      "city": "深圳市",
      "district": "南山区",
      "detailAddress": "科技园南区8栋101室"
    },
    "goods": [
      {
        "id": "G001",
        "name": "高级猫粮",
        "image": "https://example.com/cat-food.jpg",
        "specs": "5kg装",
        "price": 140.00,
        "quantity": 2,
        "subtotal": 280.00
      }
    ]
  }
}
```

### 2. 获取订单列表

**接口地址**: `GET /api/order/goods-list`

**请求参数**:
```
?status=all&page=1&pageSize=10
```

**参数说明**:
- `status`: 订单状态筛选（可选）
  - `all`: 全部订单 ✅ **已实现**
  - `pending_payment`: 待付款 ✅ **已实现**
  - `pending_shipment`: 待发货 ⚠️ **开发中**
  - `pending_receipt`: 待收货 ⚠️ **开发中**
  - `completed`: 已完成 ⚠️ **开发中**
  - `after_sale`: 售后 ⚠️ **开发中**
- `page`: 页码（默认1）
- `pageSize`: 每页数量（默认10）

**响应示例**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "list": [
      {
        "orderNumber": "ORD202412010001",
        "orderId": "12345",
        "status": "pending_payment",
        "statusText": "待付款",
        "createTime": "2024-12-01 10:30:00",
        "payTime": null,
        "shipTime": null,
        "completeTime": null,
        "totalAmount": 299.00,
        "goodsAmount": 280.00,
        "shippingFee": 19.00,
        "address": {
          "id": "A001",
          "name": "张三",
          "phone": "13800138000",
          "province": "广东省",
          "city": "深圳市",
          "district": "南山区",
          "detailAddress": "科技园南区8栋101室"
        },
        "goods": [
          {
            "id": "G001",
            "name": "高级猫粮",
            "image": "https://example.com/cat-food.jpg",
            "specs": "5kg装",
            "price": 140.00,
            "quantity": 2,
            "subtotal": 280.00
          }
        ]
      }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 10,
    "hasMore": false
  }
}
```

### 3. 订单支付

**接口地址**: `POST /api/order/pay/{orderNumber}`

**请求参数**:
```json
{
  "paymentMethod": "wechat",
  "paymentChannel": "wechat_pay"
}
```

**参数说明**:
- `paymentMethod`: 支付方式
  - `wechat`: 微信支付
  - `alipay`: 支付宝
  - `bank`: 银行卡
- `paymentChannel`: 支付渠道
  - `wechat_pay`: 微信支付
  - `alipay_app`: 支付宝APP
  - `bank_transfer`: 银行转账

**响应示例**:
```json
{
  "code": 200,
  "message": "支付成功",
  "data": {
    "orderNumber": "ORD202412010001",
    "paymentId": "PAY123456789",
    "payTime": "2024-12-01 11:30:00",
    "status": "pending_shipment",
    "statusText": "待发货"
  }
}
```

## 📊 订单状态说明

| 状态值 | 状态文本 | 说明 | 实现状态 |
|--------|----------|------|----------|
| `pending_payment` | 待付款 | 订单已创建，等待用户支付 | ✅ **已实现** |
| `pending_shipment` | 待发货 | 支付完成，等待商家发货 | ⚠️ **开发中** |
| `pending_receipt` | 待收货 | 商家已发货，等待用户确认收货 | ⚠️ **开发中** |
| `completed` | 已完成 | 用户已确认收货，订单完成 | ⚠️ **开发中** |
| `cancelled` | 已取消 | 订单已取消 | ⚠️ **开发中** |
| `after_sale` | 售后 | 订单进入售后流程 | ⚠️ **开发中** |

## 🔐 认证要求

所有订单相关接口都需要用户登录认证，请求头需要包含：

```
Authorization: Bearer {token}
```

## ⚠️ 错误码说明

| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未登录或token无效 |
| 403 | 权限不足 |
| 404 | 订单不存在 |
| 500 | 服务器内部错误 |

## 🚀 实现优先级

### 第一阶段（已实现）
1. ✅ 创建订单 (`POST /api/order/create`)
2. ✅ 获取订单列表 (`GET /api/order/goods-list`)
3. ✅ 订单支付 (`POST /api/order/pay/{orderNumber}`)

### 第二阶段（开发中）
4. ⚠️ 获取订单详情 (`GET /api/order/detail/{orderNumber}`)
5. ⚠️ 取消订单 (`POST /api/order/cancel/{orderNumber}`)
6. ⚠️ 确认收货 (`POST /api/order/confirm/{orderNumber}`)

### 第三阶段（计划中）
7. ⚠️ 获取订单统计 (`GET /api/order/stats`)
8. ⚠️ 获取待处理事项 (`GET /api/order/pending-items`)

## 📝 测试用例

### 测试用例1：创建订单
```bash
curl -X POST http://localhost:8080/api/order/create \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "cartItemIds": ["1", "2"],
    "addressId": "A001",
    "message": "请尽快发货"
  }'
```

### 测试用例2：获取订单列表（全部）
```bash
curl -X GET "http://localhost:8080/api/order/goods-list?status=all&page=1&pageSize=10" \
  -H "Authorization: Bearer {token}"
```

### 测试用例3：获取订单列表（待付款）
```bash
curl -X GET "http://localhost:8080/api/order/goods-list?status=pending_payment&page=1&pageSize=10" \
  -H "Authorization: Bearer {token}"
```

### 测试用例4：订单支付
```bash
curl -X POST http://localhost:8080/api/order/pay/ORD202412010001 \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "paymentMethod": "wechat",
    "paymentChannel": "wechat_pay"
  }'
```

## 📱 前端功能说明

### 已实现功能
- ✅ 订单列表页面显示"全部"和"待付款"标签
- ✅ 点击"全部"显示所有订单
- ✅ 点击"待付款"显示待付款订单
- ✅ 支持分页加载

### 开发中功能
- ⚠️ 点击"待发货"显示"功能开发中"
- ⚠️ 点击"待收货"显示"功能开发中"
- ⚠️ 点击"已完成"显示"功能开发中"
- ⚠️ 点击"售后"显示"功能开发中"

## 📞 联系方式

如有疑问，请联系前端开发团队。 