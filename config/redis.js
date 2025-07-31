const redis = require('redis');

// Redis connection URL from api.md
const REDIS_URL = 'redis://default:q647bjz2@petpal-db-redis.ns-t2fco94u.svc:6379';

let redisClient;

// 立即创建客户端实例但不连接
redisClient = redis.createClient({
  url: REDIS_URL
});

redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});

async function connectRedis() {
  try {
    // 如果尚未连接，则连接Redis
    if (!redisClient.isOpen) {
      await redisClient.connect();
      console.log('Connected to Redis');
    }
    return redisClient;
  } catch (error) {
    console.error('Redis connection error:', error);
    throw error;
  }
}

function getRedisClient() {
  // 修改以返回客户端实例，即使尚未连接
  return redisClient;
}

module.exports = {
  connectRedis,
  getRedisClient
}; 