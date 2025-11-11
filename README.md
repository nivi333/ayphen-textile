# Lavoro AI Ferri - Textile ERP System

Multi-tenant textile manufacturing ERP system built with Node.js, Express, TypeScript, React, and modern web technologies.

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 8.0.0
- PostgreSQL >= 13
- Redis >= 6.0

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd lavoro-ai-ferri
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Setup Husky pre-commit hooks**
   ```bash
   npm run prepare
   ```

### Development

1. **Start development server**
   ```bash
   npm run dev
   ```

2. **Build for production**
   ```bash
   npm run build
   ```

3. **Start production server**
   ```bash
   npm start
   ```

### Code Quality

- **Lint code**
  ```bash
  npm run lint
  npm run lint:fix
  ```

- **Format code**
  ```bash
  npm run format
  npm run format:check
  ```

- **Type checking**
  ```bash
  npm run type-check
  ```

### Testing

- **Run tests**
  ```bash
  npm test
  npm run test:watch
  npm run test:coverage
  ```

## 📁 Project Structure

```
src/
├── config/          # Configuration files
├── controllers/     # Route controllers
├── middleware/      # Express middleware
├── models/          # Database models
├── services/        # Business logic services
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
└── tests/           # Test files
```

## 🛠️ Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **Cache**: Redis
- **Authentication**: JWT
- **Validation**: Joi
- **Logging**: Winston
- **Testing**: Jest
- **Code Quality**: ESLint + Prettier + Husky

## 🔧 Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

- **Server**: PORT, HOST, NODE_ENV
- **Database**: DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
- **Redis**: REDIS_HOST, REDIS_PORT, REDIS_PASSWORD
- **JWT**: JWT_SECRET, JWT_REFRESH_SECRET
- **CORS**: CORS_ORIGIN, CORS_CREDENTIALS

### Multi-Tenant Architecture

The application uses schema-per-tenant architecture:
- Each company gets its own database schema
- Complete data isolation between tenants
- Shared user table with tenant relationships

## 📚 API Documentation

API documentation is available at `/api-docs` when running in development mode.

## 🔒 Security Features

- JWT authentication with refresh tokens
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation with Joi
- SQL injection prevention
- XSS protection

## 🧪 Testing Strategy

- Unit tests for services and utilities
- Integration tests for API endpoints
- Test coverage reporting
- Automated testing in CI/CD

## 📈 Performance

- Connection pooling for database
- Redis caching for sessions
- Compression middleware
- Optimized database queries
- Horizontal scaling support

## 🚀 Deployment

### Docker

```bash
# Build image
docker build -t lavoro-ai-ferri .

# Run container
docker run -p 3000:3000 lavoro-ai-ferri
```

### Production Checklist

- [ ] Set NODE_ENV=production
- [ ] Configure production database
- [ ] Set secure JWT secrets
- [ ] Enable SSL/HTTPS
- [ ] Configure logging
- [ ] Set up monitoring
- [ ] Configure backups

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Lavoro AI Ferri** - Transforming textile manufacturing with modern technology.
