# PetPal-地址管理API对接文档

## 概述

本文档为地址管理模块的后端API对接指南，包含地址的增删改查、默认地址设置等功能。

## 基础信息

- **接口基础路径**: `/api/address`
- **请求方式**: RESTful API
- **数据格式**: JSON
- **认证方式**: Bearer Token (需要在请求头中携带用户token)

## 1. 获取地址列表

### 接口信息
- **URL**: `GET /api/address/list`
- **描述**: 获取当前用户的所有收货地址
- **权限**: 需要登录

### 请求参数
```json
{
  "page": 1,
  "pageSize": 10
}
```

### 响应格式
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "A001",
        "name": "张三",
        "phone": "13800138000",
        "region": "广东省深圳市南山区",
        "regionArray": ["广东省", "深圳市", "南山区"],
        "detail": "科技园南区8栋101室",
        "isDefault": true,
        "createTime": "2024-01-15 10:30:00",
        "updateTime": "2024-01-15 10:30:00"
      }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 10
  }
}
```

### 错误响应
```json
{
  "code": 401,
  "message": "用户未登录",
  "data": null
}
```

## 2. 新增地址

### 接口信息
- **URL**: `POST /api/address/add`
- **描述**: 新增收货地址
- **权限**: 需要登录

### 请求参数
```json
{
  "name": "张三",
  "phone": "13800138000",
  "region": "广东省深圳市南山区",
  "regionArray": ["广东省", "深圳市", "南山区"],
  "detail": "科技园南区8栋101室",
  "isDefault": false
}
```

### 字段说明
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 是 | 收货人姓名，最大20字符 |
| phone | string | 是 | 手机号码，11位数字 |
| region | string | 是 | 地区完整字符串 |
| regionArray | array | 是 | 地区数组，如["广东省", "深圳市", "南山区"] |
| detail | string | 是 | 详细地址，最大100字符 |
| isDefault | boolean | 否 | 是否设为默认地址，默认false |

### 响应格式
```json
{
  "code": 200,
  "message": "添加成功",
  "data": {
    "id": "A002",
    "name": "张三",
    "phone": "13800138000",
    "region": "广东省深圳市南山区",
    "regionArray": ["广东省", "深圳市", "南山区"],
    "detail": "科技园南区8栋101室",
    "isDefault": false,
    "createTime": "2024-01-15 10:30:00",
    "updateTime": "2024-01-15 10:30:00"
  }
}
```

### 错误响应
```json
{
  "code": 400,
  "message": "手机号码格式不正确",
  "data": null
}
```

## 3. 更新地址

### 接口信息
- **URL**: `PUT /api/address/update`
- **描述**: 更新收货地址
- **权限**: 需要登录

### 请求参数
```json
{
  "id": "A001",
  "name": "张三",
  "phone": "13800138000",
  "region": "广东省深圳市南山区",
  "regionArray": ["广东省", "深圳市", "南山区"],
  "detail": "科技园南区8栋101室",
  "isDefault": true
}
```

### 字段说明
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 是 | 地址ID |
| name | string | 是 | 收货人姓名，最大20字符 |
| phone | string | 是 | 手机号码，11位数字 |
| region | string | 是 | 地区完整字符串 |
| regionArray | array | 是 | 地区数组 |
| detail | string | 是 | 详细地址，最大100字符 |
| isDefault | boolean | 否 | 是否设为默认地址 |

### 响应格式
```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "id": "A001",
    "name": "张三",
    "phone": "13800138000",
    "region": "广东省深圳市南山区",
    "regionArray": ["广东省", "深圳市", "南山区"],
    "detail": "科技园南区8栋101室",
    "isDefault": true,
    "createTime": "2024-01-15 10:30:00",
    "updateTime": "2024-01-15 11:00:00"
  }
}
```

## 4. 删除地址

### 接口信息
- **URL**: `DELETE /api/address/delete`
- **描述**: 删除收货地址
- **权限**: 需要登录

### 请求参数
```json
{
  "id": "A001"
}
```

### 字段说明
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 是 | 地址ID |

### 响应格式
```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

## 5. 设置默认地址

### 接口信息
- **URL**: `PUT /api/address/set-default`
- **描述**: 设置默认收货地址
- **权限**: 需要登录

### 请求参数
```json
{
  "id": "A001"
}
```

### 字段说明
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 是 | 地址ID |

### 响应格式
```json
{
  "code": 200,
  "message": "设置成功",
  "data": {
    "id": "A001",
    "name": "张三",
    "phone": "13800138000",
    "region": "广东省深圳市南山区",
    "regionArray": ["广东省", "深圳市", "南山区"],
    "detail": "科技园南区8栋101室",
    "isDefault": true,
    "createTime": "2024-01-15 10:30:00",
    "updateTime": "2024-01-15 11:00:00"
  }
}
```

## 6. 获取默认地址

### 接口信息
- **URL**: `GET /api/address/default`
- **描述**: 获取当前用户的默认收货地址
- **权限**: 需要登录

### 请求参数
无

### 响应格式
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": "A001",
    "name": "张三",
    "phone": "13800138000",
    "region": "广东省深圳市南山区",
    "regionArray": ["广东省", "深圳市", "南山区"],
    "detail": "科技园南区8栋101室",
    "isDefault": true,
    "createTime": "2024-01-15 10:30:00",
    "updateTime": "2024-01-15 10:30:00"
  }
}
```

### 无默认地址响应
```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

## 数据库设计

### 地址表 (address)
```sql
CREATE TABLE `address` (
  `id` varchar(32) NOT NULL COMMENT '地址ID',
  `user_id` varchar(32) NOT NULL COMMENT '用户ID',
  `name` varchar(20) NOT NULL COMMENT '收货人姓名',
  `phone` varchar(11) NOT NULL COMMENT '手机号码',
  `region` varchar(100) NOT NULL COMMENT '地区完整字符串',
  `region_array` json NOT NULL COMMENT '地区数组',
  `detail` varchar(100) NOT NULL COMMENT '详细地址',
  `is_default` tinyint(1) DEFAULT 0 COMMENT '是否默认地址',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_is_default` (`is_default`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='收货地址表';
```

## 业务逻辑说明

### 1. 默认地址管理
- 每个用户只能有一个默认地址
- 设置新的默认地址时，需要将其他地址的 `is_default` 设为 0
- 删除默认地址时，如果还有其他地址，自动将第一个地址设为默认

### 2. 数据验证
- 手机号码格式验证：11位数字，以1开头
- 收货人姓名：1-20字符
- 详细地址：1-100字符
- 地区信息：必须包含省份信息

### 3. 权限控制
- 用户只能操作自己的地址
- 需要验证用户登录状态

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 用户未登录 |
| 403 | 权限不足 |
| 404 | 地址不存在 |
| 500 | 服务器内部错误 |

## 前端对接示例

### 1. 获取地址列表
```javascript
// 前端调用示例
const getAddressList = async (page = 1, pageSize = 10) => {
  try {
    const response = await uni.request({
      url: '/api/address/list',
      method: 'GET',
      data: { page, pageSize },
      header: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.data.code === 200) {
      return response.data.data;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    console.error('获取地址列表失败:', error);
    throw error;
  }
};
```

### 2. 新增地址
```javascript
// 前端调用示例
const addAddress = async (addressData) => {
  try {
    const response = await uni.request({
      url: '/api/address/add',
      method: 'POST',
      data: addressData,
      header: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data.code === 200) {
      return response.data.data;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    console.error('新增地址失败:', error);
    throw error;
  }
};
```

## 测试用例

### 1. 新增地址测试
```bash
curl -X POST http://localhost:8080/api/address/add \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "张三",
    "phone": "13800138000",
    "region": "广东省深圳市南山区",
    "regionArray": ["广东省", "深圳市", "南山区"],
    "detail": "科技园南区8栋101室",
    "isDefault": false
  }'
```

### 2. 获取地址列表测试
```bash
curl -X GET "http://localhost:8080/api/address/list?page=1&pageSize=10" \
  -H "Authorization: Bearer your-token"
```

## 注意事项

1. **安全性**: 所有接口都需要验证用户身份，确保用户只能操作自己的地址
2. **数据一致性**: 设置默认地址时需要保证只有一个默认地址
3. **性能优化**: 建议对地址列表进行分页查询
4. **错误处理**: 前端需要妥善处理各种错误情况
5. **数据格式**: 地区数组使用JSON格式存储，便于前端解析

## 更新日志

- v1.0.0 (2024-01-15): 初始版本，包含基础的CRUD操作
- v1.1.0 (2024-01-16): 添加默认地址管理功能 