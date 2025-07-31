# AI绘图工具专用提示词库

## 🎨 Midjourney 专用提示词

### 1. JWT认证流程图
```
Create a professional JWT authentication flow diagram, technical documentation style, --ar 16:9 --v 6

Main elements:
- Top row: User Login → Password Verification → JWT Generation → Token Return (blue gradient boxes)
- Bottom row: Subsequent Request → Token Validation → User Info Extraction → Permission Check → Business Processing (orange gradient boxes)
- Curved arrow connecting "Token Return" to "Subsequent Request"
- Modern UI design, flat style, clear directional arrows
- Color scheme: #2E86AB blue, #A23B72 purple, #F18F01 orange
- White background, rounded rectangles, subtle shadows
- Chinese labels in clean sans-serif font
- Professional technical documentation aesthetic
- Clean lines, proper spacing, enterprise-grade design
--s 750 --q 2
```

### 2. Redis数据结构图
```
Professional Redis data structure application diagram, 2x2 grid layout, technical infographic style, --ar 4:3 --v 6

Four quadrants showing:
- Top left: Hash structure (red theme #ff6b6b) - user:123 with id, name, email, role fields
- Top right: List structure (teal theme #4ecdc4) - cart:123 with 3 shopping items
- Bottom left: Set structure (blue theme #45b7d1) - post:456:likes with 3 user likes
- Bottom right: String structure (green theme #96ceb4) - token:xyz with JWT content
Each structure shows title, key name, and specific data examples
Modern flat design, rounded rectangles, clear data hierarchy
Clean typography, professional color palette, enterprise documentation style
Chinese text labels, technical diagram aesthetic
--s 750 --q 2
```

### 3. 系统架构数据流图
```
Modern system architecture data flow diagram, three-layer design, --ar 16:9 --v 6

Three main layers (left to right):
- Client layer (light blue #e1f5fe): Web app, Mobile app, Admin panel
- API layer (light orange #fff3e0): Express.js with routing, business logic, validation, auth
- Redis layer (light green #e8f5e8): User data, Business data, Cache data, Session data
Bidirectional arrows between layers with labels
HTTP requests/JSON responses and Redis commands/data access annotations
Flat design, rounded rectangles, modern color scheme
Professional technical architecture style
Clean hierarchy, proper spacing, enterprise-grade visualization
Chinese labels, technical documentation aesthetic
--s 750 --q 2
```

---

## 🖼️ DALL-E 3 专用提示词

### 1. JWT认证流程图
```
Create a professional technical diagram showing JWT authentication flow. The image should have a clean, modern design with:

Layout: Two horizontal rows of connected process boxes
Top row (4 boxes): "用户登录" → "密码验证" → "JWT生成" → "Token返回"
Bottom row (5 boxes): "后续请求" → "Token验证" → "用户信息提取" → "权限检查" → "业务处理"
A curved arrow connects from "Token返回" down to "后续请求"

Visual style:
- Rounded rectangle boxes with subtle shadows
- Blue color scheme (#2E86AB) for login phase
- Orange color scheme (#F18F01) for validation phase  
- White background
- Clear directional arrows between steps
- Chinese text in clean, readable font
- Professional technical documentation appearance
- Flat design with good contrast
- 16:9 aspect ratio
```

### 2. Redis数据结构图
```
Design a professional technical infographic showing Redis data structures in a 2x2 grid layout:

Top left: Hash structure (red theme)
- Title: "Hash 结构 - 用户信息"
- Shows key "user:123" containing fields: id, name, email, role
- Rounded rectangle with nested field boxes

Top right: List structure (teal theme)  
- Title: "List 结构 - 购物车"
- Shows key "cart:123" containing ordered items: 宠物食品, 玩具球, 牵引绳
- List visualization with index numbers

Bottom left: Set structure (blue theme)
- Title: "Set 结构 - 点赞用户"  
- Shows key "post:456:likes" containing unique users: user1, user2, user3
- Circular arrangement showing set uniqueness

Bottom right: String structure (green theme)
- Title: "String 结构 - JWT Token"
- Shows key "token:xyz" containing JWT string value
- Simple key-value representation

Visual requirements:
- Modern flat design with subtle gradients
- Color scheme: Hash #ff6b6b, List #4ecdc4, Set #45b7d1, String #96ceb4
- Clean typography with Chinese labels
- Professional technical documentation style
- White background with proper spacing
- Clear data hierarchy visualization
```

### 3. 系统架构数据流图
```
Create a modern system architecture diagram showing data flow between three layers:

Left layer - Client Layer (light blue background):
- Large rounded rectangle containing three smaller boxes
- Title: "客户端 Client"
- Sub-components: "Web应用", "移动应用", "管理后台"

Center layer - API Layer (light orange background):
- Large rounded rectangle with four sub-components
- Title: "API服务器 Express.js"  
- Sub-components: "路由处理", "业务逻辑", "数据验证", "认证授权"

Right layer - Redis Layer (light green background):
- Large rounded rectangle with four data types
- Title: "Redis数据库 Memory Store"
- Sub-components: "用户数据", "业务数据", "缓存数据", "会话数据"

Visual elements:
- Thick bidirectional arrows between layers
- Arrow labels: "HTTP请求/JSON响应" and "Redis命令/数据存取"
- Color scheme: Client #e1f5fe, API #fff3e0, Redis #e8f5e8
- Modern flat design with rounded corners
- Professional technical architecture style
- Clean hierarchy and proper spacing
- Chinese labels in readable font
- 16:9 aspect ratio for presentation use
```

---

## 🎯 Stable Diffusion 专用提示词

### 通用设置
```
Model: SDXL or SD 1.5
Sampling method: DPM++ 2M Karras
Steps: 20-30
CFG Scale: 7-9
Negative prompt: blurry, low quality, distorted text, messy layout, cluttered, unprofessional
```

### 1. JWT认证流程图
```
Positive prompt:
professional technical diagram, JWT authentication flow chart, clean modern design, two rows of connected process boxes, blue and orange color scheme, rounded rectangles, directional arrows, Chinese text labels, flat design, white background, technical documentation style, high quality, clean typography, enterprise design, 8k resolution

Negative prompt:
blurry, low quality, messy, cluttered, unprofessional, distorted text, cartoon style, overly decorative, complex patterns, unnecessary elements
```

### 2. Redis数据结构图
```
Positive prompt:
technical infographic, Redis data structures, 2x2 grid layout, four colored sections showing Hash List Set String, rounded rectangles, modern flat design, clean typography, Chinese labels, professional documentation style, color coding red teal blue green, white background, clear hierarchy, 8k resolution

Negative prompt:
blurry, messy layout, poor contrast, illegible text, cluttered design, unprofessional appearance, cartoon style, overly complex, unnecessary decorations
```

### 3. 系统架构数据流图
```
Positive prompt:
system architecture diagram, three layer design, client API Redis layers, bidirectional arrows, data flow visualization, modern flat design, light blue orange green color scheme, professional technical style, Chinese labels, clean layout, enterprise documentation, 8k resolution

Negative prompt:
blurry, messy, unprofessional, cluttered, poor typography, distorted layout, cartoon style, overly decorative, unclear hierarchy, low quality
```

---

## 📝 通用优化技巧

### 🎨 色彩搭配建议
- **主色调**：#2E86AB (专业蓝)
- **辅助色**：#A23B72 (深紫)，#F18F01 (活力橙)
- **数据色**：#ff6b6b (红)，#4ecdc4 (青)，#45b7d1 (蓝)，#96ceb4 (绿)
- **背景色**：#ffffff (纯白)，#f8f9fa (浅灰)

### 📐 布局原则
1. **黄金比例**：采用16:9或4:3的标准比例
2. **留白原则**：保持适当的边距和间距
3. **对齐原则**：所有元素保持统一对齐
4. **层次原则**：通过颜色和大小建立视觉层次

### 🔤 字体建议
- **中文**：微软雅黑、思源黑体
- **英文**：Roboto、Open Sans、Helvetica
- **等宽字体**：Source Code Pro、Monaco (用于代码)

### 💡 提示词优化
1. **具体描述**：详细说明颜色、布局、风格
2. **技术术语**：使用"technical diagram"、"professional"等关键词
3. **质量要求**：添加"8k"、"high quality"、"clean"等词汇
4. **排除干扰**：使用negative prompt排除不需要的元素

---

*这些提示词已经过优化，可以直接在各种AI绘图工具中使用。建议根据具体需求微调参数和描述。*
