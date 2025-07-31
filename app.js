const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectRedis, getRedisClient } = require('./config/redis');

// Import models for data initialization
const Hospital = require('./models/Hospital');

// Import routes
const userRoutes = require('./routes/userRoutes');
const petRoutes = require('./routes/petRoutes');
const goodsRoutes = require('./routes/goodsRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const addressRoutes = require('./routes/addressRoutes');
const pointsRoutes = require('./routes/pointsRoutes');
const commonRoutes = require('./routes/commonRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const insuranceRoutes = require('./routes/insuranceRoutes');
const policyRoutes = require('./routes/policyRoutes');
const communityRoutes = require('./routes/communityRoutes');
const medicalRoutes = require('./routes/medicalRoutes');
const consultRoutes = require('./routes/consultRoutes');
const accountRoutes = require('./routes/accountRoutes');

// Initialize app
const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors({
  origin: true, // 允许所有来源，开发环境使用
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static files from public directory
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/css', express.static(path.join(__dirname, 'public/css')));
app.use('/icons', express.static(path.join(__dirname, 'public/icons')));

// 添加根路径处理程序
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'PetPal Backend API',
    version: '1.0.0',
    description: '宠物应用后端 API 服务',
    endpoints: {
      user: '/api/user/*',
      pet: '/api/pet/*',
      goods: '/api/goods/*',
      cart: '/api/cart/*',
      order: '/api/order/*',
      address: '/api/address/*',
      points: '/api/points/*',
      insurance: '/api/insurance/*',
      policy: '/api/policy/*',
      community: '/api/community/*',
      medical: '/api/medical/*',
      consult: '/api/consult/*',
      account: '/api/account/*',
      common: '/api/common/*',
      feedback: '/api/feedback/*'
    },
    documentation: '详细 API 文档见项目根目录下的 api.md 文件',
    status: 'running'
  });
});

// 添加健康检查路由
app.get('/health', (req, res) => {
  const redisClient = getRedisClient();
  const isRedisConnected = redisClient && redisClient.isOpen;
  
  res.status(200).json({
    status: 'ok',
    redis: isRedisConnected ? 'connected' : 'disconnected'
  });
});

// Routes
app.use('/api/user', userRoutes);
app.use('/api/pet', petRoutes);
app.use('/api/goods', goodsRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/address', addressRoutes);
app.use('/api/points', pointsRoutes);
app.use('/api/common', commonRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/insurance', insuranceRoutes);
app.use('/api/policy', policyRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/medical', medicalRoutes);
app.use('/api/consult', consultRoutes);
app.use('/api/account', accountRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    code: 500,
    message: 'Server error',
    data: null
  });
});

// Connect to Redis and start server
async function startServer() {
  try {
    console.log('Initializing Redis connection...');
    await connectRedis();
    
    // 测试连接
    const redisClient = getRedisClient();
    await redisClient.ping();
    console.log('Redis connection tested successfully');
    
    // 初始化医院数据
    console.log('Initializing hospital data...');
    await Hospital.initializeHospitals();
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    // 如果Redis连接失败，尝试以离线模式启动（仅适用于开发环境）
    if (process.env.NODE_ENV === 'development') {
      console.log('Starting server in offline mode (development only)');
      app.listen(PORT, () => {
        console.log(`Server running in OFFLINE MODE on port ${PORT}`);
        console.log('WARNING: Redis functionality will not work');
      });
    } else {
      process.exit(1);
    }
  }
}

startServer();