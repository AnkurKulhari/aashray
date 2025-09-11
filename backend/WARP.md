# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

**Aashray** is a comprehensive student mental health app backend built with Node.js, Express, and MongoDB. The API provides mental health tracking, goal management, community support, and gamification features specifically designed for university students.

## Development Commands

### Essential Development Commands
- `npm run dev` - Start development server with nodemon (auto-reload)
- `npm start` - Start production server
- `npm run build` - Build project using Babel (compiles src/ to dist/)
- `npm test` - Run Jest tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report

### Code Quality Commands
- `npm run lint` - Run ESLint on src/ directory
- `npm run lint:fix` - Auto-fix ESLint issues

### Database Operations
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed database with initial data
- `npm run seed:achievements` - Seed achievements data specifically

### Single Test Execution
Run individual test files: `npx jest <test-file-path>` or `npm test -- --testNamePattern="<test-name>"`

## Architecture Overview

### Core Components

**Models & Database Schema:**
- **User**: Comprehensive user profiles with mental health history, privacy settings, gamification data, and AI insights
- **MoodEntry**: Detailed mood tracking with emotional dimensions, contextual data, triggers, and AI analysis
- **Goal**: SMART goals with progress tracking, milestones, streaks, and community sharing capabilities
- **Achievement**: Gamification system with requirements, rewards, rarity levels, and series progression
- **Community**: Social features for peer support and discussion
- **Resource**: Mental health resources and educational content

**Authentication & Security:**
- JWT-based authentication with refresh tokens
- Role-based access control via `protect` and `restrictTo` middleware
- Comprehensive password management (reset, update, verification)
- Rate limiting and security middleware (helmet, mongo-sanitize)

**API Architecture:**
- RESTful API design following `/api/v1/<resource>` pattern
- Consistent error handling with status/message format
- Middleware chain: security → rate limiting → CORS → body parsing → routes
- Comprehensive validation using express-validator and Joi

### Key Features

**Mental Health Core:**
- Mood tracking with circumplex emotional model (valence/arousal)
- SMART goal setting with progress tracking and milestone rewards
- Crisis management with safety plans and risk assessment
- AI-powered insights and pattern recognition

**Gamification System:**
- Points, levels, and achievements to encourage engagement
- Streak tracking for consistency motivation  
- Leaderboards and social comparison features
- Achievement categories: mood_tracking, goal_achievement, community_engagement, etc.

**Community Support:**
- Anonymous posting with peer matching
- Helpful comment marking system
- Crisis support and peer assistance
- Privacy controls and moderation

## Environment Setup

### Required Environment Variables
Copy `.env.example` to `.env` and configure:
- `DATABASE_URL` - MongoDB connection string (default: `mongodb://localhost:27017/aashray-dev`)
- `JWT_SECRET` - JWT signing secret 
- `JWT_REFRESH_SECRET` - Refresh token secret
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment mode (development/production)

### Optional External Services
- **OpenAI**: `OPENAI_API_KEY` for AI-powered insights
- **Cloudinary**: Image upload and storage
- **Twilio**: SMS notifications and crisis alerts
- **Email SMTP**: User notifications and verification

## Database Considerations

### MongoDB Connection
- Uses Mongoose ODM with automatic indexing enabled
- Connection handled in `src/config/db.js`
- Supports connection retry and graceful error handling

### Data Seeding
- Achievement data seeding via `npm run seed:achievements`
- Comprehensive achievement system with 15+ predefined achievements
- Database migrations supported through `npm run migrate`

### Indexes & Performance
- Strategic indexes on User (email, university, points, risk score)
- MoodEntry compound indexes for trend analysis
- Achievement and Goal indexes for gamification queries

## API Patterns

### Standard Response Format
```javascript
{
  "status": "success|error",
  "message": "Description",
  "data": { ... },
  "token": "jwt-token" // for auth endpoints
}
```

### Route Protection Pattern
All major routes use `protect` middleware requiring valid JWT authentication:
```javascript
router.use(protect); // Protects all routes below
```

### Validation Pattern
Input validation using dedicated middleware:
```javascript
router.post('/endpoint', validateMiddleware, controller);
```

## Testing Strategy

### Test Structure
- Jest configuration in `package.json`
- Test setup file: `tests/setup.js`
- Coverage collection from `src/**/*.js` excluding config and scripts
- MongoDB Memory Server for test database isolation

### Coverage Targets
- Excludes: `src/index.js`, `src/config/**`, `src/scripts/**`
- Focus on controllers, models, and middleware testing

## Development Best Practices

### Code Organization
- **Controllers**: Business logic and request handling
- **Models**: Database schemas with virtuals and methods
- **Routes**: Endpoint definitions with middleware chains  
- **Middleware**: Authentication, validation, and security
- **Scripts**: Database utilities and seeding

### Error Handling
- Global error handler in main app file
- Consistent error response format
- Environment-aware error details (stack traces in development only)

### Security Implementation
- Helmet for security headers
- MongoDB sanitization against injection
- Rate limiting per endpoint group
- CORS with configurable allowed origins
- Cookie-based and Bearer token authentication support

### Mental Health Considerations
- Crisis detection through mood patterns and triggers
- Risk assessment algorithms with configurable thresholds
- Emergency contact system and safety plan management
- Privacy-first design with granular sharing controls

This backend serves as a comprehensive foundation for student mental health applications, emphasizing data privacy, clinical best practices, and engaging user experiences through gamification.
