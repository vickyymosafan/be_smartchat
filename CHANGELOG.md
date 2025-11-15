# Changelog

All notable changes to the Smartchat backend will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2025-11-15

### Fixed
- **History Loading Bug**: Fixed critical issue preventing chat history from loading
  - Corrected API field validation: now properly accepts `sessionId` field
  - Messages now saved with correct session ID references
  - Fixed session lookup and message retrieval logic

### Added
- **Diagnostic Script**: Added `scripts/fix-session-data.ts` for data analysis
  - Analyze session data and message counts
  - Detect mismatches between expected and actual message counts
  - Fix orphaned messages and incorrect session references
  - Run with `npm run fix-session-data` or `npm run fix-session-data -- --fix`

### Changed
- **Enhanced Logging**: Improved logging in `ChatService.getChatHistory`
  - Log user-facing sessionId and internal sessionId
  - Track message count expectations vs actual results
  - Better error tracking for debugging

### Technical Details
- Session lookup now properly maps user-facing sessionId to internal database ID
- Messages correctly reference Session.id (internal CUID) as foreign key
- Improved error handling and logging throughout session management

## [1.0.0] - 2025-11-10

### Added
- **Chat History API**: Complete CRUD operations for chat histories
  - Create chat history on first message
  - Get all chat histories with session data
  - Rename chat history
  - Delete chat history with cascade

- **Session Management**: Persistent session tracking
  - Create and manage user sessions
  - Track session activity and message counts
  - Session expiry management
  - IP address and user agent tracking

- **Message Storage**: Database persistence for chat messages
  - Store user and assistant messages
  - Link messages to sessions
  - Query messages by session
  - Ordered by creation time

- **Database Schema**: PostgreSQL with Prisma ORM
  - Session model with unique sessionId
  - Message model with role and content
  - ChatHistory model with title
  - Proper foreign key relationships and cascading deletes

- **API Endpoints**:
  - `POST /api/chat` - Send message and get AI response
  - `GET /api/chat/history/:sessionId` - Get chat history
  - `GET /api/chat/histories` - Get all chat histories
  - `POST /api/chat/histories` - Create chat history
  - `PATCH /api/chat/histories/:id` - Rename chat history
  - `DELETE /api/chat/histories/:id` - Delete chat history
  - `GET /api/health` - Health check endpoint

- **Middleware**:
  - CORS configuration for frontend origins
  - Rate limiting for API protection
  - Error handling with standardized responses
  - Request logging with Morgan

- **Infrastructure**:
  - Clean Architecture with layer separation
  - Repository pattern for database access
  - Service layer for business logic
  - HTTP client abstraction with retry logic
  - Centralized logging system

### Security
- Helmet.js for security headers
- CORS whitelist for allowed origins
- Rate limiting to prevent abuse
- Input validation with Zod schemas
- Environment variable validation

### Performance
- Prisma Accelerate for connection pooling
- Efficient database queries with indexes
- Optimized session and message retrieval
- Retry logic for n8n webhook calls

### Deployment
- Vercel serverless function support
- Environment-based configuration
- Database migration support
- Health check endpoint for monitoring
