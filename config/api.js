// API配置文件
const config = {
  // 开发环境配置
  development: {
    baseURL: process.env.API_BASE_URL || 'http://localhost:8080/api',
    timeout: parseInt(process.env.API_TIMEOUT) || 10000
  },
  
  // 生产环境配置
  production: {
    baseURL: process.env.API_BASE_URL || 'https://udrvmlsoncfg.sealosbja.site/api',
    timeout: parseInt(process.env.API_TIMEOUT) || 15000
  },
  
  // 测试环境配置
  test: {
    baseURL: process.env.API_BASE_URL || 'http://localhost:8080/api',
    timeout: parseInt(process.env.API_TIMEOUT) || 5000
  }
};

// 根据环境变量获取配置
const env = process.env.NODE_ENV || 'development';
const currentConfig = config[env];

// 导出配置
module.exports = {
  baseURL: currentConfig.baseURL,
  timeout: currentConfig.timeout,
  env: env,
  
  // 获取完整的API URL
  getApiUrl: (endpoint) => {
    return `${currentConfig.baseURL}${endpoint}`;
  },
  
  // 获取当前环境
  getCurrentEnv: () => env,
  
  // 获取所有配置
  getAllConfig: () => config,
  
  // 获取当前配置
  getCurrentConfig: () => currentConfig
};

console.log(`🌐 API配置已加载 - 环境: ${env}, BaseURL: ${currentConfig.baseURL}`); 