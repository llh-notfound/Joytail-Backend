# PetPal - 购物车功能后端API开发文档

## 📋 文档概述

**文档版本**: v1.0.0  
**创建日期**: 2025年7月14日  
**适用范围**: 购物车功能后端API开发  
**前端对接状态**: ✅ 已完成集成代码  

## 🎯 功能需求概述

购物车系统需要支持用户对商品的基本操作，包括添加、查看、修改、删除等功能，并且需要支持用户认证和数据持久化。

### 核心功能列表
- ✅ 用户购物车商品列表查询
- ✅ 添加商品到购物车
- ✅ 更新购物车商品数量
- ✅ 更新购物车商品选中状态
- ✅ 批量全选/取消全选操作
- ✅ 删除购物车商品
- ✅ 用户认证与权限控制

## 🗄️ 数据库设计建议

### 购物车表 (cart_items)
```sql
CREATE TABLE cart_items (
    id VARCHAR(36) PRIMARY KEY COMMENT '购物车项ID',
    user_id VARCHAR(36) NOT NULL COMMENT '用户ID',
    goods_id VARCHAR(36) NOT NULL COMMENT '商品ID',
    goods_name VARCHAR(255) NOT NULL COMMENT '商品名称',
    goods_image VARCHAR(500) COMMENT '商品图片URL',
    specs VARCHAR(100) COMMENT '商品规格',
    price DECIMAL(10,2) NOT NULL COMMENT '商品单价',
    quantity INT NOT NULL DEFAULT 1 COMMENT '商品数量',
    selected BOOLEAN DEFAULT TRUE COMMENT '是否选中',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    INDEX idx_user_id (user_id),
    INDEX idx_goods_id (goods_id),
    UNIQUE KEY uk_user_goods_specs (user_id, goods_id, specs)
) COMMENT='购物车表';
```

### 索引设计
- **主键索引**: `id` (主键)
- **用户索引**: `user_id` (快速查询用户购物车)
- **商品索引**: `goods_id` (关联商品信息)
- **唯一约束**: `(user_id, goods_id, specs)` (防止重复添加相同规格商品)

## 🔌 API接口详细设计

### 1. 获取购物车列表

**接口信息**
- **URL**: `GET /api/cart/list`
- **认证**: ✅ 必需 (Bearer Token)
- **描述**: 获取当前用户的购物车商品列表

**请求头**
```http
Authorization: Bearer {token}
Content-Type: application/json
```

**请求参数**: 无

**响应示例**
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": "cart_001",
      "name": "皇家猫粮成猫粮",
      "price": 89.90,
      "quantity": 2,
      "total": 179.80,
      "image": "https://example.com/images/cat-food.jpg",
      "specs": "2kg",
      "selected": true,
      "goodsId": "goods_001"
    },
    {
      "id": "cart_002", 
      "name": "宠物玩具球",
      "price": 25.00,
      "quantity": 1,
      "total": 25.00,
      "image": "https://example.com/images/toy-ball.jpg",
      "specs": "中号",
      "selected": false,
      "goodsId": "goods_002"
    }
  ]
}
```

**错误响应**
```json
{
  "code": 401,
  "message": "未授权，请先登录",
  "data": null
}
```

**后端实现要点**
```java
@GetMapping("/list")
public Result<List<CartItemVO>> getCartList(HttpServletRequest request) {
    // 1. 从token中获取用户ID
    String userId = JwtUtil.getUserIdFromToken(request);
    
    // 2. 查询用户购物车
    List<CartItem> cartItems = cartService.getCartByUserId(userId);
    
    // 3. 转换为VO并计算总价
    List<CartItemVO> result = cartItems.stream()
        .map(item -> {
            CartItemVO vo = new CartItemVO();
            vo.setId(item.getId());
            vo.setName(item.getGoodsName());
            vo.setPrice(item.getPrice());
            vo.setQuantity(item.getQuantity());
            vo.setTotal(item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
            vo.setImage(item.getGoodsImage());
            vo.setSpecs(item.getSpecs());
            vo.setSelected(item.getSelected());
            vo.setGoodsId(item.getGoodsId());
            return vo;
        })
        .collect(Collectors.toList());
    
    return Result.success(result);
}
```

### 2. 添加商品到购物车

**接口信息**
- **URL**: `POST /api/cart/add`
- **认证**: ✅ 必需 (Bearer Token)
- **描述**: 添加商品到用户购物车

**请求体**
```json
{
  "goodsId": "goods_001",
  "quantity": 2,
  "specs": "2kg"
}
```

**字段说明**
- `goodsId`: 商品ID (必填)
- `quantity`: 数量 (必填，最小值1，最大值99)
- `specs`: 规格 (可选，如果商品有规格则必填)

**响应示例**
```json
{
  "code": 200,
  "message": "添加成功",
  "data": null
}
```

**错误响应**
```json
{
  "code": 400,
  "message": "商品不存在",
  "data": null
}
```

**后端实现要点**
```java
@PostMapping("/add")
public Result<?> addToCart(@RequestBody @Valid AddCartRequest request, HttpServletRequest httpRequest) {
    String userId = JwtUtil.getUserIdFromToken(httpRequest);
    
    // 1. 验证商品是否存在
    Goods goods = goodsService.getById(request.getGoodsId());
    if (goods == null) {
        return Result.error(400, "商品不存在");
    }
    
    // 2. 检查是否已存在相同商品和规格
    CartItem existingItem = cartService.getByUserAndGoodsAndSpecs(
        userId, request.getGoodsId(), request.getSpecs());
    
    if (existingItem != null) {
        // 3. 如果存在，增加数量
        int newQuantity = existingItem.getQuantity() + request.getQuantity();
        if (newQuantity > 99) {
            return Result.error(400, "商品数量不能超过99个");
        }
        existingItem.setQuantity(newQuantity);
        cartService.updateById(existingItem);
    } else {
        // 4. 如果不存在，创建新的购物车项
        CartItem cartItem = new CartItem();
        cartItem.setId(UUID.randomUUID().toString());
        cartItem.setUserId(userId);
        cartItem.setGoodsId(request.getGoodsId());
        cartItem.setGoodsName(goods.getName());
        cartItem.setGoodsImage(goods.getImages().get(0)); // 取第一张图片
        cartItem.setSpecs(request.getSpecs());
        cartItem.setPrice(goods.getPrice());
        cartItem.setQuantity(request.getQuantity());
        cartItem.setSelected(true);
        cartService.save(cartItem);
    }
    
    return Result.success("添加成功");
}
```

### 3. 更新购物车商品数量

**接口信息**
- **URL**: `PUT /api/cart/update`
- **认证**: ✅ 必需 (Bearer Token)
- **描述**: 更新购物车中商品的数量

**请求体**
```json
{
  "cartItemId": "cart_001",
  "quantity": 3
}
```

**字段说明**
- `cartItemId`: 购物车项ID (必填)
- `quantity`: 新的数量 (必填，1-99)

**响应示例**
```json
{
  "code": 200,
  "message": "更新成功",
  "data": null
}
```

**后端实现要点**
```java
@PutMapping("/update")
public Result<?> updateCartItem(@RequestBody @Valid UpdateCartRequest request, HttpServletRequest httpRequest) {
    String userId = JwtUtil.getUserIdFromToken(httpRequest);
    
    // 1. 验证购物车项是否存在且属于当前用户
    CartItem cartItem = cartService.getById(request.getCartItemId());
    if (cartItem == null || !cartItem.getUserId().equals(userId)) {
        return Result.error(404, "购物车商品不存在");
    }
    
    // 2. 验证数量范围
    if (request.getQuantity() < 1 || request.getQuantity() > 99) {
        return Result.error(400, "商品数量必须在1-99之间");
    }
    
    // 3. 更新数量
    cartItem.setQuantity(request.getQuantity());
    cartService.updateById(cartItem);
    
    return Result.success("更新成功");
}
```

### 4. 更新购物车商品选中状态

**接口信息**
- **URL**: `PUT /api/cart/select`
- **认证**: ✅ 必需 (Bearer Token)
- **描述**: 更新购物车商品的选中状态

**请求体**
```json
{
  "cartItemId": "cart_001",
  "selected": true
}
```

**响应示例**
```json
{
  "code": 200,
  "message": "更新成功",
  "data": null
}
```

**后端实现要点**
```java
@PutMapping("/select")
public Result<?> updateCartItemSelected(@RequestBody @Valid SelectCartRequest request, HttpServletRequest httpRequest) {
    String userId = JwtUtil.getUserIdFromToken(httpRequest);
    
    CartItem cartItem = cartService.getById(request.getCartItemId());
    if (cartItem == null || !cartItem.getUserId().equals(userId)) {
        return Result.error(404, "购物车商品不存在");
    }
    
    cartItem.setSelected(request.getSelected());
    cartService.updateById(cartItem);
    
    return Result.success("更新成功");
}
```

### 5. 全选/取消全选

**接口信息**
- **URL**: `PUT /api/cart/select-all`
- **认证**: ✅ 必需 (Bearer Token)
- **描述**: 批量设置用户购物车中所有商品的选中状态

**请求体**
```json
{
  "selected": true
}
```

**响应示例**
```json
{
  "code": 200,
  "message": "操作成功",
  "data": null
}
```

**后端实现要点**
```java
@PutMapping("/select-all")
public Result<?> selectAllCartItems(@RequestBody @Valid SelectAllRequest request, HttpServletRequest httpRequest) {
    String userId = JwtUtil.getUserIdFromToken(httpRequest);
    
    // 批量更新用户所有购物车商品的选中状态
    cartService.updateSelectedByUserId(userId, request.getSelected());
    
    return Result.success("操作成功");
}
```

### 6. 删除购物车商品

**接口信息**
- **URL**: `DELETE /api/cart/delete`
- **认证**: ✅ 必需 (Bearer Token)
- **描述**: 从购物车中删除指定商品

**请求体**
```json
{
  "cartItemIds": ["cart_001", "cart_002"]
}
```

**字段说明**
- `cartItemIds`: 要删除的购物车项ID数组 (必填)

**响应示例**
```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

**后端实现要点**
```java
@DeleteMapping("/delete")
public Result<?> deleteCartItems(@RequestBody @Valid DeleteCartRequest request, HttpServletRequest httpRequest) {
    String userId = JwtUtil.getUserIdFromToken(httpRequest);
    
    // 1. 验证所有购物车项都属于当前用户
    List<CartItem> cartItems = cartService.listByIds(request.getCartItemIds());
    boolean allBelongToUser = cartItems.stream()
        .allMatch(item -> item.getUserId().equals(userId));
    
    if (!allBelongToUser) {
        return Result.error(403, "无权删除其他用户的购物车商品");
    }
    
    // 2. 执行删除
    cartService.removeByIds(request.getCartItemIds());
    
    return Result.success("删除成功");
}
```

## 🔐 认证与权限

### JWT Token验证
```java
@Component
public class JwtUtil {
    
    public static String getUserIdFromToken(HttpServletRequest request) {
        String token = request.getHeader("Authorization");
        if (token == null || !token.startsWith("Bearer ")) {
            throw new UnauthorizedException("未授权，请先登录");
        }
        
        token = token.substring(7); // 移除 "Bearer " 前缀
        
        try {
            Claims claims = Jwts.parser()
                .setSigningKey(SECRET_KEY)
                .parseClaimsJws(token)
                .getBody();
            return claims.getSubject();
        } catch (Exception e) {
            throw new UnauthorizedException("Token无效或已过期");
        }
    }
}
```

### 权限验证拦截器
```java
@Component
public class AuthInterceptor implements HandlerInterceptor {
    
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        // 购物车相关接口都需要认证
        if (request.getRequestURI().startsWith("/api/cart/")) {
            try {
                JwtUtil.getUserIdFromToken(request);
                return true;
            } catch (UnauthorizedException e) {
                response.setStatus(401);
                response.setContentType("application/json;charset=UTF-8");
                response.getWriter().write("{\"code\":401,\"message\":\"" + e.getMessage() + "\",\"data\":null}");
                return false;
            }
        }
        return true;
    }
}
```

## 📝 请求/响应DTO设计

### 请求DTO
```java
// 添加购物车请求
@Data
public class AddCartRequest {
    @NotBlank(message = "商品ID不能为空")
    private String goodsId;
    
    @Min(value = 1, message = "数量最少为1")
    @Max(value = 99, message = "数量最多为99")
    private Integer quantity;
    
    private String specs; // 可选
}

// 更新数量请求
@Data
public class UpdateCartRequest {
    @NotBlank(message = "购物车项ID不能为空")
    private String cartItemId;
    
    @Min(value = 1, message = "数量最少为1")
    @Max(value = 99, message = "数量最多为99")
    private Integer quantity;
}

// 选中状态请求
@Data
public class SelectCartRequest {
    @NotBlank(message = "购物车项ID不能为空")
    private String cartItemId;
    
    @NotNull(message = "选中状态不能为空")
    private Boolean selected;
}

// 全选请求
@Data
public class SelectAllRequest {
    @NotNull(message = "选中状态不能为空")
    private Boolean selected;
}

// 删除请求
@Data
public class DeleteCartRequest {
    @NotEmpty(message = "购物车项ID列表不能为空")
    private List<String> cartItemIds;
}
```

### 响应VO
```java
@Data
public class CartItemVO {
    private String id;
    private String name;
    private BigDecimal price;
    private Integer quantity;
    private BigDecimal total;
    private String image;
    private String specs;
    private Boolean selected;
    private String goodsId;
}
```

## 🔄 业务逻辑处理

### Service层设计
```java
@Service
public class CartService {
    
    @Autowired
    private CartItemMapper cartItemMapper;
    
    @Autowired
    private GoodsService goodsService;
    
    /**
     * 获取用户购物车
     */
    public List<CartItem> getCartByUserId(String userId) {
        return cartItemMapper.selectByUserId(userId);
    }
    
    /**
     * 根据用户、商品、规格查询购物车项
     */
    public CartItem getByUserAndGoodsAndSpecs(String userId, String goodsId, String specs) {
        return cartItemMapper.selectByUserAndGoodsAndSpecs(userId, goodsId, specs);
    }
    
    /**
     * 批量更新选中状态
     */
    public void updateSelectedByUserId(String userId, Boolean selected) {
        cartItemMapper.updateSelectedByUserId(userId, selected);
    }
    
    /**
     * 清理过期购物车商品（定时任务）
     */
    @Scheduled(cron = "0 0 2 * * ?") // 每天凌晨2点执行
    public void cleanExpiredCartItems() {
        // 删除30天前的购物车商品
        LocalDateTime expireTime = LocalDateTime.now().minusDays(30);
        cartItemMapper.deleteExpiredItems(expireTime);
    }
}
```

## 🧪 接口测试用例

### 测试数据准备
```sql
-- 测试用户
INSERT INTO users (id, username, password, phone) VALUES 
('user_001', 'testuser', '$2a$10$...', '13800138000');

-- 测试商品
INSERT INTO goods (id, name, price, specs, images) VALUES 
('goods_001', '皇家猫粮', 89.90, '["500g","1kg","2kg","5kg"]', '["https://example.com/cat-food.jpg"]'),
('goods_002', '宠物玩具球', 25.00, '["小号","中号","大号"]', '["https://example.com/toy-ball.jpg"]');
```

### Postman测试集合
```json
{
  "info": {
    "name": "PetPal购物车API测试",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "获取购物车列表",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "url": {
          "raw": "{{base_url}}/api/cart/list",
          "host": ["{{base_url}}"],
          "path": ["api", "cart", "list"]
        }
      }
    },
    {
      "name": "添加商品到购物车",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          },
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"goodsId\": \"goods_001\",\n  \"quantity\": 2,\n  \"specs\": \"2kg\"\n}"
        },
        "url": {
          "raw": "{{base_url}}/api/cart/add",
          "host": ["{{base_url}}"],
          "path": ["api", "cart", "add"]
        }
      }
    }
  ]
}
```

## 📊 性能优化建议

### 1. 数据库优化
- 为高频查询字段添加索引
- 定期清理过期购物车数据
- 使用数据库连接池

### 2. 缓存策略
```java
@Service
public class CartCacheService {
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    private static final String CART_KEY_PREFIX = "cart:user:";
    private static final int CART_CACHE_TTL = 3600; // 1小时
    
    /**
     * 缓存用户购物车
     */
    public void cacheUserCart(String userId, List<CartItem> cartItems) {
        String key = CART_KEY_PREFIX + userId;
        redisTemplate.opsForValue().set(key, cartItems, CART_CACHE_TTL, TimeUnit.SECONDS);
    }
    
    /**
     * 获取缓存的购物车
     */
    public List<CartItem> getCachedUserCart(String userId) {
        String key = CART_KEY_PREFIX + userId;
        return (List<CartItem>) redisTemplate.opsForValue().get(key);
    }
    
    /**
     * 清除用户购物车缓存
     */
    public void clearUserCartCache(String userId) {
        String key = CART_KEY_PREFIX + userId;
        redisTemplate.delete(key);
    }
}
```

### 3. 异步处理
```java
@Service
public class CartAsyncService {
    
    @Async
    public void syncCartToRecommendationSystem(String userId, String goodsId) {
        // 异步同步购物车数据到推荐系统
        // 不影响主要业务流程
    }
    
    @Async
    public void logCartOperation(String userId, String operation, String goodsId) {
        // 异步记录用户行为日志
        // 用于数据分析
    }
}
```

## 🚀 部署配置

### application.yml
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/petpal?useUnicode=true&characterEncoding=utf-8&useSSL=false
    username: ${DB_USERNAME:root}
    password: ${DB_PASSWORD:password}
    driver-class-name: com.mysql.cj.jdbc.Driver
    
  redis:
    host: ${REDIS_HOST:localhost}
    port: ${REDIS_PORT:6379}
    password: ${REDIS_PASSWORD:}
    timeout: 2000ms
    lettuce:
      pool:
        max-active: 20
        max-wait: -1ms
        max-idle: 10
        min-idle: 0

# JWT配置
jwt:
  secret: ${JWT_SECRET:your-secret-key}
  expiration: ${JWT_EXPIRATION:86400} # 24小时

# 购物车配置
cart:
  max-items-per-user: 100  # 单用户最大购物车商品数
  auto-clean-days: 30      # 自动清理天数
```

## 📋 开发检查清单

### 后端开发完成标准
- [ ] 所有6个API接口实现完成
- [ ] 数据库表结构创建
- [ ] JWT认证机制实现
- [ ] 请求参数验证
- [ ] 错误处理机制
- [ ] 单元测试覆盖
- [ ] 接口文档更新
- [ ] 性能测试通过

### 前后端联调准备
- [ ] API基础路径配置: `/api`
- [ ] 错误码统一: 200成功, 400参数错误, 401未认证, 403无权限, 404不存在, 500服务器错误
- [ ] 响应格式统一: `{code, message, data}`
- [ ] 时间格式统一: ISO 8601 (`2025-07-14T10:30:00Z`)
- [ ] 分页格式统一: `{page, pageSize, total, data}`

## 🔗 相关资源

### 前端集成代码
- 购物车页面: `/src/pages/cart/index.vue`
- 商品详情页: `/src/pages/goods/detail.vue`
- API封装: `/src/utils/api/cart.js`
- 工具函数: `/src/utils/cartUtils.js`

### 数据库依赖
- 用户表: `users`
- 商品表: `goods`
- 购物车表: `cart_items` (需新建)

### 第三方依赖
- Spring Boot Web
- MyBatis Plus
- JWT
- Redis (可选，用于缓存)
- MySQL/PostgreSQL

---

**文档维护**: 前端已完成购物车功能集成，等待后端API实现后即可进行联调测试。  
**联系方式**: 如有问题请联系前端开发团队进行确认。
