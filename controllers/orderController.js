const { getRedisClient } = require('../config/redis');
const { v4: uuidv4 } = require('uuid');
const Goods = require('../models/Goods');

const redisClient = getRedisClient();

// 确保Redis连接
const ensureConnection = async () => {
  if (!redisClient.isOpen) {
    console.log('Redis client not connected, attempting to connect...');
    await redisClient.connect();
    console.log('Redis client connected');
  }
};

// 生成唯一ID
const generateId = (prefix) => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// 生成订单号
const generateOrderNumber = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  const second = String(now.getSeconds()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  return `PO${year}${month}${day}${hour}${minute}${second}${random}`;
};

// 1. 创建订单
exports.createOrder = async (req, res) => {
  try {
    await ensureConnection();
    
    const { cartItemIds, addressId, message } = req.body;
    const { userId } = req.user;
    
    // 参数验证
    if (!cartItemIds || !Array.isArray(cartItemIds) || cartItemIds.length === 0) {
      return res.status(400).json({
        code: 400,
        message: "请选择要结算的商品",
        data: null
      });
    }
    
    if (!addressId) {
      return res.status(400).json({
        code: 400,
        message: "请选择收货地址",
        data: null
      });
    }
    
    // 获取购物车数据
    const cartKey = `cart:${userId}`;
    const cartData = await redisClient.get(cartKey);
    
    let selectedCartItems = [];
    
    if (!cartData) {
      // 测试模式：如果购物车为空，使用模拟数据
      console.log('🛒 购物车为空，使用测试数据');
      selectedCartItems = [
        {
          id: 'cart_item_1',
          goodsId: 'G001',
          name: '高级猫粮',
          image: 'https://example.com/cat-food.jpg',
          price: 140.00,
          quantity: 2,
          specs: '5kg装'
        },
        {
          id: 'cart_item_2',
          goodsId: 'G002',
          name: '宠物玩具',
          image: 'https://example.com/pet-toy.jpg',
          price: 50.00,
          quantity: 1,
          specs: '小型犬适用'
        }
      ];
    } else {
      const cart = JSON.parse(cartData);
      selectedCartItems = cart.items.filter(item => cartItemIds.includes(item.id));
      
      if (selectedCartItems.length !== cartItemIds.length) {
        return res.status(400).json({
          code: 400,
          message: "购物车数据异常",
          data: null
        });
      }
      
      // 获取每个商品的详细信息
      for (let i = 0; i < selectedCartItems.length; i++) {
        const item = selectedCartItems[i];
        try {
          const goods = await Goods.getGoodsById(item.goodsId);
          if (goods) {
            selectedCartItems[i] = {
              ...item,
              name: goods.name,
              price: parseFloat(goods.price),
              image: goods.images && goods.images.length > 0 ? goods.images[0] : null,
              specs: item.specs || goods.specs || ''
            };
          } else {
            console.log(`⚠️ 商品不存在: ${item.goodsId}`);
            return res.status(400).json({
              code: 400,
              message: `商品不存在: ${item.goodsId}`,
              data: null
            });
          }
        } catch (error) {
          console.error(`获取商品信息失败 ${item.goodsId}:`, error);
          return res.status(400).json({
            code: 400,
            message: `获取商品信息失败: ${item.goodsId}`,
            data: null
          });
        }
      }
    }
    
    // 验证收货地址
    const addressKey = `address:${userId}:${addressId}`;
    const addressData = await redisClient.get(addressKey);
    
    if (!addressData) {
      return res.status(400).json({
        code: 400,
        message: "收货地址不存在",
        data: null
      });
    }
    
    const address = JSON.parse(addressData);
    
    // 确保地址信息完整
    if (!address.name || !address.phone) {
      return res.status(400).json({
        code: 400,
        message: "收货地址信息不完整",
        data: null
      });
    }
    
    // 计算订单金额和验证库存
    let goodsAmount = 0;
    const orderItems = [];
    
    for (const cartItem of selectedCartItems) {
      // 确保商品信息完整
      if (!cartItem.name || !cartItem.price || cartItem.price <= 0) {
        return res.status(400).json({
          code: 400,
          message: "商品信息不完整或价格异常",
          data: null
        });
      }
      
      const subtotal = parseFloat((cartItem.price * cartItem.quantity).toFixed(2));
      goodsAmount += subtotal;
      
      orderItems.push({
        id: generateId('item'),
        goodsId: cartItem.goodsId || generateId('goods'),
        name: cartItem.name,
        image: cartItem.image || 'https://via.placeholder.com/100x100?text=商品图片',
        price: parseFloat(cartItem.price),
        quantity: cartItem.quantity,
        specs: cartItem.specs || '规格信息缺失',
        subtotal
      });
    }
    
    // 计算运费（满100免运费）
    const shippingFee = goodsAmount >= 100 ? 0 : 12;
    const totalAmount = parseFloat((goodsAmount + shippingFee).toFixed(2));
    
    // 创建订单
    const orderId = generateId('order');
    const orderNumber = generateOrderNumber();
    const currentTime = new Date().toISOString();
    
    const orderData = {
      id: orderId,
      orderNumber,
      userId,
      addressId,
      address: {
        name: address.name,
        phone: address.phone,
        province: address.province || '',
        city: address.city || '',
        district: address.district || '',
        detailAddress: address.detailAddress || ''
      },
      totalAmount,
      goodsAmount: parseFloat(goodsAmount.toFixed(2)),
      shippingFee,
      payableAmount: totalAmount,
      status: 'pending_payment',
      statusText: '待付款',
      message: message || '',
      createTime: currentTime,
      payExpireTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30分钟后过期
      items: orderItems
    };
    
    // 保存订单数据
    await redisClient.set(`order:${orderNumber}`, JSON.stringify(orderData));
    
    // 添加到用户订单列表
    const userOrdersKey = `user:${userId}:orders`;
    await redisClient.lPush(userOrdersKey, orderNumber);
    
    // 如果不是测试模式，从购物车中删除已结算的商品
    if (cartData) {
      const cart = JSON.parse(cartData);
      cart.items = cart.items.filter(item => !cartItemIds.includes(item.id));
      await redisClient.set(cartKey, JSON.stringify(cart));
    }
    
    res.status(200).json({
      code: 200,
      message: "订单创建成功",
      data: {
        orderNumber,
        orderId,
        status: 'pending_payment',
        statusText: '待付款',
        createTime: currentTime,
        totalAmount,
        goodsAmount: parseFloat(goodsAmount.toFixed(2)),
        shippingFee,
        address: {
          id: addressId,
          name: address.name,
          phone: address.phone,
          province: address.province || '',
          city: address.city || '',
          district: address.district || '',
          detailAddress: address.detailAddress || ''
        },
        goods: orderItems.map(item => ({
          id: item.goodsId,
          name: item.name,
          image: item.image,
          specs: item.specs,
          price: item.price,
          quantity: item.quantity,
          subtotal: item.subtotal
        }))
      }
    });

  } catch (error) {
    console.error('创建订单失败:', error);
    res.status(500).json({
      code: 500,
      message: "服务器内部错误",
      data: null
    });
  }
};

// 2. 获取订单列表
exports.getOrderList = async (req, res) => {
  try {
    await ensureConnection();
    
    const { status = 'all', page = 1, pageSize = 10 } = req.query;
    const { userId } = req.user;
    
    const pageNum = Math.max(1, parseInt(page));
    const pageSizeNum = Math.min(20, Math.max(1, parseInt(pageSize)));
    
    // 获取用户订单列表
    const userOrdersKey = `user:${userId}:orders`;
    const orderNumbers = await redisClient.lRange(userOrdersKey, 0, -1);
    
    const orders = [];
    
    for (const orderNumber of orderNumbers) {
      const orderData = await redisClient.get(`order:${orderNumber}`);
      if (orderData) {
        const order = JSON.parse(orderData);
        
        // 按状态筛选
        if (status !== 'all' && order.status !== status) continue;
        
        // 格式化订单数据，符合前端期望的结构
        const formattedOrder = {
          orderNumber: order.orderNumber,
          orderId: order.id,
          status: order.status,
          statusText: order.statusText,
          createTime: order.createTime,
          payTime: order.payTime || null,
          shipTime: order.shipTime || null,
          completeTime: order.completeTime || null,
          totalAmount: order.totalAmount || 0,
          goodsAmount: order.goodsAmount || 0,
          shippingFee: order.shippingFee || 0,
          // 前端期望的地址信息格式
          addressInfo: order.address ? {
            id: order.addressId || 'addr_' + order.orderNumber,
            receiver: order.address.name || '收货人',
            phone: order.address.phone || '',
            address: `${order.address.province || ''}${order.address.city || ''}${order.address.district || ''}${order.address.detailAddress || ''}`
          } : {
            id: 'addr_default',
            receiver: '收货人',
            phone: '',
            address: '地址信息缺失'
          },
          // 前端期望的商品信息格式
          goodsInfo: (order.items || []).map(item => ({
            id: item.goodsId || 'goods_' + Math.random().toString(36).substr(2, 9),
            name: item.name || '商品信息缺失',
            image: item.image || 'https://via.placeholder.com/100x100?text=商品图片',
            specs: item.specs || '规格信息缺失',
            price: item.price || 0,
            quantity: item.quantity || 1
          }))
        };
        
        orders.push(formattedOrder);
      }
    }
    
    // 按创建时间倒序排列
    orders.sort((a, b) => new Date(b.createTime) - new Date(a.createTime));
    
    // 分页处理
    const startIndex = (pageNum - 1) * pageSizeNum;
    const endIndex = startIndex + pageSizeNum;
    const paginatedOrders = orders.slice(startIndex, endIndex);
    
    res.status(200).json({
      code: 200,
      message: "获取成功",
      data: {
        list: paginatedOrders,
        total: orders.length,
        page: pageNum,
        pageSize: pageSizeNum,
        hasMore: endIndex < orders.length
      }
    });

  } catch (error) {
    console.error('获取订单列表失败:', error);
    res.status(500).json({
      code: 500,
      message: "服务器内部错误",
      data: null
    });
  }
};

// 3. 获取订单详情
exports.getOrderDetail = async (req, res) => {
  try {
    await ensureConnection();
    
    const { orderNumber } = req.params;
    const { userId } = req.user;
    
    const orderData = await redisClient.get(`order:${orderNumber}`);
    
    if (!orderData) {
      return res.status(404).json({
        code: 404,
        message: "订单不存在",
        data: null
      });
    }
    
    const order = JSON.parse(orderData);
    
    // 验证订单归属
    if (order.userId !== userId) {
      return res.status(403).json({
        code: 403,
        message: "无权查看该订单",
        data: null
      });
    }
    
    res.status(200).json({
      code: 200,
      message: "获取成功",
      data: {
        orderNumber: order.orderNumber,
        status: order.status,
        statusText: order.statusText,
        totalAmount: order.totalAmount || 0,
        goodsAmount: order.goodsAmount || 0,
        shippingFee: order.shippingFee || 0,
        createTime: order.createTime,
        payExpireTime: order.payExpireTime,
        // 前端期望的地址信息格式
        addressInfo: order.address ? {
          id: order.addressId || 'addr_' + order.orderNumber,
          receiver: order.address.name || '收货人',
          phone: order.address.phone || '',
          address: `${order.address.province || ''}${order.address.city || ''}${order.address.district || ''}${order.address.detailAddress || ''}`
        } : {
          id: 'addr_default',
          receiver: '收货人',
          phone: '',
          address: '地址信息缺失'
        },
        // 前端期望的商品信息格式
        goodsInfo: (order.items || []).map(item => ({
          id: item.goodsId || 'goods_' + Math.random().toString(36).substr(2, 9),
          name: item.name || '商品信息缺失',
          image: item.image || 'https://via.placeholder.com/100x100?text=商品图片',
          specs: item.specs || '规格信息缺失',
          price: item.price || 0,
          quantity: item.quantity || 1
        })),
        logistics: {
          company: "顺丰速运",
          trackingNumber: order.trackingNumber || "",
          status: order.status === 'shipped' ? "运输中" : order.status === 'delivered' ? "已送达" : "待发货"
        }
      }
    });

  } catch (error) {
    console.error('获取订单详情失败:', error);
    res.status(500).json({
      code: 500,
      message: "服务器内部错误",
      data: null
    });
  }
};

// 4. 订单支付
exports.payOrder = async (req, res) => {
  try {
    await ensureConnection();
    
    const { orderNumber } = req.params;
    const { paymentMethod, paymentChannel } = req.body;
    const { userId } = req.user;
    
    // 参数验证
    if (!paymentMethod || !paymentChannel) {
      return res.status(400).json({
        code: 400,
        message: "支付方式和支付渠道不能为空",
        data: null
      });
    }
    
    // 验证支付方式
    const validPaymentMethods = ['wechat', 'alipay', 'bank'];
    if (!validPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({
        code: 400,
        message: "不支持的支付方式",
        data: null
      });
    }
    
    // 验证支付渠道
    const validPaymentChannels = ['wechat_pay', 'alipay_app', 'bank_transfer'];
    if (!validPaymentChannels.includes(paymentChannel)) {
      return res.status(400).json({
        code: 400,
        message: "不支持的支付渠道",
        data: null
      });
    }
    
    const orderData = await redisClient.get(`order:${orderNumber}`);
    
    if (!orderData) {
      return res.status(404).json({
        code: 404,
        message: "订单不存在",
        data: null
      });
    }
    
    const order = JSON.parse(orderData);
    
    // 验证订单归属
    if (order.userId !== userId) {
      return res.status(403).json({
        code: 403,
        message: "无权操作该订单",
        data: null
      });
    }
    
    // 验证订单状态
    if (order.status !== 'pending_payment') {
      return res.status(400).json({
        code: 400,
        message: "订单状态不允许支付",
        data: null
      });
    }
    
    // 检查订单是否过期
    if (order.payExpireTime && new Date() > new Date(order.payExpireTime)) {
      return res.status(400).json({
        code: 400,
        message: "订单已过期",
        data: null
      });
    }
    
    // 模拟支付成功（实际项目中应该调用真实的支付接口）
    const currentTime = new Date().toISOString();
    
    // 更新订单状态
    order.status = 'pending_shipment';
    order.statusText = '待发货';
    order.payTime = currentTime;
    order.paymentMethod = paymentMethod;
    order.paymentChannel = paymentChannel;
    
    // 保存更新后的订单
    await redisClient.set(`order:${orderNumber}`, JSON.stringify(order));
    
    res.status(200).json({
      code: 200,
      message: "支付成功",
      data: {
        orderNumber,
        paymentId: `PAY${Date.now()}`,
        payTime: currentTime,
        status: 'pending_shipment',
        statusText: '待发货'
      }
    });

  } catch (error) {
    console.error('订单支付失败:', error);
    res.status(500).json({
      code: 500,
      message: "服务器内部错误",
      data: null
    });
  }
};

// 5. 支付状态查询
exports.getPaymentStatus = async (req, res) => {
  try {
    await ensureConnection();
    
    const { orderNumber } = req.params;
    const { userId } = req.user;
    
    const orderData = await redisClient.get(`order:${orderNumber}`);
    
    if (!orderData) {
      return res.status(404).json({
        code: 404,
        message: "订单不存在",
        data: null
      });
    }
    
    const order = JSON.parse(orderData);
    
    if (order.userId !== userId) {
      return res.status(403).json({
        code: 403,
        message: "无权查看该订单",
        data: null
      });
    }
    
    res.status(200).json({
      code: 200,
      message: "查询成功",
      data: {
        orderNumber,
        paymentStatus: order.status === 'paid' ? 'success' : order.status === 'pending_payment' ? 'pending' : 'failed',
        paymentTime: order.payTime || null,
        paymentMethod: order.paymentMethod || null,
        paymentAmount: order.payableAmount
      }
    });

  } catch (error) {
    console.error('查询支付状态失败:', error);
    res.status(500).json({
      code: 500,
      message: "服务器内部错误",
      data: null
    });
  }
};

// 6. 模拟支付成功回调（开发测试用）
exports.mockPaymentSuccess = async (req, res) => {
  try {
    await ensureConnection();
    
    const { orderNumber } = req.body;
    
    const orderData = await redisClient.get(`order:${orderNumber}`);
    
    if (!orderData) {
      return res.status(404).json({
        code: 404,
        message: "订单不存在",
        data: null
      });
    }
    
    const order = JSON.parse(orderData);
    
    // 更新订单状态
    order.status = 'paid';
    order.statusText = '已付款';
    order.payTime = new Date().toISOString();
    order.paymentMethod = 'mock';
    
    await redisClient.set(`order:${orderNumber}`, JSON.stringify(order));
    
    res.status(200).json({
      code: 200,
      message: "支付成功",
      data: {
        orderNumber,
        status: 'paid',
        payTime: order.payTime
      }
    });

  } catch (error) {
    console.error('模拟支付失败:', error);
    res.status(500).json({
      code: 500,
      message: "服务器内部错误",
      data: null
    });
  }
};

// 7. 取消订单
exports.cancelOrder = async (req, res) => {
  try {
    await ensureConnection();
    
    const { orderNumber } = req.params;
    const { reason } = req.body;
    const { userId } = req.user;
    
    const orderData = await redisClient.get(`order:${orderNumber}`);
    
    if (!orderData) {
      return res.status(404).json({
        code: 404,
        message: "订单不存在",
        data: null
      });
    }
    
    const order = JSON.parse(orderData);
    
    if (order.userId !== userId) {
      return res.status(403).json({
        code: 403,
        message: "无权操作该订单",
        data: null
      });
    }
    
    // 只有待付款状态可以取消
    if (order.status !== 'pending_payment') {
      return res.status(400).json({
        code: 400,
        message: "订单状态不允许取消",
        data: null
      });
    }
    
    // 更新订单状态
    order.status = 'cancelled';
    order.statusText = '已取消';
    order.cancelTime = new Date().toISOString();
    order.cancelReason = reason || '用户取消';
    
    await redisClient.set(`order:${orderNumber}`, JSON.stringify(order));
    
    res.status(200).json({
      code: 200,
      message: "订单取消成功",
      data: {
        orderNumber,
        status: 'cancelled',
        cancelTime: order.cancelTime
      }
    });

  } catch (error) {
    console.error('取消订单失败:', error);
    res.status(500).json({
      code: 500,
      message: "服务器内部错误",
      data: null
    });
  }
};

// 8. 确认收货
exports.confirmOrder = async (req, res) => {
  try {
    await ensureConnection();
    
    const { orderNumber } = req.params;
    const { userId } = req.user;
    
    const orderData = await redisClient.get(`order:${orderNumber}`);
    
    if (!orderData) {
      return res.status(404).json({
        code: 404,
        message: "订单不存在",
        data: null
      });
    }
    
    const order = JSON.parse(orderData);
    
    if (order.userId !== userId) {
      return res.status(403).json({
        code: 403,
        message: "无权操作该订单",
        data: null
      });
    }
    
    // 只有已发货状态可以确认收货
    if (order.status !== 'shipped') {
      return res.status(400).json({
        code: 400,
        message: "订单状态不允许确认收货",
        data: null
      });
    }
    
    // 更新订单状态
    order.status = 'completed';
    order.statusText = '已完成';
    order.confirmTime = new Date().toISOString();
    
    await redisClient.set(`order:${orderNumber}`, JSON.stringify(order));
    
    res.status(200).json({
      code: 200,
      message: "确认收货成功",
      data: {
        orderNumber,
        status: 'completed',
        confirmTime: order.confirmTime
      }
    });

  } catch (error) {
    console.error('确认收货失败:', error);
    res.status(500).json({
      code: 500,
      message: "服务器内部错误",
      data: null
    });
  }
};

// 9. 获取订单统计
exports.getOrderStats = async (req, res) => {
  try {
    await ensureConnection();
    
    const { userId } = req.user;
    
    // 获取用户订单列表
    const userOrdersKey = `user:${userId}:orders`;
    const orderNumbers = await redisClient.lRange(userOrdersKey, 0, -1);
    
    const stats = {
      pendingPayment: 0,
      paid: 0,
      shipped: 0,
      delivered: 0,
      completed: 0,
      totalOrders: orderNumbers.length
    };
    
    for (const orderNumber of orderNumbers) {
      const orderData = await redisClient.get(`order:${orderNumber}`);
      if (orderData) {
        const order = JSON.parse(orderData);
        switch (order.status) {
          case 'pending_payment':
            stats.pendingPayment++;
            break;
          case 'paid':
            stats.paid++;
            break;
          case 'shipped':
            stats.shipped++;
            break;
          case 'delivered':
            stats.delivered++;
            break;
          case 'completed':
            stats.completed++;
            break;
        }
      }
    }
    
    res.status(200).json({
      code: 200,
      message: "获取成功",
      data: stats
    });

  } catch (error) {
    console.error('获取订单统计失败:', error);
    res.status(500).json({
      code: 500,
      message: "服务器内部错误",
      data: null
    });
  }
};

module.exports = {
  createOrder: exports.createOrder,
  getOrderList: exports.getOrderList,
  getOrderDetail: exports.getOrderDetail,
  payOrder: exports.payOrder,
  getPaymentStatus: exports.getPaymentStatus,
  mockPaymentSuccess: exports.mockPaymentSuccess,
  cancelOrder: exports.cancelOrder,
  confirmOrder: exports.confirmOrder,
  getOrderStats: exports.getOrderStats
};
