const { getRedisClient } = require('../config/redis');

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

// 1. 获取用户地址列表
exports.getAddressList = async (req, res) => {
  try {
    await ensureConnection();
    
    const { userId } = req.user;
    const { page = 1, pageSize = 10 } = req.query;
    
    // 获取用户地址列表
    const addressListKey = `user:${userId}:addresses`;
    const addressIds = await redisClient.lRange(addressListKey, 0, -1);
    
    const addresses = [];
    
    for (const addressId of addressIds) {
      const addressKey = `address:${userId}:${addressId}`;
      const addressData = await redisClient.get(addressKey);
      
      if (addressData) {
        const address = JSON.parse(addressData);
        addresses.push({
          id: address.id,
          name: address.name,
          phone: address.phone,
          region: address.region,
          regionArray: address.regionArray,
          detail: address.detail,
          isDefault: address.isDefault || false,
          createTime: address.createTime,
          updateTime: address.updateTime || address.createTime
        });
      }
    }
    
    // 按默认地址和创建时间排序
    addresses.sort((a, b) => {
      if (a.isDefault && !b.isDefault) return -1;
      if (!a.isDefault && b.isDefault) return 1;
      return new Date(b.createTime) - new Date(a.createTime);
    });
    
    // 分页处理
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + parseInt(pageSize);
    const paginatedAddresses = addresses.slice(startIndex, endIndex);
    
    res.status(200).json({
      code: 200,
      message: "success",
      data: {
        list: paginatedAddresses,
        total: addresses.length,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    });

  } catch (error) {
    console.error('获取用户地址列表失败:', error);
    res.status(500).json({
      code: 500,
      message: "服务器内部错误",
      data: null
    });
  }
};

// 2. 获取默认地址
exports.getDefaultAddress = async (req, res) => {
  try {
    await ensureConnection();
    
    const { userId } = req.user;
    
    // 获取用户地址列表
    const addressListKey = `user:${userId}:addresses`;
    const addressIds = await redisClient.lRange(addressListKey, 0, -1);
    
    let defaultAddress = null;
    
    for (const addressId of addressIds) {
      const addressKey = `address:${userId}:${addressId}`;
      const addressData = await redisClient.get(addressKey);
      
      if (addressData) {
        const address = JSON.parse(addressData);
        if (address.isDefault) {
          defaultAddress = {
            id: address.id,
            name: address.name,
            phone: address.phone,
            region: address.region,
            regionArray: address.regionArray,
            detail: address.detail,
            isDefault: true,
            createTime: address.createTime,
            updateTime: address.updateTime || address.createTime
          };
          break;
        }
      }
    }
    
    res.status(200).json({
      code: 200,
      message: "success",
      data: defaultAddress
    });

  } catch (error) {
    console.error('获取默认地址失败:', error);
    res.status(500).json({
      code: 500,
      message: "服务器内部错误",
      data: null
    });
  }
};

// 3. 添加收货地址
exports.addAddress = async (req, res) => {
  try {
    await ensureConnection();
    
    const { name, phone, region, regionArray, detail, isDefault = false } = req.body;
    const { userId } = req.user;
    
    console.log('📝 新增地址请求参数:', req.body);
    console.log('👤 用户ID:', userId);
    
    // 参数验证
    if (!name || !phone || !region || !regionArray || !detail) {
      console.log('❌ 参数验证失败:', { name, phone, region, regionArray, detail });
      return res.status(400).json({
        code: 400,
        message: "地址信息不完整",
        data: null
      });
    }
    
    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        code: 400,
        message: "手机号码格式不正确",
        data: null
      });
    }
    
    // 验证收货人姓名
    if (name.length > 20) {
      return res.status(400).json({
        code: 400,
        message: "收货人姓名不能超过20字符",
        data: null
      });
    }
    
    // 验证详细地址
    if (detail.length > 100) {
      return res.status(400).json({
        code: 400,
        message: "详细地址不能超过100字符",
        data: null
      });
    }
    
    const addressId = generateId('A');
    const currentTime = new Date().toISOString();
    
    // 如果设置为默认地址，需要先取消其他默认地址
    if (isDefault) {
      const addressListKey = `user:${userId}:addresses`;
      const existingAddressIds = await redisClient.lRange(addressListKey, 0, -1);
      
      for (const existingId of existingAddressIds) {
        const existingKey = `address:${userId}:${existingId}`;
        const existingData = await redisClient.get(existingKey);
        
        if (existingData) {
          const existingAddress = JSON.parse(existingData);
          if (existingAddress.isDefault) {
            existingAddress.isDefault = false;
            await redisClient.set(existingKey, JSON.stringify(existingAddress));
          }
        }
      }
    }
    
    const addressData = {
      id: addressId,
      userId,
      name,
      phone,
      region,
      regionArray,
      detail,
      isDefault,
      createTime: currentTime,
      updateTime: currentTime
    };
    
    // 保存地址数据
    const addressKey = `address:${userId}:${addressId}`;
    await redisClient.set(addressKey, JSON.stringify(addressData));
    
    // 添加到用户地址列表
    const addressListKey = `user:${userId}:addresses`;
    await redisClient.lPush(addressListKey, addressId);
    
    res.status(200).json({
      code: 200,
      message: "添加成功",
      data: {
        id: addressId,
        name,
        phone,
        region,
        regionArray,
        detail,
        isDefault,
        createTime: currentTime,
        updateTime: currentTime
      }
    });

  } catch (error) {
    console.error('添加收货地址失败:', error);
    res.status(500).json({
      code: 500,
      message: "服务器内部错误",
      data: null
    });
  }
};

// 4. 更新收货地址
exports.updateAddress = async (req, res) => {
  try {
    await ensureConnection();
    
    const { id, name, phone, region, regionArray, detail, isDefault } = req.body;
    const { userId } = req.user;
    
    if (!id) {
      return res.status(400).json({
        code: 400,
        message: "地址ID不能为空",
        data: null
      });
    }
    
    const addressKey = `address:${userId}:${id}`;
    const addressData = await redisClient.get(addressKey);
    
    if (!addressData) {
      return res.status(404).json({
        code: 404,
        message: "地址不存在",
        data: null
      });
    }
    
    const address = JSON.parse(addressData);
    
    // 参数验证
    if (phone && !/^1[3-9]\d{9}$/.test(phone)) {
      return res.status(400).json({
        code: 400,
        message: "手机号码格式不正确",
        data: null
      });
    }
    
    if (name && name.length > 20) {
      return res.status(400).json({
        code: 400,
        message: "收货人姓名不能超过20字符",
        data: null
      });
    }
    
    if (detail && detail.length > 100) {
      return res.status(400).json({
        code: 400,
        message: "详细地址不能超过100字符",
        data: null
      });
    }
    
    // 如果设置为默认地址，需要先取消其他默认地址
    if (isDefault && !address.isDefault) {
      const addressListKey = `user:${userId}:addresses`;
      const existingAddressIds = await redisClient.lRange(addressListKey, 0, -1);
      
      for (const existingId of existingAddressIds) {
        if (existingId === id) continue;
        
        const existingKey = `address:${userId}:${existingId}`;
        const existingData = await redisClient.get(existingKey);
        
        if (existingData) {
          const existingAddress = JSON.parse(existingData);
          if (existingAddress.isDefault) {
            existingAddress.isDefault = false;
            await redisClient.set(existingKey, JSON.stringify(existingAddress));
          }
        }
      }
    }
    
    // 更新地址信息
    if (name !== undefined) address.name = name;
    if (phone !== undefined) address.phone = phone;
    if (region !== undefined) address.region = region;
    if (regionArray !== undefined) address.regionArray = regionArray;
    if (detail !== undefined) address.detail = detail;
    if (isDefault !== undefined) address.isDefault = isDefault;
    address.updateTime = new Date().toISOString();
    
    await redisClient.set(addressKey, JSON.stringify(address));
    
    res.status(200).json({
      code: 200,
      message: "更新成功",
      data: {
        id: address.id,
        name: address.name,
        phone: address.phone,
        region: address.region,
        regionArray: address.regionArray,
        detail: address.detail,
        isDefault: address.isDefault,
        createTime: address.createTime,
        updateTime: address.updateTime
      }
    });

  } catch (error) {
    console.error('更新收货地址失败:', error);
    res.status(500).json({
      code: 500,
      message: "服务器内部错误",
      data: null
    });
  }
};

// 5. 删除收货地址
exports.deleteAddress = async (req, res) => {
  try {
    await ensureConnection();
    
    const { id } = req.body;
    const { userId } = req.user;
    
    if (!id) {
      return res.status(400).json({
        code: 400,
        message: "地址ID不能为空",
        data: null
      });
    }
    
    const addressKey = `address:${userId}:${id}`;
    const addressData = await redisClient.get(addressKey);
    
    if (!addressData) {
      return res.status(404).json({
        code: 404,
        message: "地址不存在",
        data: null
      });
    }
    
    const address = JSON.parse(addressData);
    
    // 删除地址数据
    await redisClient.del(addressKey);
    
    // 从用户地址列表中移除
    const addressListKey = `user:${userId}:addresses`;
    await redisClient.lRem(addressListKey, 0, id);
    
    // 如果删除的是默认地址，且还有其他地址，则设置第一个为默认
    if (address.isDefault) {
      const remainingAddressIds = await redisClient.lRange(addressListKey, 0, -1);
      if (remainingAddressIds.length > 0) {
        const firstAddressKey = `address:${userId}:${remainingAddressIds[0]}`;
        const firstAddressData = await redisClient.get(firstAddressKey);
        if (firstAddressData) {
          const firstAddress = JSON.parse(firstAddressData);
          firstAddress.isDefault = true;
          firstAddress.updateTime = new Date().toISOString();
          await redisClient.set(firstAddressKey, JSON.stringify(firstAddress));
        }
      }
    }
    
    res.status(200).json({
      code: 200,
      message: "删除成功",
      data: null
    });

  } catch (error) {
    console.error('删除收货地址失败:', error);
    res.status(500).json({
      code: 500,
      message: "服务器内部错误",
      data: null
    });
  }
};

// 6. 设置默认地址
exports.setDefaultAddress = async (req, res) => {
  try {
    await ensureConnection();
    
    const { id } = req.body;
    const { userId } = req.user;
    
    if (!id) {
      return res.status(400).json({
        code: 400,
        message: "地址ID不能为空",
        data: null
      });
    }
    
    const addressKey = `address:${userId}:${id}`;
    const addressData = await redisClient.get(addressKey);
    
    if (!addressData) {
      return res.status(404).json({
        code: 404,
        message: "地址不存在",
        data: null
      });
    }
    
    // 先取消所有地址的默认状态
    const addressListKey = `user:${userId}:addresses`;
    const allAddressIds = await redisClient.lRange(addressListKey, 0, -1);
    
    for (const addressId of allAddressIds) {
      const key = `address:${userId}:${addressId}`;
      const data = await redisClient.get(key);
      
      if (data) {
        const address = JSON.parse(data);
        address.isDefault = false;
        await redisClient.set(key, JSON.stringify(address));
      }
    }
    
    // 设置目标地址为默认
    const targetAddress = JSON.parse(addressData);
    targetAddress.isDefault = true;
    targetAddress.updateTime = new Date().toISOString();
    await redisClient.set(addressKey, JSON.stringify(targetAddress));
    
    res.status(200).json({
      code: 200,
      message: "设置成功",
      data: {
        id: targetAddress.id,
        name: targetAddress.name,
        phone: targetAddress.phone,
        region: targetAddress.region,
        regionArray: targetAddress.regionArray,
        detail: targetAddress.detail,
        isDefault: true,
        createTime: targetAddress.createTime,
        updateTime: targetAddress.updateTime
      }
    });

  } catch (error) {
    console.error('设置默认地址失败:', error);
    res.status(500).json({
      code: 500,
      message: "服务器内部错误",
      data: null
    });
  }
};

module.exports = {
  getAddressList: exports.getAddressList,
  getDefaultAddress: exports.getDefaultAddress,
  addAddress: exports.addAddress,
  updateAddress: exports.updateAddress,
  deleteAddress: exports.deleteAddress,
  setDefaultAddress: exports.setDefaultAddress
};
