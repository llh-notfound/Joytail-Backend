const jwt = require('jsonwebtoken');
const config = require('../config/jwt');

// 身份验证中间件，用于保护需要授权的路由
const protect = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        code: 401,
        message: '未授权，请先登录',
        data: null
      });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, config.secret);
    req.user = decoded; // 用user替代userData保持一致性
    next();
  } catch (error) {
    return res.status(401).json({
      code: 401,
      message: '令牌无效或已过期',
      data: null
    });
  }
};

// 可选认证中间件，用于可登录可不登录的路由
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, config.secret);
      req.user = decoded;
    }
    next();
  } catch (error) {
    // 认证失败时继续执行，但不设置用户信息
    next();
  }
};

module.exports = protect;
module.exports.protect = protect;
module.exports.optionalAuth = optionalAuth;