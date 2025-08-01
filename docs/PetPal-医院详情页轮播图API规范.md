# PetPal 医院详情页轮播图API规范

## 📋 概述

本文档描述了PetPal医院详情页面的新设计需求和对应的API格式规范。医院详情页现在采用了简化设计，主要包含医院基本信息、4张轮播图和医院介绍文字，移除了其他板块内容。

## 📄 设计变更说明

### 🔄 变更内容

1. **页面结构简化**：
   - 保留医院基本信息（名称、地址、联系方式等）
   - 保留医院介绍文字描述
   - 新增4张轮播图展示
   - 移除服务项目、医生团队、设施信息等板块

2. **轮播图规格**：
   - 轮播图数量：固定为4张
   - 轮播图尺寸：建议750×400像素
   - 轮播图格式：支持JPG和PNG

## 🔌 API规范

### 1. 获取医院详情 API

- **接口路径**: `/api/medical/hospitals/{id}`
- **请求方式**: GET
- **接口描述**: 获取指定ID的医院详细信息，包含轮播图和介绍

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
    "logo_url": "https://example.com/images/hospital1-logo.png",
    "description": "专业的宠物医疗服务，拥有先进的医疗设备和资深的兽医团队。我们致力于为您的宠物提供最优质的医疗护理。",
    "business_hours": "周一至周日 8:00-22:00",
    "emergency_24h": true,
    "rating": 4.8,
    "images": [
      "https://example.com/images/hospitals/id1/slide1.jpg",
      "https://example.com/images/hospitals/id1/slide2.jpg",
      "https://example.com/images/hospitals/id1/slide3.jpg",
      "https://example.com/images/hospitals/id1/slide4.jpg"
    ]
  }
}
```

#### 字段说明

| 字段名 | 类型 | 必填 | 说明 |
|-------|------|------|------|
| `id` | number | 是 | 医院ID |
| `name` | string | 是 | 医院名称 |
| `address` | string | 是 | 医院地址 |
| `phone` | string | 是 | 联系电话 |
| `website` | string | 否 | 官方网站 |
| `logo_url` | string | 是 | 医院Logo图片URL |
| `description` | string | 是 | 医院介绍描述文字 |
| `business_hours` | string | 否 | 营业时间 |
| `emergency_24h` | boolean | 否 | 是否提供24小时急诊 |
| `rating` | number | 否 | 医院评分(1-5分) |
| `images` | array | 是 | 轮播图URL数组，建议提供4张图片 |

## 🖼️ 图片规范

### 轮播图

1. **数量要求**:
   - 后端应提供正好4张图片
   - 如不足4张，前端会使用占位图补充
   - 如超过4张，前端只显示前4张

2. **图片格式**:
   - 文件格式：JPG或PNG
   - 推荐尺寸：750×400像素
   - 图片质量：中高质量，文件大小建议控制在200KB以内
   - 图片内容：医院环境、设施、诊疗场景等

3. **文件命名**:
   - 建议格式：`hospital_{id}_slide_{num}.jpg`
   - 示例：`hospital_1_slide_1.jpg`

4. **图片存储路径**:
   - 建议路径：`/public/images/hospitals/{hospitalId}/`

## 🔍 测试和验证

### 测试环境

- 后端API地址：`http://localhost:8080/api`
- 测试医院ID：1, 2, 3

### 验证步骤

1. 请求医院详情API并确认响应包含所需字段
2. 验证返回的图片URL是否可以正确访问
3. 检查图片数量是否符合规范
4. 验证图片质量和尺寸是否符合要求

## 📝 注意事项

1. **图片路径处理**:
   - 确保图片URL是完整的URL，包含域名
   - 或提供以`/`开头的相对路径，前端会自动拼接域名

2. **图片优化**:
   - 图片应进行适当压缩，确保加载速度
   - 考虑提供不同分辨率的图片版本

3. **向后兼容**:
   - API应保持向后兼容，即使前端不再显示某些信息
   - 原有字段如`services`、`doctors`等可以继续保留

## 🚀 实现时间表

1. 后端API调整：请在收到此文档后3个工作日内完成
2. 前端页面已更新：已完成
3. 联调测试：API调整完成后1个工作日
4. 正式上线：联调测试通过后

## 📞 联系方式

如有任何问题，请联系前端开发负责人。
