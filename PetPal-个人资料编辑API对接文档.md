# PetPal 个人资料编辑 API 对接文档

## 📋 概述

本文档为后端团队提供个人资料编辑功能的API对接指导，包括用户信息获取、更新、头像上传、手机号验证等功能。

## 🔍 功能分析

### 当前页面功能
1. **头像编辑** - 选择并上传用户头像
2. **昵称编辑** - 修改用户昵称
3. **性别选择** - 选择用户性别（男/女）
4. **资料保存** - 保存所有修改的信息

### 数据流程
```
用户进入页面 → 获取当前用户信息 → 编辑各项信息 → 上传头像 → 保存资料 → 返回上一页
```

## 🛠️ API 接口规范

### 1. 获取用户信息

**接口地址**: `GET /api/user/info`

**请求头**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**请求参数**: 无

**响应示例**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "id": "user_001",
    "username": "llh",
    "nickname": "宠物爱好者",
    "avatar": "https://example.com/avatars/user_001.jpg",
    "gender": "male",
    "createTime": "2025-01-27T10:30:00Z",
    "updateTime": "2025-01-27T15:45:00Z"
  }
}
```

**字段说明**:
- `id`: 用户ID
- `username`: 用户名
- `nickname`: 昵称
- `avatar`: 头像URL
- `gender`: 性别 (male/female)
- `createTime`: 创建时间
- `updateTime`: 更新时间

### 2. 更新用户信息

**接口地址**: `PUT /api/user/update`

**请求头**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**请求参数**:
```json
{
  "nickname": "新昵称",
  "gender": "male"
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "id": "user_001",
    "nickname": "新昵称",
    "gender": "male",
    "updateTime": "2025-01-27T16:00:00Z"
  }
}
```

**字段说明**:
- `nickname`: 昵称（必填，最大20字符）
- `gender`: 性别（必填，male/female）

### 3. 上传用户头像

**接口地址**: `POST /api/user/upload-avatar`

**请求头**:
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**请求参数**:
```
file: [图片文件]
```

**响应示例**:
```json
{
  "code": 200,
  "message": "上传成功",
  "data": {
    "avatarUrl": "https://example.com/avatars/user_001_avatar.jpg",
    "fileName": "avatar_1706364000000.jpg",
    "fileSize": 102400,
    "uploadTime": "2025-01-27T16:00:00Z"
  }
}
```

**字段说明**:
- `avatarUrl`: 头像访问URL
- `fileName`: 文件名
- `fileSize`: 文件大小（字节）
- `uploadTime`: 上传时间



## 📱 前端代码修改建议

### 1. 修改编辑个人资料页面

```javascript
// 在 edit-profile.vue 中引入API
import { userApi } from '../../utils/api';

// 获取用户信息
const loadUserInfo = async () => {
  try {
    const response = await userApi.getUserInfo();
    if (response.code === 200) {
      userInfo.value = response.data;
    }
  } catch (error) {
    console.error('获取用户信息失败:', error);
  }
};

// 上传头像
const uploadAvatar = async (filePath) => {
  try {
    const response = await userApi.uploadAvatar(filePath);
    if (response.code === 200) {
      userInfo.value.avatar = response.data.avatarUrl;
      uni.showToast({
        title: '头像上传成功',
        icon: 'success'
      });
    }
  } catch (error) {
    console.error('头像上传失败:', error);
    uni.showToast({
      title: '头像上传失败',
      icon: 'none'
    });
  }
};



// 保存个人资料
const saveProfile = async () => {
  // 验证必填字段
  if (!userInfo.value.nickname) {
    uni.showToast({
      title: '请输入昵称',
      icon: 'none'
    });
    return;
  }

  if (!userInfo.value.gender) {
    uni.showToast({
      title: '请选择性别',
      icon: 'none'
    });
    return;
  }

  try {
    const updateData = {
      nickname: userInfo.value.nickname,
      gender: userInfo.value.gender
    };

    const response = await userApi.updateUserInfo(updateData);
    if (response.code === 200) {
      uni.showToast({
        title: '保存成功',
        icon: 'success'
      });
      
      // 更新本地存储
      uni.setStorageSync('userInfo', JSON.stringify(response.data));
      
      setTimeout(() => {
        goBack();
      }, 1500);
    }
  } catch (error) {
    console.error('保存个人资料失败:', error);
    uni.showToast({
      title: '保存失败',
      icon: 'none'
    });
  }
};
```

## 🔒 安全要求

### 1. 数据验证
- **昵称**: 必填，最大20字符，不能包含特殊字符
- **性别**: 必填，只能是 male 或 female

### 2. 权限控制
- 所有接口需要用户登录认证
- 只能修改自己的用户信息
- 头像上传需要验证文件类型和大小

### 3. 文件上传限制
- **文件类型**: 仅支持 jpg, jpeg, png, gif
- **文件大小**: 最大 5MB
- **图片尺寸**: 建议 200x200 像素以上

## 📊 错误码说明

| 错误码 | 说明 | 处理建议 |
|--------|------|----------|
| 200 | 成功 | 正常处理 |
| 400 | 参数错误 | 检查请求参数格式 |
| 401 | 未授权 | 重新登录 |
| 403 | 禁止访问 | 检查用户权限 |
| 404 | 资源不存在 | 检查接口地址 |
| 500 | 服务器错误 | 联系技术支持 |

## 🧪 测试用例

### 测试用例1：获取用户信息
```bash
curl -X GET "http://localhost:8080/api/user/info" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### 测试用例2：更新用户信息
```bash
curl -X PUT "http://localhost:8080/api/user/update" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nickname": "测试昵称",
    "gender": "male"
  }'
```

### 测试用例3：上传头像
```bash
curl -X POST "http://localhost:8080/api/user/upload-avatar" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@avatar.jpg"
```

## 📝 实现优先级

### 🔥 高优先级（立即实现）
1. **获取用户信息** - 页面加载时获取当前用户信息
2. **更新用户信息** - 保存昵称和性别信息
3. **上传头像** - 头像上传和预览功能

### 🔶 中优先级（本周内完成）
1. **数据验证** - 完善输入验证逻辑
2. **头像裁剪** - 支持头像裁剪功能

### 🔵 低优先级（后续优化）
1. **多语言支持** - 性别选项多语言显示
2. **历史记录** - 保存修改历史

## 📞 技术支持

如果在实现过程中遇到问题，请：

1. **检查认证状态** - 确认用户登录状态和token有效性
2. **验证请求格式** - 检查请求参数和Content-Type
3. **查看错误日志** - 检查服务器日志获取详细错误信息
4. **联系前端团队** - 确认接口调用方式是否正确

---

**文档版本**: v1.0  
**创建时间**: 2025-01-27  
**最后更新**: 2025-01-27  
**负责人**: 后端开发团队 