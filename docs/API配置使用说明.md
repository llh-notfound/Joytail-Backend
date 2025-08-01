# PetPal API配置使用说明

## 概述

为了方便在不同环境（开发、测试、生产）中切换API地址，我们创建了一套灵活的配置系统。

## 配置结构

```
config/
├── api.js          # API配置文件
└── ...

scripts/
├── setup-env.js    # 环境配置脚本
└── ...

.env                # 环境变量文件（自动生成）
```

## 使用方法

### 1. 快速切换环境

```bash
# 切换到开发环境
node scripts/setup-env.js development

# 切换到生产环境
node scripts/setup-env.js production

# 切换到测试环境
node scripts/setup-env.js test
```

### 2. 手动配置环境变量

创建 `.env` 文件：

```bash
# 开发环境
NODE_ENV=development
API_BASE_URL=http://localhost:8080/api
API_TIMEOUT=10000

# 生产环境
NODE_ENV=production
API_BASE_URL=https://udrvmlsoncfg.sealosbja.site/api
API_TIMEOUT=15000

# 测试环境
NODE_ENV=test
API_BASE_URL=http://localhost:8080/api
API_TIMEOUT=5000
```

### 3. 在代码中使用

```javascript
const apiConfig = require('./config/api');

// 获取基础URL
console.log(apiConfig.baseURL);

// 获取完整的API URL
const userListUrl = apiConfig.getApiUrl('/user/list');
console.log(userListUrl);

// 获取当前环境
console.log(apiConfig.getCurrentEnv());

// 获取当前配置
console.log(apiConfig.getCurrentConfig());
```

## 环境配置详情

### 开发环境 (development)
- **BaseURL**: `http://localhost:8080/api`
- **超时**: 10秒
- **用途**: 本地开发调试

### 生产环境 (production)
- **BaseURL**: `https://udrvmlsoncfg.sealosbja.site/api`
- **超时**: 15秒
- **用途**: 线上生产环境

### 测试环境 (test)
- **BaseURL**: `http://localhost:8080/api`
- **超时**: 5秒
- **用途**: 自动化测试

## 配置优先级

1. **环境变量** (最高优先级)
   - `API_BASE_URL`
   - `API_TIMEOUT`
   - `NODE_ENV`

2. **默认配置** (最低优先级)
   - 各环境的默认值

## 示例用法

### 1. 开发时使用

```bash
# 设置开发环境
node scripts/setup-env.js development

# 启动服务器
npm start

# 运行测试
node test-address-api.js
```

### 2. 部署到生产环境

```bash
# 设置生产环境
node scripts/setup-env.js production

# 启动服务器
NODE_ENV=production npm start
```

### 3. 运行测试

```bash
# 设置测试环境
node scripts/setup-env.js test

# 运行测试
NODE_ENV=test node test-address-api.js
```

## 自定义配置

如果需要自定义API地址，可以：

1. **直接修改环境变量**：
   ```bash
   export API_BASE_URL=https://your-custom-domain.com/api
   ```

2. **修改配置文件**：
   编辑 `config/api.js` 文件中的配置

3. **使用 .env 文件**：
   创建 `.env` 文件并设置自定义值

## 验证配置

运行以下命令验证当前配置：

```bash
node -e "console.log(require('./config/api'))"
```

## 注意事项

1. **环境变量优先级**: 环境变量会覆盖默认配置
2. **安全性**: 生产环境的API密钥等敏感信息不要提交到代码库
3. **版本控制**: `.env` 文件通常应该被 `.gitignore` 忽略
4. **团队协作**: 使用 `scripts/setup-env.js` 确保团队成员使用相同的配置

## 故障排除

### 问题1: 配置不生效
```bash
# 检查环境变量
echo $NODE_ENV
echo $API_BASE_URL

# 重新设置环境
node scripts/setup-env.js development
```

### 问题2: API请求失败
```bash
# 检查API地址
node -e "console.log(require('./config/api').baseURL)"

# 测试API连接
curl $(node -e "console.log(require('./config/api').baseURL)")/health
```

### 问题3: 超时错误
```bash
# 检查超时设置
node -e "console.log(require('./config/api').timeout)"

# 增加超时时间
export API_TIMEOUT=30000
``` 