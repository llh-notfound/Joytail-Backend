#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 环境配置模板
const envConfigs = {
  development: {
    NODE_ENV: 'development',
    API_BASE_URL: 'http://localhost:8080/api',
    API_TIMEOUT: '10000',
    PORT: '8080'
  },
  production: {
    NODE_ENV: 'production',
    API_BASE_URL: 'https://udrvmlsoncfg.sealosbja.site/api',
    API_TIMEOUT: '15000',
    PORT: '8080'
  },
  test: {
    NODE_ENV: 'test',
    API_BASE_URL: 'http://localhost:8080/api',
    API_TIMEOUT: '5000',
    PORT: '8080'
  }
};

// 获取命令行参数
const args = process.argv.slice(2);
const targetEnv = args[0] || 'development';

if (!envConfigs[targetEnv]) {
  console.error('❌ 无效的环境名称:', targetEnv);
  console.log('✅ 支持的环境: development, production, test');
  process.exit(1);
}

// 生成环境变量文件内容
const envContent = Object.entries(envConfigs[targetEnv])
  .map(([key, value]) => `${key}=${value}`)
  .join('\n');

// 写入 .env 文件
const envPath = path.join(__dirname, '..', '.env');
fs.writeFileSync(envPath, envContent);

console.log(`✅ 环境配置已更新为: ${targetEnv}`);
console.log(`📁 配置文件: ${envPath}`);
console.log(`🌐 API地址: ${envConfigs[targetEnv].API_BASE_URL}`);
console.log(`⏱️ 超时设置: ${envConfigs[targetEnv].API_TIMEOUT}ms`);

// 显示当前配置
console.log('\n📋 当前配置:');
Object.entries(envConfigs[targetEnv]).forEach(([key, value]) => {
  console.log(`   ${key}: ${value}`);
});

console.log('\n💡 使用方法:');
console.log('   node scripts/setup-env.js development  # 开发环境');
console.log('   node scripts/setup-env.js production   # 生产环境');
console.log('   node scripts/setup-env.js test         # 测试环境'); 