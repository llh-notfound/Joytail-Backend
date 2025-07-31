const jwt = require('jsonwebtoken');

const JWT_SECRET = 'petpal-secret-key-should-be-environment-variable';

// 生成测试令牌
const token = jwt.sign(
  { userId: 'user123', username: 'testuser' }, 
  JWT_SECRET,
  { expiresIn: '24h' }
);

console.log('JWT Token:', token);

// 测试订单创建的数据
const testOrderData = {
  cartItemIds: ['cart_item_001', 'cart_item_002'],
  addressId: 'addr_001',
  message: '请小心轻放'
};

console.log('Test Order Data:', JSON.stringify(testOrderData, null, 2));
