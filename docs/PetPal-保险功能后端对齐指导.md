# 宠物保险功能后端对齐指导文档

## 问题诊断总结

### ✅ 已验证正常的功能
通过测试确认以下API端点正常工作：
- **基础服务器连接**: ✅ 正常 (200ms响应)
- **保险产品列表API**: ✅ 正常 (`GET /api/insurance/products`)
- **保险产品详情API**: ✅ 正常 (`GET /api/insurance/products/{id}`)

### ❌ 需要修复的问题
1. **认证相关API返回401错误**
   - `/api/insurance/policies/my` - 我的保单列表
   - `/api/insurance/quote` - 保险报价
   - `/api/insurance/claims/*` - 理赔相关接口

2. **用户体验问题**
   - 错误提示不够明确
   - 未登录用户看到"无法连接服务器"的误导信息

## 后端开发对齐要求

### 1. JWT认证中间件配置

确保JWT认证中间件正确处理以下情况：

```javascript
// Express.js 示例
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      code: 401,
      message: '未提供认证令牌',
      data: null
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(401).json({
        code: 401,
        message: '令牌无效或已过期',
        data: null
      });
    }
    
    req.user = user;
    next();
  });
};
```

### 2. 保险API端点实现清单

#### 2.1 无需认证的接口 (✅已实现)
```javascript
// 获取保险产品列表
app.get('/api/insurance/products', getInsuranceProducts);

// 获取保险产品详情
app.get('/api/insurance/products/:id', getInsuranceProductDetail);
```

#### 2.2 需要认证的接口 (❌需要实现)
```javascript
// 获取我的保单列表
app.get('/api/insurance/policies/my', authenticateToken, getMyPolicies);

// 获取保单详情
app.get('/api/insurance/policies/:id', authenticateToken, getPolicyDetail);

// 获取保险报价
app.post('/api/insurance/quote', authenticateToken, getInsuranceQuote);

// 购买保险
app.post('/api/insurance/purchase', authenticateToken, purchaseInsurance);

// 提交理赔申请
app.post('/api/insurance/claims', authenticateToken, submitClaim);

// 获取理赔记录
app.get('/api/insurance/claims/my', authenticateToken, getClaimHistory);

// 获取理赔详情
app.get('/api/insurance/claims/:id', authenticateToken, getClaimDetail);

// 续保
app.post('/api/insurance/policies/renew', authenticateToken, renewPolicy);

// 取消保单
app.post('/api/insurance/policies/cancel', authenticateToken, cancelPolicy);
```

### 3. 响应格式标准化

所有API响应必须遵循统一格式：

```javascript
// 成功响应
{
  "code": 200,
  "message": "获取成功",
  "data": {
    // 具体数据
  }
}

// 错误响应
{
  "code": 401,
  "message": "令牌无效或已过期",
  "data": null
}
```

### 4. 关键API实现示例

#### 4.1 获取我的保单列表
```javascript
const getMyPolicies = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, pageSize = 10, status } = req.query;
    
    // 构建查询条件
    const where = { userId };
    if (status && status !== 'all') {
      where.status = status;
    }
    
    // 分页查询
    const offset = (page - 1) * pageSize;
    const policies = await Policy.findAndCountAll({
      where,
      limit: parseInt(pageSize),
      offset: offset,
      include: [
        { model: InsuranceProduct, as: 'product' },
        { model: Pet, as: 'pet' }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    // 格式化响应数据
    const formattedPolicies = policies.rows.map(policy => ({
      policyId: policy.id,
      productName: policy.product.name,
      company: policy.product.company,
      petName: policy.pet.name,
      petType: policy.pet.type,
      status: policy.status,
      statusText: getStatusText(policy.status),
      startDate: policy.startDate,
      endDate: policy.endDate,
      premium: policy.premium,
      coverageLimit: policy.coverageLimit,
      claimsUsed: policy.claimsUsed || '0'
    }));
    
    res.json({
      code: 200,
      message: '获取成功',
      data: {
        list: formattedPolicies,
        total: policies.count,
        hasMore: offset + formattedPolicies.length < policies.count
      }
    });
  } catch (error) {
    console.error('获取保单列表失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      data: null
    });
  }
};
```

#### 4.2 获取保险报价
```javascript
const getInsuranceQuote = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      productId, 
      petType, 
      petAge, 
      petBreed, 
      isNeutered, 
      coverageOptions 
    } = req.body;
    
    // 验证必填参数
    if (!productId || !petType || petAge === undefined) {
      return res.status(400).json({
        code: 400,
        message: '缺少必填参数',
        data: null
      });
    }
    
    // 获取保险产品信息
    const product = await InsuranceProduct.findByPk(productId);
    if (!product) {
      return res.status(404).json({
        code: 404,
        message: '保险产品不存在',
        data: null
      });
    }
    
    // 计算保费（示例逻辑）
    let basePrice = product.price;
    const adjustments = [];
    
    // 年龄调整
    if (petAge > 8) {
      const ageAdjustment = Math.floor(basePrice * 0.2);
      basePrice += ageAdjustment;
      adjustments.push({
        factor: 'age',
        adjustment: ageAdjustment,
        description: '高龄宠物调整'
      });
    }
    
    // 绝育状态调整
    if (!isNeutered) {
      const neuteredAdjustment = Math.floor(basePrice * 0.1);
      basePrice += neuteredAdjustment;
      adjustments.push({
        factor: 'neutered',
        adjustment: neuteredAdjustment,
        description: '未绝育风险调整'
      });
    }
    
    // 报价有效期（24小时）
    const validUntil = new Date();
    validUntil.setHours(validUntil.getHours() + 24);
    
    res.json({
      code: 200,
      message: '报价成功',
      data: {
        productId,
        basePrice: product.price,
        adjustments,
        finalPrice: basePrice,
        validUntil: validUntil.toISOString()
      }
    });
  } catch (error) {
    console.error('获取保险报价失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      data: null
    });
  }
};
```

### 5. 数据库表结构建议

#### 5.1 保险产品表 (insurance_products)
```sql
CREATE TABLE insurance_products (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(200) NOT NULL COMMENT '产品名称',
  company VARCHAR(100) NOT NULL COMMENT '保险公司',
  coverage TEXT COMMENT '保障范围描述',
  price DECIMAL(10,2) NOT NULL COMMENT '年保费',
  original_price DECIMAL(10,2) COMMENT '原价',
  pet_types JSON COMMENT '适用宠物类型',
  type ENUM('medical','accident','comprehensive','liability') COMMENT '保险类型',
  image VARCHAR(500) COMMENT '产品图片',
  tags JSON COMMENT '标签',
  period VARCHAR(50) DEFAULT '1年' COMMENT '保障期限',
  rating DECIMAL(2,1) DEFAULT 0 COMMENT '评分',
  sales_count INT DEFAULT 0 COMMENT '销量',
  status ENUM('active','inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 5.2 保单表 (policies)
```sql
CREATE TABLE policies (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL COMMENT '用户ID',
  product_id VARCHAR(50) NOT NULL COMMENT '产品ID',
  pet_id VARCHAR(50) NOT NULL COMMENT '宠物ID',
  order_no VARCHAR(100) UNIQUE COMMENT '订单号',
  status ENUM('pending','active','expired','cancelled') DEFAULT 'pending',
  start_date DATE COMMENT '保障开始日期',
  end_date DATE COMMENT '保障结束日期',
  premium DECIMAL(10,2) NOT NULL COMMENT '保费',
  coverage_limit VARCHAR(50) COMMENT '保障额度',
  claims_used DECIMAL(10,2) DEFAULT 0 COMMENT '已使用理赔金额',
  contact_name VARCHAR(100) COMMENT '联系人姓名',
  contact_phone VARCHAR(20) COMMENT '联系电话',
  contact_email VARCHAR(100) COMMENT '联系邮箱',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (product_id) REFERENCES insurance_products(id),
  FOREIGN KEY (pet_id) REFERENCES pets(id)
);
```

#### 5.3 理赔记录表 (claims)
```sql
CREATE TABLE claims (
  id VARCHAR(50) PRIMARY KEY,
  claim_no VARCHAR(100) UNIQUE COMMENT '理赔编号',
  policy_id VARCHAR(50) NOT NULL COMMENT '保单ID',
  user_id VARCHAR(50) NOT NULL COMMENT '用户ID',
  incident_date DATE NOT NULL COMMENT '事故日期',
  incident_type ENUM('accident','illness','surgery') COMMENT '事故类型',
  description TEXT COMMENT '事故描述',
  claim_amount DECIMAL(10,2) NOT NULL COMMENT '申请理赔金额',
  approved_amount DECIMAL(10,2) COMMENT '批准理赔金额',
  status ENUM('pending','reviewing','approved','rejected','paid') DEFAULT 'pending',
  submit_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '提交日期',
  processed_date TIMESTAMP NULL COMMENT '处理完成日期',
  veterinary_name VARCHAR(100) COMMENT '兽医姓名',
  veterinary_hospital VARCHAR(200) COMMENT '兽医院名称',
  veterinary_phone VARCHAR(20) COMMENT '兽医联系电话',
  documents JSON COMMENT '相关文件',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_policy_id (policy_id),
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  FOREIGN KEY (policy_id) REFERENCES policies(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 6. 测试验证步骤

#### 6.1 API测试命令
```bash
# 1. 测试保险产品列表（无需认证）
curl -X GET "https://udrvmlsoncfg.sealosbja.site/api/insurance/products?page=1&pageSize=5"

# 2. 测试我的保单列表（需要认证）
curl -X GET "https://udrvmlsoncfg.sealosbja.site/api/insurance/policies/my" \
  -H "Authorization: Bearer YOUR_VALID_TOKEN"

# 3. 测试保险报价（需要认证）
curl -X POST "https://udrvmlsoncfg.sealosbja.site/api/insurance/quote" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_VALID_TOKEN" \
  -d '{
    "productId": "product_1",
    "petType": "dog",
    "petAge": 3,
    "petBreed": "金毛",
    "isNeutered": true
  }'
```

#### 6.2 预期响应示例

**成功响应**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "list": [
      {
        "policyId": "policy_123",
        "productName": "宠物医疗保险",
        "company": "太平洋保险",
        "petName": "小花",
        "petType": "cat",
        "status": "active",
        "statusText": "生效中",
        "startDate": "2024-01-01",
        "endDate": "2024-12-31",
        "premium": 899,
        "coverageLimit": "20万",
        "claimsUsed": "0"
      }
    ],
    "total": 1,
    "hasMore": false
  }
}
```

**认证失败响应**:
```json
{
  "code": 401,
  "message": "令牌无效或已过期",
  "data": null
}
```

### 7. 部署检查清单

- [ ] **JWT认证中间件配置正确**
- [ ] **所有保险相关API路由已实现**
- [ ] **数据库表结构已创建**
- [ ] **CORS配置允许前端域名访问**
- [ ] **环境变量配置正确**（JWT_SECRET等）
- [ ] **服务器防火墙开放HTTP/HTTPS端口**
- [ ] **SSL证书配置正确**
- [ ] **数据库连接正常**
- [ ] **错误日志记录配置**

### 8. 常见问题排查

#### 8.1 401错误排查步骤
1. 检查JWT_SECRET环境变量是否配置
2. 验证token格式是否正确（Bearer token）
3. 确认token未过期
4. 检查认证中间件是否正确应用到路由

#### 8.2 CORS错误排查
1. 确认Access-Control-Allow-Origin设置
2. 检查Access-Control-Allow-Headers包含Authorization
3. 确认OPTIONS预检请求正确处理

#### 8.3 数据库错误排查
1. 检查数据库连接配置
2. 确认表结构已创建
3. 验证外键约束配置

### 9. 监控和日志

建议添加以下监控点：
- API请求响应时间
- 认证失败次数
- 数据库查询性能
- 错误率统计

```javascript
// 日志记录示例
const logger = require('winston');

app.use('/api/insurance', (req, res, next) => {
  logger.info('Insurance API Request', {
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    userId: req.user?.id
  });
  next();
});
```

### 10. 联系方式

如在实现过程中遇到问题，请及时与前端开发团队沟通。

---

**文档版本**: v1.0  
**最后更新**: 2024年1月  
**维护者**: PetPal开发团队
