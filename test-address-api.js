const axios = require('axios');
const apiConfig = require('./config/api');

const BASE_URL = apiConfig.baseURL;
let authToken = '';

console.log(`🚀 使用API配置: ${BASE_URL}`);

// 创建测试用户并获取token
async function createTestUser() {
  try {
    console.log('🔐 创建测试用户...');
    
    // 注册用户
    const registerResponse = await axios.post(`${apiConfig.getApiUrl('/user/register')}`, {
      username: 'testuser_address',
      password: '123456',
      nickname: '地址测试用户'
    });
    
    if (registerResponse.data.code === 200) {
      console.log('✅ 用户注册成功');
    }
    
    // 登录获取token
    const loginResponse = await axios.post(`${apiConfig.getApiUrl('/user/login')}`, {
      username: 'testuser_address',
      password: '123456'
    });
    
    if (loginResponse.data.code === 200) {
      authToken = loginResponse.data.data.token;
      console.log('✅ 登录成功，获取到token');
    }
    
  } catch (error) {
    console.log('⚠️ 用户可能已存在，尝试登录...');
    
    try {
      const loginResponse = await axios.post(`${apiConfig.getApiUrl('/user/login')}`, {
        username: 'testuser_address',
        password: '123456'
      });
      
      if (loginResponse.data.code === 200) {
        authToken = loginResponse.data.data.token;
        console.log('✅ 登录成功，获取到token');
      }
    } catch (loginError) {
      console.error('❌ 登录失败:', loginError.response?.data || loginError.message);
      throw loginError;
    }
  }
}

// 测试获取地址列表
async function testGetAddressList() {
  try {
    console.log('\n📋 测试获取地址列表...');
    
    const response = await axios.get(`${apiConfig.getApiUrl('/address/list')}?page=1&pageSize=10`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    console.log('✅ 获取地址列表成功');
    console.log('   响应数据:', JSON.stringify(response.data, null, 2));
    
    if (response.data.data) {
      console.log(`   总数: ${response.data.data.total || 0}`);
      console.log(`   当前页: ${response.data.data.page || 1}`);
      console.log(`   每页大小: ${response.data.data.pageSize || 10}`);
      console.log(`   地址数量: ${response.data.data.list ? response.data.data.list.length : 0}`);
    }
    
    return response.data.data;
  } catch (error) {
    console.error('❌ 获取地址列表失败:', error.response?.data || error.message);
    throw error;
  }
}

// 测试新增地址
async function testAddAddress() {
  try {
    console.log('\n➕ 测试新增地址...');
    
    const addressData = {
      name: '张三',
      phone: '13800138000',
      region: '广东省深圳市南山区',
      regionArray: ['广东省', '深圳市', '南山区'],
      detail: '科技园南区8栋101室',
      isDefault: true
    };
    
    const response = await axios.post(`${apiConfig.getApiUrl('/address/add')}`, addressData, {
      headers: { 
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ 新增地址成功');
    console.log(`   地址ID: ${response.data.data.id}`);
    console.log(`   收货人: ${response.data.data.name}`);
    console.log(`   手机号: ${response.data.data.phone}`);
    console.log(`   地区: ${response.data.data.region}`);
    console.log(`   详细地址: ${response.data.data.detail}`);
    console.log(`   是否默认: ${response.data.data.isDefault}`);
    
    return response.data.data;
  } catch (error) {
    console.error('❌ 新增地址失败:', error.response?.data || error.message);
    throw error;
  }
}

// 测试新增第二个地址
async function testAddSecondAddress() {
  try {
    console.log('\n➕ 测试新增第二个地址...');
    
    const addressData = {
      name: '李四',
      phone: '13900139000',
      region: '北京市朝阳区',
      regionArray: ['北京市', '北京市', '朝阳区'],
      detail: '三里屯SOHO 2号楼3层',
      isDefault: false
    };
    
    const response = await axios.post(`${apiConfig.getApiUrl('/address/add')}`, addressData, {
      headers: { 
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ 新增第二个地址成功');
    console.log(`   地址ID: ${response.data.data.id}`);
    console.log(`   收货人: ${response.data.data.name}`);
    console.log(`   是否默认: ${response.data.data.isDefault}`);
    
    return response.data.data;
  } catch (error) {
    console.error('❌ 新增第二个地址失败:', error.response?.data || error.message);
    throw error;
  }
}

// 测试获取默认地址
async function testGetDefaultAddress() {
  try {
    console.log('\n🏠 测试获取默认地址...');
    
    const response = await axios.get(`${apiConfig.getApiUrl('/address/default')}`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    if (response.data.data) {
      console.log('✅ 获取默认地址成功');
      console.log(`   地址ID: ${response.data.data.id}`);
      console.log(`   收货人: ${response.data.data.name}`);
      console.log(`   地区: ${response.data.data.region}`);
      console.log(`   详细地址: ${response.data.data.detail}`);
    } else {
      console.log('ℹ️ 暂无默认地址');
    }
    
    return response.data.data;
  } catch (error) {
    console.error('❌ 获取默认地址失败:', error.response?.data || error.message);
    throw error;
  }
}

// 测试设置默认地址
async function testSetDefaultAddress(addressId) {
  try {
    console.log('\n⭐ 测试设置默认地址...');
    
    const response = await axios.put(`${apiConfig.getApiUrl('/address/set-default')}`, {
      id: addressId
    }, {
      headers: { 
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ 设置默认地址成功');
    console.log(`   地址ID: ${response.data.data.id}`);
    console.log(`   收货人: ${response.data.data.name}`);
    console.log(`   是否默认: ${response.data.data.isDefault}`);
    
    return response.data.data;
  } catch (error) {
    console.error('❌ 设置默认地址失败:', error.response?.data || error.message);
    throw error;
  }
}

// 测试更新地址
async function testUpdateAddress(addressId) {
  try {
    console.log('\n✏️ 测试更新地址...');
    
    const updateData = {
      id: addressId,
      name: '张三（已更新）',
      phone: '13800138001',
      region: '广东省深圳市福田区',
      regionArray: ['广东省', '深圳市', '福田区'],
      detail: '福田中心区深南大道1001号',
      isDefault: false
    };
    
    const response = await axios.put(`${apiConfig.getApiUrl('/address/update')}`, updateData, {
      headers: { 
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ 更新地址成功');
    console.log(`   地址ID: ${response.data.data.id}`);
    console.log(`   收货人: ${response.data.data.name}`);
    console.log(`   手机号: ${response.data.data.phone}`);
    console.log(`   地区: ${response.data.data.region}`);
    console.log(`   详细地址: ${response.data.data.detail}`);
    
    return response.data.data;
  } catch (error) {
    console.error('❌ 更新地址失败:', error.response?.data || error.message);
    throw error;
  }
}

// 测试删除地址
async function testDeleteAddress(addressId) {
  try {
    console.log('\n🗑️ 测试删除地址...');
    
    const response = await axios.delete(`${apiConfig.getApiUrl('/address/delete')}`, {
      data: { id: addressId },
      headers: { 
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ 删除地址成功');
    console.log(`   删除的地址ID: ${addressId}`);
    
    return response.data;
  } catch (error) {
    console.error('❌ 删除地址失败:', error.response?.data || error.message);
    throw error;
  }
}

// 主测试函数
async function runTests() {
  try {
    console.log('🚀 开始测试地址管理API...\n');
    
    // 1. 创建测试用户
    await createTestUser();
    
    // 2. 获取初始地址列表
    await testGetAddressList();
    
    // 3. 新增第一个地址
    const address1 = await testAddAddress();
    
    // 4. 新增第二个地址
    const address2 = await testAddSecondAddress();
    
    // 5. 获取地址列表（应该有2个地址）
    await testGetAddressList();
    
    // 6. 获取默认地址
    await testGetDefaultAddress();
    
    // 7. 设置第二个地址为默认
    await testSetDefaultAddress(address2.id);
    
    // 8. 再次获取默认地址
    await testGetDefaultAddress();
    
    // 9. 更新第一个地址
    await testUpdateAddress(address1.id);
    
    // 10. 获取更新后的地址列表
    await testGetAddressList();
    
    // 11. 删除第一个地址
    await testDeleteAddress(address1.id);
    
    // 12. 获取删除后的地址列表
    await testGetAddressList();
    
    console.log('\n🎉 所有测试完成！');
    
  } catch (error) {
    console.error('\n❌ 测试过程中出现错误:', error.message);
  }
}

// 运行测试
runTests(); 