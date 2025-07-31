# PetPal API Documentation

## Overview

This document provides detailed descriptions of all backend APIs for the PetPal application, including request methods, parameter formats, return values, and other information.

### Basic Information

- API Root Address: `https://udrvmlsoncfg.sealosbja.site`
- Base URL: `/api`
- Response Format: JSON
- Authentication Method: JWT (Bearer Token)
- Database: Redis

### Common Response Format

All API responses follow this JSON format:

```json
{
  "code": 200,       // Status code, 200 means success, others indicate errors
  "message": "xxx",  // Response message
  "data": {}         // Response data, can be object or array
}
```

### Common Error Codes

| Error Code | Description |
|------------|-------------|
| 200 | Success |
| 400 | Bad Request |
| 401 | Unauthorized (Not logged in or invalid token) |
| 403 | Forbidden |
| 404 | Resource Not Found |
| 500 | Internal Server Error |

### Authentication

Most APIs require a JWT token in the request header:

```
Authorization: Bearer {token}
```

## Table of Contents

1. [User Management APIs](#user-management-apis)
2. [Pet Management APIs](#pet-management-apis)
3. [Product APIs](#product-apis)
4. [Shopping Cart APIs](#shopping-cart-apis)
5. [Order APIs](#order-apis)
6. [Address Management APIs](#address-management-apis)
7. [Account Tool APIs](#account-tool-apis)
8. [Insurance APIs](#insurance-apis)
9. [Other APIs](#other-apis)

---

## User Management APIs

### 1. User Registration

- **API URL**: `/api/user/register`
- **Method**: POST
- **Headers**: No authentication required
- **Request Parameters**:

  ```json
  {
    "username": "string",  // Required
    "password": "string",  // Required, minimum 6 characters
    "phone": "string",     // Optional
    "email": "string"      // Optional
  }
  ```

- **Success Response**:

  ```json
  {
    "code": 200,
    "message": "Registration successful",
    "data": {
      "userId": "string",
      "token": "string",
      "isNewUser": true
    }
  }
  ```

- **Error Response**:

  ```json
  {
    "code": 400,
    "message": "Username already exists",
    "data": null
  }
  ```

  or

  ```json
  {
    "code": 400,
    "message": "Password must be at least 6 characters",
    "data": null
  }
  ```

### 2. User Login

- **API URL**: `/api/user/login`
- **Method**: POST
- **Headers**: No authentication required
- **Request Parameters**:

  ```json
  {
    "username": "string",  // Username/phone/email, required
    "password": "string"   // Password, required
  }
  ```

- **Success Response**:

  ```json
  {
    "code": 200,
    "message": "Login successful",
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

- **Error Response**:

  ```json
  {
    "code": 401,
    "message": "Invalid username or password",
    "data": null
  }
  ```

### 3. WeChat Login

- **API URL**: `/api/user/wxlogin`
- **Method**: POST
- **Headers**: No authentication required
- **Request Parameters**:

  ```json
  {
    "code": "string",  // WeChat temporary login code, required
    "userInfo": {      // User info object, optional
      "nickName": "string",
      "avatarUrl": "string",
      "gender": "number"
    }
  }
  ```

- **Success Response**:

  ```json
  {
    "code": 200,
    "message": "Login successful",
    "data": {
      "userId": "string",
      "token": "string",
      "isNewUser": true  // Whether it's a new user
    }
  }
  ```

- **Error Response**:

  ```json
  {
    "code": 400,
    "message": "WeChat login code cannot be empty",
    "data": null
  }
  ```

### 4. Get User Information

- **API URL**: `/api/user/info`
- **Method**: GET
- **Headers**: Authentication required

  ```
  Authorization: Bearer {token}
  ```

- **Request Parameters**: None

- **Success Response**:

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

- **Error Response**:

  ```json
  {
    "code": 401,
    "message": "Unauthorized, please login first",
    "data": null
  }
  ```

  or

  ```json
  {
    "code": 404,
    "message": "User not found",
    "data": null
  }
  ```

### 5. Update User Information

- **API URL**: `/api/user/update`
- **Method**: PUT
- **Headers**: Authentication required

  ```
  Authorization: Bearer {token}
  ```

- **Request Parameters**:

  ```json
  {
    "nickname": "string",  // Optional
    "avatar": "string",    // Avatar URL, optional
    "phone": "string",     // Optional
    "email": "string"      // Optional
  }
  ```

- **Success Response**:

  ```json
  {
    "code": 200,
    "message": "Update successful",
    "data": {
      "userId": "string",
      "nickname": "string",
      "avatar": "string"
    }
  }
  ```

- **Error Response**:

  ```json
  {
    "code": 401,
    "message": "Unauthorized, please login first",
    "data": null
  }
  ```

  or

  ```json
  {
    "code": 400,
    "message": "Nickname must be 2-20 characters",
    "data": null
  }
  ```

## Pet Management APIs

### 1. Get Pet List

- **API URL**: `/api/pet/list`
- **Method**: GET
- **Headers**: Authentication required

  ```
  Authorization: Bearer {token}
  ```

- **Request Parameters**: None

- **Success Response**:

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

- **Error Response**:

  ```json
  {
    "code": 401,
    "message": "Unauthorized, please login first",
    "data": null
  }
  ```

### 2. Get Pet Details

- **API URL**: `/api/pet/detail/{petId}`
- **Method**: GET
- **Headers**: Authentication required

  ```
  Authorization: Bearer {token}
  ```

- **Request Parameters**: None

- **Success Response**:

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

- **Error Response**:

  ```json
  {
    "code": 401,
    "message": "Unauthorized, please login first",
    "data": null
  }
  ```

  or

  ```json
  {
    "code": 404,
    "message": "Pet not found",
    "data": null
  }
  ```

  or

  ```json
  {
    "code": 403,
    "message": "No permission to access this pet's information",
    "data": null
  }
  ```

### 3. Add New Pet

- **API URL**: `/api/pet/add`
- **Method**: POST
- **Headers**: Authentication required

  ```
  Authorization: Bearer {token}
  ```

- **Request Parameters**:

  ```json
  {
    "name": "string",       // Required
    "avatar": "string",     // Pet avatar URL, optional
    "type": "string",       // Pet type, required
    "breed": "string",      // Pet breed, required
    "age": "number",        // Pet age, required
    "gender": "string",     // Pet gender, required
    "weight": "number",     // Pet weight, required
    "vaccines": ["string"], // Vaccination status, optional
    "health": "string"      // Health status, optional
  }
  ```

- **Success Response**:

  ```json
  {
    "code": 200,
    "message": "Added successfully",
    "data": {
      "id": "string",
      "name": "string"
    }
  }
  ```

- **Error Response**:

  ```json
  {
    "code": 401,
    "message": "Unauthorized, please login first",
    "data": null
  }
  ```

  or

  ```json
  {
    "code": 400,
    "message": "Pet name cannot be empty",
    "data": null
  }
  ```

## Product APIs

### 1. Get Product List

- **API URL**: `/api/goods/list`
- **Method**: GET
- **Headers**: No authentication required
- **Request Parameters**:

  ```
  category: string (Optional, product category)
  brand: string (Optional, brand)
  keyword: string (Optional, search keyword)
  sortBy: string (Optional, sort method: price_asc/price_desc/sales_desc)
  page: number (Optional, default 1)
  pageSize: number (Optional, default 10)
  ```

- **Success Response**:

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

- **Error Response**:

  ```json
  {
    "code": 400,
    "message": "Invalid parameters",
    "data": null
  }
  ```

### 2. Get Product Details

- **API URL**: `/api/goods/detail/{goodsId}`
- **Method**: GET
- **Headers**: No authentication required
- **Request Parameters**: None

- **Success Response**:

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

- **Error Response**:

  ```json
  {
    "code": 404,
    "message": "Product not found",
    "data": null
  }
  ```

### 3. Get Hot Products

- **API URL**: `/api/goods/hot`
- **Method**: GET
- **Headers**: No authentication required
- **Request Parameters**:

  ```
  limit: number (Optional, default 5)
  ```

- **Success Response**:

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

### 4. Product Search

- **API URL**: `/api/goods/search`
- **Method**: GET
- **Headers**: No authentication required
- **Request Parameters**:

  ```
  keyword: string (Search keyword, required)
  page: number (Optional, default 1)
  pageSize: number (Optional, default 10)
  ```

- **Success Response**:

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

- **Error Response**:

  ```json
  {
    "code": 400,
    "message": "Keyword cannot be empty",
    "data": null
  }
  ```

## Shopping Cart APIs

### 1. Get Cart List

- **API URL**: `/api/cart/list`
- **Method**: GET
- **Headers**: Authentication required

  ```
  Authorization: Bearer {token}
  ```

- **Request Parameters**: None

- **Success Response**:

  ```json
  {
    "code": 200,
    "message": "success",
    "data": [
      {
        "id": "string",
        "name": "string",
        "price": "number",
        "quantity": "number",
        "total": "number",
        "image": "string"
      }
    ]
  }
  ```

- **Error Response**:

  ```json
  {
    "code": 401,
    "message": "Unauthorized, please login first",
    "data": null
  }
  ```

### 2. Add Item to Cart

- **API URL**: `/api/cart/add`
- **Method**: POST
- **Headers**: Authentication required

  ```
  Authorization: Bearer {token}
  ```

- **Request Parameters**:

  ```json
  {
    "goodsId": "string",  // Product ID, required
    "quantity": "number"  // Quantity, required
  }
  ```

- **Success Response**:

  ```json
  {
    "code": 200,
    "message": "Added successfully"
  }
  ```

- **Error Response**:

  ```json
  {
    "code": 401,
    "message": "Unauthorized, please login first",
    "data": null
  }
  ```

### 3. Update Cart Item Quantity

- **API URL**: `/api/cart/update`
- **Method**: PUT
- **Headers**: Authentication required

  ```
  Authorization: Bearer {token}
  ```

- **Request Parameters**:

  ```json
  {
    "goodsId": "string",  // Product ID, required
    "quantity": "number"  // Quantity, required
  }
  ```

- **Success Response**:

  ```json
  {
    "code": 200,
    "message": "Update successful"
  }
  ```

- **Error Response**:

  ```json
  {
    "code": 401,
    "message": "Unauthorized, please login first",
    "data": null
  }
  ```

### 4. Delete Cart Item

- **API URL**: `/api/cart/delete`
- **Method**: DELETE
- **Headers**: Authentication required

  ```
  Authorization: Bearer {token}
  ```

- **Request Parameters**:

  ```json
  {
    "goodsId": "string"  // Product ID, required
  }
  ```

- **Success Response**:

  ```json
  {
    "code": 200,
    "message": "Delete successful"
  }
  ```

- **Error Response**:

  ```json
  {
    "code": 401,
    "message": "Unauthorized, please login first",
    "data": null
  }
  ```

## Order APIs

### 1. Get Order List

- **API URL**: `/api/order/list`
- **Method**: GET
- **Headers**: Authentication required

  ```
  Authorization: Bearer {token}
  ```

- **Request Parameters**: None

- **Success Response**:

  ```json
  {
    "code": 200,
    "message": "success",
    "data": [
      {
        "id": "string",
        "status": "string",
        "total": "number",
        "createdAt": "string"
      }
    ]
  }
  ```

- **Error Response**:

  ```json
  {
    "code": 401,
    "message": "Unauthorized, please login first",
    "data": null
  }
  ```

### 2. Get Order Details

- **API URL**: `/api/order/detail/{orderId}`
- **Method**: GET
- **Headers**: Authentication required

  ```
  Authorization: Bearer {token}
  ```

- **Request Parameters**: None

- **Success Response**:

  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "id": "string",
      "status": "string",
      "total": "number",
      "createdAt": "string",
      "items": [
        {
          "id": "string",
          "name": "string",
          "price": "number",
          "quantity": "number",
          "total": "number"
        }
      ]
    }
  }
  ```

- **Error Response**:

  ```json
  {
    "code": 401,
    "message": "Unauthorized, please login first",
    "data": null
  }
  ```

  or

  ```json
  {
    "code": 404,
    "message": "Order not found",
    "data": null
  }
  ```

### 3. Create Order

- **API URL**: `/api/order/create`
- **Method**: POST
- **Headers**: Authentication required

  ```
  Authorization: Bearer {token}
  ```

- **Request Parameters**:

  ```json
  {
    "goodsIds": ["string"],  // Array of product IDs, required
    "addressId": "string"    // Address ID, required
  }
  ```

- **Success Response**:

  ```json
  {
    "code": 200,
    "message": "Order created successfully",
    "data": {
      "id": "string"
    }
  }
  ```

- **Error Response**:

  ```json
  {
    "code": 401,
    "message": "Unauthorized, please login first",
    "data": null
  }
  ```

  or

  ```json
  {
    "code": 400,
    "message": "Product IDs cannot be empty",
    "data": null
  }
  ```

  or

  ```json
  {
    "code": 400,
    "message": "Address ID cannot be empty",
    "data": null
  }
  ```

### 4. Cancel Order

- **API URL**: `/api/order/cancel/{orderId}`
- **Method**: PUT
- **Headers**: Authentication required

  ```
  Authorization: Bearer {token}
  ```

- **Request Parameters**: None

- **Success Response**:

  ```json
  {
    "code": 200,
    "message": "Order cancelled successfully"
  }
  ```

- **Error Response**:

  ```json
  {
    "code": 401,
    "message": "Unauthorized, please login first",
    "data": null
  }
  ```

  or

  ```json
  {
    "code": 404,
    "message": "Order not found",
    "data": null
  }
  ```

### 5. Confirm Receipt

- **API URL**: `/api/order/confirm/{orderId}`
- **Method**: PUT
- **Headers**: Authentication required

  ```
  Authorization: Bearer {token}
  ```

- **Request Parameters**: None

- **Success Response**:

  ```json
  {
    "code": 200,
    "message": "Receipt confirmed successfully"
  }
  ```

- **Error Response**:

  ```json
  {
    "code": 401,
    "message": "Unauthorized, please login first",
    "data": null
  }
  ```

  or

  ```json
  {
    "code": 404,
    "message": "Order not found",
    "data": null
  }
  ```

## Address Management APIs

### 1. Get Address List

- **API URL**: `/api/address/list`
- **Method**: GET
- **Headers**: Authentication required

  ```
  Authorization: Bearer {token}
  ```

- **Request Parameters**: None

- **Success Response**:

  ```json
  {
    "code": 200,
    "message": "success",
    "data": [
      {
        "id": "string",
        "name": "string",
        "phone": "string",
        "address": "string"
      }
    ]
  }
  ```

- **Error Response**:

  ```json
  {
    "code": 401,
    "message": "Unauthorized, please login first",
    "data": null
  }
  ```

### 2. Get Address Details

- **API URL**: `/api/address/detail/{addressId}`
- **Method**: GET
- **Headers**: Authentication required

  ```
  Authorization: Bearer {token}
  ```

- **Request Parameters**: None

- **Success Response**:

  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "id": "string",
      "name": "string",
      "phone": "string",
      "address": "string"
    }
  }
  ```

- **Error Response**:

  ```json
  {
    "code": 401,
    "message": "Unauthorized, please login first",
    "data": null
  }
  ```

  or

  ```json
  {
    "code": 404,
    "message": "Address not found",
    "data": null
  }
  ```

### 3. Add New Address

- **API URL**: `/api/address/add`
- **Method**: POST
- **Headers**: Authentication required

  ```
  Authorization: Bearer {token}
  ```

- **Request Parameters**:

  ```json
  {
    "name": "string",    // Recipient name, required
    "phone": "string",   // Phone number, required
    "address": "string"  // Address, required
  }
  ```

- **Success Response**:

  ```json
  {
    "code": 200,
    "message": "Added successfully"
  }
  ```

- **Error Response**:

  ```json
  {
    "code": 401,
    "message": "Unauthorized, please login first",
    "data": null
  }
  ```

### 4. Update Address

- **API URL**: `/api/address/update`
- **Method**: PUT
- **Headers**: Authentication required

  ```
  Authorization: Bearer {token}
  ```

- **Request Parameters**:

  ```json
  {
    "id": "string",      // Address ID, required
    "name": "string",    // Recipient name, optional
    "phone": "string",   // Phone number, optional
    "address": "string"  // Address, optional
  }
  ```

- **Success Response**:

  ```json
  {
    "code": 200,
    "message": "Update successful"
  }
  ```

- **Error Response**:

  ```json
  {
    "code": 401,
    "message": "Unauthorized, please login first",
    "data": null
  }
  ```

### 5. Delete Address

- **API URL**: `/api/address/delete/{addressId}`
- **Method**: DELETE
- **Headers**: Authentication required

  ```
  Authorization: Bearer {token}
  ```

- **Request Parameters**: None

- **Success Response**:

  ```json
  {
    "code": 200,
    "message": "Delete successful"
  }
  ```

- **Error Response**:

  ```json
  {
    "code": 401,
    "message": "Unauthorized, please login first",
    "data": null
  }
  ```

  or

  ```json
  {
    "code": 404,
    "message": "Address not found",
    "data": null
  }
  ```

## Account Tool APIs

### 1. Get Account Information

- **API URL**: `/api/account/info`
- **Method**: GET
- **Headers**: Authentication required

  ```
  Authorization: Bearer {token}
  ```

- **Request Parameters**: None

- **Success Response**:

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

- **Error Response**:

  ```json
  {
    "code": 401,
    "message": "Unauthorized, please login first",
    "data": null
  }
  ```

### 2. Update Account Information

- **API URL**: `/api/account/update`
- **Method**: PUT
- **Headers**: Authentication required

  ```
  Authorization: Bearer {token}
  ```

- **Request Parameters**:

  ```json
  {
    "nickname": "string",  // Optional
    "avatar": "string",    // Avatar URL, optional
    "phone": "string",     // Optional
    "email": "string"      // Optional
  }
  ```

- **Success Response**:

  ```json
  {
    "code": 200,
    "message": "Update successful",
    "data": {
      "userId": "string",
      "nickname": "string",
      "avatar": "string"
    }
  }
  ```

- **Error Response**:

  ```json
  {
    "code": 401,
    "message": "Unauthorized, please login first",
    "data": null
  }
  ```

  or

  ```json
  {
    "code": 400,
    "message": "Nickname must be 2-20 characters",
    "data": null
  }
  ```

### 3. Upload Account Avatar

- **API URL**: `/api/account/upload-avatar`
- **Method**: POST
- **Headers**: Authentication required

  ```
  Authorization: Bearer {token}
  Content-Type: multipart/form-data
  ```

- **Request Parameters**:

  ```
  file: (binary file)  // Avatar image file, required
  ```

- **Success Response**:

  ```json
  {
    "code": 200,
    "message": "Upload successful",
    "data": {
      "url": "string"  // Avatar URL
    }
  }
  ```

- **Error Response**:

  ```json
  {
    "code": 400,
    "message": "No file uploaded",
    "data": null
  }
  ```

  or

  ```json
  {
    "code": 400,
    "message": "Unsupported file type, only JPG, PNG, GIF and WEBP formats are supported",
    "data": null
  }
  ```

### 4. Get Account Balance

- **API URL**: `/api/account/balance`
- **Method**: GET
- **Headers**: Authentication required

  ```
  Authorization: Bearer {token}
  ```

- **Request Parameters**: None

- **Success Response**:

  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "balance": "number"
    }
  }
  ```

- **Error Response**:

  ```json
  {
    "code": 401,
    "message": "Unauthorized, please login first",
    "data": null
  }
  ```

### 5. Get Account Points

- **API URL**: `/api/account/points`
- **Method**: GET
- **Headers**: Authentication required

  ```
  Authorization: Bearer {token}
  ```

- **Request Parameters**: None

- **Success Response**:

  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "points": "number"
    }
  }
  ```

- **Error Response**:

  ```json
  {
    "code": 401,
    "message": "Unauthorized, please login first",
    "data": null
  }
  ```

## Insurance APIs

### 1. Get Insurance Plan List

- **API URL**: `/api/insurance/plans`
- **Method**: GET
- **Headers**: No authentication required
- **Request Parameters**:

  ```
  petType: string (Optional, pet type: dog/cat/other)
  category: string (Optional, insurance category: health/accident/comprehensive)
  ageRange: string (Optional, age range: puppy/adult/senior)
  page: number (Optional, default 1)
  pageSize: number (Optional, default 10)
  ```

- **Success Response**:

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
          "description": "string",
          "category": "string",
          "petTypes": ["string"],
          "ageRange": ["string"],
          "price": "number",
          "coverage": "number",
          "period": "string",
          "features": ["string"]
        }
      ]
    }
  }
  ```

- **Error Response**:

  ```json
  {
    "code": 400,
    "message": "Invalid parameters",
    "data": null
  }
  ```

### 2. Get Insurance Plan Details

- **API URL**: `/api/insurance/plan/{planId}`
- **Method**: GET
- **Headers**: No authentication required
- **Request Parameters**: None

- **Success Response**:

  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "id": "string",
      "name": "string",
      "description": "string",
      "category": "string",
      "petTypes": ["string"],
      "ageRange": ["string"],
      "price": "number",
      "coverage": "number",
      "period": "string",
      "features": ["string"],
      "conditions": ["string"],
      "exclusions": ["string"],
      "claimProcess": "string",
      "reviews": [
        {
          "userId": "string",
          "username": "string",
          "rating": "number",
          "comment": "string",
          "date": "string"
        }
      ]
    }
  }
  ```

- **Error Response**:

  ```json
  {
    "code": 404,
    "message": "Insurance plan not found",
    "data": null
  }
  ```

### 3. Get User Policies

- **API URL**: `/api/insurance/policies`
- **Method**: GET
- **Headers**: Authentication required

  ```
  Authorization: Bearer {token}
  ```

- **Request Parameters**:

  ```
  status: string (Optional, policy status: active/expired/pending)
  page: number (Optional, default 1)
  pageSize: number (Optional, default 10)
  ```

- **Success Response**:

  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "total": "number",
      "items": [
        {
          "id": "string",
          "planId": "string",
          "planName": "string",
          "petId": "string",
          "petName": "string",
          "startDate": "string",
          "endDate": "string",
          "status": "string",
          "price": "number",
          "coverage": "number"
        }
      ]
    }
  }
  ```

- **Error Response**:

  ```json
  {
    "code": 401,
    "message": "Unauthorized, please login first",
    "data": null
  }
  ```

## Other APIs

### 1. Upload Image

- **API URL**: `/api/common/upload-image`
- **Method**: POST
- **Headers**: Authentication required

  ```
  Authorization: Bearer {token}
  Content-Type: multipart/form-data
  ```

- **Request Parameters**:

  ```
  file: (binary file)  // Image file, required
  type: string (Optional, image usage: user, pet, goods, etc.)
  ```

- **Success Response**:

  ```json
  {
    "code": 200,
    "message": "Upload successful",
    "data": {
      "url": "string"  // Image URL
    }
  }
  ```

- **Error Response**:

  ```json
  {
    "code": 400,
    "message": "No file uploaded",
    "data": null
  }
  ```

  or

  ```json
  {
    "code": 400,
    "message": "Unsupported file type, only JPG, PNG, GIF and WEBP formats are supported",
    "data": null
  }
  ```

### 2. Get User Agreement

- **API URL**: `/api/common/user-policy`
- **Method**: GET
- **Headers**: No authentication required
- **Request Parameters**: None

- **Success Response**:

  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "content": "string"  // User agreement content
    }
  }
  ```

### 3. Get Privacy Policy

- **API URL**: `/api/common/privacy-policy`
- **Method**: GET
- **Headers**: No authentication required
- **Request Parameters**: None

- **Success Response**:

  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "content": "string"  // Privacy policy content
    }
  }
  ```

### 4. Submit Feedback

- **API URL**: `/api/feedback/submit`
- **Method**: POST
- **Headers**: Authentication required

  ```
  Authorization: Bearer {token}
  ```

- **Request Parameters**:

  ```json
  {
    "type": "string",     // Feedback type, required
    "content": "string",  // Feedback content, required
    "images": ["string"]  // Image URL array, optional
  }
  ```

- **Success Response**:

  ```json
  {
    "code": 200,
    "message": "Submission successful",
    "data": {
      "id": "string"  // Feedback ID
    }
  }
  ```

- **Error Response**:

  ```json
  {
    "code": 401,
    "message": "Unauthorized, please login first",
    "data": null
  }
  ```

  or

  ```json
  {
    "code": 400,
    "message": "Feedback content cannot be empty",
    "data": null
  }
  ```

[End of documentation] 