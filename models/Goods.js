const { getRedisClient } = require('../config/redis');
const { v4: uuidv4 } = require('uuid');

/**
 * Goods class represents the model for pet products
 */
class Goods {
  /**
   * Get all goods with filters
   * @param {Object} options - Filter options
   * @returns {Promise<Array>} Array of goods
   */
  static async getGoods(options = {}) {
    const client = getRedisClient();
    
    try {
      const goodsKeys = await client.keys('goods:*');
      
      if (!goodsKeys.length) {
        // 如果没有商品数据，添加一些测试数据
        await this.createSampleGoods();
        return this.getGoods(options);
      }
      
      const goods = [];
      for (const key of goodsKeys) {
        const goodsData = await client.get(key);
        if (goodsData) {
          const item = JSON.parse(goodsData);
          
          // Apply filters if provided
          if (options.category && item.category !== options.category) continue;
          if (options.brand && item.brand !== options.brand) continue;
          
          // 价格区间筛选
          if (options.minPrice !== undefined && item.price < parseFloat(options.minPrice)) continue;
          if (options.maxPrice !== undefined && item.price > parseFloat(options.maxPrice)) continue;
          
          // 关键词搜索（名称和描述）
          if (options.keyword) {
            const keyword = options.keyword.toLowerCase();
            const nameMatch = item.name.toLowerCase().includes(keyword);
            const descMatch = item.description && item.description.toLowerCase().includes(keyword);
            const briefMatch = item.brief && item.brief.toLowerCase().includes(keyword);
            if (!nameMatch && !descMatch && !briefMatch) continue;
          }
          
          goods.push(item);
        }
      }
      
      // Apply sorting if provided
      if (options.sortBy) {
        switch (options.sortBy) {
          case 'price_asc':
            goods.sort((a, b) => a.price - b.price);
            break;
          case 'price_desc':
            goods.sort((a, b) => b.price - a.price);
            break;
          case 'sales_desc':
            goods.sort((a, b) => b.sales - a.sales);
            break;
          default:
            // 默认排序：按销量降序
            goods.sort((a, b) => b.sales - a.sales);
        }
      } else {
        // 默认排序：按销量降序
        goods.sort((a, b) => b.sales - a.sales);
      }
      
      return goods;
    } catch (error) {
      console.error('Error getting goods:', error);
      return [];
    }
  }
  
  /**
   * Get goods by ID
   * @param {String} goodsId - Goods ID
   * @returns {Promise<Object|null>} Goods object or null if not found
   */
  static async getGoodsById(goodsId) {
    try {
      const client = getRedisClient();
      const goodsData = await client.get(`goods:${goodsId}`);
      return goodsData ? JSON.parse(goodsData) : null;
    } catch (error) {
      console.error('Error getting goods by ID:', error);
      return null;
    }
  }
  
  /**
   * Get hot goods
   * @param {Number} limit - Number of items to return
   * @returns {Promise<Array>} Array of hot goods
   */
  static async getHotGoods(limit = 5) {
    try {
      const allGoods = await this.getGoods();
      return allGoods
        .sort((a, b) => b.sales - a.sales)
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting hot goods:', error);
      return [];
    }
  }
  
  /**
   * Search goods by keyword
   * @param {String} keyword - Search keyword
   * @returns {Promise<Array>} Array of matching goods
   */
  static async searchGoods(keyword) {
    try {
      const allGoods = await this.getGoods();
      return allGoods.filter(item => 
        item.name.toLowerCase().includes(keyword.toLowerCase()) ||
        item.description.toLowerCase().includes(keyword.toLowerCase())
      );
    } catch (error) {
      console.error('Error searching goods:', error);
      return [];
    }
  }
  
  /**
   * Create sample goods for testing
   * @private
   */
  static async createSampleGoods() {
    const client = getRedisClient();
    
    const sampleGoods = [
      {
        id: uuidv4(),
        name: '麦富迪成犬小型犬狗粮',
        price: 128.5,
        sales: 1250,
        brand: '麦富迪',
        category: '狗粮',
        brief: '专为成犬小型犬设计，营养全面',
        images: ['http://localhost:8080/public/images/goods/狗粮/麦富迪/封面.jpg'],
        specs: ['1.5kg', '3kg', '7kg'],
        stock: 100,
        description: '专为小型成犬设计的营养配方，含有丰富蛋白质和维生素，帮助维持狗狗健康体重。'
      },
      {
        id: uuidv4(),
        name: '皇家ROYAL CANNIN 成猫通用猫粮',
        price: 156.8,
        sales: 2000,
        brand: '皇家',
        category: '猫粮',
        brief: '皇家品牌，成猫专用，营养均衡',
        images: ['http://localhost:8080/public/images/goods/猫粮/皇家/封面.jpg'],
        specs: ['2kg', '5kg', '10kg'],
        stock: 150,
        description: '皇家品牌成猫通用猫粮，采用优质蛋白源，添加多种维生素和矿物质，促进猫咪健康成长。'
      },
      {
        id: uuidv4(),
        name: 'HOUYA狗狗可发声玩具球',
        price: 29.9,
        sales: 1800,
        brand: 'HOUYA',
        category: '玩具',
        brief: '可发声玩具球，训练必备',
        images: ['http://localhost:8080/public/images/goods/玩具/HOUYA/封面.JPG'],
        specs: ['小号', '中号', '大号'],
        stock: 200,
        description: '采用优质环保材料，安全无毒，可发声设计增加趣味性，适合狗狗玩耍和训练。'
      },
      {
        id: uuidv4(),
        name: '爱犬岛护毛素',
        price: 45.8,
        sales: 980,
        brand: '爱犬岛',
        category: '护毛素',
        brief: '深层滋养，让毛发更柔顺',
        images: ['http://localhost:8080/public/images/goods/护毛素/爱犬岛/封面.jpg'],
        specs: ['250ml', '500ml'],
        stock: 120,
        description: '含有天然植物精华，深层滋养宠物毛发，让毛发更加柔顺有光泽，适合长毛宠物使用。'
      },
      {
        id: uuidv4(),
        name: '顽皮消臭饼干',
        price: 39.9,
        sales: 1500,
        brand: '顽皮',
        category: '零食',
        brief: '消臭功能，营养美味',
        images: ['http://localhost:8080/public/images/goods/零食/顽皮/封面.jpg'],
        specs: ['250g', '500g', '1kg'],
        stock: 180,
        description: '特殊配方制作，具有消臭功能，富含蛋白质和纤维，是训练和奖励的最佳选择。'
      },
      {
        id: uuidv4(),
        name: '皇恒赛级沐浴露',
        price: 68.8,
        sales: 750,
        brand: '皇恒',
        category: '沐浴露',
        brief: '赛级品质，温和清洁',
        images: ['http://localhost:8080/public/images/goods/沐浴露/皇恒/封面.png'],
        specs: ['250ml', '500ml', '1L'],
        stock: 90,
        description: '赛级品质沐浴露，温和无刺激配方，深层清洁的同时保护宠物肌肤，含有护毛成分。'
      },
      {
        id: uuidv4(),
        name: '凯锐思猫砂',
        price: 35.9,
        sales: 2200,
        brand: '凯锐思',
        category: '猫砂',
        brief: '强力除臭，结团快速',
        images: ['http://localhost:8080/public/images/goods/猫砂/凯锐思/封面.png'],
        specs: ['5L', '10L', '20L'],
        stock: 160,
        description: '采用优质材料制成，吸水性强，结团迅速，有效控制异味，使用方便。'
      },
      {
        id: uuidv4(),
        name: '瓜洲牧除臭剂',
        price: 28.9,
        sales: 1100,
        brand: '瓜洲牧',
        category: '除臭剂',
        brief: '植物配方，安全除臭',
        images: ['http://localhost:8080/public/images/goods/除臭剂/瓜洲牧/封面.png'],
        specs: ['300ml', '500ml'],
        stock: 140,
        description: '天然植物配方，安全无害，有效分解异味分子，适用于宠物生活区域的除臭清洁。'
      },
      {
        id: uuidv4(),
        name: '蓝氏幼猫猫粮',
        price: 89.9,
        sales: 680,
        brand: '蓝氏',
        category: '猫粮',
        brief: '专为幼猫设计，营养丰富',
        images: ['http://localhost:8080/public/images/goods/猫粮/蓝氏/封面.jpg'],
        specs: ['1.5kg', '3kg'],
        stock: 80,
        description: '专为4-12月龄幼猫研发，含有幼猫成长所需的全面营养，易消化配方，支持健康成长。'
      },
      {
        id: uuidv4(),
        name: '迪普尔逗猫棒',
        price: 18.8,
        sales: 1350,
        brand: '迪普尔',
        category: '玩具',
        brief: '互动玩具，增进感情',
        images: ['http://localhost:8080/public/images/goods/玩具/迪普尔/封面.jpg'],
        specs: ['标准款', '加长款'],
        stock: 220,
        description: '高品质逗猫棒，可替换羽毛头，增加猫咪运动量，增进主人与宠物的互动感情。'
      }
    ];
    
    for (const goods of sampleGoods) {
      await client.set(`goods:${goods.id}`, JSON.stringify(goods));
      console.log(`Sample goods created: ${goods.name}`);
    }
  }
}

module.exports = Goods; 