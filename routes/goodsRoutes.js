const express = require('express');
const router = express.Router();
const Goods = require('../models/Goods');

// Get goods list
router.get('/list', async (req, res) => {
  try {
    const { 
      category, 
      brand, 
      keyword, 
      minPrice, 
      maxPrice, 
      sortBy, 
      page = 1, 
      pageSize = 10 
    } = req.query;
    
    // 参数验证
    const validCategories = ['猫粮', '狗粮', '玩具', '零食', '护毛素', '猫砂', '除臭剂', '沐浴露'];
    const validBrands = ['皇家', '麦富迪', 'HOUYA', '爱犬岛', '顽皮', '皇恒', '凯锐思', '瓜洲牧', '蓝氏', '迪普尔'];
    const validSortBy = ['price_asc', 'price_desc', 'sales_desc'];
    
    // 验证分类
    if (category && !validCategories.includes(category)) {
      return res.status(400).json({
        code: 400,
        message: `参数错误: category值'${category}'不在允许范围内`,
        data: null
      });
    }
    
    // 验证品牌
    if (brand && !validBrands.includes(brand)) {
      return res.status(400).json({
        code: 400,
        message: `参数错误: brand值'${brand}'不在允许范围内`,
        data: null
      });
    }
    
    // 验证排序
    if (sortBy && !validSortBy.includes(sortBy)) {
      return res.status(400).json({
        code: 400,
        message: `参数错误: sortBy值'${sortBy}'不在允许范围内`,
        data: null
      });
    }
    
    // 验证价格参数
    if (minPrice && (isNaN(minPrice) || parseFloat(minPrice) < 0)) {
      return res.status(400).json({
        code: 400,
        message: '参数错误: minPrice必须是有效的非负数',
        data: null
      });
    }
    
    if (maxPrice && (isNaN(maxPrice) || parseFloat(maxPrice) < 0)) {
      return res.status(400).json({
        code: 400,
        message: '参数错误: maxPrice必须是有效的非负数',
        data: null
      });
    }
    
    if (minPrice && maxPrice && parseFloat(minPrice) > parseFloat(maxPrice)) {
      return res.status(400).json({
        code: 400,
        message: '参数错误: minPrice不能大于maxPrice',
        data: null
      });
    }
    
    // 验证分页参数
    const pageNum = parseInt(page);
    const pageSizeNum = parseInt(pageSize);
    
    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({
        code: 400,
        message: '参数错误: page必须是大于0的整数',
        data: null
      });
    }
    
    if (isNaN(pageSizeNum) || pageSizeNum < 1 || pageSizeNum > 100) {
      return res.status(400).json({
        code: 400,
        message: '参数错误: pageSize必须是1-100之间的整数',
        data: null
      });
    }
    
    // 获取商品数据
    const goods = await Goods.getGoods({ 
      category, 
      brand, 
      keyword, 
      minPrice, 
      maxPrice, 
      sortBy 
    });
    
    // Apply pagination
    const startIndex = (pageNum - 1) * pageSizeNum;
    const endIndex = pageNum * pageSizeNum;
    const paginatedGoods = goods.slice(startIndex, endIndex);
    
    res.status(200).json({
      code: 200,
      message: 'success',
      data: {
        total: goods.length,
        items: paginatedGoods
      }
    });
  } catch (error) {
    console.error('Error getting goods list:', error);
    res.status(500).json({
      code: 500,
      message: '获取商品列表失败',
      data: null
    });
  }
});

// Get filter options (categories and brands)
router.get('/filters', async (req, res) => {
  try {
    const categories = [
      { value: '猫粮', label: '猫粮' },
      { value: '狗粮', label: '狗粮' },
      { value: '玩具', label: '玩具' },
      { value: '零食', label: '零食' },
      { value: '护毛素', label: '护毛素' },
      { value: '猫砂', label: '猫砂' },
      { value: '除臭剂', label: '除臭剂' },
      { value: '沐浴露', label: '沐浴露' }
    ];
    
    const brands = [
      { value: '皇家', label: '皇家' },
      { value: '麦富迪', label: '麦富迪' },
      { value: 'HOUYA', label: 'HOUYA' },
      { value: '爱犬岛', label: '爱犬岛' },
      { value: '顽皮', label: '顽皮' },
      { value: '皇恒', label: '皇恒' },
      { value: '凯锐思', label: '凯锐思' },
      { value: '瓜洲牧', label: '瓜洲牧' },
      { value: '蓝氏', label: '蓝氏' },
      { value: '迪普尔', label: '迪普尔' }
    ];
    
    const sortOptions = [
      { value: 'price_asc', label: '价格升序' },
      { value: 'price_desc', label: '价格降序' },
      { value: 'sales_desc', label: '销量降序' }
    ];
    
    const priceRanges = [
      { value: { min: 0, max: 50 }, label: '50元以下' },
      { value: { min: 50, max: 100 }, label: '50-100元' },
      { value: { min: 100, max: 200 }, label: '100-200元' },
      { value: { min: 200 }, label: '200元以上' }
    ];
    
    res.status(200).json({
      code: 200,
      message: 'success',
      data: {
        categories,
        brands,
        sortOptions,
        priceRanges
      }
    });
  } catch (error) {
    console.error('Error getting filter options:', error);
    res.status(500).json({
      code: 500,
      message: '获取筛选选项失败',
      data: null
    });
  }
});

// Get goods detail
router.get('/detail/:goodsId', async (req, res) => {
  try {
    const { goodsId } = req.params;
    const goods = await Goods.getGoodsById(goodsId);
    
    if (!goods) {
      return res.status(404).json({
        code: 404,
        message: '商品不存在',
        data: null
      });
    }
    
    res.status(200).json({
      code: 200,
      message: 'success',
      data: goods
    });
  } catch (error) {
    console.error('Error getting goods detail:', error);
    res.status(500).json({
      code: 500,
      message: '获取商品详情失败',
      data: null
    });
  }
});

// Get hot goods
router.get('/hot', async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    const hotGoods = await Goods.getHotGoods(parseInt(limit));
    
    res.status(200).json({
      code: 200,
      message: 'success',
      data: hotGoods
    });
  } catch (error) {
    console.error('Error getting hot goods:', error);
    res.status(500).json({
      code: 500,
      message: '获取热门商品失败',
      data: null
    });
  }
});

// Search goods
router.get('/search', async (req, res) => {
  try {
    const { keyword, page = 1, pageSize = 10 } = req.query;
    
    if (!keyword) {
      return res.status(400).json({
        code: 400,
        message: '搜索关键词不能为空',
        data: null
      });
    }
    
    const goods = await Goods.searchGoods(keyword);
    
    // Apply pagination
    const startIndex = (page - 1) * pageSize;
    const endIndex = page * pageSize;
    const paginatedGoods = goods.slice(startIndex, endIndex);
    
    res.status(200).json({
      code: 200,
      message: 'success',
      data: {
        total: goods.length,
        items: paginatedGoods
      }
    });
  } catch (error) {
    console.error('Error searching goods:', error);
    res.status(500).json({
      code: 500,
      message: '搜索商品失败',
      data: null
    });
  }
});

module.exports = router;