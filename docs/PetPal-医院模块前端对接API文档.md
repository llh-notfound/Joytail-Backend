# PetPal 医院模块前端对接API文档

## 📋 概述

本文档为前端开发者提供 PetPal 医院模块的完整 API 对接指导，包括接口说明、请求示例、响应格式、错误处理等。

## 🚀 快速开始

### 基础信息
- **API 基础URL**: `http://localhost:8080/api/medical`
- **数据格式**: JSON
- **字符编码**: UTF-8
- **请求方法**: GET, POST

### 测试环境
- 可访问 [API测试页面](hospital-api-test.html) 进行可视化测试
- 使用 `test-hospital-api.sh` 脚本进行命令行测试

## 📡 API 接口详情

### 1. 获取医院列表

获取所有医院的基本信息，用于展示医院列表、轮播图等。

#### 请求信息
```http
GET /api/medical/hospitals
```

#### 请求示例
```javascript
// 使用 fetch
const getHospitalList = async () => {
  try {
    const response = await fetch('http://localhost:8080/api/medical/hospitals');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('获取医院列表失败:', error);
  }
};

// 使用 axios
const getHospitalList = async () => {
  try {
    const response = await axios.get('/api/medical/hospitals');
    return response.data;
  } catch (error) {
    console.error('获取医院列表失败:', error);
  }
};
```

#### 响应格式
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "list": [
      {
        "id": 1,
        "name": "香港宠物医院",
        "address": "香港中环干诺道中200号",
        "phone": "+852 2234 5678",
        "website": "https://www.hkpethospital.com",
        "description": "专业的宠物医疗服务，拥有先进的医疗设备和资深的兽医团队...",
        "logo_url": "https://via.placeholder.com/200x200/4299e1/ffffff?text=香港宠物医院",
        "cover_url": "https://via.placeholder.com/750x300/4299e1/ffffff?text=香港宠物医院",
        "rating": 4.8,
        "services": ["急诊服务", "手术服务", "健康体检", "疫苗接种"],
        "business_hours": "周一至周日 8:00-22:00",
        "emergency_24h": true,
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z"
      }
    ],
    "total": 3
  }
}
```

#### 数据字段说明
| 字段名 | 类型 | 说明 |
|--------|------|------|
| `id` | number | 医院唯一标识 |
| `name` | string | 医院名称 |
| `address` | string | 医院地址 |
| `phone` | string | 联系电话 |
| `website` | string | 官方网站 |
| `description` | string | 医院描述 |
| `logo_url` | string | 医院Logo图片URL |
| `cover_url` | string | 医院封面图片URL |
| `rating` | number | 医院评分 (1-5) |
| `services` | array | 提供的服务列表 |
| `business_hours` | string | 营业时间 |
| `emergency_24h` | boolean | 是否提供24小时急诊 |
| `created_at` | string | 创建时间 (ISO格式) |
| `updated_at` | string | 更新时间 (ISO格式) |

### 2. 获取医院详情

获取指定医院的详细信息，包括环境图片、医生团队、服务详情等。

#### 请求信息
```http
GET /api/medical/hospitals/{id}
```

#### 路径参数
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `id` | number | 是 | 医院ID |

#### 请求示例
```javascript
// 获取医院详情
const getHospitalDetail = async (hospitalId) => {
  try {
    const response = await fetch(`http://localhost:8080/api/medical/hospitals/${hospitalId}`);
    const data = await response.json();
    
    if (data.code === 200) {
      return data.data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('获取医院详情失败:', error);
  }
};

// 使用示例
const hospital = await getHospitalDetail(1);
console.log(hospital.name); // "香港宠物医院"
```

#### 响应格式
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "id": 1,
    "name": "香港宠物医院",
    "address": "香港中环干诺道中200号",
    "phone": "+852 2234 5678",
    "website": "https://www.hkpethospital.com",
    "description": "专业的宠物医疗服务，拥有先进的医疗设备和资深的兽医团队...",
    "logo_url": "https://via.placeholder.com/200x200/4299e1/ffffff?text=香港宠物医院",
    "cover_url": "https://via.placeholder.com/750x300/4299e1/ffffff?text=香港宠物医院",
    "images": [
      {
        "id": 1,
        "url": "https://via.placeholder.com/400x400/4299e1/ffffff?text=诊疗室1",
        "title": "诊疗室",
        "description": "宽敞明亮的诊疗环境"
      },
      {
        "id": 2,
        "url": "https://via.placeholder.com/400x400/4299e1/ffffff?text=手术室",
        "title": "手术室",
        "description": "无菌手术环境"
      }
    ],
    "rating": 4.8,
    "services": [
      {
        "name": "急诊服务",
        "description": "24小时急诊服务"
      },
      {
        "name": "手术服务",
        "description": "各类宠物手术"
      }
    ],
    "doctors": [
      {
        "id": 1,
        "name": "张医生",
        "title": "主任兽医师",
        "experience": "15年临床经验",
        "avatar": "https://via.placeholder.com/100x100/4299e1/ffffff?text=张医生"
      }
    ],
    "business_hours": "周一至周日 8:00-22:00",
    "emergency_24h": true,
    "parking": true,
    "wifi": true,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

#### 详情页独有字段说明
| 字段名 | 类型 | 说明 |
|--------|------|------|
| `images` | array | 医院环境图片列表 |
| `images[].id` | number | 图片ID |
| `images[].url` | string | 图片URL |
| `images[].title` | string | 图片标题 |
| `images[].description` | string | 图片描述 |
| `services` | array | 服务详情列表（详情页为对象格式） |
| `services[].name` | string | 服务名称 |
| `services[].description` | string | 服务描述 |
| `doctors` | array | 医生团队列表 |
| `doctors[].id` | number | 医生ID |
| `doctors[].name` | string | 医生姓名 |
| `doctors[].title` | string | 医生职称 |
| `doctors[].experience` | string | 工作经验 |
| `doctors[].avatar` | string | 医生头像URL |
| `parking` | boolean | 是否有停车位 |
| `wifi` | boolean | 是否提供WiFi |

## 🎨 前端实现示例

### React 组件示例

#### 医院列表组件
```jsx
import React, { useState, useEffect } from 'react';

const HospitalList = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      const response = await fetch('/api/medical/hospitals');
      const data = await response.json();
      
      if (data.code === 200) {
        setHospitals(data.data.list);
      }
    } catch (error) {
      console.error('获取医院列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>加载中...</div>;

  return (
    <div className="hospital-list">
      {hospitals.map(hospital => (
        <div key={hospital.id} className="hospital-card">
          <img src={hospital.cover_url} alt={hospital.name} />
          <div className="hospital-info">
            <h3>{hospital.name}</h3>
            <p>{hospital.address}</p>
            <div className="rating">⭐ {hospital.rating}</div>
            <div className="services">
              {hospital.services.map((service, index) => (
                <span key={index} className="service-tag">{service}</span>
              ))}
            </div>
            {hospital.emergency_24h && (
              <span className="emergency-badge">24小时急诊</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
```

#### 医院详情组件
```jsx
import React, { useState, useEffect } from 'react';

const HospitalDetail = ({ hospitalId }) => {
  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHospitalDetail();
  }, [hospitalId]);

  const fetchHospitalDetail = async () => {
    try {
      const response = await fetch(`/api/medical/hospitals/${hospitalId}`);
      const data = await response.json();
      
      if (data.code === 200) {
        setHospital(data.data);
      } else if (data.code === 404) {
        // 处理医院不存在的情况
        console.error('医院不存在');
      }
    } catch (error) {
      console.error('获取医院详情失败:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>加载中...</div>;
  if (!hospital) return <div>医院不存在</div>;

  return (
    <div className="hospital-detail">
      <div className="hospital-header">
        <img src={hospital.cover_url} alt={hospital.name} className="cover-image" />
        <div className="hospital-basic-info">
          <img src={hospital.logo_url} alt={hospital.name} className="logo" />
          <h1>{hospital.name}</h1>
          <p>{hospital.description}</p>
          <div className="contact-info">
            <p>📍 {hospital.address}</p>
            <p>📞 {hospital.phone}</p>
            <p>🌐 <a href={hospital.website}>{hospital.website}</a></p>
            <p>🕒 {hospital.business_hours}</p>
          </div>
        </div>
      </div>

      {/* 环境图片 */}
      <div className="hospital-images">
        <h2>医院环境</h2>
        <div className="image-gallery">
          {hospital.images.map(image => (
            <div key={image.id} className="image-item">
              <img src={image.url} alt={image.title} />
              <div className="image-info">
                <h4>{image.title}</h4>
                <p>{image.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 服务项目 */}
      <div className="hospital-services">
        <h2>服务项目</h2>
        <div className="services-grid">
          {hospital.services.map((service, index) => (
            <div key={index} className="service-item">
              <h4>{service.name}</h4>
              <p>{service.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 医生团队 */}
      <div className="hospital-doctors">
        <h2>医生团队</h2>
        <div className="doctors-grid">
          {hospital.doctors.map(doctor => (
            <div key={doctor.id} className="doctor-item">
              <img src={doctor.avatar} alt={doctor.name} />
              <h4>{doctor.name}</h4>
              <p>{doctor.title}</p>
              <p>{doctor.experience}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 设施信息 */}
      <div className="hospital-facilities">
        <h2>设施服务</h2>
        <div className="facilities-list">
          {hospital.emergency_24h && <span className="facility">🚨 24小时急诊</span>}
          {hospital.parking && <span className="facility">🅿️ 停车位</span>}
          {hospital.wifi && <span className="facility">📶 免费WiFi</span>}
        </div>
      </div>
    </div>
  );
};
```

### Vue.js 组件示例

```vue
<template>
  <div class="hospital-list">
    <div v-if="loading">加载中...</div>
    <div v-else>
      <div 
        v-for="hospital in hospitals" 
        :key="hospital.id" 
        class="hospital-card"
        @click="goToDetail(hospital.id)"
      >
        <img :src="hospital.cover_url" :alt="hospital.name" />
        <div class="hospital-info">
          <h3>{{ hospital.name }}</h3>
          <p>{{ hospital.address }}</p>
          <div class="rating">⭐ {{ hospital.rating }}</div>
          <div class="services">
            <span 
              v-for="(service, index) in hospital.services" 
              :key="index" 
              class="service-tag"
            >
              {{ service }}
            </span>
          </div>
          <span v-if="hospital.emergency_24h" class="emergency-badge">
            24小时急诊
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HospitalList',
  data() {
    return {
      hospitals: [],
      loading: true
    };
  },
  async created() {
    await this.fetchHospitals();
  },
  methods: {
    async fetchHospitals() {
      try {
        const response = await this.$http.get('/api/medical/hospitals');
        if (response.data.code === 200) {
          this.hospitals = response.data.data.list;
        }
      } catch (error) {
        console.error('获取医院列表失败:', error);
      } finally {
        this.loading = false;
      }
    },
    goToDetail(hospitalId) {
      this.$router.push(`/hospitals/${hospitalId}`);
    }
  }
};
</script>
```

## ⚠️ 错误处理

### 常见错误码
| 错误码 | 说明 | 处理建议 |
|--------|------|----------|
| 200 | 成功 | 正常处理数据 |
| 404 | 医院不存在 | 显示"医院不存在"提示，引导用户返回列表 |
| 500 | 服务器内部错误 | 显示"服务暂时不可用"，提供重试按钮 |

### 错误处理示例
```javascript
const handleApiError = (error, data) => {
  switch (data?.code) {
    case 404:
      showToast('医院不存在', 'warning');
      router.push('/hospitals');
      break;
    case 500:
      showToast('服务暂时不可用，请稍后重试', 'error');
      break;
    default:
      showToast('网络连接失败', 'error');
  }
};

// 在API调用中使用
try {
  const response = await fetch('/api/medical/hospitals/1');
  const data = await response.json();
  
  if (data.code !== 200) {
    handleApiError(null, data);
    return;
  }
  
  // 处理成功数据
  setHospital(data.data);
} catch (error) {
  handleApiError(error);
}
```

## 🔧 开发工具和调试

### 1. API 测试工具
- **浏览器**: 直接访问 API URL 查看 JSON 响应
- **Postman**: 导入 API 集合进行测试
- **curl**: 使用命令行测试
```bash
# 测试医院列表
curl http://localhost:8080/api/medical/hospitals

# 测试医院详情
curl http://localhost:8080/api/medical/hospitals/1
```

### 2. Mock 数据
如果后端服务不可用，可以使用以下 Mock 数据：

```javascript
// Mock 医院列表数据
const mockHospitalList = {
  code: 200,
  message: "获取成功",
  data: {
    list: [
      {
        id: 1,
        name: "香港宠物医院",
        address: "香港中环干诺道中200号",
        phone: "+852 2234 5678",
        website: "https://www.hkpethospital.com",
        description: "专业的宠物医疗服务...",
        logo_url: "https://via.placeholder.com/200x200/4299e1/ffffff?text=香港宠物医院",
        cover_url: "https://via.placeholder.com/750x300/4299e1/ffffff?text=香港宠物医院",
        rating: 4.8,
        services: ["急诊服务", "手术服务", "健康体检", "疫苗接种"],
        business_hours: "周一至周日 8:00-22:00",
        emergency_24h: true,
        created_at: "2024-01-01T00:00:00.000Z",
        updated_at: "2024-01-01T00:00:00.000Z"
      }
    ],
    total: 1
  }
};

// 使用 Mock 数据的 API 服务
class MockHospitalService {
  static async getHospitals() {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockHospitalList;
  }
  
  static async getHospitalDetail(id) {
    await new Promise(resolve => setTimeout(resolve, 500));
    if (id > 3) {
      return { code: 404, message: "医院不存在", data: null };
    }
    return { code: 200, message: "获取成功", data: mockHospitalList.data.list[0] };
  }
}
```

## 📱 响应式设计建议

### 图片处理
```css
/* 医院封面图片 */
.hospital-cover {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
}

/* 医院Logo */
.hospital-logo {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

/* 环境图片画廊 */
.image-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

@media (max-width: 768px) {
  .image-gallery {
    grid-template-columns: 1fr;
  }
}
```

### 医院卡片布局
```css
.hospital-card {
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
  overflow: hidden;
  transition: transform 0.2s ease;
}

.hospital-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
}

@media (min-width: 768px) {
  .hospital-card {
    flex-direction: row;
  }
}
```

## 🚀 性能优化建议

### 1. 图片懒加载
```javascript
// 使用 Intersection Observer 实现图片懒加载
const LazyImage = ({ src, alt, className }) => {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLoaded(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} className={className}>
      {loaded ? (
        <img src={src} alt={alt} />
      ) : (
        <div className="image-placeholder">加载中...</div>
      )}
    </div>
  );
};
```

### 2. 数据缓存
```javascript
// 简单的内存缓存
class HospitalCache {
  static cache = new Map();
  static cacheTimeout = 5 * 60 * 1000; // 5分钟

  static get(key) {
    const item = this.cache.get(key);
    if (item && Date.now() - item.timestamp < this.cacheTimeout) {
      return item.data;
    }
    this.cache.delete(key);
    return null;
  }

  static set(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
}

// 在API服务中使用缓存
const getHospitals = async () => {
  const cached = HospitalCache.get('hospitals');
  if (cached) return cached;

  const response = await fetch('/api/medical/hospitals');
  const data = await response.json();
  
  HospitalCache.set('hospitals', data);
  return data;
};
```

## 📞 技术支持

如有技术问题，请：
1. 查看 `医院模块API更新说明.md` 获取更多详情
2. 使用 `hospital-api-test.html` 进行API测试
3. 检查浏览器开发者工具的Network面板查看请求详情
4. 确认服务器运行在正确的端口 (8080)

## 📚 相关文档
- [医院模块API更新说明](./医院模块API更新说明.md)
- [医院模块完整更新总结](./医院模块完整更新总结.md)
- [PetPal医院页面完整API文档](./PetPal-医院页面完整API文档.md)

---

**版本**: v1.0  
**更新时间**: 2025-07-13  
**维护者**: PetPal 开发团队
