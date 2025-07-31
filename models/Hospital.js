const { getRedisClient } = require('../config/redis');

class Hospital {
  constructor() {
    this.redisClient = getRedisClient();
  }

  // 确保Redis连接
  async ensureConnection() {
    if (!this.redisClient.isOpen) {
      await this.redisClient.connect();
    }
  }

  // 获取所有医院列表
  async getHospitals() {
    try {
      await this.ensureConnection();
      
      // 从Redis获取医院数据
      const hospitalKeys = await this.redisClient.keys('hospital:*');
      const hospitals = [];
      
      for (const key of hospitalKeys) {
        const hospitalData = await this.redisClient.get(key);
        if (hospitalData) {
          try {
            const hospital = JSON.parse(hospitalData);
            hospitals.push(hospital);
          } catch (parseError) {
            console.warn(`无法解析医院数据 ${key}:`, parseError);
          }
        }
      }
      
      return hospitals.sort((a, b) => a.id - b.id);
    } catch (error) {
      console.error('获取医院列表失败:', error);
      // 返回默认数据
      return this.getDefaultHospitals();
    }
  }

  // 根据ID获取医院详情
  async getHospitalById(id) {
    try {
      await this.ensureConnection();
      
      const hospitalData = await this.redisClient.get(`hospital:${id}`);
      if (hospitalData) {
        return JSON.parse(hospitalData);
      }
      
      // 如果Redis中没有数据，返回默认数据中的对应医院
      const defaultHospitals = this.getDefaultHospitals();
      return defaultHospitals.find(h => h.id == id) || null;
    } catch (error) {
      console.error('获取医院详情失败:', error);
      // 返回默认数据中的对应医院
      const defaultHospitals = this.getDefaultHospitals();
      return defaultHospitals.find(h => h.id == id) || null;
    }
  }

  // 初始化医院数据到Redis
  async initializeHospitals() {
    try {
      await this.ensureConnection();
      
      const hospitals = this.getDefaultHospitals();
      
      // 清理旧数据
      const oldKeys = await this.redisClient.keys('hospital:*');
      if (oldKeys.length > 0) {
        await this.redisClient.del(oldKeys);
      }
      
      // 存储新数据
      for (const hospital of hospitals) {
        await this.redisClient.set(
          `hospital:${hospital.id}`, 
          JSON.stringify(hospital),
          { EX: 86400 * 30 } // 30天过期
        );
      }
      
      console.log(`成功初始化 ${hospitals.length} 家医院数据到Redis`);
      return hospitals;
    } catch (error) {
      console.error('初始化医院数据失败:', error);
      throw error;
    }
  }

  // 获取默认医院数据
  getDefaultHospitals() {
    return [
      {
        id: 1,
        name: "芭比堂动物医院",
        address: "香港中环干诺道中200号",
        phone: "+852 2234 5678",
        website: "https://www.hkpethospital.com",
        description: "专业的宠物医疗服务，拥有先进的医疗设备和资深的兽医团队。我们致力于为您的宠物提供最优质的医疗护理，确保每一只小动物都能得到专业的治疗和关爱。医院成立于2010年，拥有超过10年的宠物医疗经验。",
        logo_url: "http://localhost:8080/public/images/hospitals/covers/babidang/芭比堂-封面.jpg",
        cover_url: "http://localhost:8080/public/images/hospitals/covers/babidang/芭比堂-封面.jpg",
        images: [
          "http://localhost:8080/public/images/hospitals/covers/babidang/芭比1.jpg",
          "http://localhost:8080/public/images/hospitals/covers/babidang/芭比2.jpg",
          "http://localhost:8080/public/images/hospitals/covers/babidang/芭比3.jpg",
          "http://localhost:8080/public/images/hospitals/covers/babidang/芭比4.jpg"
        ],
        rating: 4.8,
        services: [
          {
            name: "急诊服务",
            description: "24小时急诊服务"
          },
          {
            name: "手术服务", 
            description: "各类宠物手术"
          },
          {
            name: "健康体检",
            description: "全面健康检查"
          },
          {
            name: "疫苗接种",
            description: "疫苗预防接种"
          }
        ],
        doctors: [
          {
            id: 1,
            name: "梁医生",
            title: "主任兽医师",
            experience: "15年临床经验",
            avatar: "https://via.placeholder.com/100x100/4299e1/ffffff?text=梁医生"
          }
        ],
        business_hours: "周一至周日 8:00-22:00",
        emergency_24h: true,
        parking: true,
        wifi: true,
        created_at: "2024-01-01T00:00:00.000Z",
        updated_at: "2024-01-01T00:00:00.000Z"
      },
      {
        id: 2,
        name: "瑞鹏宠物医院",
        address: "香港九龙尖沙咀弥敦道100号",
        phone: "+852 2345 6789",
        website: "https://www.kowloonpet.com",
        description: "位于九龙核心地带的专业宠物诊所，提供全方位的宠物医疗服务。拥有最新的医疗设备和经验丰富的医疗团队，为您的宠物提供最贴心的医疗护理。",
        logo_url: "http://localhost:8080/public/images/hospitals/covers/ruipeng/瑞鹏-封面.jpg",
        cover_url: "http://localhost:8080/public/images/hospitals/covers/ruipeng/瑞鹏-封面.jpg",
        images: [
          "http://localhost:8080/public/images/hospitals/covers/ruipeng/瑞鹏1.jpg",
          "http://localhost:8080/public/images/hospitals/covers/ruipeng/瑞鹏2.jpg",
          "http://localhost:8080/public/images/hospitals/covers/ruipeng/瑞鹏3.jpg",
          "http://localhost:8080/public/images/hospitals/covers/ruipeng/瑞鹏4.jpg"
        ],
        rating: 4.6,
        services: [
          {
            name: "内科诊疗",
            description: "内科疾病诊断治疗"
          },
          {
            name: "外科手术",
            description: "各类外科手术"
          },
          {
            name: "美容护理",
            description: "宠物美容服务"
          }
        ],
        doctors: [
          {
            id: 2,
            name: "李医生",
            title: "资深兽医师",
            experience: "12年临床经验",
            avatar: "https://via.placeholder.com/100x100/48bb78/ffffff?text=李医生"
          }
        ],
        business_hours: "周一至周六 9:00-21:00",
        emergency_24h: false,
        parking: false,
        wifi: true,
        created_at: "2024-01-01T00:00:00.000Z",
        updated_at: "2024-01-01T00:00:00.000Z"
      },
      {
        id: 3,
        name: "瑞派宠物医院",
        address: "香港新界沙田正街50号",
        phone: "+852 2456 7890",
        website: "https://www.ntpetcare.com",
        description: "新界地区最大的宠物医疗中心，设施齐全，服务全面。提供从基础诊疗到高级手术的全方位医疗服务，是宠物主人的信赖之选。",
        logo_url: "http://localhost:8080/public/images/hospitals/covers/ruipai/瑞派-封面.jpg",
        cover_url: "http://localhost:8080/public/images/hospitals/covers/ruipai/瑞派-封面.jpg",
        images: [
          "http://localhost:8080/public/images/hospitals/covers/ruipai/瑞派1.jpg",
          "http://localhost:8080/public/images/hospitals/covers/ruipai/瑞派2.jpg",
          "http://localhost:8080/public/images/hospitals/covers/ruipai/瑞派3.jpg",
          "http://localhost:8080/public/images/hospitals/covers/ruipai/瑞派4.jpg"
        ],
        rating: 4.9,
        services: [
          {
            name: "专科手术",
            description: "骨科、心脏等专科手术"
          },
          {
            name: "影像诊断",
            description: "X光、CT、MRI诊断"
          },
          {
            name: "住院护理",
            description: "24小时住院护理"
          },
          {
            name: "康复理疗",
            description: "术后康复训练"
          }
        ],
        doctors: [
          {
            id: 3,
            name: "王医生",
            title: "专科主任医师",
            experience: "20年临床经验",
            avatar: "https://via.placeholder.com/100x100/ed8936/ffffff?text=王医生"
          },
          {
            id: 4,
            name: "陈医生",
            title: "外科医师",
            experience: "8年手术经验",
            avatar: "https://via.placeholder.com/100x100/ed8936/ffffff?text=陈医生"
          }
        ],
        business_hours: "周一至周日 24小时",
        emergency_24h: true,
        parking: true,
        wifi: true,
        created_at: "2024-01-01T00:00:00.000Z",
        updated_at: "2024-01-01T00:00:00.000Z"
      }
    ];
  }
}

module.exports = new Hospital();
