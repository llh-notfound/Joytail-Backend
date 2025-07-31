const redis = require('redis');
const client = redis.createClient();

async function setupTestData() {
  try {
    await client.connect();
    console.log('Connected to Redis');
    
    const userId = 'user123';
    
    // 添加购物车数据
    const cartData = {
      userId: userId,
      items: [
        {
          id: 'cart_item_001',
          goodsId: 'goods_001',
          name: 'KONG狗狗玩具球',
          price: 29.90,
          quantity: 4,
          specs: '小号',
          selected: true,
          image: '/images/kong-ball.jpg'
        },
        {
          id: 'cart_item_002', 
          goodsId: 'goods_002',
          name: '膨润土猫砂 10L',
          price: 25.90,
          quantity: 2,
          specs: '10L装',
          selected: true,
          image: '/images/cat-litter.jpg'
        }
      ]
    };
    
    await client.set(`cart:${userId}`, JSON.stringify(cartData));
    console.log('Added cart data');
    
    // 添加测试地址
    const addressData = {
      id: 'addr_001',
      name: '张三',
      phone: '138****1234',
      province: '广东省',
      city: '深圳市',
      district: '南山区',
      detailAddress: '科技园1号楼101室',
      isDefault: true
    };
    
    await client.set(`address:${userId}:addr_001`, JSON.stringify(addressData));
    console.log('Added address data');
    
    // 添加商品数据
    const goods1 = {
      id: 'goods_001',
      name: 'KONG狗狗玩具球',
      price: 29.90,
      stock: 100,
      images: ['/images/kong-ball.jpg'],
      category: '玩具',
      brand: 'KONG'
    };
    
    const goods2 = {
      id: 'goods_002',
      name: '膨润土猫砂 10L',
      price: 25.90,
      stock: 50,
      images: ['/images/cat-litter.jpg'],
      category: '猫砂',
      brand: '净味王'
    };
    
    await client.set('goods:goods_001', JSON.stringify(goods1));
    await client.set('goods:goods_002', JSON.stringify(goods2));
    console.log('Added goods data');
    
    await client.disconnect();
    console.log('Test data setup complete');
  } catch (error) {
    console.error('Error:', error);
  }
}

setupTestData();
