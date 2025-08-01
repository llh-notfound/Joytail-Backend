# Joytail Backend

A Node.js and Redis-based backend API service for pet applications.

## Tech Stack

- Node.js
- Express.js
- Redis
- JWT Authentication
- Multer (File Upload)

## Project Structure

```
joytail-backend/
│
├── config/           # Configuration files
│   ├── redis.js      # Redis configuration
│   ├── jwt.js        # JWT configuration
│   └── api.js        # API configuration
│
├── controllers/      # Controllers
│   ├── userController.js
│   ├── petController.js
│   ├── orderController.js
│   ├── cartController.js
│   ├── addressController.js
│   ├── communityController.js
│   ├── insuranceController.js
│   ├── medicalController.js
│   └── ...
│
├── middleware/       # Middleware
│   ├── auth.js       # Authentication middleware
│   └── upload.js     # File upload middleware
│
├── routes/           # Routes
│   ├── userRoutes.js
│   ├── petRoutes.js
│   ├── orderRoutes.js
│   ├── cartRoutes.js
│   ├── addressRoutes.js
│   ├── communityRoutes.js
│   ├── insuranceRoutes.js
│   ├── medicalRoutes.js
│   └── ...
│
├── models/           # Data models
│   ├── User.js
│   ├── Pet.js
│   ├── Order.js
│   ├── Cart.js
│   ├── Address.js
│   └── ...
│
├── utils/            # Utility functions
│   ├── fileUpload.js # File upload utilities
│   └── smsService.js # SMS service utilities
│
├── public/           # Static files
│   ├── images/       # Image assets
│   ├── css/          # Stylesheets
│   └── icons/        # Icon files
│
├── docs/             # Documentation
│   ├── API documentation
│   ├── Development guides
│   └── Technical specifications
│
├── scripts/          # Utility scripts
│   └── setup-env.js  # Environment setup
│
├── uploads/          # Upload directory
├── app.js            # Application entry point
├── package.json      # Project dependencies
└── README.md         # This file
```

## Installation and Setup

### Prerequisites

- Node.js 14+
- Redis server

### Install Dependencies

```bash
npm install
```

### Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Redis Configuration
REDIS_URL=redis://default:q647bjz2@petpal-db-redis.ns-t2fco94u.svc:6379

# JWT Configuration
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRES_IN=7d

# File Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
```

### Start the Application

```bash
# Development mode
npm run dev

# Production mode
npm start

# Start with nodemon (if installed)
npm run watch
```

## API Documentation

Detailed API documentation is available in [petpal-api-documentation-en.md](petpal-api-documentation-en.md).

### Main API Endpoints

- User Management: `/api/user/*`
- Pet Management: `/api/pet/*`
- Product Management: `/api/goods/*`
- Shopping Cart: `/api/cart/*`
- Order Management: `/api/order/*`
- Address Management: `/api/address/*`
- Community: `/api/community/*`
- Insurance: `/api/insurance/*`
- Medical Services: `/api/medical/*`

## Database

The project uses Redis as the primary database. Connection string:

```
redis://default:q647bjz2@petpal-db-redis.ns-t2fco94u.svc:6379
```

## Authentication

The API uses JWT-based authentication. Most endpoints require a valid JWT token in the request header:

```
Authorization: Bearer <token>
```

## File Upload

The application supports file uploads for:
- User avatars
- Pet images
- Product images
- Community post images

Uploaded files are stored in the `uploads/` directory and served statically.

## Development

### Running Tests

```bash
# Run all tests
npm test

# Run specific test files
npm test -- test-file-name.js
```

### Code Style

The project follows standard JavaScript/Node.js conventions. Consider using ESLint for code linting:

```bash
npm install -g eslint
eslint .
```

## Deployment

### Docker Deployment

```bash
# Build Docker image
docker build -t joytail-backend .

# Run container
docker run -p 3000:3000 joytail-backend
```

### Environment Variables

Make sure to set the following environment variables in production:

- `NODE_ENV=production`
- `REDIS_URL` (your Redis connection string)
- `JWT_SECRET` (secure random string)
- `PORT` (application port)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License. 