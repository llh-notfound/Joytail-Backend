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

// 1. 获取购物车列表
exports.getCartList = async (req, res) => {
  try {
    await ensureConnection();
    
    const { userId } = req.user;
    const cartKey = `cart:${userId}`;
    
    // 从Redis获取购物车数据
    const cartData = await redisClient.get(cartKey);
    
    if (!cartData) {
      return res.status(200).json({
        code: 200,
        message: "success",
        data: []
      });
    }
    
    const cart = JSON.parse(cartData);
    const cartItems = [];
    
    // 获取每个商品的详细信息
    for (const item of cart.items || []) {
      try {
        const goods = await Goods.getGoodsById(item.goodsId);
        if (goods) {
          cartItems.push({
            id: item.id,
            name: goods.name,
            price: parseFloat(goods.price),
            quantity: item.quantity,
            total: parseFloat((goods.price * item.quantity).toFixed(2)),
            image: goods.images && goods.images.length > 0 ? goods.images[0] : null,
            specs: item.specs || '',
            selected: item.selected !== undefined ? item.selected : true,
            goodsId: item.goodsId
          });
        }
      } catch (error) {
        console.error(`获取商品信息失败 ${item.goodsId}:`, error);
      }
    }
    
    res.status(200).json({
      code: 200,
      message: "success",
      data: cartItems
    });

  } catch (error) {
    console.error('获取购物车列表失败:', error);
    res.status(500).json({
      code: 500,
      message: "服务器内部错误",
      data: null
    });
  }
};

// 2. 添加商品到购物车
exports.addToCart = async (req, res) => {
  try {
    await ensureConnection();
    
    const { goodsId, quantity = 1, specs = '' } = req.body;
    const { userId } = req.user;
    
    // 参数验证
    if (!goodsId) {
      return res.status(400).json({
        code: 400,
        message: "商品ID不能为空",
        data: null
      });
    }
    
    if (quantity < 1 || quantity > 99) {
      return res.status(400).json({
        code: 400,
        message: "商品数量必须在1-99之间",
        data: null
      });
    }
    
    // 验证商品是否存在
    const goods = await Goods.getGoodsById(goodsId);
    if (!goods) {
      return res.status(400).json({
        code: 400,
        message: "商品不存在",
        data: null
      });
    }
    
    const cartKey = `cart:${userId}`;
    const cartData = await redisClient.get(cartKey);
    const cart = cartData ? JSON.parse(cartData) : { items: [] };
    
    // 检查是否已存在相同商品和规格
    const existingItemIndex = cart.items.findIndex(
      item => item.goodsId === goodsId && item.specs === specs
    );
    
    if (existingItemIndex !== -1) {
      // 如果存在，增加数量
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      if (newQuantity > 99) {
        return res.status(400).json({
          code: 400,
          message: "商品数量不能超过99个",
          data: null
        });
      }
      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      // 如果不存在，创建新的购物车项
      const cartItem = {
        id: generateId('cart'),
        goodsId,
        quantity,
        specs,
        selected: true,
        createdAt: new Date().toISOString()
      };
      cart.items.push(cartItem);
    }
    
    // 保存购物车数据
    await redisClient.set(cartKey, JSON.stringify(cart));
    
    res.status(200).json({
      code: 200,
      message: "添加成功",
      data: null
    });

  } catch (error) {
    console.error('添加商品到购物车失败:', error);
    res.status(500).json({
      code: 500,
      message: "服务器内部错误",
      data: null
    });
  }
};

// 3. 更新购物车商品数量
exports.updateCartItem = async (req, res) => {
  try {
    await ensureConnection();
    
    const { cartItemId, quantity } = req.body;
    const { userId } = req.user;
    
    // 参数验证
    if (!cartItemId) {
      return res.status(400).json({
        code: 400,
        message: "购物车项ID不能为空",
        data: null
      });
    }
    
    if (quantity < 1 || quantity > 99) {
      return res.status(400).json({
        code: 400,
        message: "商品数量必须在1-99之间",
        data: null
      });
    }
    
    const cartKey = `cart:${userId}`;
    const cartData = await redisClient.get(cartKey);
    
    if (!cartData) {
      return res.status(404).json({
        code: 404,
        message: "购物车商品不存在",
        data: null
      });
    }
    
    const cart = JSON.parse(cartData);
    const itemIndex = cart.items.findIndex(item => item.id === cartItemId);
    
    if (itemIndex === -1) {
      return res.status(404).json({
        code: 404,
        message: "购物车商品不存在",
        data: null
      });
    }
    
    // 更新数量
    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].updatedAt = new Date().toISOString();
    
    // 保存购物车数据
    await redisClient.set(cartKey, JSON.stringify(cart));
    
    res.status(200).json({
      code: 200,
      message: "更新成功",
      data: null
    });

  } catch (error) {
    console.error('更新购物车商品数量失败:', error);
    res.status(500).json({
      code: 500,
      message: "服务器内部错误",
      data: null
    });
  }
};

// 4. 更新购物车商品选中状态
exports.updateCartItemSelected = async (req, res) => {
  try {
    await ensureConnection();
    
    const { cartItemId, selected } = req.body;
    const { userId } = req.user;
    
    // 参数验证
    if (!cartItemId) {
      return res.status(400).json({
        code: 400,
        message: "购物车项ID不能为空",
        data: null
      });
    }
    
    if (selected === undefined || selected === null) {
      return res.status(400).json({
        code: 400,
        message: "选中状态不能为空",
        data: null
      });
    }
    
    const cartKey = `cart:${userId}`;
    const cartData = await redisClient.get(cartKey);
    
    if (!cartData) {
      return res.status(404).json({
        code: 404,
        message: "购物车商品不存在",
        data: null
      });
    }
    
    const cart = JSON.parse(cartData);
    const itemIndex = cart.items.findIndex(item => item.id === cartItemId);
    
    if (itemIndex === -1) {
      return res.status(404).json({
        code: 404,
        message: "购物车商品不存在",
        data: null
      });
    }
    
    // 更新选中状态
    cart.items[itemIndex].selected = selected;
    cart.items[itemIndex].updatedAt = new Date().toISOString();
    
    // 保存购物车数据
    await redisClient.set(cartKey, JSON.stringify(cart));
    
    res.status(200).json({
      code: 200,
      message: "更新成功",
      data: null
    });

  } catch (error) {
    console.error('更新购物车商品选中状态失败:', error);
    res.status(500).json({
      code: 500,
      message: "服务器内部错误",
      data: null
    });
  }
};

// 5. 全选/取消全选
exports.selectAllCartItems = async (req, res) => {
  try {
    await ensureConnection();
    
    const { selected } = req.body;
    const { userId } = req.user;
    
    // 参数验证
    if (selected === undefined || selected === null) {
      return res.status(400).json({
        code: 400,
        message: "选中状态不能为空",
        data: null
      });
    }
    
    const cartKey = `cart:${userId}`;
    const cartData = await redisClient.get(cartKey);
    
    if (!cartData) {
      return res.status(200).json({
        code: 200,
        message: "操作成功",
        data: null
      });
    }
    
    const cart = JSON.parse(cartData);
    
    // 批量更新所有商品的选中状态
    cart.items = cart.items.map(item => ({
      ...item,
      selected,
      updatedAt: new Date().toISOString()
    }));
    
    // 保存购物车数据
    await redisClient.set(cartKey, JSON.stringify(cart));
    
    res.status(200).json({
      code: 200,
      message: "操作成功",
      data: null
    });

  } catch (error) {
    console.error('全选操作失败:', error);
    res.status(500).json({
      code: 500,
      message: "服务器内部错误",
      data: null
    });
  }
};

// 6. 删除购物车商品
exports.deleteCartItems = async (req, res) => {
  try {
    await ensureConnection();
    
    const { cartItemIds } = req.body;
    const { userId } = req.user;
    
    // 参数验证
    if (!cartItemIds || !Array.isArray(cartItemIds) || cartItemIds.length === 0) {
      return res.status(400).json({
        code: 400,
        message: "购物车项ID列表不能为空",
        data: null
      });
    }
    
    const cartKey = `cart:${userId}`;
    const cartData = await redisClient.get(cartKey);
    
    if (!cartData) {
      return res.status(200).json({
        code: 200,
        message: "删除成功",
        data: null
      });
    }
    
    const cart = JSON.parse(cartData);
    
    // 删除指定的购物车项
    cart.items = cart.items.filter(item => !cartItemIds.includes(item.id));
    
    // 保存购物车数据
    await redisClient.set(cartKey, JSON.stringify(cart));
    
    res.status(200).json({
      code: 200,
      message: "删除成功",
      data: null
    });

  } catch (error) {
    console.error('删除购物车商品失败:', error);
    res.status(500).json({
      code: 500,
      message: "服务器内部错误",
      data: null
    });
  }
};
