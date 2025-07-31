# PetPal 购物车功能 - 后端开发快速入门指南

## 🚀 快速开始

### 1. 前置条件检查
- [ ] Spring Boot 项目已搭建
- [ ] 数据库连接已配置
- [ ] JWT认证机制已实现
- [ ] 用户系统已完成
- [ ] 商品系统已完成

### 2. 数据库表创建 (5分钟)
```sql
-- 购物车表
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    UNIQUE KEY uk_user_goods_specs (user_id, goods_id, specs)
);
```

### 3. 依赖添加 (2分钟)
```xml
<!-- pom.xml -->
<dependencies>
    <!-- 如果还没有的话 -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>com.baomidou</groupId>
        <artifactId>mybatis-plus-boot-starter</artifactId>
        <version>3.5.3</version>
    </dependency>
    <dependency>
        <groupId>mysql</groupId>
        <artifactId>mysql-connector-java</artifactId>
    </dependency>
</dependencies>
```

## 📁 文件结构

创建以下文件结构：
```
src/main/java/com/petpal/
├── controller/
│   └── CartController.java
├── service/
│   ├── CartService.java
│   └── impl/
│       └── CartServiceImpl.java
├── mapper/
│   └── CartMapper.java
├── entity/
│   └── CartItem.java
├── dto/
│   ├── request/
│   │   ├── AddCartRequest.java
│   │   ├── UpdateCartRequest.java
│   │   ├── SelectCartRequest.java
│   │   ├── SelectAllRequest.java
│   │   └── DeleteCartRequest.java
│   └── response/
│       └── CartItemVO.java
└── common/
    ├── Result.java
    └── utils/
        └── JwtUtil.java
```

## 💻 核心代码实现

### 1. 实体类 (CartItem.java)
```java
@Data
@TableName("cart_items")
public class CartItem {
    @TableId(type = IdType.ASSIGN_UUID)
    private String id;
    
    private String userId;
    private String goodsId;
    private String goodsName;
    private String goodsImage;
    private String specs;
    private BigDecimal price;
    private Integer quantity;
    private Boolean selected;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
```

### 2. 请求DTO (AddCartRequest.java)
```java
@Data
public class AddCartRequest {
    @NotBlank(message = "商品ID不能为空")
    private String goodsId;
    
    @Min(value = 1, message = "数量最少为1")
    @Max(value = 99, message = "数量最多为99")
    private Integer quantity;
    
    private String specs; // 可选
}
```

### 3. 响应VO (CartItemVO.java)
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

### 4. Mapper接口 (CartMapper.java)
```java
@Mapper
public interface CartMapper extends BaseMapper<CartItem> {
    
    /**
     * 根据用户ID查询购物车
     */
    @Select("SELECT * FROM cart_items WHERE user_id = #{userId} ORDER BY created_at DESC")
    List<CartItem> selectByUserId(String userId);
    
    /**
     * 根据用户、商品、规格查询
     */
    @Select("SELECT * FROM cart_items WHERE user_id = #{userId} AND goods_id = #{goodsId} AND specs = #{specs}")
    CartItem selectByUserAndGoodsAndSpecs(@Param("userId") String userId, 
                                          @Param("goodsId") String goodsId, 
                                          @Param("specs") String specs);
    
    /**
     * 批量更新选中状态
     */
    @Update("UPDATE cart_items SET selected = #{selected} WHERE user_id = #{userId}")
    void updateSelectedByUserId(@Param("userId") String userId, @Param("selected") Boolean selected);
}
```

### 5. Service实现 (CartServiceImpl.java)
```java
@Service
public class CartServiceImpl extends ServiceImpl<CartMapper, CartItem> implements CartService {
    
    @Autowired
    private GoodsService goodsService;
    
    @Override
    public List<CartItem> getCartByUserId(String userId) {
        return baseMapper.selectByUserId(userId);
    }
    
    @Override
    public CartItem getByUserAndGoodsAndSpecs(String userId, String goodsId, String specs) {
        return baseMapper.selectByUserAndGoodsAndSpecs(userId, goodsId, specs);
    }
    
    @Override
    public void updateSelectedByUserId(String userId, Boolean selected) {
        baseMapper.updateSelectedByUserId(userId, selected);
    }
    
    @Override
    public boolean addToCart(String userId, AddCartRequest request) {
        // 验证商品是否存在
        Goods goods = goodsService.getById(request.getGoodsId());
        if (goods == null) {
            throw new BusinessException("商品不存在");
        }
        
        // 检查是否已存在
        CartItem existingItem = getByUserAndGoodsAndSpecs(
            userId, request.getGoodsId(), request.getSpecs());
        
        if (existingItem != null) {
            // 增加数量
            int newQuantity = existingItem.getQuantity() + request.getQuantity();
            if (newQuantity > 99) {
                throw new BusinessException("商品数量不能超过99个");
            }
            existingItem.setQuantity(newQuantity);
            return updateById(existingItem);
        } else {
            // 创建新的购物车项
            CartItem cartItem = new CartItem();
            cartItem.setUserId(userId);
            cartItem.setGoodsId(request.getGoodsId());
            cartItem.setGoodsName(goods.getName());
            cartItem.setGoodsImage(goods.getImages().get(0));
            cartItem.setSpecs(request.getSpecs());
            cartItem.setPrice(goods.getPrice());
            cartItem.setQuantity(request.getQuantity());
            cartItem.setSelected(true);
            return save(cartItem);
        }
    }
}
```

### 6. Controller控制器 (CartController.java)
```java
@RestController
@RequestMapping("/api/cart")
@Slf4j
public class CartController {
    
    @Autowired
    private CartService cartService;
    
    /**
     * 获取购物车列表
     */
    @GetMapping("/list")
    public Result<List<CartItemVO>> getCartList(HttpServletRequest request) {
        String userId = JwtUtil.getUserIdFromToken(request);
        List<CartItem> cartItems = cartService.getCartByUserId(userId);
        
        List<CartItemVO> result = cartItems.stream()
            .map(this::convertToVO)
            .collect(Collectors.toList());
        
        return Result.success(result);
    }
    
    /**
     * 添加商品到购物车
     */
    @PostMapping("/add")
    public Result<?> addToCart(@RequestBody @Valid AddCartRequest request, 
                               HttpServletRequest httpRequest) {
        String userId = JwtUtil.getUserIdFromToken(httpRequest);
        cartService.addToCart(userId, request);
        return Result.success("添加成功");
    }
    
    /**
     * 更新购物车商品数量
     */
    @PutMapping("/update")
    public Result<?> updateCartItem(@RequestBody @Valid UpdateCartRequest request, 
                                   HttpServletRequest httpRequest) {
        String userId = JwtUtil.getUserIdFromToken(httpRequest);
        
        CartItem cartItem = cartService.getById(request.getCartItemId());
        if (cartItem == null || !cartItem.getUserId().equals(userId)) {
            return Result.error(404, "购物车商品不存在");
        }
        
        cartItem.setQuantity(request.getQuantity());
        cartService.updateById(cartItem);
        
        return Result.success("更新成功");
    }
    
    /**
     * 更新选中状态
     */
    @PutMapping("/select")
    public Result<?> updateCartItemSelected(@RequestBody @Valid SelectCartRequest request, 
                                           HttpServletRequest httpRequest) {
        String userId = JwtUtil.getUserIdFromToken(httpRequest);
        
        CartItem cartItem = cartService.getById(request.getCartItemId());
        if (cartItem == null || !cartItem.getUserId().equals(userId)) {
            return Result.error(404, "购物车商品不存在");
        }
        
        cartItem.setSelected(request.getSelected());
        cartService.updateById(cartItem);
        
        return Result.success("更新成功");
    }
    
    /**
     * 全选/取消全选
     */
    @PutMapping("/select-all")
    public Result<?> selectAllCartItems(@RequestBody @Valid SelectAllRequest request, 
                                       HttpServletRequest httpRequest) {
        String userId = JwtUtil.getUserIdFromToken(httpRequest);
        cartService.updateSelectedByUserId(userId, request.getSelected());
        return Result.success("操作成功");
    }
    
    /**
     * 删除购物车商品
     */
    @DeleteMapping("/delete")
    public Result<?> deleteCartItems(@RequestBody @Valid DeleteCartRequest request, 
                                    HttpServletRequest httpRequest) {
        String userId = JwtUtil.getUserIdFromToken(httpRequest);
        
        // 验证权限
        List<CartItem> cartItems = cartService.listByIds(request.getCartItemIds());
        boolean allBelongToUser = cartItems.stream()
            .allMatch(item -> item.getUserId().equals(userId));
        
        if (!allBelongToUser) {
            return Result.error(403, "无权删除其他用户的购物车商品");
        }
        
        cartService.removeByIds(request.getCartItemIds());
        return Result.success("删除成功");
    }
    
    /**
     * 转换为VO
     */
    private CartItemVO convertToVO(CartItem item) {
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
    }
}
```

## ⚡ 快速测试

### 1. 启动项目后，使用curl测试：

```bash
# 获取购物车 (需要替换真实的token)
curl -X GET "http://localhost:8080/api/cart/list" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 添加商品到购物车
curl -X POST "http://localhost:8080/api/cart/add" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"goodsId":"goods_001","quantity":2,"specs":"2kg"}'
```

### 2. 或者导入Postman测试集合：
- 文件：`PetPal-购物车API-Postman测试集合.json`
- 配置变量：`base_url = http://localhost:8080`、`token = YOUR_JWT_TOKEN`

## 🔧 调试技巧

### 1. 日志配置
```yaml
# application.yml
logging:
  level:
    com.petpal.mapper: DEBUG  # 显示SQL语句
    com.petpal.controller: DEBUG
```

### 2. 常见问题排查
- **401错误**: 检查JWT token是否正确
- **404错误**: 检查商品ID是否存在
- **400错误**: 检查请求参数格式
- **500错误**: 查看控制台异常日志

### 3. 数据库检查
```sql
-- 查看购物车数据
SELECT * FROM cart_items WHERE user_id = 'your_user_id';

-- 查看表结构
DESCRIBE cart_items;
```

## 🎯 验收标准

完成以下测试后即可认为功能实现完毕：

- [ ] ✅ 获取购物车列表 - 返回正确格式的数据
- [ ] ✅ 添加商品到购物车 - 成功添加并返回200
- [ ] ✅ 更新商品数量 - 数量更新成功
- [ ] ✅ 更新选中状态 - 选中状态切换成功
- [ ] ✅ 全选/取消全选 - 批量操作成功
- [ ] ✅ 删除购物车商品 - 删除成功
- [ ] ✅ 认证失败处理 - 返回401错误
- [ ] ✅ 权限检查 - 不能操作他人购物车
- [ ] ✅ 参数验证 - 无效参数返回400错误

## 📞 技术支持

如果在实现过程中遇到问题：

1. **前端对接问题**：检查返回数据格式是否与文档一致
2. **数据库问题**：确认表结构和索引是否正确创建
3. **认证问题**：确认JWT工具类是否正确实现
4. **性能问题**：检查数据库查询是否使用了索引

**预计开发时间**: 2-4小时（包括测试）
**前端集成状态**: ✅ 已完成，等待后端API实现

---

> 💡 **提示**: 前端已经完成了购物车功能的集成代码，包括Mock模式和API模式的双重支持。一旦后端API实现完成，只需要将前端配置中的`USE_MOCK`设置为`false`即可无缝切换到真实API模式。
