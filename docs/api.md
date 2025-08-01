# PetPal 后端API需求文档

# 这是一个基于node.js的后端项目，我的数据库连接方式是redis://default:q647bjz2@petpal-db-redis.ns-t2fco94u.svc:6379

## 用户管理相关接口

### 1. 用户注册
- **URL**: `/api/user/register`
- **方法**: POST
- **请求参数**:
  ```json
  {
    "username": "string",
    "password": "string",
    "phone": "string",
    "email": "string"
  }
  ```
- **响应结果**:
  ```json
  {
    "code": 200,
    "message": "注册成功",
    "data": {
      "userId": "string",
      "token": "string",
      "isNewUser": true
    }
  }
  ```

### 2. 用户登录
- **URL**: `/api/user/login`
- **方法**: POST
- **请求参数**:
  ```json
  {
    "username": "string",  // 用户名/手机号/邮箱
    "password": "string"
  }
  ```
- **响应结果**:
  ```json
  {
    "code": 200,
    "message": "登录成功",
    "data": {
      "userId": "string",
      "token": "string",
      "nickname": "string",
      "avatar": "string",
      "memberLevel": "string",
      "petAvatar": "string"
    }
  }
  ```

### 3. 发送手机验证码
- **URL**: `/api/user/send-code`
- **方法**: POST
- **请求参数**:
  ```json
  {
    "phone": "string",
    "type": "string"
  }
  ```
- **响应结果**:
  ```json
  {
    "code": 200,
    "message": "验证码发送成功",
    "data": {}
  }
  ```

### 4. 手机验证码登录
- **URL**: `/api/user/phone-login`
- **方法**: POST
- **请求参数**:
  ```json
  {
    "phone": "string",
    "code": "string",
    "registerIfNotExists": "boolean"
  }
  ```
- **响应结果**:
  ```json
  {
    "code": 200,
    "message": "登录成功",
    "data": {
      "userId": "string",
      "token": "string",
      "nickname": "string",
      "avatar": "string",
      "memberLevel": "string",
      "petAvatar": "string",
      "isNewUser": "boolean"
    }
  }
  ```

### 5. 手机验证码注册
- **URL**: `/api/user/phone-register`
- **方法**: POST
- **请求参数**:
  ```json
  {
    "phone": "string",
    "code": "string",
    "nickname": "string"
  }
  ```
- **响应结果**:
  ```json
  {
    "code": 200,
    "message": "注册成功",
    "data": {
      "userId": "string",
      "token": "string",
      "nickname": "string",
      "isNewUser": "boolean"
    }
  }
  ```

### 6. 微信登录
- **URL**: `/api/user/wxlogin`
- **方法**: POST
- **请求参数**:
  ```json
  {
    "code": "string",  // 微信临时登录凭证
    "userInfo": {
      "nickName": "string",
      "avatarUrl": "string",
      "gender": "number"
    }
  }
  ```
- **响应结果**:
  ```json
  {
    "code": 200,
    "message": "登录成功",
    "data": {
      "userId": "string",
      "token": "string",
      "isNewUser": true
    }
  }
  ```

### 7. 获取用户信息
- **URL**: `/api/user/info`
- **方法**: GET
- **请求头**:
  ```
  Authorization: Bearer {token}
  ```
- **响应结果**:
  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "userId": "string",
      "nickname": "string",
      "avatar": "string",
      "memberLevel": "string",
      "petAvatar": "string",
      "phone": "string",
      "email": "string",
      "points": "number",
      "coupons": "number"
    }
  }
  ```

### 8. 修改用户信息
- **URL**: `/api/user/update`
- **方法**: PUT
- **请求头**:
  ```
  Authorization: Bearer {token}
  ```
- **请求参数**:
  ```json
  {
    "nickname": "string",
    "avatar": "string",
    "phone": "string",
    "email": "string"
  }
  ```
- **响应结果**:
  ```json
  {
    "code": 200,
    "message": "更新成功",
    "data": {
      "userId": "string",
      "nickname": "string",
      "avatar": "string"
    }
  }
  ```

### 9. 上传用户头像
- **URL**: `/api/user/upload-avatar`
- **方法**: POST
- **请求头**:
  ```
  Authorization: Bearer {token}
  Content-Type: multipart/form-data
  ```
- **请求参数**:
  ```
  file: (二进制文件)
  ```
- **响应结果**:
  ```json
  {
    "code": 200,
    "message": "上传成功",
    "data": {
      "url": "string"  // 头像URL
    }
  }
  ```

### 10. 用户登出
- **URL**: `/api/user/logout`
- **方法**: POST
- **请求头**:
  ```
  Authorization: Bearer {token}
  ```
- **响应结果**:
  ```json
  {
    "code": 200,
    "message": "登出成功"
  }
  ```

## 宠物管理相关接口

### 1. 获取宠物列表
- **URL**: `/api/pet/list`
- **方法**: GET
- **请求头**:
  ```
  Authorization: Bearer {token}
  ```
- **响应结果**:
  ```json
  {
    "code": 200,
    "message": "success",
    "data": [
      {
        "id": "string",
        "name": "string",
        "avatar": "string",
        "type": "string",
        "breed": "string",
        "age": "number",
        "gender": "string",
        "weight": "number",
        "vaccines": ["string"],
        "health": "string"
      }
    ]
  }
  ```

### 2. 获取宠物详情
- **URL**: `/api/pet/detail/{petId}`
- **方法**: GET
- **请求头**:
  ```
  Authorization: Bearer {token}
  ```
- **响应结果**:
  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "id": "string",
      "name": "string",
      "avatar": "string",
      "type": "string",
      "breed": "string",
      "age": "number",
      "gender": "string",
      "weight": "number",
      "vaccines": ["string"],
      "health": "string"
    }
  }
  ```

### 3. 新增宠物
- **URL**: `/api/pet/add`
- **方法**: POST
- **请求头**:
  ```
  Authorization: Bearer {token}
  ```
- **请求参数**:
  ```json
  {
    "name": "string",
    "avatar": "string",
    "type": "string",
    "breed": "string",
    "age": "number",
    "gender": "string",
    "weight": "number",
    "vaccines": ["string"],
    "health": "string"
  }
  ```
- **响应结果**:
  ```json
  {
    "code": 200,
    "message": "添加成功",
    "data": {
      "id": "string",
      "name": "string"
    }
  }
  ```

### 4. 更新宠物信息
- **URL**: `/api/pet/update/{petId}`
- **方法**: PUT
- **请求头**:
  ```
  Authorization: Bearer {token}
  ```
- **请求参数**:
  ```json
  {
    "name": "string",
    "avatar": "string",
    "type": "string",
    "breed": "string",
    "age": "number",
    "gender": "string",
    "weight": "number",
    "vaccines": ["string"],
    "health": "string"
  }
  ```
- **响应结果**:
  ```json
  {
    "code": 200,
    "message": "更新成功"
  }
  ```

### 5. 删除宠物
- **URL**: `/api/pet/delete/{petId}`
- **方法**: DELETE
- **请求头**:
  ```
  Authorization: Bearer {token}
  ```
- **响应结果**:
  ```json
  {
    "code": 200,
    "message": "删除成功"
  }
  ```

### 6. 上传宠物头像
- **URL**: `/api/pet/upload-avatar`
- **方法**: POST
- **请求头**:
  ```
  Authorization: Bearer {token}
  Content-Type: multipart/form-data
  ```
- **请求参数**:
  ```
  file: (二进制文件)
  ```
- **响应结果**:
  ```json
  {
    "code": 200,
    "message": "上传成功",
    "data": {
      "url": "string"  // 头像URL
    }
  }
  ```

## 商品相关接口

### 1. 获取商品列表
- **URL**: `/api/goods/list`
- **方法**: GET
- **请求参数**:
  ```
  category: string (可选，商品类别)
  brand: string (可选，品牌)
  keyword: string (可选，搜索关键词)
  sortBy: string (可选，排序方式: price_asc/price_desc/sales_desc)
  page: number (可选，默认1)
  pageSize: number (可选，默认10)
  ```
- **响应结果**:
  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "total": "number",
      "items": [
        {
          "id": "number",
          "name": "string",
          "price": "number",
          "sales": "number",
          "image": "string",
          "brand": "string",
          "category": "string"
        }
      ]
    }
  }
  ```

### 2. 获取商品详情
- **URL**: `/api/goods/detail/{goodsId}`
- **方法**: GET
- **响应结果**:
  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "id": "number",
      "name": "string",
      "price": "number",
      "sales": "number",
      "brand": "string",
      "category": "string",
      "brief": "string",
      "images": ["string"],
      "specs": ["string"],
      "stock": "number",
      "description": "string"
    }
  }
  ```

### 3. 获取热门商品
- **URL**: `/api/goods/hot`
- **方法**: GET
- **请求参数**:
  ```
  limit: number (可选，默认5)
  ```
- **响应结果**:
  ```json
  {
    "code": 200,
    "message": "success",
    "data": [
      {
        "id": "number",
        "name": "string",
        "price": "number",
        "sales": "number",
        "image": "string",
        "brand": "string",
        "category": "string"
      }
    ]
  }
  ```

### 4. 商品搜索
- **URL**: `/api/goods/search`
- **方法**: GET
- **请求参数**:
  ```
  keyword: string (搜索关键词)
  page: number (可选，默认1)
  pageSize: number (可选，默认10)
  ```
- **响应结果**:
  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "total": "number",
      "items": [
        {
          "id": "number",
          "name": "string",
          "price": "number",
          "sales": "number",
          "image": "string",
          "brand": "string",
          "category": "string"
        }
      ]
    }
  }
  ```

## 购物车相关接口

### 1. 获取购物车列表
- **URL**: `/api/cart/list`
- **方法**: GET
- **请求头**:
  ```
  Authorization: Bearer {token}
  ```
- **响应结果**:
  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "totalAmount": "number",
      "items": [
        {
          "id": "string",
          "goodsId": "number",
          "name": "string",
          "image": "string",
          "price": "number",
          "quantity": "number",
          "specs": "string",
          "selected": "boolean"
        }
      ]
    }
  }
  ```

### 2. 添加商品到购物车
- **URL**: `/api/cart/add`
- **方法**: POST
- **请求头**:
  ```
  Authorization: Bearer {token}
  ```
- **请求参数**:
  ```json
  {
    "goodsId": "number",
    "quantity": "number",
    "specs": "string"
  }
  ```
- **响应结果**:
  ```json
  {
    "code": 200,
    "message": "添加成功",
    "data": {
      "cartItemId": "string"
    }
  }
  ```

### 3. 更新购物车商品数量
- **URL**: `/api/cart/update`
- **方法**: PUT
- **请求头**:
  ```
  Authorization: Bearer {token}
  ```
- **请求参数**:
  ```json
  {
    "cartItemId": "string",
    "quantity": "number"
  }
  ```
- **响应结果**:
  ```json
  {
    "code": 200,
    "message": "更新成功"
  }
  ```

### 4. 更新购物车商品选中状态
- **URL**: `/api/cart/select`
- **方法**: PUT
- **请求头**:
  ```
  Authorization: Bearer {token}
  ```
- **请求参数**:
  ```json
  {
    "cartItemId": "string",
    "selected": "boolean"
  }
  ```
- **响应结果**:
  ```json
  {
    "code": 200,
    "message": "更新成功"
  }
  ```

### 5. 全选/取消全选购物车商品
- **URL**: `/api/cart/select-all`
- **方法**: PUT
- **请求头**:
  ```
  Authorization: Bearer {token}
  ```
- **请求参数**:
  ```json
  {
    "selected": "boolean"
  }
  ```
- **响应结果**:
  ```json
  {
    "code": 200,
    "message": "更新成功"
  }
  ```

### 6. 删除购物车商品
- **URL**: `/api/cart/delete`
- **方法**: DELETE
- **请求头**:
  ```
  Authorization: Bearer {token}
  ```
- **请求参数**:
  ```json
  {
    "cartItemIds": ["string"]
  }
  ```
- **响应结果**:
  ```json
  {
    "code": 200,
    "message": "删除成功"
  }
  ```

## 订单相关接口

### 1. 创建订单（商品购买）
- **URL**: `/api/order/create`
- **方法**: POST
- **请求头**:
  ```
  Authorization: Bearer {token}
  ```
- **请求参数**:
  ```json
  {
    "cartItemIds": ["string"],
    "addressId": "string",
    "couponId": "string",
    "message": "string"
  }
  ```
- **响应结果**:
  ```json
  {
    "code": 200,
    "message": "下单成功",
    "data": {
      "orderNumber": "string",
      "totalAmount": "number",
      "paymentAmount": "number"
    }
  }
  ```

### 2. 获取订单列表（宠物用品订单）
- **URL**: `/api/order/goods-list`
- **方法**: GET
- **请求头**:
  ```
  Authorization: Bearer {token}
  ```
- **请求参数**:
  ```
  status: string (可选，订单状态：all, pending_payment, pending_ship, pending_receive, completed, after_sale)
  page: number (可选，默认1)
  pageSize: number (可选，默认10)
  ```
- **响应结果**:
  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "total": "number",
      "items": [
        {
          "orderNumber": "string",
          "status": "string",
          "image": "string",
          "name": "string",
          "specs": "string",
          "price": "number",
          "quantity": "number",
          "totalPrice": "number",
          "createTime": "string"
        }
      ]
    }
  }
  ```

### 3. 获取订单详情
- **URL**: `/api/order/detail/{orderNumber}`
- **方法**: GET
- **请求头**:
  ```
  Authorization: Bearer {token}
  ```
- **响应结果**:
  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "orderNumber": "string",
      "status": "string",
      "createTime": "string",
      "payTime": "string",
      "shipTime": "string",
      "receiveTime": "string",
      "address": {
        "name": "string",
        "phone": "string",
        "province": "string",
        "city": "string",
        "district": "string",
        "detail": "string"
      },
      "goods": [
        {
          "goodsId": "number",
          "image": "string",
          "name": "string",
          "specs": "string",
          "price": "number",
          "quantity": "number"
        }
      ],
      "totalAmount": "number",
      "discountAmount": "number",
      "shippingFee": "number",
      "paymentAmount": "number",
      "message": "string"
    }
  }
  ```

### 4. 取消订单
- **URL**: `/api/order/cancel/{orderNumber}`
- **方法**: POST
- **请求头**:
  ```
  Authorization: Bearer {token}
  ```
- **请求参数**:
  ```json
  {
    "reason": "string"
  }
  ```
- **响应结果**:
  ```json
  {
    "code": 200,
    "message": "取消成功"
  }
  ```

### 5. 确认收货
- **URL**: `/api/order/confirm/{orderNumber}`
- **方法**: POST
- **请求头**:
  ```
  Authorization: Bearer {token}
  ```
- **响应结果**:
  ```json
  {
    "code": 200,
    "message": "确认成功"
  }
  ```

### 6. 订单支付
- **URL**: `/api/order/pay/{orderNumber}`
- **方法**: POST
- **请求头**:
  ```
  Authorization: Bearer {token}
  ```
- **请求参数**:
  ```json
  {
    "paymentMethod": "string",  // 支付方式：wechat, alipay
    "paymentChannel": "string"   // 支付渠道：app, h5, mini_program
  }
  ```
- **响应结果**:
  ```json
  {
    "code": 200,
    "message": "支付成功",
    "data": {
      "paymentInfo": "string"  // 支付信息，根据支付方式不同返回不同内容
    }
  }
  ```

### 7. 获取订单统计
- **URL**: `/api/order/stats`
- **方法**: GET
- **请求头**:
  ```
  Authorization: Bearer {token}
  ```
- **响应结果**:
  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "unpaid": "number",
      "shipping": "number",
      "delivered": "number",
      "completed": "number"
    }
  }
  ```

### 8. 获取待处理事项
- **URL**: `/api/order/pending-items`
- **方法**: GET
- **请求头**:
  ```
  Authorization: Bearer {token}
  ```
- **响应结果**:
  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "unpaidOrders": "number",
      "pendingConsultations": "number",
      "processingClaims": "number"
    }
  }
  ```

### 9. 获取医疗订单列表
- **URL**: `/api/order/medical-list`
- **方法**: GET
- **请求头**:
  ```
  Authorization: Bearer {token}
  ```
- **请求参数**:
  ```
  status: string (可选，订单状态：all, pending_payment, completed)
  page: number (可选，默认1)
  pageSize: number (可选，默认10)
  ```
- **响应结果**:
  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "total": "number",
      "items": [
        {
          "orderNumber": "string",
          "status": "string",
          "doctorName": "string",
          "consultTime": "string",
          "diagnosis": "string",
          "totalPrice": "number",
          "hasPrescription": "boolean"
        }
      ]
    }
  }
  ```

### 10. 获取保险订单列表
- **URL**: `/api/order/insurance-list`
- **方法**: GET
- **请求头**:
  ```
  Authorization: Bearer {token}
  ```
- **请求参数**:
  ```
  status: string (可选，订单状态：all, pending_payment, active)
  page: number (可选，默认1)
  pageSize: number (可选，默认10)
  ```
- **响应结果**:
  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "total": "number",
      "items": [
        {
          "policyNumber": "string",
          "status": "string",
          "insuranceType": "string",
          "effectiveDate": "string",
          "expiryDate": "string",
          "insuredPet": "string",
          "premium": "number"
        }
      ]
    }
  }
  ```

## 地址管理接口

### 1. 获取地址列表
- **URL**: `/api/address/list`
- **方法**: GET
- **请求头**:
  ```
  Authorization: Bearer {token}
  ```
- **响应结果**:
  ```json
  {
    "code": 200,
    "message": "success",
    "data": [
      {
        "id": "string",
        "name": "string",
        "phone": "string",
        "province": "string",
        "city": "string",
        "district": "string",
        "detail": "string",
        "isDefault": "boolean"
      }
    ]
  }
  ```

### 2. 添加地址
- **URL**: `/api/address/add`
- **方法**: POST
- **请求头**:
  ```
  Authorization: Bearer {token}
  ```
- **请求参数**:
  ```json
  {
    "name": "string",
    "phone": "string",
    "province": "string",
    "city": "string",
    "district": "string",
    "detail": "string",
    "isDefault": "boolean"
  }
  ```
- **响应结果**:
  ```json
  {
    "code": 200,
    "message": "添加成功",
    "data": {
      "id": "string"
    }
  }
  ```

### 3. 更新地址
- **URL**: `/api/address/update/{addressId}`
- **方法**: PUT
- **请求头**:
  ```
  Authorization: Bearer {token}
  ```
- **请求参数**:
  ```json
  {
    "name": "string",
    "phone": "string",
    "province": "string",
    "city": "string",
    "district": "string",
    "detail": "string",
    "isDefault": "boolean"
  }
  ```
- **响应结果**:
  ```json
  {
    "code": 200,
    "message": "更新成功"
  }
  ```

### 4. 删除地址
- **URL**: `/api/address/delete/{addressId}`
- **方法**: DELETE
- **请求头**:
  ```
  Authorization: Bearer {token}
  ```
- **响应结果**:
  ```json
  {
    "code": 200,
    "message": "删除成功"
  }
  ```

### 5. 设为默认地址
- **URL**: `/api/address/set-default/{addressId}`
- **方法**: PUT
- **请求头**:
  ```
  Authorization: Bearer {token}
  ```
- **响应结果**:
  ```json
  {
    "code": 200,
    "message": "设置成功"
  }
  ```

## 账户工具接口

### 1. 获取优惠券列表
- **URL**: `/api/coupon/list`
- **方法**: GET
- **请求头**:
  ```
  Authorization: Bearer {token}
  ```
- **请求参数**:
  ```
  status: string (可选，优惠券状态：all, valid, used, expired)
  ```
- **响应结果**:
  ```json
  {
    "code": 200,
    "message": "success",
    "data": [
      {
        "id": "string",
        "name": "string",
        "type": "string",
        "amount": "number",
        "minConsume": "number",
        "startTime": "string",
        "endTime": "string",
        "status": "string",
        "description": "string"
      }
    ]
  }
  ```

### 2. 领取优惠券
- **URL**: `/api/coupon/receive/{couponId}`
- **方法**: POST
- **请求头**:
  ```
  Authorization: Bearer {token}
  ```
- **响应结果**:
  ```json
  {
    "code": 200,
    "message": "领取成功"
  }
  ```

### 3. 获取积分记录
- **URL**: `/api/points/record`
- **方法**: GET
- **请求头**:
  ```
  Authorization: Bearer {token}
  ```
- **请求参数**:
  ```
  page: number (可选，默认1)
  pageSize: number (可选，默认10)
  ```
- **响应结果**:
  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "total": "number",
      "balance": "number",
      "items": [
        {
          "id": "string",
          "type": "string",
          "amount": "number",
          "description": "string",
          "createTime": "string"
        }
      ]
    }
  }
  ```

### 4. 获取积分商城商品
- **URL**: `/api/points/goods`
- **方法**: GET
- **请求头**:
  ```
  Authorization: Bearer {token}
  ```
- **请求参数**:
  ```
  page: number (可选，默认1)
  pageSize: number (可选，默认10)
  ```
- **响应结果**:
  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "total": "number",
      "items": [
        {
          "id": "string",
          "name": "string",
          "image": "string",
          "points": "number",
          "stock": "number",
          "description": "string"
        }
      ]
    }
  }
  ```

### 5. 积分兑换商品
- **URL**: `/api/points/exchange`
- **方法**: POST
- **请求头**:
  ```
  Authorization: Bearer {token}
  ```
- **请求参数**:
  ```json
  {
    "goodsId": "string",
    "quantity": "number",
    "addressId": "string"
  }
  ```
- **响应结果**:
  ```json
  {
    "code": 200,
    "message": "兑换成功",
    "data": {
      "exchangeId": "string"
    }
  }
  ```

## 其他接口

### 1. 上传图片
- **URL**: `/api/common/upload-image`
- **方法**: POST
- **请求头**:
  ```
  Authorization: Bearer {token}
  Content-Type: multipart/form-data
  ```
- **请求参数**:
  ```
  file: (二进制文件)
  type: string (可选，图片用途：user, pet, goods, etc.)
  ```
- **响应结果**:
  ```json
  {
    "code": 200,
    "message": "上传成功",
    "data": {
      "url": "string"
    }
  }
  ```

### 2. 获取用户协议
- **URL**: `/api/common/user-policy`
- **方法**: GET
- **响应结果**:
  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "content": "string"
    }
  }
  ```

### 3. 获取隐私政策
- **URL**: `/api/common/privacy-policy`
- **方法**: GET
- **响应结果**:
  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "content": "string"
    }
  }
  ```

### 4. 意见反馈
- **URL**: `/api/feedback/submit`
- **方法**: POST
- **请求头**:
  ```
  Authorization: Bearer {token}
  ```
- **请求参数**:
  ```json
  {
    "type": "string",
    "content": "string",
    "images": ["string"]
  }
  ```
- **响应结果**:
  ```json
  {
    "code": 200,
    "message": "提交成功"
  }
  ```

## 通用响应格式

所有API的响应格式统一为：
```json
{
  "code": "number",  // 状态码，200表示成功，其他表示错误
  "message": "string",  // 响应消息
  "data": "object"  // 响应数据，可能是对象或数组
}
```

## 错误码说明

- 200: 成功
- 400: 请求参数错误
- 401: 未授权（未登录或token无效）
- 403: 权限不足
- 404: 资源不存在
- 500: 服务器内部错误 