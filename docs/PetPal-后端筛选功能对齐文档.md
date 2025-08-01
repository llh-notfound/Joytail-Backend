# PetPal 商品筛选功能后端对齐文档

## 📋 文档概述

**目标**：前端已完成商品筛选功能的重构（从前端筛选改为后端筛选），需要后端API提供相应支持。

**更新时间**：2025年7月12日  
**前端版本**：已完成筛选功能后端化改造  
**影响接口**：`GET /api/goods/list`

---

## 🎯 核心变更说明

### 变更背景
- **原实现**：前端使用computed属性对已加载数据进行筛选（性能差，用户体验不佳）
- **新实现**：前端将所有筛选条件通过API参数传递给后端处理（性能好，支持大数据量）

### 用户体验改进
- ✅ 每次筛选都有明确的网络请求（用户可感知）
- ✅ 筛选结果实时更新（获取最新数据）
- ✅ 支持复杂筛选条件组合
- ✅ 更好的分页和排序体验

---

## 🔧 API接口规范

### 接口地址
```
GET /api/goods/list
```

### 请求参数详细说明

#### 基础参数（必需）
| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `page` | number | 是 | 1 | 页码，从1开始 |
| `pageSize` | number | 是 | 10 | 每页数量 |

#### 筛选参数（可选）
| 参数名 | 类型 | 必填 | 可选值 | 说明 | 示例 |
|--------|------|------|--------|------|------|
| `category` | string | 否 | 见下方分类表 | 商品分类筛选 | `猫粮` |
| `brand` | string | 否 | 见下方品牌表 | 品牌筛选 | `皇家` |
| `keyword` | string | 否 | - | 搜索关键词 | `成犬专用` |
| `minPrice` | number | 否 | - | 最低价格 | `50` |
| `maxPrice` | number | 否 | - | 最高价格 | `200` |
| `sortBy` | string | 否 | 见下方排序表 | 排序方式 | `price_asc` |

---

## 📊 筛选条件枚举值

### 🏷️ 商品分类 (category)
**重要**：前端已更新为新的宠物用品专用分类

| 分类值 | 说明 | 数据库建议 |
|--------|------|------------|
| `猫粮` | 猫咪主食 | 精确匹配 |
| `狗粮` | 狗狗主食 | 精确匹配 |
| `玩具` | 宠物玩具 | 精确匹配 |
| `零食` | 宠物零食 | 精确匹配 |
| `护毛素` | 毛发护理产品 | 精确匹配 |
| `猫砂` | 猫咪用品 | 精确匹配 |
| `除臭剂` | 环境清洁用品 | 精确匹配 |
| `沐浴露` | 宠物清洁用品 | 精确匹配 |

**注意**：前端不再使用旧分类 `['主食', '零食', '玩具', '日用品', '洗护用品']`

### 🏪 品牌 (brand)
| 品牌值 | 说明 |
|--------|------|
| `皇家` | Royal Canin |
| `冠能` | Pro Plan |
| `宝路` | Pedigree |
| `萌能` | 萌能品牌 |
| `麦富迪` | 麦富迪品牌 |

### 🔢 排序方式 (sortBy)
| 排序值 | 说明 | 数据库实现建议 |
|--------|------|----------------|
| `price_asc` | 价格升序 | `ORDER BY price ASC` |
| `price_desc` | 价格降序 | `ORDER BY price DESC` |
| `sales_desc` | 销量降序 | `ORDER BY sales DESC` |
| 不传或空值 | 默认排序 | 综合排序（可自定义） |

---

## 💡 请求示例

### 示例1：基础分类筛选
```http
GET /api/goods/list?page=1&pageSize=10&category=猫粮
```

**业务场景**：用户在筛选弹窗选择"猫粮"分类

**后端处理**：
```sql
SELECT * FROM goods 
WHERE category = '猫粮' 
ORDER BY id DESC 
LIMIT 10 OFFSET 0;
```

### 示例2：组合筛选
```http
GET /api/goods/list?page=1&pageSize=10&category=猫粮&brand=皇家&minPrice=50&maxPrice=200&sortBy=price_asc
```

**业务场景**：用户选择猫粮分类，皇家品牌，50-200元价格区间，按价格升序

**后端处理**：
```sql
SELECT * FROM goods 
WHERE category = '猫粮' 
  AND brand = '皇家'
  AND price >= 50 
  AND price <= 200
ORDER BY price ASC
LIMIT 10 OFFSET 0;
```

### 示例3：搜索关键词
```http
GET /api/goods/list?page=1&pageSize=10&keyword=成犬专用
```

**业务场景**：用户在搜索框输入"成犬专用"

**后端处理**：
```sql
SELECT * FROM goods 
WHERE (name LIKE '%成犬专用%' OR description LIKE '%成犬专用%')
ORDER BY id DESC
LIMIT 10 OFFSET 0;
```

### 示例4：价格区间"200元以上"
```http
GET /api/goods/list?page=1&pageSize=10&minPrice=200
```

**注意**：当用户选择"200元以上"时，只传`minPrice`，不传`maxPrice`

**后端处理**：
```sql
SELECT * FROM goods 
WHERE price >= 200
ORDER BY id DESC
LIMIT 10 OFFSET 0;
```

---

## 📤 响应格式规范

### 成功响应
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 156,
    "items": [
      {
        "id": 1,
        "name": "皇家猫粮 成猫专用 2kg",
        "price": 89.9,
        "sales": 1250,
        "brand": "皇家",
        "category": "猫粮",
        "image": "https://example.com/goods/1.jpg",
        "brief": "优质猫粮，营养均衡，适合成猫"
      }
    ]
  }
}
```

### 字段说明
| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `code` | number | 是 | 状态码，200表示成功 |
| `message` | string | 是 | 响应消息 |
| `data.total` | number | 是 | 符合条件的商品总数 |
| `data.items` | array | 是 | 当前页商品列表 |
| `data.items[].id` | number | 是 | 商品ID |
| `data.items[].name` | string | 是 | 商品名称 |
| `data.items[].price` | number | 是 | 商品价格 |
| `data.items[].sales` | number | 是 | 销量 |
| `data.items[].brand` | string | 是 | 品牌 |
| `data.items[].category` | string | 是 | 分类 |
| `data.items[].image` | string | 是 | 商品图片URL |
| `data.items[].brief` | string | 否 | 商品简介 |

### 错误响应
```json
{
  "code": 400,
  "message": "参数错误: category值不支持",
  "data": null
}
```

---

## 🗄️ 数据库设计建议

### 商品表结构
```sql
CREATE TABLE goods (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL COMMENT '商品名称',
  price DECIMAL(10,2) NOT NULL COMMENT '价格',
  sales INT DEFAULT 0 COMMENT '销量',
  brand VARCHAR(50) NOT NULL COMMENT '品牌',
  category VARCHAR(50) NOT NULL COMMENT '分类',
  image VARCHAR(500) COMMENT '商品图片URL',
  brief TEXT COMMENT '商品简介',
  description TEXT COMMENT '详细描述',
  stock INT DEFAULT 0 COMMENT '库存',
  status TINYINT DEFAULT 1 COMMENT '状态：1=上架，0=下架',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- 建议添加索引
  INDEX idx_category (category),
  INDEX idx_brand (brand),
  INDEX idx_price (price),
  INDEX idx_sales (sales),
  INDEX idx_status (status),
  
  -- 全文搜索索引
  FULLTEXT INDEX idx_search (name, brief, description)
);
```

### 索引优化建议
```sql
-- 组合索引（针对常用筛选组合）
CREATE INDEX idx_category_brand_price ON goods (category, brand, price);
CREATE INDEX idx_status_category ON goods (status, category);

-- 全文搜索（支持关键词搜索）
CREATE FULLTEXT INDEX idx_goods_search ON goods (name, brief, description);
```

---

## 🔍 数据迁移指南

### 如果现有数据使用旧分类
需要将现有商品的分类从旧分类映射到新分类：

```sql
-- 数据迁移示例
UPDATE goods SET category = '猫粮' WHERE category = '主食' AND name LIKE '%猫%';
UPDATE goods SET category = '狗粮' WHERE category = '主食' AND name LIKE '%狗%';
UPDATE goods SET category = '护毛素' WHERE category = '洗护用品' AND name LIKE '%护毛%';
UPDATE goods SET category = '沐浴露' WHERE category = '洗护用品' AND name LIKE '%沐浴%';
UPDATE goods SET category = '猫砂' WHERE category = '日用品' AND name LIKE '%猫砂%';
UPDATE goods SET category = '除臭剂' WHERE category = '日用品' AND name LIKE '%除臭%';
-- 零食和玩具保持不变
```

---

## 🧪 测试用例

### 测试案例1：分类筛选
```bash
# 请求
curl "https://your-api-domain.com/api/goods/list?page=1&pageSize=5&category=猫粮"

# 期望结果
- 返回的所有商品category字段都是"猫粮"
- total字段反映数据库中所有猫粮商品的总数
- items数组最多包含5个商品
```

### 测试案例2：价格区间筛选
```bash
# 请求
curl "https://your-api-domain.com/api/goods/list?page=1&pageSize=10&minPrice=50&maxPrice=100"

# 期望结果
- 返回的所有商品price字段都在50-100之间
- 按默认排序返回
```

### 测试案例3：关键词搜索
```bash
# 请求
curl "https://your-api-domain.com/api/goods/list?page=1&pageSize=10&keyword=猫粮"

# 期望结果
- 返回的商品name或description包含"猫粮"关键词
- 支持模糊匹配
```

### 测试案例4：复杂组合筛选
```bash
# 请求
curl "https://your-api-domain.com/api/goods/list?page=1&pageSize=10&category=狗粮&brand=皇家&minPrice=30&maxPrice=200&sortBy=price_asc"

# 期望结果
- category = "狗粮"
- brand = "皇家"  
- price在30-200之间
- 按价格升序排列
```

---

## ⚠️ 注意事项

### 1. 参数处理
- **中文编码**：URL中的中文参数（如`category=猫粮`）会被URL编码，后端需要正确解码
- **参数验证**：建议验证category和brand参数是否在允许的枚举值内
- **SQL注入防护**：所有参数都需要进行SQL注入防护

### 2. 性能考虑
- **分页优化**：使用LIMIT和OFFSET进行分页，考虑大数据量的性能
- **索引使用**：确保category、brand、price字段有合适的索引
- **缓存策略**：对于热门筛选条件，可以考虑添加缓存

### 3. 兼容性
- **空值处理**：当筛选参数为空时，不应该影响查询结果
- **默认排序**：当sortBy参数为空时，使用合理的默认排序
- **分页边界**：正确处理页码超出范围的情况

### 4. 错误处理
```json
// 参数错误示例
{
  "code": 400,
  "message": "参数错误: category值'无效分类'不在允许范围内",
  "data": null
}

// 数据为空示例  
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 0,
    "items": []
  }
}
```

---

## 🚀 实现优先级建议

### P0 (必须实现)
1. ✅ 基础分页参数支持 (page, pageSize)
2. ✅ 分类筛选支持 (category)
3. ✅ 价格区间筛选支持 (minPrice, maxPrice)
4. ✅ 基础排序支持 (sortBy)

### P1 (重要功能)
1. ✅ 品牌筛选支持 (brand)  
2. ✅ 关键词搜索支持 (keyword)
3. ✅ 组合筛选支持
4. ✅ 错误处理和参数验证

### P2 (性能优化)
1. 🔄 数据库索引优化
2. 🔄 查询性能优化
3. 🔄 缓存机制
4. 🔄 全文搜索优化

---

## 📞 联调支持

### 前端联系方式
- **技术负责人**：前端开发团队
- **调试工具**：前端已集成详细的API请求日志
- **测试地址**：http://localhost:5175/#/pages/goods/list

### 调试方法
1. **查看请求参数**：前端Console会显示详细的API请求参数
2. **网络监控**：可以在浏览器Network选项卡查看真实请求
3. **错误日志**：前端会记录API调用错误信息

### 前端已完成
- ✅ 筛选逻辑完全重构为后端调用
- ✅ 所有筛选条件都通过API参数传递
- ✅ 详细的调试日志和错误处理
- ✅ 用户交互体验优化

**等待后端配合完成API支持即可上线！** 🎉
