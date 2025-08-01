# Backend

## 1. Proof of Concept

### 1.1 Backend
In the backend proof-of-concept of the pet one-stop platform-PetPal project, the technology selection is centered around the core framework, data management, and API architecture design.

#### 1.1.1 Core Framework
First of all, we identified the core framework of PetPal backend as Node.js and Express.js.
Node.js is the most efficient and widely adopted server-side JavaScript runtime, and its event-driven, non-blocking I/O model dramatically enhances the handling capability of concurrent requests, which is particularly suitable for PetPal's high-concurrency pet community and e-commerce scenarios. With Node.js's rich ecosystem, PetPal can leverage numerous mature middleware and libraries to accelerate development efficiency. The asynchronous programming model allows the backend to handle multiple user requests simultaneously without blocking, ensuring excellent performance under high load conditions.

Express.js's advantage lies in its lightweight and flexible web application framework. Thanks to its minimal core architecture and extensive middleware ecosystem, PetPal can quickly build RESTful APIs while maintaining code clarity and maintainability. Express.js provides robust routing mechanisms, middleware support, and template engines, which enable PetPal to flexibly handle different business scenarios and data processing requirements. The framework's simplicity allows the development team to focus on business logic implementation rather than underlying infrastructure concerns.

In terms of compatibility, Express.js integrates seamlessly with Node.js and supports modern JavaScript features including async/await, ES6 modules, and Promise-based operations, allowing the team to write clean and maintainable code.

#### 1.1.2 Data Management and Storage Architecture
In terms of data management, PetPal adopts a Redis-centric storage strategy combined with JWT-based authentication system.
Redis serves as the primary data storage solution, providing both caching and persistent data storage capabilities. Through Redis's versatile data structures (strings, hashes, sets, lists, sorted sets), the team implemented efficient data modeling for complex business scenarios such as user sessions, shopping carts, community posts, and real-time interactions. Redis's atomic operations ensure data consistency in concurrent environments, while its pub/sub functionality supports real-time features like community notifications and chat systems.

For authentication and authorization, PetPal fully adopts JWT (JSON Web Tokens) as the security mechanism. Through stateless token design, the system achieves horizontal scalability while maintaining secure user sessions. Each JWT contains encrypted user information and expiration timestamps, eliminating the need for server-side session storage and reducing memory overhead. The middleware-based authentication system provides flexible permission control, enabling fine-grained access control for different API endpoints and user roles.

Finally, to ensure data reliability and performance optimization, PetPal implements a comprehensive caching strategy using Redis. Key-value caching for frequently accessed data like user profiles, pet information, and product catalogs significantly reduces response times. The system also employs cache invalidation strategies and TTL (Time-To-Live) settings to maintain data freshness while maximizing performance benefits.

## 2. Design and Construction of Your System

### 2.1 Backend

#### 2.1.1 Backend Architecture Structure

##### 1. System Architecture
PetPal backend is organized into a layered architecture following the MVC (Model-View-Controller) pattern with clear separation of concerns. The system consists of six primary layers: routing layer for request handling, controller layer for business logic coordination, service layer for core business operations, data access layer for Redis interactions, middleware layer for cross-cutting concerns, and utility layer for common functionalities. This architecture ensures maintainability, testability, and scalability while providing clear boundaries between different system components.

##### 2. API Design and Routing
PetPal adopts RESTful API design principles with Express.js router mechanism to achieve centralized route management. All API endpoints follow the `/api/{module}/{action}` pattern, where module represents business domains like user, pet, goods, community, etc. The routing system distinguishes between public endpoints (accessible without authentication) and protected endpoints (requiring JWT token verification). For API versioning, the system reserves the capability to support `/api/v1/` prefixes for future version management. The router configuration supports HTTP methods (GET, POST, PUT, DELETE) mapped to CRUD operations, enabling intuitive and predictable API interactions.

#### 2.1.2 Detailed Structure of Each Business Module

##### 1. User Management Module
The User Management module (userController.js) implements comprehensive user lifecycle management including registration, authentication, profile management, and session handling. The registration system supports both username/password and phone/verification code methods, with bcrypt-based password hashing for security. The authentication system utilizes JWT tokens with 24-hour expiration and automatic refresh mechanisms. User profile management includes avatar upload functionality through Multer middleware, supporting multiple image formats and automatic file processing. The module also handles user preferences, notification settings, and account verification workflows.

##### 2. Pet Information Management Module  
Pet Information Management module (petController.js) provides complete pet profile management capabilities for users to register, update, and maintain their pets' information. The system supports multiple pets per user with detailed profiles including basic information (name, breed, age, gender), health records, vaccination history, and photo galleries. Health record management allows users to track medical appointments, treatments, and veterinary visits with attachment support for medical documents. The vaccination tracking system maintains immunization schedules and sends reminder notifications. All pet data is stored in Redis using hash structures for efficient retrieval and user-specific access control ensures data privacy.

##### 3. Product and E-commerce Module
The Product and E-commerce module encompasses goods management (goodsController.js), shopping cart operations (cartController.js), and order processing (orderController.js). The goods system supports product catalogs with categories, filtering, search functionality, and inventory management. Product details include images, descriptions, specifications, pricing, and user reviews. The shopping cart module provides real-time cart management with item addition/removal, quantity updates, and price calculations. Order processing handles the complete e-commerce workflow from cart checkout to payment integration, order tracking, and fulfillment status updates. The system supports multiple payment methods and includes order history management.

##### 4. Address Management Module
Address Management module (addressController.js) handles user delivery addresses with comprehensive CRUD operations. Users can maintain multiple addresses with detailed information including recipient name, phone number, detailed address components (province, city, district, street address), and postal codes. The system supports default address selection for streamlined checkout processes and validates address formats to ensure delivery accuracy. Address data is organized using Redis lists and hash structures for efficient storage and retrieval, with user-specific access controls.

##### 5. Community Interaction Module
Community Interaction module (communityController.js) powers the social features of PetPal with comprehensive content management and user engagement capabilities. The posting system supports rich content creation including text, images (up to 9 photos), and hashtag tagging. Content discovery features include timeline feeds, category-based filtering, search functionality, and recommendation algorithms. Social interaction features encompass likes, comments, shares, and bookmark functionality with real-time updates. The comment system supports threaded discussions and moderation capabilities. User-generated content management includes personal post history, draft saving, and content editing capabilities.

##### 6. Medical Services Module
Medical Services module (medicalController.js) provides healthcare-related functionalities including hospital directory, appointment scheduling, and veterinary consultation services. The hospital directory maintains comprehensive listings with detailed information including services offered, location data, contact information, and user reviews. The consultation system (consultController.js) enables real-time chat functionality between pet owners and veterinarians, supporting text messages, image sharing, and session management. Appointment scheduling integrates with hospital availability and sends confirmation notifications to users.

##### 7. Insurance Services Module
Insurance Services module (insuranceController.js) offers pet insurance product browsing, comparison, and application facilitation. The system maintains insurance product catalogs with detailed coverage information, pricing structures, and eligibility requirements. Users can compare different insurance options, calculate premiums based on pet characteristics, and initiate application processes. The module provides educational content about pet insurance and maintains user insurance history and claims tracking.

##### 8. Points and Rewards Module  
Points and Rewards module (pointsRoutes.js, accountController.js) implements a comprehensive loyalty program with point accumulation, redemption, and reward management. Users earn points through various activities including purchases, community participation, referrals, and app engagement. The redemption system offers diverse reward options including discounts, products, and premium services. Point history tracking provides transparency and analytics for user engagement patterns.

##### 9. Feedback and Support Module
Feedback and Support module (feedbackController.js) handles user communications including issue reporting, feature requests, and customer support inquiries. The system categorizes feedback types, tracks resolution status, and maintains communication history. Integration with customer support workflows ensures timely response and issue resolution.

##### 10. Common Services Module
Common Services module (commonRoutes.js) provides shared functionalities including file upload services, notification management, and system configuration endpoints. The file upload system supports multiple file types with automatic processing, thumbnail generation, and CDN integration. Notification services handle push notifications, email communications, and in-app messaging.

##### 11. Authentication and Security Infrastructure
The authentication and security infrastructure (middleware/auth.js) provides comprehensive security measures including JWT token validation, role-based access control, rate limiting, and input sanitization. The middleware system automatically validates tokens for protected endpoints, manages user sessions, and implements security headers. Rate limiting prevents abuse and ensures system stability under load.

##### 12. Data Access and Caching Layer
The data access layer (config/redis.js) manages all database interactions with Redis, implementing connection pooling, error handling, and data serialization. The caching strategy employs multiple cache layers including frequently accessed user data, product catalogs, and session information. Cache invalidation policies ensure data consistency while maximizing performance benefits. The system implements automatic failover mechanisms and data backup strategies to ensure reliability and data durability.

## 3. Technical Learning Summary

在这个项目中，我深入学习了现代后端系统的设计与实现。在架构设计方面，我掌握了如何构建一个基于MVC模式的分层架构系统。通过实践，我理解了如何将复杂的系统需求拆分成清晰的层级结构，包括路由层、控制器层、服务层和数据访问层。在API设计中，我严格遵循RESTful原则，实现了直观且易于维护的接口设计。这种架构设计不仅确保了系统的可扩展性，还为后续的功能迭代提供了坚实的基础。

在核心技术栈的应用上，我深入掌握了Node.js和Express.js框架的使用。通过Express.js，我实现了强大的路由系统和中间件机制，有效处理了跨域请求、请求验证、错误处理等横切关注点。在用户认证方面，我采用了基于JWT的认证机制，实现了安全可靠的用户会话管理。同时，我还实现了包括速率限制和输入验证在内的多层安全防护机制，有效保障了系统的安全性。

在数据管理领域，我深入学习了Redis的高级应用。我设计了高效的数据模型，充分利用Redis的各种数据结构来优化数据存储和查询性能。通过实现多层缓存策略，我显著提升了系统的响应速度。在数据一致性方面，我实现了可靠的缓存失效机制和数据备份策略。通过合理的连接池管理和错误处理机制，我确保了系统在高并发场景下的稳定性。

在系统集成方面，我学会了如何设计和实现可靠的模块间通信机制。通过统一的错误处理和日志记录系统，我能够有效监控和调试系统运行状态。在性能优化方面，我实施了多项措施，包括查询优化、缓存策略优化和负载均衡等。这些实践不仅提升了系统性能，还确保了系统的可维护性和可扩展性。

通过这个项目，我不仅掌握了各项具体的技术，更重要的是学会了如何将这些技术有机地结合起来，构建一个完整的、高性能的后端系统。这些经验为我今后进行更复杂的系统设计和开发工作打下了坚实的基础。
