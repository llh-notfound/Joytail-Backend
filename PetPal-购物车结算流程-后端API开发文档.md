# 🛒 PetPal 购物车结算流程 - 后端API开发文档

## 📋 文档概述

**文档版本：** v1.0.0  
**创建日期：** 2025年7月14日  
**适用范围：** PetPal 购物车结算流程完整链路  
**前端状态：** ✅ 已完成集成  
**后端状态：** 🚧 待开发  

### 🎯 业务流程概述

```
购物车管理 → 商品结算 → 订单创建 → 订单支付 → 订单管理
     ↓           ↓          ↓          ↓          ↓
  购物车API    订单创建API   支付API    订单查询API  订单状态API
```

---

## 🔧 技术规范

### 基础配置

**API Base URL:** `https://your-domain.com/api/v1`  
**认证方式:** Bearer Token  
**请求格式:** JSON  
**响应格式:** JSON  
**编码格式:** UTF-8  

### 统一响应格式

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {},
  "timestamp": "2025-07-14T10:00:00Z",
  "requestId": "uuid-string"
}
```

### 错误码定义

| 错误码 | 含义 | 处理建议 |
|--------|------|----------|
| 200 | 成功 | 正常处理 |
| 400 | 参数错误 | 检查请求参数 |
| 401 | 未认证 | 重新登录 |
| 403 | 无权限 | 检查用户权限 |
| 404 | 资源不存在 | 检查资源ID |
| 500 | 服务器错误 | 联系技术支持 |

---

## 🛒 购物车管理 API

### 1. 获取购物车列表

**接口地址:** `GET /cart/list`  
**认证要求:** 是  
**前端调用:** `cartApi.getCartList()`

#### 请求参数
无

#### 响应示例
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "items": [
      {
        "id": "cart_item_001",
        "goodsId": "goods_001",
        "name": "宠物狗粮 - 皇家小型犬成犬粮",
        "image": "https://example.com/images/dog-food.jpg",
        "price": 128.00,
        "quantity": 2,
        "specs": "2.5kg装",
        "selected": true,
        "stock": 100,
        "createTime": "2025-07-14T09:00:00Z",
        "updateTime": "2025-07-14T09:30:00Z"
      }
    ],
    "totalItems": 1,
    "totalAmount": 256.00,
    "selectedCount": 1,
    "selectedAmount": 256.00
  },
  "timestamp": "2025-07-14T10:00:00Z"
}
```

#### 数据库设计建议
```sql
CREATE TABLE cart_items (
    id VARCHAR(32) PRIMARY KEY,
    user_id VARCHAR(32) NOT NULL,
    goods_id VARCHAR(32) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    selected BOOLEAN DEFAULT TRUE,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_goods_id (goods_id)
);
```

### 2. 添加商品到购物车

**接口地址:** `POST /cart/add`  
**认证要求:** 是  
**前端调用:** `cartApi.addToCart(goodsId, quantity, specs)`

#### 请求参数
```json
{
  "goodsId": "goods_001",
  "quantity": 1,
  "specs": "2.5kg装"
}
```

#### 参数说明
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| goodsId | String | 是 | 商品ID |
| quantity | Integer | 是 | 数量，必须大于0 |
| specs | String | 否 | 商品规格 |

#### 业务逻辑
1. 验证商品是否存在且有库存
2. 检查是否已在购物车中（存在则更新数量）
3. 验证库存是否充足
4. 添加到购物车或更新数量

#### 响应示例
```json
{
  "code": 200,
  "message": "添加成功",
  "data": {
    "cartItemId": "cart_item_002",
    "totalQuantity": 3
  }
}
```

### 3. 更新购物车商品

**接口地址:** `PUT /cart/update`  
**认证要求:** 是  
**前端调用:** `cartApi.updateCartItem(cartItemId, quantity)`

#### 请求参数
```json
{
  "cartItemId": "cart_item_001",
  "quantity": 3
}
```

#### 业务逻辑
1. 验证购物车项是否属于当前用户
2. 验证库存是否充足
3. 更新数量（quantity为0时删除该项）

### 4. 更新商品选中状态

**接口地址:** `PUT /cart/select`  
**认证要求:** 是  
**前端调用:** `cartApi.updateCartItemSelected(cartItemId, selected)`

#### 请求参数
```json
{
  "cartItemId": "cart_item_001",
  "selected": true
}
```

### 5. 批量删除购物车商品

**接口地址:** `DELETE /cart/items`  
**认证要求:** 是  
**前端调用:** `cartApi.deleteCartItems(cartItemIds)`

#### 请求参数
```json
{
  "cartItemIds": ["cart_item_001", "cart_item_002"]
}
```

---

## 📝 订单管理 API

### 1. 创建订单

**接口地址:** `POST /order/create`  
**认证要求:** 是  
**前端调用:** `orderApi.createOrder(cartItemIds, addressId, couponId, message)`

#### 请求参数
```json
{
  "cartItemIds": ["cart_item_001", "cart_item_002"],
  "addressId": "addr_001",
  "couponId": "coupon_001",
  "message": "请小心轻放"
}
```

#### 参数说明
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| cartItemIds | Array | 是 | 购物车项ID数组 |
| addressId | String | 是 | 收货地址ID |
| couponId | String | 否 | 优惠券ID |
| message | String | 否 | 订单备注 |

#### 业务逻辑
1. 验证购物车项是否属于当前用户
2. 验证收货地址是否有效
3. 验证优惠券是否可用
4. 计算订单金额（商品金额、运费、优惠金额）
5. 验证库存并锁定库存
6. 创建订单记录
7. 清除购物车中已下单的商品

#### 响应示例
```json
{
  "code": 200,
  "message": "订单创建成功",
  "data": {
    "orderNumber": "PO2025071400001",
    "totalAmount": 268.00,
    "goodsAmount": 256.00,
    "shippingFee": 12.00,
    "discountAmount": 0.00,
    "payableAmount": 268.00,
    "status": "pending_payment",
    "createTime": "2025-07-14T10:00:00Z",
    "items": [
      {
        "goodsId": "goods_001",
        "name": "宠物狗粮 - 皇家小型犬成犬粮",
        "image": "https://example.com/images/dog-food.jpg",
        "price": 128.00,
        "quantity": 2,
        "specs": "2.5kg装",
        "subtotal": 256.00
      }
    ]
  }
}
```

#### 数据库设计建议
```sql
-- 订单主表
CREATE TABLE orders (
    id VARCHAR(32) PRIMARY KEY,
    order_number VARCHAR(20) UNIQUE NOT NULL,
    user_id VARCHAR(32) NOT NULL,
    address_id VARCHAR(32) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    goods_amount DECIMAL(10,2) NOT NULL,
    shipping_fee DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    payable_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending_payment', 'paid', 'shipped', 'delivered', 'completed', 'cancelled') NOT NULL,
    coupon_id VARCHAR(32),
    message TEXT,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_order_number (order_number),
    INDEX idx_status (status)
);

-- 订单商品表
CREATE TABLE order_items (
    id VARCHAR(32) PRIMARY KEY,
    order_id VARCHAR(32) NOT NULL,
    goods_id VARCHAR(32) NOT NULL,
    name VARCHAR(200) NOT NULL,
    image VARCHAR(500),
    price DECIMAL(10,2) NOT NULL,
    quantity INT NOT NULL,
    specs VARCHAR(100),
    subtotal DECIMAL(10,2) NOT NULL,
    INDEX idx_order_id (order_id),
    INDEX idx_goods_id (goods_id)
);
```

### 2. 获取订单列表

**接口地址:** `GET /order/goods-list`  
**认证要求:** 是  
**前端调用:** `orderApi.getGoodsOrderList(status, page, pageSize)`

#### 请求参数
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| status | String | 否 | 订单状态：all, pending_payment, paid, shipped, delivered, completed |
| page | Integer | 否 | 页码，默认1 |
| pageSize | Integer | 否 | 每页数量，默认10 |

#### 响应示例
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "items": [
      {
        "id": "order_001",
        "orderNumber": "PO2025071400001",
        "status": "pending_payment",
        "statusText": "待付款",
        "totalAmount": 268.00,
        "goodsCount": 1,
        "createTime": "2025-07-14T10:00:00Z",
        "payExpireTime": "2025-07-14T11:00:00Z",
        "items": [
          {
            "goodsId": "goods_001",
            "name": "宠物狗粮 - 皇家小型犬成犬粮",
            "image": "https://example.com/images/dog-food.jpg",
            "price": 128.00,
            "quantity": 2,
            "specs": "2.5kg装"
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

### 3. 获取订单详情

**接口地址:** `GET /order/detail/{orderNumber}`  
**认证要求:** 是  
**前端调用:** `orderApi.getOrderDetail(orderNumber)`

#### 响应示例
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "orderNumber": "PO2025071400001",
    "status": "pending_payment",
    "statusText": "待付款",
    "totalAmount": 268.00,
    "goodsAmount": 256.00,
    "shippingFee": 12.00,
    "discountAmount": 0.00,
    "createTime": "2025-07-14T10:00:00Z",
    "payExpireTime": "2025-07-14T11:00:00Z",
    "address": {
      "name": "张三",
      "phone": "138****1234",
      "address": "广东省深圳市南山区科技园1号楼101室"
    },
    "items": [
      {
        "goodsId": "goods_001",
        "name": "宠物狗粮 - 皇家小型犬成犬粮",
        "image": "https://example.com/images/dog-food.jpg",
        "price": 128.00,
        "quantity": 2,
        "specs": "2.5kg装",
        "subtotal": 256.00
      }
    ],
    "logistics": {
      "company": "顺丰速运",
      "trackingNumber": "SF1234567890",
      "status": "待发货"
    }
  }
}
```

---

## 💳 支付相关 API

### 1. 订单支付

**接口地址:** `POST /order/pay/{orderNumber}`  
**认证要求:** 是  
**前端调用:** `orderApi.payOrder(orderNumber, paymentMethod, paymentChannel)`

#### 请求参数
```json
{
  "paymentMethod": "wechat",
  "paymentChannel": "h5"
}
```

#### 参数说明
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| paymentMethod | String | 是 | 支付方式：wechat, alipay |
| paymentChannel | String | 是 | 支付渠道：h5, app, mini_program |

#### 业务逻辑
1. 验证订单状态（必须是待付款状态）
2. 验证订单金额
3. 调用第三方支付接口
4. 生成支付订单
5. 返回支付参数

#### 响应示例
```json
{
  "code": 200,
  "message": "支付发起成功",
  "data": {
    "paymentOrderId": "pay_001",
    "paymentInfo": {
      "appId": "your_app_id",
      "timeStamp": "1642147200",
      "nonceStr": "random_string",
      "package": "prepay_id=prepay_id_value",
      "signType": "RSA",
      "paySign": "signature_value"
    },
    "paymentUrl": "https://pay.example.com/pay?id=pay_001",
    "expireTime": "2025-07-14T11:00:00Z"
  }
}
```

### 2. 支付回调处理

**接口地址:** `POST /order/pay-callback`  
**认证要求:** 否（第三方回调）  
**说明:** 第三方支付平台回调接口

#### 业务逻辑
1. 验证回调签名
2. 验证支付状态
3. 更新订单状态
4. 扣减库存
5. 发送支付成功通知

### 3. 支付状态查询

**接口地址:** `GET /order/pay-status/{orderNumber}`  
**认证要求:** 是  

#### 响应示例
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "orderNumber": "PO2025071400001",
    "paymentStatus": "success",
    "paymentTime": "2025-07-14T10:30:00Z",
    "paymentMethod": "wechat",
    "paymentAmount": 268.00
  }
}
```

---

## 📊 订单状态管理 API

### 1. 确认收货

**接口地址:** `POST /order/confirm/{orderNumber}`  
**认证要求:** 是  
**前端调用:** `orderApi.confirmOrder(orderNumber)`

#### 业务逻辑
1. 验证订单状态（必须是已发货状态）
2. 更新订单状态为已完成
3. 记录确认收货时间

#### 响应示例
```json
{
  "code": 200,
  "message": "确认收货成功",
  "data": {
    "orderNumber": "PO2025071400001",
    "status": "completed",
    "confirmTime": "2025-07-14T15:00:00Z"
  }
}
```

### 2. 取消订单

**接口地址:** `POST /order/cancel/{orderNumber}`  
**认证要求:** 是  
**前端调用:** `orderApi.cancelOrder(orderNumber, reason)`

#### 请求参数
```json
{
  "reason": "不想要了"
}
```

#### 业务逻辑
1. 验证订单状态（只有待付款状态可以取消）
2. 释放锁定的库存
3. 更新订单状态为已取消

---

## 🏪 地址管理 API

### 1. 获取用户地址列表

**接口地址:** `GET /user/addresses`  
**认证要求:** 是

#### 响应示例
```json
{
  "code": 200,
  "message": "获取成功",
  "data": [
    {
      "id": "addr_001",
      "name": "张三",
      "phone": "13812345678",
      "province": "广东省",
      "city": "深圳市",
      "district": "南山区",
      "detailAddress": "科技园1号楼101室",
      "postalCode": "518000",
      "isDefault": true,
      "createTime": "2025-07-14T09:00:00Z"
    }
  ]
}
```

### 2. 获取默认地址

**接口地址:** `GET /user/addresses/default`  
**认证要求:** 是

---

## 🎫 优惠券相关 API

### 1. 获取可用优惠券

**接口地址:** `GET /user/coupons/available`  
**认证要求:** 是

#### 请求参数
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| totalAmount | Decimal | 是 | 订单总金额 |

#### 响应示例
```json
{
  "code": 200,
  "message": "获取成功",
  "data": [
    {
      "id": "coupon_001",
      "name": "新用户优惠券",
      "type": "fixed",
      "amount": 10.00,
      "minAmount": 100.00,
      "expireDate": "2025-12-31",
      "scope": "全场通用"
    }
  ]
}
```

---

## 🔍 数据统计 API

### 1. 获取订单统计

**接口地址:** `GET /order/stats`  
**认证要求:** 是  
**前端调用:** `orderApi.getOrderStats()`

#### 响应示例
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "pendingPayment": 2,
    "paid": 1,
    "shipped": 0,
    "delivered": 3,
    "completed": 5,
    "totalOrders": 11
  }
}
```

### 2. 获取待处理事项

**接口地址:** `GET /order/pending-items`  
**认证要求:** 是  
**前端调用:** `orderApi.getPendingItems()`

#### 响应示例
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "unpaidOrders": 2,
    "unshippedOrders": 1,
    "unreceivedOrders": 3
  }
}
```

---

## 🧪 测试用例

### 购物车测试用例

#### 测试场景 1：添加商品到购物车
```bash
curl -X POST "http://localhost:8080/api/v1/cart/add" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "goodsId": "goods_001",
    "quantity": 2,
    "specs": "2.5kg装"
  }'
```

#### 测试场景 2：获取购物车列表
```bash
curl -X GET "http://localhost:8080/api/v1/cart/list" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 订单测试用例

#### 测试场景 3：创建订单
```bash
curl -X POST "http://localhost:8080/api/v1/order/create" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "cartItemIds": ["cart_item_001"],
    "addressId": "addr_001"
  }'
```

#### 测试场景 4：订单支付
```bash
curl -X POST "http://localhost:8080/api/v1/order/pay/PO2025071400001" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "paymentMethod": "wechat",
    "paymentChannel": "h5"
  }'
```

---

## 🚀 部署指南

### 环境要求
- Java 8+ / Node.js 14+
- MySQL 5.7+ / PostgreSQL 10+
- Redis 6.0+
- Docker (可选)

### 配置文件示例
```yaml
# application.yml
server:
  port: 8080

spring:
  datasource:
    url: jdbc:mysql://localhost:3306/petpal?useUnicode=true&characterEncoding=utf8
    username: petpal
    password: your_password
  redis:
    host: localhost
    port: 6379

# 支付配置
payment:
  wechat:
    appId: your_wechat_app_id
    mchId: your_merchant_id
    apiKey: your_api_key
  alipay:
    appId: your_alipay_app_id
    privateKey: your_private_key
    publicKey: your_public_key
```

---

## 📝 开发注意事项

### 1. 数据安全
- 所有金额字段使用 DECIMAL 类型，避免精度丢失
- 敏感信息（支付密钥）使用环境变量管理
- 用户数据访问需要权限验证

### 2. 性能优化
- 购物车数据可以使用 Redis 缓存
- 订单列表支持分页查询
- 商品库存操作需要考虑并发安全

### 3. 业务规则
- 订单创建时需要锁定库存
- 支付超时后自动释放库存
- 订单状态变更需要记录操作日志

### 4. 错误处理
- 统一的异常处理机制
- 详细的错误日志记录
- 用户友好的错误提示

---

## 📞 联系方式

**技术支持:** tech-support@petpal.com  
**文档维护:** api-docs@petpal.com  
**更新日期:** 2025年7月14日  

---

**附件:**
- [前端API调用示例](./购物车结算流程自动测试工具.js)
- [完整验证指南](./PetPal-购物车结算流程-完整验证指南.md)
- [数据库设计文档](./database-schema.sql)

**版本记录:**
- v1.0.0 (2025-07-14): 初始版本，包含完整的购物车结算流程API
