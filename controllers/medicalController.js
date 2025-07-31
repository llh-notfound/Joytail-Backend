const Hospital = require('../models/Hospital');

// 获取医院列表
exports.getHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.getHospitals();
    
    // 为列表视图简化数据，只返回必要字段
    const simplifiedHospitals = hospitals.map(hospital => ({
      id: hospital.id,
      name: hospital.name,
      address: hospital.address,
      phone: hospital.phone,
      website: hospital.website,
      description: hospital.description,
      logo_url: hospital.logo_url,
      cover_url: hospital.cover_url,
      rating: hospital.rating,
      services: hospital.services ? hospital.services.map(s => s.name) : [],
      business_hours: hospital.business_hours,
      emergency_24h: hospital.emergency_24h,
      created_at: hospital.created_at,
      updated_at: hospital.updated_at
    }));

    res.status(200).json({
      code: 200,
      message: '获取成功',
      data: {
        list: simplifiedHospitals,
        total: simplifiedHospitals.length
      }
    });

  } catch (error) {
    console.error('获取医院列表失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      data: null
    });
  }
};

// 获取医院详情
exports.getHospitalDetail = async (req, res) => {
  try {
    const { id } = req.params;
    
    const hospital = await Hospital.getHospitalById(id);
    
    if (!hospital) {
      return res.status(404).json({
        code: 404,
        message: '医院不存在',
        data: null
      });
    }

    // 返回完整的医院详情数据
    res.status(200).json({
      code: 200,
      message: '获取成功',
      data: hospital
    });

  } catch (error) {
    console.error('获取医院详情失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      data: null
    });
  }
};

// 初始化医院数据（可选，用于管理员初始化数据）
exports.initializeHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.initializeHospitals();
    
    res.status(200).json({
      code: 200,
      message: '医院数据初始化成功',
      data: {
        count: hospitals.length,
        hospitals: hospitals
      }
    });

  } catch (error) {
    console.error('初始化医院数据失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      data: null
    });
  }
};