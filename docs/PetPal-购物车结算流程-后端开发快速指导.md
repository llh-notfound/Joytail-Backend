# 🚀 PetPal 购物车结算流程 - 后端开发快速指导

## 📋 开发优先级清单

### 🎯 第一阶段（核心功能）- 预计2-3天

#### 1. 购物车基础功能
- [x] **数据库表创建** (0.5天)
  - cart_items 表
  - orders 表
  - order_items 表
  - user_addresses 表

- [ ] **购物车API开发** (1天)
  - `GET /cart/list` - 获取购物车列表
  - `POST /cart/add` - 添加商品到购物车
  - `PUT /cart/update` - 更新商品数量
  - `PUT /cart/select` - 更新选中状态

#### 2. 订单创建功能
- [ ] **订单创建API** (1天)
  - `POST /order/create` - 创建订单
  - `GET /order/detail/{orderNumber}` - 获取订单详情
  - 库存扣减逻辑
  - 金额计算逻辑

#### 3. 订单查询功能
- [ ] **订单列表API** (0.5天)
  - `GET /order/goods-list` - 获取订单列表
  - `GET /order/stats` - 获取订单统计

### 🎯 第二阶段（支付功能）- 预计1-2天

#### 4. 支付功能
- [ ] **支付API开发** (1天)
  - `POST /order/pay/{orderNumber}` - 发起支付
  - `GET /order/pay-status/{orderNumber}` - 查询支付状态
  - `POST /order/pay-callback` - 支付回调处理

#### 5. 订单状态管理
- [ ] **订单操作API** (0.5天)
  - `POST /order/cancel/{orderNumber}` - 取消订单
  - `POST /order/confirm/{orderNumber}` - 确认收货

### 🎯 第三阶段（完善功能）- 预计1天

#### 6. 辅助功能
- [ ] **地址管理** (0.5天)
  - `GET /user/addresses` - 获取地址列表
  - `GET /user/addresses/default` - 获取默认地址

- [ ] **优惠券功能** (0.5天)
  - `GET /user/coupons/available` - 获取可用优惠券

---

## 🛠️ 技术栈建议

### 后端框架选择
```
推荐选择：
1. Spring Boot (Java) - 企业级稳定
2. Express.js (Node.js) - 开发效率高
3. Django/FastAPI (Python) - 简洁优雅
```

### 数据库配置
```sql
-- 开发环境数据库配置
CREATE DATABASE petpal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建用户
CREATE USER 'petpal'@'localhost' IDENTIFIED BY 'petpal_password';
GRANT ALL PRIVILEGES ON petpal.* TO 'petpal'@'localhost';
FLUSH PRIVILEGES;
```

### 项目结构建议
```
petpal-backend/
├── src/
│   ├── controllers/     # 控制器层
│   │   ├── CartController.js
│   │   ├── OrderController.js
│   │   └── PaymentController.js
│   ├── services/        # 业务逻辑层
│   │   ├── CartService.js
│   │   ├── OrderService.js
│   │   └── PaymentService.js
│   ├── models/          # 数据模型层
│   │   ├── CartItem.js
│   │   ├── Order.js
│   │   └── OrderItem.js
│   ├── middlewares/     # 中间件
│   │   ├── auth.js
│   │   └── validation.js
│   ├── utils/           # 工具类
│   │   ├── response.js
│   │   └── payment.js
│   └── routes/          # 路由配置
│       ├── cart.js
│       ├── order.js
│       └── payment.js
├── config/
│   ├── database.js
│   ├── payment.js
│   └── app.js
├── tests/
├── docs/
└── package.json
```

---

## 📝 核心代码示例

### 1. 购物车控制器示例 (Node.js/Express)

```javascript
// controllers/CartController.js
const CartService = require('../services/CartService');
const { successResponse, errorResponse } = require('../utils/response');

class CartController {
  // 获取购物车列表
  async getCartList(req, res) {
    try {
      const userId = req.user.id;
      const cartData = await CartService.getCartList(userId);
      return successResponse(res, cartData, '获取购物车成功');
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

  // 添加商品到购物车
  async addToCart(req, res) {
    try {
      const userId = req.user.id;
      const { goodsId, quantity, specs } = req.body;
      
      // 参数验证
      if (!goodsId || !quantity || quantity <= 0) {
        return errorResponse(res, '参数错误', 400);
      }
      
      const result = await CartService.addToCart(userId, goodsId, quantity, specs);
      return successResponse(res, result, '添加成功');
    } catch (error) {
      if (error.message.includes('库存不足')) {
        return errorResponse(res, error.message, 400);
      }
      return errorResponse(res, error.message, 500);
    }
  }

  // 更新购物车商品
  async updateCartItem(req, res) {
    try {
      const userId = req.user.id;
      const { cartItemId, quantity } = req.body;
      
      const result = await CartService.updateCartItem(userId, cartItemId, quantity);
      return successResponse(res, result, '更新成功');
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }
}

module.exports = new CartController();
```

### 2. 购物车服务层示例

```javascript
// services/CartService.js
const CartItem = require('../models/CartItem');
const Goods = require('../models/Goods');
const { generateId } = require('../utils/common');

class CartService {
  // 获取购物车列表
  async getCartList(userId) {
    const cartItems = await CartItem.findByUserId(userId);
    
    // 计算总金额等统计信息
    const totalItems = cartItems.length;
    const selectedItems = cartItems.filter(item => item.selected);
    const selectedCount = selectedItems.length;
    const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const selectedAmount = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    return {
      items: cartItems,
      totalItems,
      totalAmount,
      selectedCount,
      selectedAmount
    };
  }

  // 添加商品到购物车
  async addToCart(userId, goodsId, quantity, specs) {
    // 验证商品是否存在
    const goods = await Goods.findById(goodsId);
    if (!goods) {
      throw new Error('商品不存在');
    }
    
    // 检查库存
    if (goods.stock < quantity) {
      throw new Error('库存不足');
    }
    
    // 检查是否已在购物车中
    const existingItem = await CartItem.findByUserAndGoods(userId, goodsId, specs);
    
    if (existingItem) {
      // 更新数量
      const newQuantity = existingItem.quantity + quantity;
      if (goods.stock < newQuantity) {
        throw new Error('库存不足');
      }
      
      return await CartItem.updateQuantity(existingItem.id, newQuantity);
    } else {
      // 新增购物车项
      const cartItemData = {
        id: generateId(),
        userId,
        goodsId,
        quantity,
        specs,
        selected: true
      };
      
      return await CartItem.create(cartItemData);
    }
  }

  // 更新购物车商品
  async updateCartItem(userId, cartItemId, quantity) {
    const cartItem = await CartItem.findById(cartItemId);
    
    if (!cartItem || cartItem.userId !== userId) {
      throw new Error('购物车项不存在');
    }
    
    if (quantity === 0) {
      // 删除商品
      return await CartItem.delete(cartItemId);
    } else {
      // 更新数量
      const goods = await Goods.findById(cartItem.goodsId);
      if (goods.stock < quantity) {
        throw new Error('库存不足');
      }
      
      return await CartItem.updateQuantity(cartItemId, quantity);
    }
  }
}

module.exports = new CartService();
```

### 3. 订单控制器示例

```javascript
// controllers/OrderController.js
const OrderService = require('../services/OrderService');
const { successResponse, errorResponse } = require('../utils/response');

class OrderController {
  // 创建订单
  async createOrder(req, res) {
    try {
      const userId = req.user.id;
      const { cartItemIds, addressId, couponId, message } = req.body;
      
      // 参数验证
      if (!cartItemIds || !Array.isArray(cartItemIds) || cartItemIds.length === 0) {
        return errorResponse(res, '请选择要结算的商品', 400);
      }
      
      if (!addressId) {
        return errorResponse(res, '请选择收货地址', 400);
      }
      
      const orderData = await OrderService.createOrder(userId, {
        cartItemIds,
        addressId,
        couponId,
        message
      });
      
      return successResponse(res, orderData, '订单创建成功');
    } catch (error) {
      if (error.message.includes('库存不足') || error.message.includes('地址不存在')) {
        return errorResponse(res, error.message, 400);
      }
      return errorResponse(res, error.message, 500);
    }
  }

  // 获取订单列表
  async getOrderList(req, res) {
    try {
      const userId = req.user.id;
      const { status = 'all', page = 1, pageSize = 10 } = req.query;
      
      const orderData = await OrderService.getOrderList(userId, {
        status,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      });
      
      return successResponse(res, orderData, '获取成功');
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

  // 获取订单详情
  async getOrderDetail(req, res) {
    try {
      const userId = req.user.id;
      const { orderNumber } = req.params;
      
      const orderDetail = await OrderService.getOrderDetail(userId, orderNumber);
      
      if (!orderDetail) {
        return errorResponse(res, '订单不存在', 404);
      }
      
      return successResponse(res, orderDetail, '获取成功');
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }
}

module.exports = new OrderController();
```

### 4. 支付控制器示例

```javascript
// controllers/PaymentController.js
const PaymentService = require('../services/PaymentService');
const { successResponse, errorResponse } = require('../utils/response');

class PaymentController {
  // 发起支付
  async payOrder(req, res) {
    try {
      const userId = req.user.id;
      const { orderNumber } = req.params;
      const { paymentMethod, paymentChannel } = req.body;
      
      // 参数验证
      if (!['wechat', 'alipay'].includes(paymentMethod)) {
        return errorResponse(res, '不支持的支付方式', 400);
      }
      
      if (!['h5', 'app', 'mini_program'].includes(paymentChannel)) {
        return errorResponse(res, '不支持的支付渠道', 400);
      }
      
      const paymentData = await PaymentService.createPayment(userId, orderNumber, {
        paymentMethod,
        paymentChannel
      });
      
      return successResponse(res, paymentData, '支付发起成功');
    } catch (error) {
      if (error.message.includes('订单状态') || error.message.includes('订单不存在')) {
        return errorResponse(res, error.message, 400);
      }
      return errorResponse(res, error.message, 500);
    }
  }

  // 支付回调
  async paymentCallback(req, res) {
    try {
      const callbackData = req.body;
      
      // 验证签名
      const isValid = PaymentService.verifySignature(callbackData);
      if (!isValid) {
        return errorResponse(res, '签名验证失败', 400);
      }
      
      // 处理支付结果
      await PaymentService.handlePaymentCallback(callbackData);
      
      return successResponse(res, null, '处理成功');
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

  // 查询支付状态
  async getPaymentStatus(req, res) {
    try {
      const userId = req.user.id;
      const { orderNumber } = req.params;
      
      const paymentStatus = await PaymentService.getPaymentStatus(userId, orderNumber);
      
      return successResponse(res, paymentStatus, '查询成功');
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }
}

module.exports = new PaymentController();
```

---

## 🔍 关键业务逻辑实现

### 1. 订单创建逻辑

```javascript
// services/OrderService.js
async createOrder(userId, orderData) {
  const { cartItemIds, addressId, couponId, message } = orderData;
  
  // 开启数据库事务
  const transaction = await db.transaction();
  
  try {
    // 1. 验证购物车项
    const cartItems = await CartItem.findByIds(cartItemIds, { transaction });
    if (cartItems.length !== cartItemIds.length) {
      throw new Error('购物车数据异常');
    }
    
    // 2. 验证地址
    const address = await UserAddress.findByUserAndId(userId, addressId);
    if (!address) {
      throw new Error('收货地址不存在');
    }
    
    // 3. 计算金额
    let goodsAmount = 0;
    const orderItems = [];
    
    for (const cartItem of cartItems) {
      const goods = await Goods.findById(cartItem.goodsId, { transaction });
      if (!goods) {
        throw new Error(`商品 ${cartItem.goodsId} 不存在`);
      }
      
      if (goods.stock < cartItem.quantity) {
        throw new Error(`商品 ${goods.name} 库存不足`);
      }
      
      const subtotal = goods.price * cartItem.quantity;
      goodsAmount += subtotal;
      
      orderItems.push({
        id: generateId(),
        goodsId: goods.id,
        name: goods.name,
        image: goods.image,
        price: goods.price,
        quantity: cartItem.quantity,
        specs: cartItem.specs,
        subtotal
      });
      
      // 锁定库存
      await Goods.updateStock(goods.id, -cartItem.quantity, { transaction });
    }
    
    // 4. 处理优惠券
    let discountAmount = 0;
    if (couponId) {
      const coupon = await UserCoupon.findByUserAndId(userId, couponId);
      if (!coupon || coupon.status !== 'unused') {
        throw new Error('优惠券不可用');
      }
      
      const template = await CouponTemplate.findById(coupon.templateId);
      if (goodsAmount >= template.minAmount) {
        discountAmount = template.amount;
        
        // 标记优惠券为已使用
        await UserCoupon.markAsUsed(couponId, { transaction });
      }
    }
    
    // 5. 创建订单
    const shippingFee = goodsAmount >= 100 ? 0 : 10; // 满100免运费
    const totalAmount = goodsAmount + shippingFee - discountAmount;
    
    const orderNumber = generateOrderNumber();
    const orderId = generateId();
    
    const order = await Order.create({
      id: orderId,
      orderNumber,
      userId,
      addressId,
      totalAmount,
      goodsAmount,
      shippingFee,
      discountAmount,
      payableAmount: totalAmount,
      status: 'pending_payment',
      couponId,
      message
    }, { transaction });
    
    // 6. 创建订单商品
    for (const item of orderItems) {
      item.orderId = orderId;
      await OrderItem.create(item, { transaction });
    }
    
    // 7. 删除购物车项
    await CartItem.deleteByIds(cartItemIds, { transaction });
    
    // 提交事务
    await transaction.commit();
    
    return {
      id: orderId,
      orderNumber,
      totalAmount,
      goodsAmount,
      shippingFee,
      discountAmount,
      payableAmount: totalAmount,
      status: 'pending_payment',
      createTime: new Date(),
      items: orderItems
    };
    
  } catch (error) {
    // 回滚事务
    await transaction.rollback();
    throw error;
  }
}
```

### 2. 支付处理逻辑

```javascript
// services/PaymentService.js
async createPayment(userId, orderNumber, paymentData) {
  const { paymentMethod, paymentChannel } = paymentData;
  
  // 1. 验证订单
  const order = await Order.findByUserAndNumber(userId, orderNumber);
  if (!order) {
    throw new Error('订单不存在');
  }
  
  if (order.status !== 'pending_payment') {
    throw new Error('订单状态不允许支付');
  }
  
  // 2. 创建支付记录
  const paymentOrderId = generatePaymentOrderId();
  const expireTime = new Date(Date.now() + 30 * 60 * 1000); // 30分钟过期
  
  const paymentRecord = await PaymentRecord.create({
    id: generateId(),
    orderId: order.id,
    orderNumber,
    paymentOrderId,
    paymentMethod,
    paymentChannel,
    paymentAmount: order.payableAmount,
    status: 'pending',
    expireTime
  });
  
  // 3. 调用第三方支付接口
  let paymentInfo;
  if (paymentMethod === 'wechat') {
    paymentInfo = await this.createWechatPayment(paymentOrderId, order.payableAmount, paymentChannel);
  } else if (paymentMethod === 'alipay') {
    paymentInfo = await this.createAlipayPayment(paymentOrderId, order.payableAmount, paymentChannel);
  }
  
  return {
    paymentOrderId,
    paymentInfo,
    paymentUrl: paymentInfo.paymentUrl,
    expireTime
  };
}

async handlePaymentCallback(callbackData) {
  const { orderNumber, paymentOrderId, paymentStatus, transactionId } = callbackData;
  
  const transaction = await db.transaction();
  
  try {
    // 1. 查找支付记录
    const paymentRecord = await PaymentRecord.findByPaymentOrderId(paymentOrderId, { transaction });
    if (!paymentRecord) {
      throw new Error('支付记录不存在');
    }
    
    // 2. 更新支付记录
    await PaymentRecord.update(paymentRecord.id, {
      status: paymentStatus === 'success' ? 'success' : 'failed',
      transactionId,
      successTime: paymentStatus === 'success' ? new Date() : null,
      callbackData: JSON.stringify(callbackData)
    }, { transaction });
    
    // 3. 更新订单状态
    if (paymentStatus === 'success') {
      await Order.updateStatus(paymentRecord.orderId, 'paid', {
        payTime: new Date()
      }, { transaction });
      
      // 4. 扣减实际库存（之前只是锁定）
      const orderItems = await OrderItem.findByOrderId(paymentRecord.orderId, { transaction });
      for (const item of orderItems) {
        await Goods.confirmStockReduction(item.goodsId, item.quantity, { transaction });
      }
    }
    
    await transaction.commit();
    
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}
```

---

## 🧪 测试指导

### 1. 单元测试示例

```javascript
// tests/services/CartService.test.js
const CartService = require('../../src/services/CartService');
const CartItem = require('../../src/models/CartItem');
const Goods = require('../../src/models/Goods');

describe('CartService', () => {
  beforeEach(async () => {
    // 清理测试数据
    await CartItem.deleteAll();
    await Goods.deleteAll();
    
    // 创建测试商品
    await Goods.create({
      id: 'goods_001',
      name: '测试商品',
      price: 100.00,
      stock: 10
    });
  });

  describe('addToCart', () => {
    test('should add new item to cart successfully', async () => {
      const result = await CartService.addToCart('user_001', 'goods_001', 2);
      
      expect(result).toBeDefined();
      expect(result.cartItemId).toBeDefined();
      expect(result.totalQuantity).toBe(2);
    });

    test('should throw error when goods not exists', async () => {
      await expect(
        CartService.addToCart('user_001', 'invalid_goods', 1)
      ).rejects.toThrow('商品不存在');
    });

    test('should throw error when stock insufficient', async () => {
      await expect(
        CartService.addToCart('user_001', 'goods_001', 20)
      ).rejects.toThrow('库存不足');
    });
  });
});
```

### 2. API集成测试

```javascript
// tests/api/cart.test.js
const request = require('supertest');
const app = require('../../src/app');

describe('Cart API', () => {
  let authToken;
  
  beforeAll(async () => {
    // 获取测试用户的认证Token
    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({ username: 'test_user', password: 'test_password' });
    
    authToken = loginResponse.body.data.token;
  });

  describe('POST /api/v1/cart/add', () => {
    test('should add item to cart successfully', async () => {
      const response = await request(app)
        .post('/api/v1/cart/add')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          goodsId: 'goods_001',
          quantity: 2,
          specs: '2.5kg装'
        });

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(200);
      expect(response.body.data.cartItemId).toBeDefined();
    });

    test('should return 400 for invalid goods', async () => {
      const response = await request(app)
        .post('/api/v1/cart/add')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          goodsId: 'invalid_goods',
          quantity: 1
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe(400);
    });
  });
});
```

---

## 📊 性能优化建议

### 1. 数据库优化

```sql
-- 为高频查询添加索引
CREATE INDEX idx_cart_user_selected ON cart_items(user_id, selected);
CREATE INDEX idx_orders_user_status_time ON orders(user_id, status, create_time);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- 分区表（适用于大数据量场景）
ALTER TABLE orders PARTITION BY RANGE (YEAR(create_time)) (
  PARTITION p2024 VALUES LESS THAN (2025),
  PARTITION p2025 VALUES LESS THAN (2026),
  PARTITION p2026 VALUES LESS THAN (2027)
);
```

### 2. 缓存策略

```javascript
// 购物车数据缓存
const Redis = require('redis');
const client = Redis.createClient();

class CartCache {
  static async get(userId) {
    const key = `cart:${userId}`;
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  }
  
  static async set(userId, cartData) {
    const key = `cart:${userId}`;
    await client.setex(key, 3600, JSON.stringify(cartData)); // 1小时过期
  }
  
  static async clear(userId) {
    const key = `cart:${userId}`;
    await client.del(key);
  }
}
```

### 3. 异步处理

```javascript
// 订单创建后的异步处理
const Queue = require('bull');
const orderQueue = new Queue('order processing');

// 订单创建成功后，异步处理库存和通知
orderQueue.add('process-order', {
  orderId: order.id,
  userId: order.userId
}, {
  delay: 0,
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 2000
  }
});

orderQueue.process('process-order', async (job) => {
  const { orderId, userId } = job.data;
  
  // 发送订单创建通知
  await NotificationService.sendOrderNotification(userId, orderId);
  
  // 更新用户积分
  await UserService.updatePoints(userId, 'order_created');
  
  // 记录用户行为
  await AnalyticsService.recordEvent(userId, 'order_created', { orderId });
});
```

---

## 🔧 部署配置

### 1. Docker配置

```dockerfile
# Dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 8080

CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
      - DB_HOST=mysql
      - REDIS_HOST=redis
    depends_on:
      - mysql
      - redis

  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root_password
      MYSQL_DATABASE: petpal
      MYSQL_USER: petpal
      MYSQL_PASSWORD: petpal_password
    volumes:
      - mysql_data:/var/lib/mysql
      - ./database-schema.sql:/docker-entrypoint-initdb.d/init.sql

  redis:
    image: redis:6-alpine
    volumes:
      - redis_data:/data

volumes:
  mysql_data:
  redis_data:
```

### 2. 环境配置

```javascript
// config/app.js
module.exports = {
  port: process.env.PORT || 8080,
  
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    database: process.env.DB_NAME || 'petpal',
    username: process.env.DB_USER || 'petpal',
    password: process.env.DB_PASSWORD || 'petpal_password',
    dialect: 'mysql',
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },
  
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || null
  },
  
  payment: {
    wechat: {
      appId: process.env.WECHAT_APP_ID,
      mchId: process.env.WECHAT_MCH_ID,
      apiKey: process.env.WECHAT_API_KEY
    },
    alipay: {
      appId: process.env.ALIPAY_APP_ID,
      privateKey: process.env.ALIPAY_PRIVATE_KEY,
      publicKey: process.env.ALIPAY_PUBLIC_KEY
    }
  }
};
```

---

## 📞 开发支持

### 技术支持联系方式
- **前端对接人:** 前端开发团队
- **API文档:** [PetPal-购物车结算流程-后端API开发文档.md](./PetPal-购物车结算流程-后端API开发文档.md)
- **数据库设计:** [database-schema.sql](./database-schema.sql)
- **测试集合:** [PetPal-购物车结算流程-Postman测试集合.json](./PetPal-购物车结算流程-Postman测试集合.json)

### 开发进度跟踪
建议使用如下方式跟踪开发进度：

```markdown
## 开发进度
- [ ] 第一阶段：购物车基础功能 (预计3天)
  - [ ] 数据库表创建
  - [ ] 购物车API开发
  - [ ] 订单创建功能
  - [ ] 订单查询功能

- [ ] 第二阶段：支付功能 (预计2天)
  - [ ] 支付API开发
  - [ ] 订单状态管理

- [ ] 第三阶段：完善功能 (预计1天)
  - [ ] 地址管理
  - [ ] 优惠券功能

- [ ] 第四阶段：测试和优化 (预计1天)
  - [ ] 集成测试
  - [ ] 性能优化
  - [ ] 部署配置
```

---

**文档版本:** v1.0.0  
**最后更新:** 2025年7月14日  
**更新内容:** 初始版本，包含完整的开发指导和代码示例
