# PetPal医院页面API对接文档

## 📋 概述

本文档提供PetPal医院页面前后端对接的完整API规范，包括接口定义、数据格式、错误处理等内容。

## 🏥 医院模块接口列表

### 1. 获取医院列表
**接口路径**: `GET /api/medical/hospitals`  
**功能描述**: 获取所有医院的基本信息和封面图  
**前端调用**: 医院主页轮播图和卡片列表

#### 请求参数
无需参数

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
        "description": "专业的宠物医疗服务，拥有先进的医疗设备和资深的兽医团队",
        "logo_url": "https://example.com/images/hospital1-logo.png",
        "cover_url": "https://example.com/images/hospital1-cover.jpg",
        "rating": 4.8,
        "services": ["急诊", "手术", "体检", "疫苗"],
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

#### 前端Mock数据示例
```javascript
// 前端回退数据（当API不可用时）
getMockHospitals() {
  return [
    {
      id: 1,
      name: "香港宠物医院",
      address: "香港中环干诺道中200号",
      phone: "+852 2234 5678",
      website: "https://www.hkpethospital.com",
      description: "专业的宠物医疗服务，拥有先进的医疗设备和资深的兽医团队。我们致力于为您的宠物提供最优质的医疗护理，确保每一只小动物都能得到专业的治疗和关爱。",
      logo_url: "https://via.placeholder.com/200x200/4299e1/ffffff?text=香港宠物医院",
      cover_url: "https://via.placeholder.com/750x300/4299e1/ffffff?text=香港宠物医院",
      images: [
        "https://via.placeholder.com/400x400/4299e1/ffffff?text=诊疗室1",
        "https://via.placeholder.com/400x400/4299e1/ffffff?text=手术室",
        "https://via.placeholder.com/400x400/4299e1/ffffff?text=住院部",
        "https://via.placeholder.com/400x400/4299e1/ffffff?text=前台"
      ]
    }
    // ... 其他医院数据
  ];
}
```

### 2. 获取医院详情
**接口路径**: `GET /api/medical/hospitals/{id}`  
**功能描述**: 获取指定医院的详细信息，包括环境图片  
**前端调用**: 医院详情页

#### 请求参数
- `id` (integer, required): 医院ID

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
    "description": "专业的宠物医疗服务，拥有先进的医疗设备和资深的兽医团队。我们致力于为您的宠物提供最优质的医疗护理，确保每一只小动物都能得到专业的治疗和关爱。医院成立于2010年，拥有超过10年的宠物医疗经验。",
    "logo_url": "https://example.com/images/hospital1-logo.png",
    "cover_url": "https://example.com/images/hospital1-cover.jpg",
    "images": [
      {
        "id": 1,
        "url": "https://example.com/images/hospital1-room1.jpg",
        "title": "诊疗室",
        "description": "宽敞明亮的诊疗环境"
      },
      {
        "id": 2,
        "url": "https://example.com/images/hospital1-surgery.jpg",
        "title": "手术室",
        "description": "无菌手术环境"
      },
      {
        "id": 3,
        "url": "https://example.com/images/hospital1-ward.jpg",
        "title": "住院部",
        "description": "舒适的住院环境"
      },
      {
        "id": 4,
        "url": "https://example.com/images/hospital1-reception.jpg",
        "title": "前台接待",
        "description": "温馨的接待环境"
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
      },
      {
        "name": "健康体检",
        "description": "全面健康检查"
      },
      {
        "name": "疫苗接种",
        "description": "疫苗预防接种"
      }
    ],
    "doctors": [
      {
        "id": 1,
        "name": "张医生",
        "title": "主任兽医师",
        "experience": "15年临床经验",
        "avatar": "https://example.com/images/doctor1.jpg"
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

## 🗄️ 数据库设计

### 医院表 (hospitals)
```sql
CREATE TABLE hospitals (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL COMMENT '医院名称',
    address VARCHAR(255) NOT NULL COMMENT '医院地址',
    phone VARCHAR(20) NOT NULL COMMENT '联系电话',
    website VARCHAR(255) COMMENT '官方网站',
    description TEXT COMMENT '医院描述',
    logo_url VARCHAR(500) COMMENT 'Logo图片URL',
    cover_url VARCHAR(500) COMMENT '封面图片URL',
    rating DECIMAL(3,2) DEFAULT 0 COMMENT '评分',
    business_hours VARCHAR(100) COMMENT '营业时间',
    emergency_24h BOOLEAN DEFAULT FALSE COMMENT '是否24小时急诊',
    parking BOOLEAN DEFAULT FALSE COMMENT '是否有停车位',
    wifi BOOLEAN DEFAULT FALSE COMMENT '是否有WiFi',
    status TINYINT DEFAULT 1 COMMENT '状态：1-正常，0-停用',
    sort_order INT DEFAULT 0 COMMENT '排序',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 医院图片表 (hospital_images)
```sql
CREATE TABLE hospital_images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    hospital_id INT NOT NULL COMMENT '医院ID',
    url VARCHAR(500) NOT NULL COMMENT '图片URL',
    title VARCHAR(100) COMMENT '图片标题',
    description VARCHAR(255) COMMENT '图片描述',
    type ENUM('environment', 'equipment', 'staff') DEFAULT 'environment' COMMENT '图片类型',
    sort_order INT DEFAULT 0 COMMENT '排序',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE
);
```

### 医院服务表 (hospital_services)
```sql
CREATE TABLE hospital_services (
    id INT PRIMARY KEY AUTO_INCREMENT,
    hospital_id INT NOT NULL COMMENT '医院ID',
    name VARCHAR(100) NOT NULL COMMENT '服务名称',
    description VARCHAR(255) COMMENT '服务描述',
    price DECIMAL(10,2) COMMENT '服务价格',
    duration INT COMMENT '服务时长(分钟)',
    status TINYINT DEFAULT 1 COMMENT '状态：1-可用，0-停用',
    sort_order INT DEFAULT 0 COMMENT '排序',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE
);
```

### 医院医生表 (hospital_doctors)
```sql
CREATE TABLE hospital_doctors (
    id INT PRIMARY KEY AUTO_INCREMENT,
    hospital_id INT NOT NULL COMMENT '医院ID',
    name VARCHAR(50) NOT NULL COMMENT '医生姓名',
    title VARCHAR(100) COMMENT '职称',
    experience VARCHAR(100) COMMENT '从业经验',
    specialties TEXT COMMENT '专业领域',
    avatar VARCHAR(500) COMMENT '头像URL',
    phone VARCHAR(20) COMMENT '联系电话',
    status TINYINT DEFAULT 1 COMMENT '状态：1-在职，0-离职',
    sort_order INT DEFAULT 0 COMMENT '排序',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE
);
```

## 💻 后端实现示例 (Laravel)

### 1. 医院控制器
```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Hospital;
use Illuminate\Http\JsonResponse;

class HospitalController extends Controller
{
    /**
     * 获取医院列表
     */
    public function index(): JsonResponse
    {
        try {
            $hospitals = Hospital::with(['services'])
                ->where('status', 1)
                ->orderBy('sort_order')
                ->orderBy('id')
                ->get()
                ->map(function ($hospital) {
                    return [
                        'id' => $hospital->id,
                        'name' => $hospital->name,
                        'address' => $hospital->address,
                        'phone' => $hospital->phone,
                        'website' => $hospital->website,
                        'description' => $hospital->description,
                        'logo_url' => $hospital->logo_url,
                        'cover_url' => $hospital->cover_url,
                        'rating' => $hospital->rating,
                        'services' => $hospital->services->pluck('name')->toArray(),
                        'business_hours' => $hospital->business_hours,
                        'emergency_24h' => $hospital->emergency_24h,
                        'created_at' => $hospital->created_at,
                        'updated_at' => $hospital->updated_at,
                    ];
                });

            return response()->json([
                'code' => 200,
                'message' => '获取成功',
                'data' => [
                    'list' => $hospitals,
                    'total' => $hospitals->count()
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'code' => 500,
                'message' => '服务器错误',
                'data' => null
            ], 500);
        }
    }

    /**
     * 获取医院详情
     */
    public function show($id): JsonResponse
    {
        try {
            $hospital = Hospital::with(['images', 'services', 'doctors'])
                ->where('status', 1)
                ->find($id);

            if (!$hospital) {
                return response()->json([
                    'code' => 404,
                    'message' => '医院不存在',
                    'data' => null
                ], 404);
            }

            $data = [
                'id' => $hospital->id,
                'name' => $hospital->name,
                'address' => $hospital->address,
                'phone' => $hospital->phone,
                'website' => $hospital->website,
                'description' => $hospital->description,
                'logo_url' => $hospital->logo_url,
                'cover_url' => $hospital->cover_url,
                'images' => $hospital->images->map(function ($image) {
                    return [
                        'id' => $image->id,
                        'url' => $image->url,
                        'title' => $image->title,
                        'description' => $image->description,
                    ];
                }),
                'rating' => $hospital->rating,
                'services' => $hospital->services->map(function ($service) {
                    return [
                        'name' => $service->name,
                        'description' => $service->description,
                    ];
                }),
                'doctors' => $hospital->doctors->map(function ($doctor) {
                    return [
                        'id' => $doctor->id,
                        'name' => $doctor->name,
                        'title' => $doctor->title,
                        'experience' => $doctor->experience,
                        'avatar' => $doctor->avatar,
                    ];
                }),
                'business_hours' => $hospital->business_hours,
                'emergency_24h' => $hospital->emergency_24h,
                'parking' => $hospital->parking,
                'wifi' => $hospital->wifi,
                'created_at' => $hospital->created_at,
                'updated_at' => $hospital->updated_at,
            ];

            return response()->json([
                'code' => 200,
                'message' => '获取成功',
                'data' => $data
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'code' => 500,
                'message' => '服务器错误',
                'data' => null
            ], 500);
        }
    }
}
```

### 2. 医院模型
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Hospital extends Model
{
    protected $fillable = [
        'name', 'address', 'phone', 'website', 'description',
        'logo_url', 'cover_url', 'rating', 'business_hours',
        'emergency_24h', 'parking', 'wifi', 'status', 'sort_order'
    ];

    protected $casts = [
        'emergency_24h' => 'boolean',
        'parking' => 'boolean',
        'wifi' => 'boolean',
        'rating' => 'decimal:2',
    ];

    public function images()
    {
        return $this->hasMany(HospitalImage::class)->orderBy('sort_order');
    }

    public function services()
    {
        return $this->hasMany(HospitalService::class)->where('status', 1)->orderBy('sort_order');
    }

    public function doctors()
    {
        return $this->hasMany(HospitalDoctor::class)->where('status', 1)->orderBy('sort_order');
    }
}
```

### 3. 路由配置
```php
// routes/api.php
Route::prefix('medical')->group(function () {
    Route::get('hospitals', [HospitalController::class, 'index']);
    Route::get('hospitals/{id}', [HospitalController::class, 'show']);
});
```

## 🧪 前端集成代码

### API调用服务 (`/src/utils/api/medical.js`)
```javascript
import { request } from '@/utils/request.js';

/**
 * 获取医院列表
 */
export const getHospitals = () => {
  return request({
    url: '/medical/hospitals',
    method: 'GET'
  });
};

/**
 * 获取医院详情
 */
export const getHospitalDetail = (id) => {
  return request({
    url: `/medical/hospitals/${id}`,
    method: 'GET'
  });
};
```

### 前端页面集成示例
```javascript
// 医院列表页面
export default {
  data() {
    return {
      hospitals: [],
      loading: false
    };
  },
  async onLoad() {
    await this.loadHospitals();
  },
  methods: {
    async loadHospitals() {
      this.loading = true;
      try {
        const response = await getHospitals();
        if (response && response.data && response.data.list) {
          this.hospitals = response.data.list;
        } else {
          // 回退到Mock数据
          this.hospitals = this.getMockHospitals();
          console.warn('API响应格式异常，使用Mock数据');
        }
      } catch (error) {
        console.error('医院列表加载失败:', error);
        // 回退到Mock数据
        this.hospitals = this.getMockHospitals();
        uni.showToast({
          title: '网络异常，显示示例数据',
          icon: 'none'
        });
      } finally {
        this.loading = false;
      }
    }
  }
};
```

## 🔍 错误处理

### 常见错误码
- `200`: 成功
- `404`: 医院不存在
- `500`: 服务器内部错误

### 错误响应格式
```json
{
  "code": 404,
  "message": "医院不存在",
  "data": null
}
```

## 🧪 测试用例

### 1. Postman测试集合
```json
{
  "info": {
    "name": "PetPal医院API测试",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "获取医院列表",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{base_url}}/api/medical/hospitals",
          "host": ["{{base_url}}"],
          "path": ["api", "medical", "hospitals"]
        }
      },
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "pm.test('响应状态码为200', function () {",
              "    pm.response.to.have.status(200);",
              "});",
              "",
              "pm.test('返回医院列表', function () {",
              "    var jsonData = pm.response.json();",
              "    pm.expect(jsonData.code).to.eql(200);",
              "    pm.expect(jsonData.data.list).to.be.an('array');",
              "    pm.expect(jsonData.data.total).to.be.a('number');",
              "});"
            ]
          }
        }
      ]
    },
    {
      "name": "获取医院详情",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{base_url}}/api/medical/hospitals/1",
          "host": ["{{base_url}}"],
          "path": ["api", "medical", "hospitals", "1"]
        }
      },
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "pm.test('响应状态码为200', function () {",
              "    pm.response.to.have.status(200);",
              "});",
              "",
              "pm.test('返回医院详情', function () {",
              "    var jsonData = pm.response.json();",
              "    pm.expect(jsonData.code).to.eql(200);",
              "    pm.expect(jsonData.data.id).to.be.a('number');",
              "    pm.expect(jsonData.data.images).to.be.an('array');",
              "});"
            ]
          }
        }
      ]
    }
  ]
}
```

### 2. 测试数据SQL
```sql
-- 插入测试医院数据
INSERT INTO hospitals (name, address, phone, website, description, logo_url, cover_url, rating, business_hours, emergency_24h) VALUES
('香港宠物医院', '香港中环干诺道中200号', '+852 2234 5678', 'https://www.hkpethospital.com', '专业的宠物医疗服务，拥有先进的医疗设备和资深的兽医团队', 'https://example.com/hospital1-logo.png', 'https://example.com/hospital1-cover.jpg', 4.8, '周一至周日 8:00-22:00', true),
('旺角宠物诊所', '香港旺角弥敦道123号', '+852 2345 6789', 'https://www.mkpetclinic.com', '位于旺角核心地带，交通便利，提供全科宠物医疗服务', 'https://example.com/hospital2-logo.png', 'https://example.com/hospital2-cover.jpg', 4.6, '周一至周日 9:00-21:00', false),
('铜锣湾动物医院', '香港铜锣湾轩尼诗道456号', '+852 3456 7890', 'https://www.cwbanimalhospital.com', '24小时急诊服务，配备最先进的医疗设备和专业团队', 'https://example.com/hospital3-logo.png', 'https://example.com/hospital3-cover.jpg', 4.9, '24小时营业', true);

-- 插入测试图片数据
INSERT INTO hospital_images (hospital_id, url, title, description, sort_order) VALUES
(1, 'https://example.com/hospital1-room1.jpg', '诊疗室', '宽敞明亮的诊疗环境', 1),
(1, 'https://example.com/hospital1-surgery.jpg', '手术室', '无菌手术环境', 2),
(1, 'https://example.com/hospital1-ward.jpg', '住院部', '舒适的住院环境', 3),
(1, 'https://example.com/hospital1-reception.jpg', '前台接待', '温馨的接待环境', 4);

-- 插入测试服务数据
INSERT INTO hospital_services (hospital_id, name, description, sort_order) VALUES
(1, '急诊服务', '24小时急诊服务', 1),
(1, '手术服务', '各类宠物手术', 2),
(1, '健康体检', '全面健康检查', 3),
(1, '疫苗接种', '疫苗预防接种', 4);
```

## 🚀 部署建议

### 1. 图片存储
- 建议使用CDN存储图片资源
- 图片压缩优化，建议WebP格式
- 设置合理的缓存策略

### 2. 数据缓存
- 医院列表数据可缓存30分钟
- 医院详情数据可缓存1小时
- 使用Redis缓存热点数据

### 3. 安全考虑
- API接口添加访问频率限制
- 图片URL添加防盗链验证
- 敏感信息不要直接暴露

## 📋 检查清单

### 后端开发
- [ ] 创建数据库表结构
- [ ] 实现医院列表接口
- [ ] 实现医院详情接口
- [ ] 添加错误处理机制
- [ ] 编写API文档
- [ ] 创建测试用例

### 前端对接
- [ ] 更新API调用地址
- [ ] 测试接口连通性
- [ ] 验证数据格式匹配
- [ ] 处理异常情况
- [ ] 更新Mock数据兼容性

### 测试验证
- [ ] 接口功能测试
- [ ] 异常场景测试
- [ ] 性能压力测试
- [ ] 前后端联调测试

---

## 📞 技术支持

如有疑问，请联系前端开发团队进行技术对接。

**文档版本**: v1.0  
**更新日期**: 2024-01-01  
**维护人员**: PetPal开发团队
