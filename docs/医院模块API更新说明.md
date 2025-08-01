# PetPal 医院模块 API 更新说明

## 概述
医院模块已经完全重构，现在提供简化的API接口，符合前端API文档的要求。

## 新的API接口

### 1. 获取医院列表
**接口**: `GET /api/medical/hospitals`

**响应示例**:
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
        "description": "专业的宠物医疗服务...",
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

### 2. 获取医院详情
**接口**: `GET /api/medical/hospitals/{id}`

**响应示例**:
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
    "description": "专业的宠物医疗服务...",
    "logo_url": "https://via.placeholder.com/200x200/4299e1/ffffff?text=香港宠物医院",
    "cover_url": "https://via.placeholder.com/750x300/4299e1/ffffff?text=香港宠物医院",
    "images": [
      {
        "id": 1,
        "url": "https://via.placeholder.com/400x400/4299e1/ffffff?text=诊疗室1",
        "title": "诊疗室",
        "description": "宽敞明亮的诊疗环境"
      }
    ],
    "rating": 4.8,
    "services": [
      {
        "name": "急诊服务",
        "description": "24小时急诊服务"
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

### 3. 初始化医院数据 (管理员接口)
**接口**: `POST /api/medical/hospitals/initialize`

用于初始化医院示例数据到Redis。

## 测试命令

```bash
# 测试医院列表
curl http://localhost:8080/api/medical/hospitals

# 测试医院详情
curl http://localhost:8080/api/medical/hospitals/1

# 初始化数据
curl -X POST http://localhost:8080/api/medical/hospitals/initialize
```

## 变更说明

### 删除的功能
- 医院广告位点击统计
- 分页功能（现在直接返回所有医院）
- 搜索和过滤功能

### 简化的数据结构
- 医院列表返回简化的数据（不包含images、doctors等详细信息）
- 医院详情返回完整的数据结构
- 数据格式完全符合前端API文档要求

### 数据存储
- 使用Redis存储医院数据
- 提供默认的示例数据（3家医院）
- 支持数据初始化接口

## 前端对接
新的API接口完全符合 `PetPal-医院页面完整API文档.md` 中定义的数据格式，前端可以直接使用。
