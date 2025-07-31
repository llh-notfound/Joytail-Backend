const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function testAvatarAccess() {
  console.log('🖼️ 测试头像文件访问...\n');
  
  const avatarFiles = [
    'user1_avatar.jpg',
    'user2_avatar.jpg', 
    'user3_avatar.jpg',
    'user4_avatar.jpg',
    'user5_avatar.jpg',
    'user6_avatar.jpg'
  ];
  
  const baseUrl = 'http://localhost:8080';
  
  for (const avatarFile of avatarFiles) {
    const avatarUrl = `${baseUrl}/uploads/community-users/${avatarFile}`;
    
    try {
      console.log(`📸 测试头像: ${avatarFile}`);
      console.log(`   URL: ${avatarUrl}`);
      
      const response = await axios.get(avatarUrl, {
        timeout: 5000,
        validateStatus: function (status) {
          return status < 500; // 接受所有状态码
        }
      });
      
      if (response.status === 200) {
        console.log(`   ✅ 状态码: ${response.status}`);
        console.log(`   📏 文件大小: ${response.headers['content-length']} bytes`);
        console.log(`   🎯 内容类型: ${response.headers['content-type']}`);
      } else {
        console.log(`   ❌ 状态码: ${response.status}`);
        console.log(`   📄 响应: ${response.data}`);
      }
      
    } catch (error) {
      console.log(`   ❌ 请求失败: ${error.message}`);
      if (error.response) {
        console.log(`   📄 错误状态: ${error.response.status}`);
        console.log(`   📄 错误信息: ${error.response.data}`);
      }
    }
    
    console.log('');
  }
  
  // 检查文件是否存在
  console.log('🔍 检查本地文件是否存在:');
  const uploadsDir = path.join(__dirname, 'uploads', 'community-users');
  
  for (const avatarFile of avatarFiles) {
    const filePath = path.join(uploadsDir, avatarFile);
    const exists = fs.existsSync(filePath);
    const stats = exists ? fs.statSync(filePath) : null;
    
    console.log(`   ${avatarFile}: ${exists ? '✅ 存在' : '❌ 不存在'}`);
    if (exists) {
      console.log(`      📏 大小: ${stats.size} bytes`);
      console.log(`      📅 修改时间: ${stats.mtime}`);
    }
  }
  
  console.log('\n💡 解决方案:');
  console.log('1. 确保后端服务器运行在端口8080');
  console.log('2. 确保头像文件存在于 uploads/community-users/ 目录');
  console.log('3. 前端应该使用 http://localhost:8080/uploads/community-users/ 访问头像');
  console.log('4. 如果前端使用端口5173，需要修改头像URL生成逻辑');
}

testAvatarAccess(); 