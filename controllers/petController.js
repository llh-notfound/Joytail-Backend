const { v4: uuidv4 } = require('uuid');
const { getRedisClient } = require('../config/redis');

const redisClient = getRedisClient();

// 添加一个辅助函数来检查连接状态
const ensureConnection = async () => {
  if (!redisClient.isOpen) {
    console.log('Redis client not connected, attempting to connect...');
    await redisClient.connect();
    console.log('Redis client connected');
  }
};

// Get pet list for user
exports.getPetList = async (req, res) => {
  try {
    await ensureConnection();
    
    const { userId } = req.user;
    
    // Get user's pets
    const petListKey = `user:${userId}:pets`;
    const petIds = await redisClient.sMembers(petListKey);
    
    if (!petIds || petIds.length === 0) {
      return res.status(200).json({
        code: 200,
        message: 'success',
        data: []
      });
    }
    
    // Get pet details
    const petPromises = petIds.map(async (petId) => {
      const petData = await redisClient.hGet('pets', petId);
      return petData ? JSON.parse(petData) : null;
    });
    
    const pets = (await Promise.all(petPromises)).filter(pet => pet !== null);
    
    return res.status(200).json({
      code: 200,
      message: 'success',
      data: pets
    });
  } catch (error) {
    console.error('Get pet list error:', error);
    return res.status(500).json({
      code: 500,
      message: '服务器错误',
      data: null
    });
  }
};

// Get pet details
exports.getPetDetail = async (req, res) => {
  try {
    await ensureConnection();
    
    const { userId } = req.user;
    const { petId } = req.params;
    
    // Check if pet exists
    const petData = await redisClient.hGet('pets', petId);
    if (!petData) {
      return res.status(404).json({
        code: 404,
        message: '宠物不存在',
        data: null
      });
    }
    
    const pet = JSON.parse(petData);
    
    // Check if pet belongs to user
    const petListKey = `user:${userId}:pets`;
    const isPetOwner = await redisClient.sIsMember(petListKey, petId);
    
    if (!isPetOwner) {
      return res.status(403).json({
        code: 403,
        message: '无权访问该宠物信息',
        data: null
      });
    }
    
    return res.status(200).json({
      code: 200,
      message: 'success',
      data: pet
    });
  } catch (error) {
    console.error('Get pet detail error:', error);
    return res.status(500).json({
      code: 500,
      message: '服务器错误',
      data: null
    });
  }
};

// Add new pet
exports.addPet = async (req, res) => {
  try {
    await ensureConnection();
    
    const { userId } = req.user;
    const { name, avatar, type, breed, age, gender, weight, vaccines, health } = req.body;
    
    // Create pet object
    const petId = uuidv4();
    const newPet = {
      id: petId,
      name,
      avatar: avatar || '',
      type,
      breed,
      age,
      gender,
      weight,
      vaccines: vaccines || [],
      health: health || '',
      createdAt: Date.now()
    };
    
    // Save pet to Redis
    await redisClient.hSet('pets', petId, JSON.stringify(newPet));
    
    // Add pet to user's pet list
    const petListKey = `user:${userId}:pets`;
    await redisClient.sAdd(petListKey, petId);
    
    return res.status(200).json({
      code: 200,
      message: '添加成功',
      data: {
        id: petId,
        name
      }
    });
  } catch (error) {
    console.error('Add pet error:', error);
    return res.status(500).json({
      code: 500,
      message: '服务器错误',
      data: null
    });
  }
};

// Update pet info
exports.updatePet = async (req, res) => {
  try {
    await ensureConnection();
    
    const { userId } = req.user;
    const { petId } = req.params;
    const { name, avatar, type, breed, age, gender, weight, vaccines, health } = req.body;
    
    // Check if pet exists
    const petData = await redisClient.hGet('pets', petId);
    if (!petData) {
      return res.status(404).json({
        code: 404,
        message: '宠物不存在',
        data: null
      });
    }
    
    // Check if pet belongs to user
    const petListKey = `user:${userId}:pets`;
    const isPetOwner = await redisClient.sIsMember(petListKey, petId);
    
    if (!isPetOwner) {
      return res.status(403).json({
        code: 403,
        message: '无权修改该宠物信息',
        data: null
      });
    }
    
    const pet = JSON.parse(petData);
    
    // Update pet data
    if (name) pet.name = name;
    if (avatar) pet.avatar = avatar;
    if (type) pet.type = type;
    if (breed) pet.breed = breed;
    if (age !== undefined) pet.age = age;
    if (gender) pet.gender = gender;
    if (weight !== undefined) pet.weight = weight;
    if (vaccines) pet.vaccines = vaccines;
    if (health) pet.health = health;
    
    // Save updated pet
    await redisClient.hSet('pets', petId, JSON.stringify(pet));
    
    return res.status(200).json({
      code: 200,
      message: '更新成功'
    });
  } catch (error) {
    console.error('Update pet error:', error);
    return res.status(500).json({
      code: 500,
      message: '服务器错误',
      data: null
    });
  }
};

// Delete pet
exports.deletePet = async (req, res) => {
  try {
    await ensureConnection();
    
    const { userId } = req.user;
    const { petId } = req.params;
    
    // Check if pet exists
    const petData = await redisClient.hGet('pets', petId);
    if (!petData) {
      return res.status(404).json({
        code: 404,
        message: '宠物不存在',
        data: null
      });
    }
    
    // Check if pet belongs to user
    const petListKey = `user:${userId}:pets`;
    const isPetOwner = await redisClient.sIsMember(petListKey, petId);
    
    if (!isPetOwner) {
      return res.status(403).json({
        code: 403,
        message: '无权删除该宠物信息',
        data: null
      });
    }
    
    // Remove pet from user's pet list
    await redisClient.sRem(petListKey, petId);
    
    // Delete pet from Redis
    await redisClient.hDel('pets', petId);
    
    return res.status(200).json({
      code: 200,
      message: '删除成功'
    });
  } catch (error) {
    console.error('Delete pet error:', error);
    return res.status(500).json({
      code: 500,
      message: '服务器错误',
      data: null
    });
  }
};

// Upload pet avatar
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        code: 400,
        message: '未上传文件',
        data: null
      });
    }
    
    // Get file URL
    const fileUrl = `/uploads/pet/${req.file.filename}`;
    
    return res.status(200).json({
      code: 200,
      message: '上传成功',
      data: {
        url: fileUrl
      }
    });
  } catch (error) {
    console.error('Upload pet avatar error:', error);
    return res.status(500).json({
      code: 500,
      message: '服务器错误',
      data: null
    });
  }
};

// Get pet health records
exports.getPetHealthRecords = async (req, res) => {
  try {
    await ensureConnection();
    
    const { userId } = req.user;
    const { petId } = req.params;
    
    // Check if pet exists
    const petData = await redisClient.hGet('pets', petId);
    if (!petData) {
      return res.status(404).json({
        code: 404,
        message: '宠物不存在',
        data: null
      });
    }
    
    // Check if pet belongs to user
    const petListKey = `user:${userId}:pets`;
    const isPetOwner = await redisClient.sIsMember(petListKey, petId);
    
    if (!isPetOwner) {
      return res.status(403).json({
        code: 403,
        message: '无权访问该宠物的健康记录',
        data: null
      });
    }
    
    // Get health records from Redis
    const healthRecordsKey = `pet:${petId}:health-records`;
    const recordIds = await redisClient.lRange(healthRecordsKey, 0, -1);
    
    const records = [];
    for (const recordId of recordIds) {
      const recordData = await redisClient.get(`health-record:${recordId}`);
      if (recordData) {
        records.push(JSON.parse(recordData));
      }
    }
    
    return res.status(200).json({
      code: 200,
      message: 'success',
      data: records
    });
  } catch (error) {
    console.error('Get pet health records error:', error);
    return res.status(500).json({
      code: 500,
      message: '服务器错误',
      data: null
    });
  }
};

// Add health record
exports.addHealthRecord = async (req, res) => {
  try {
    await ensureConnection();
    
    const { userId } = req.user;
    const { petId } = req.params;
    const { date, type, description, clinic, vet, attachments } = req.body;
    
    // Check if pet exists
    const petData = await redisClient.hGet('pets', petId);
    if (!petData) {
      return res.status(404).json({
        code: 404,
        message: '宠物不存在',
        data: null
      });
    }
    
    // Check if pet belongs to user
    const petListKey = `user:${userId}:pets`;
    const isPetOwner = await redisClient.sIsMember(petListKey, petId);
    
    if (!isPetOwner) {
      return res.status(403).json({
        code: 403,
        message: '无权为该宠物添加健康记录',
        data: null
      });
    }
    
    // Create health record
    const recordId = uuidv4();
    const healthRecord = {
      id: recordId,
      petId,
      date: date || new Date().toISOString(),
      type,
      description,
      clinic,
      vet,
      attachments: attachments || [],
      createdAt: new Date().toISOString()
    };
    
    // Save health record to Redis
    await redisClient.set(`health-record:${recordId}`, JSON.stringify(healthRecord));
    
    // Add record ID to pet's health records list
    const healthRecordsKey = `pet:${petId}:health-records`;
    await redisClient.lPush(healthRecordsKey, recordId);
    
    return res.status(200).json({
      code: 200,
      message: '添加成功',
      data: {
        id: recordId
      }
    });
  } catch (error) {
    console.error('Add health record error:', error);
    return res.status(500).json({
      code: 500,
      message: '服务器错误',
      data: null
    });
  }
};

// Get pet vaccination records
exports.getPetVaccinations = async (req, res) => {
  try {
    await ensureConnection();
    
    const { userId } = req.user;
    const { petId } = req.params;
    
    // Check if pet exists
    const petData = await redisClient.hGet('pets', petId);
    if (!petData) {
      return res.status(404).json({
        code: 404,
        message: '宠物不存在',
        data: null
      });
    }
    
    // Check if pet belongs to user
    const petListKey = `user:${userId}:pets`;
    const isPetOwner = await redisClient.sIsMember(petListKey, petId);
    
    if (!isPetOwner) {
      return res.status(403).json({
        code: 403,
        message: '无权访问该宠物的疫苗记录',
        data: null
      });
    }
    
    // Get vaccination records from Redis
    const vaccinationRecordsKey = `pet:${petId}:vaccinations`;
    const recordIds = await redisClient.lRange(vaccinationRecordsKey, 0, -1);
    
    const records = [];
    for (const recordId of recordIds) {
      const recordData = await redisClient.get(`vaccination:${recordId}`);
      if (recordData) {
        records.push(JSON.parse(recordData));
      }
    }
    
    return res.status(200).json({
      code: 200,
      message: 'success',
      data: records
    });
  } catch (error) {
    console.error('Get pet vaccination records error:', error);
    return res.status(500).json({
      code: 500,
      message: '服务器错误',
      data: null
    });
  }
};

// Add vaccination record
exports.addVaccinationRecord = async (req, res) => {
  try {
    await ensureConnection();
    
    const { userId } = req.user;
    const { petId } = req.params;
    const { date, vaccine, manufacturer, batchNumber, clinic, nextDate, attachments } = req.body;
    
    // Check if pet exists
    const petData = await redisClient.hGet('pets', petId);
    if (!petData) {
      return res.status(404).json({
        code: 404,
        message: '宠物不存在',
        data: null
      });
    }
    
    // Check if pet belongs to user
    const petListKey = `user:${userId}:pets`;
    const isPetOwner = await redisClient.sIsMember(petListKey, petId);
    
    if (!isPetOwner) {
      return res.status(403).json({
        code: 403,
        message: '无权为该宠物添加疫苗记录',
        data: null
      });
    }
    
    // Create vaccination record
    const recordId = uuidv4();
    const vaccinationRecord = {
      id: recordId,
      petId,
      date: date || new Date().toISOString(),
      vaccine,
      manufacturer,
      batchNumber,
      clinic,
      nextDate,
      attachments: attachments || [],
      createdAt: new Date().toISOString()
    };
    
    // Save vaccination record to Redis
    await redisClient.set(`vaccination:${recordId}`, JSON.stringify(vaccinationRecord));
    
    // Add record ID to pet's vaccination records list
    const vaccinationRecordsKey = `pet:${petId}:vaccinations`;
    await redisClient.lPush(vaccinationRecordsKey, recordId);
    
    return res.status(200).json({
      code: 200,
      message: '添加成功',
      data: {
        id: recordId
      }
    });
  } catch (error) {
    console.error('Add vaccination record error:', error);
    return res.status(500).json({
      code: 500,
      message: '服务器错误',
      data: null
    });
  }
}; 