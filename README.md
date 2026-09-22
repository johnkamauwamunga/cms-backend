# ALI CMS

## Technical System Architecture & Engineering Specification

**Project Type:** Personal Portfolio & Content Management System
**Architecture:** Full-stack Web Application
**Backend:** Node.js + TypeScript + Express
**Frontend:** React + TypeScript
**Database:** PostgreSQL
**ORM:** Prisma 6.19.0
**Authentication:** JWT + Google OAuth
**Caching / Queues:** Redis + BullMQ
**File Storage:** Local storage initially, S3-compatible storage later
**Server:** IONOS VPS
**Reverse Proxy:** Nginx
**Process Management:** PM2
**Containerization:** Docker
**CI/CD:** GitHub Actions
**API Style:** REST API

---

# 1. System Overview

ALI CMS is a full-stack personal portfolio and content management platform.

The system provides two primary experiences:

1. **Public portfolio website**
2. **Private administration dashboard**

The public website displays information such as:

* Personal profile
* Banner
* Interests
* Skills
* Education
* Professional experience
* Certifications
* Projects
* CV
* Contact information

The administrator can authenticate into the CMS and manage the content displayed on the public website.

The fundamental design principle is that **the frontend does not hardcode portfolio content**.

Instead:

```text
Database
    ↓
Backend API
    ↓
Frontend
    ↓
Public Website
```

This means portfolio information can be changed from the administration dashboard without modifying or redeploying the frontend.

---

# 2. High-Level Architecture

The system follows a layered full-stack architecture.

```text
                         INTERNET
                            │
                            ▼
                    ┌───────────────┐
                    │    NGINX      │
                    │ Reverse Proxy │
                    └───────┬───────┘
                            │
              ┌─────────────┴─────────────┐
              │                           │
              ▼                           ▼
       React Frontend                Express API
              │                           │
              │                           ▼
              │                       Services
              │                           │
              │                           ▼
              │                      Repositories
              │                           │
              │                           ▼
              │                         Prisma
              │                           │
              │                           ▼
              │                       PostgreSQL
              │
              │
              └──────────────┐
                             │
                             ▼
                         Public UI


                    Background Processing
                             │
                             ▼
                          Redis
                             │
                             ▼
                          BullMQ
                             │
                ┌────────────┴────────────┐
                ▼                         ▼
          Email Worker               CV Worker
```

---

# 3. Application Components

The system consists of several major components.

## 3.1 Frontend

The frontend is responsible for:

* Rendering the public portfolio
* Rendering the administration dashboard
* Sending API requests
* Managing authentication state
* Handling forms
* Uploading files
* Displaying portfolio content
* Managing administrative CRUD operations

Recommended stack:

```text
React
TypeScript
Vite
React Router
Axios
```

The frontend does not directly communicate with PostgreSQL.

Instead:

```text
React
   ↓
HTTP/REST
   ↓
Express API
   ↓
Prisma
   ↓
PostgreSQL
```

---

# 4. Public Website

The public section is accessible without authentication.

Possible pages include:

```text
/
├── Home
├── About
├── Experience
├── Education
├── Projects
├── Certifications
├── Skills
├── Interests
├── CV
└── Contact
```

The frontend retrieves content through public API endpoints.

Example:

```http
GET /api/public/profile
```

```http
GET /api/public/projects
```

```http
GET /api/public/experience
```

```http
GET /api/public/certifications
```

Only published content should be returned.

For example:

```text
GET /api/public/projects
        ↓
Project Service
        ↓
Prisma
        ↓
WHERE isPublished = true
        ↓
Response
```

This prevents draft or private content from accidentally appearing on the public website.

---

# 5. Administration Dashboard

The administration dashboard is a protected application area.

Example:

```text
/admin
/admin/profile
/admin/projects
/admin/experience
/admin/education
/admin/certifications
/admin/skills
/admin/interests
/admin/cv
/admin/uploads
```

The administrator can:

* Create content
* Edit content
* Delete content
* Publish content
* Unpublish content
* Reorder content
* Upload images
* Manage CV versions
* Review contact messages

Administrative requests require authentication.

Example:

```http
POST /api/projects
Authorization: Bearer <access_token>
```

---

# 6. Backend Architecture

The backend is built using:

```text
Node.js
TypeScript
Express
Prisma
PostgreSQL
```

The backend follows a modular architecture.

```text
src/
├── config/
├── modules/
├── middleware/
├── errors/
├── lib/
├── queues/
├── workers/
├── routes/
├── app.ts
└── server.ts
```

---

# 7. Backend Request Lifecycle

A typical request follows this pipeline:

```text
HTTP Request
     ↓
Express
     ↓
Request ID Middleware
     ↓
Request Logger
     ↓
Authentication
     ↓
Authorization
     ↓
Validation
     ↓
Controller
     ↓
Service
     ↓
Repository
     ↓
Prisma
     ↓
PostgreSQL
     ↓
Repository
     ↓
Service
     ↓
Controller
     ↓
HTTP Response
```

Each layer has a specific responsibility.

---

# 8. Controllers

Controllers are responsible for HTTP concerns.

For example:

```text
auth.controller.ts
project.controller.ts
profile.controller.ts
cv.controller.ts
```

A controller should:

* Read the request
* Validate input
* Call the appropriate service
* Return the HTTP response

Controllers should not contain large amounts of business logic.

Example:

```text
Request
   ↓
Controller
   ↓
authService.login()
   ↓
Response
```

---

# 9. Services

Services contain business logic.

For example:

```text
auth.service.ts
project.service.ts
cv.service.ts
upload.service.ts
```

The service layer determines what the application should actually do.

Example:

```text
Login Service

1. Find user
2. Verify password
3. Check account status
4. Generate tokens
5. Store refresh-token hash
6. Return authentication result
```

---

# 10. Repository Layer

The repository layer isolates database access.

Example:

```text
auth.repository.ts
project.repository.ts
```

Instead of allowing services to contain raw database logic everywhere:

```text
Service
   ↓
Repository
   ↓
Prisma
```

This improves separation of concerns and makes testing easier.

---

# 11. Prisma and PostgreSQL

PostgreSQL is the primary persistent database.

Prisma provides the application's database abstraction.

```text
Express
   ↓
Service
   ↓
Repository
   ↓
Prisma Client
   ↓
PostgreSQL
```

The database contains entities such as:

```text
users
accounts
refresh_tokens
profiles
interests
certifications
experiences
education
projects
project_images
skills
files
cvs
contact_messages
```

---

# 12. User Model

The `User` represents an internal application identity.

Important fields include:

```text
id
email
passwordHash
role
isActive
createdAt
updatedAt
```

The user identity is independent from the authentication provider.

This is important because the same person may authenticate through:

```text
Email + Password
```

or:

```text
Google
```

but should still correspond to one internal user.

---

# 13. Authentication Architecture

ALI CMS supports two authentication mechanisms.

```text
                 Authentication
                       │
             ┌─────────┴─────────┐
             │                   │
             ▼                   ▼
      Email/Password          Google OAuth
             │                   │
             └─────────┬─────────┘
                       ▼
                     User
                       │
                       ▼
                    JWT
```

---

# 14. Local Authentication

Registration:

```text
POST /api/auth/register
```

Process:

```text
Email + Password
       ↓
Zod validation
       ↓
Check existing user
       ↓
bcrypt password hashing
       ↓
Create User
       ↓
Generate JWT tokens
       ↓
Return authentication response
```

Passwords are never stored as plaintext.

Instead:

```text
Password
   ↓
bcrypt
   ↓
Password Hash
   ↓
PostgreSQL
```

---

# 15. Login

Login endpoint:

```text
POST /api/auth/login
```

Process:

```text
Email + Password
       ↓
Find User
       ↓
Check account status
       ↓
bcrypt.compare()
       ↓
Valid?
   ┌───┴───┐
   │       │
  YES      NO
   │       │
   ▼       ▼
Generate   Authentication
JWTs       Error
```

---

# 16. JWT Authentication

The system uses two JWT concepts.

## Access Token

Short-lived token used for API authorization.

Example lifetime:

```text
15 minutes
```

Example payload:

```json
{
  "sub": "user-id",
  "role": "ADMIN",
  "type": "access"
}
```

The token is sent using:

```http
Authorization: Bearer <access_token>
```

---

# 17. Refresh Tokens

Access tokens are intentionally short-lived.

When the access token expires, the client can use a refresh token to obtain another access token.

Example lifetime:

```text
7 days
```

The raw refresh token is not stored in PostgreSQL.

Instead:

```text
Refresh Token
      ↓
SHA-256
      ↓
Hash
      ↓
Database
```

The database stores:

```text
tokenHash
userId
expiresAt
revokedAt
```

This allows refresh tokens to be revoked.

---

# 18. JWT Request Flow

Protected request:

```text
Client
  │
  │ Authorization: Bearer JWT
  ▼
Express
  │
  ▼
Authentication Middleware
  │
  ▼
Verify JWT
  │
  ├── Invalid → 401
  │
  └── Valid
       │
       ▼
    req.user
       │
       ▼
Authorization Middleware
       │
       ├── Not allowed → 403
       │
       └── Allowed
              │
              ▼
          Controller
```

---

# 19. Authorization

Authentication answers:

> Who are you?

Authorization answers:

> What are you allowed to do?

The system has roles such as:

```text
ADMIN
USER
```

For example:

```text
GET /api/public/projects
```

requires no authentication.

But:

```text
POST /api/projects
```

requires an authenticated administrator.

---

# 20. Google OAuth

Google OAuth will be implemented as a separate authentication provider.

The flow is:

```text
User
 ↓
Google Login
 ↓
Google
 ↓
Google authenticates user
 ↓
Google callback
 ↓
Backend verifies identity
 ↓
Find Google Account
 ↓
Find/Create internal User
 ↓
Issue ALI CMS JWT
```

The important identity model is:

```text
Google Account
       │
       │ userId
       ▼
     User
       │
       ├── Profile
       ├── Refresh Tokens
       └── Application permissions
```

Google authentication therefore does not bypass the application's own authorization system.

---

# 21. Authentication Harmonization

The system must prevent duplicate identities.

For example, suppose:

```text
User:
khalif@example.com
```

already exists using password authentication.

Later, the same verified email is used to authenticate through Google.

The backend should attempt to associate the Google identity with the existing internal user rather than blindly creating another user.

Conceptually:

```text
                    User
                     │
              ┌──────┴──────┐
              │             │
           Local          Google
          Account         Account
```

This provides a unified identity model.

---

# 22. Error Handling

The application uses a centralized error architecture.

```text
src/errors/
├── app-error.ts
├── authentication.error.ts
├── authorization.error.ts
├── conflict.error.ts
├── not-found.error.ts
└── validation.error.ts
```

Instead of scattering HTTP responses throughout services:

```text
Service
   ↓
throw AppError
   ↓
Error Middleware
   ↓
Standard Response
```

Example:

```json
{
  "success": false,
  "error": {
    "code": "AUTHENTICATION_ERROR",
    "message": "Invalid email or password"
  },
  "requestId": "..."
}
```

The request ID makes debugging individual requests easier.

---

# 23. Logging

The backend uses Pino for structured logging.

```text
Request
   ↓
Request ID
   ↓
Pino Logger
   ↓
Application Logs
```

Logs can contain:

```text
timestamp
level
service
requestId
HTTP method
path
status code
duration
error
```

Example:

```json
{
  "level": "info",
  "service": "ali-cms-api",
  "requestId": "abc-123",
  "msg": "User logged in"
}
```

Sensitive information such as passwords, JWTs, and secrets must never be logged.

---

# 24. Content Management

The CMS manages multiple content modules.

```text
Profile
Interests
Certifications
Experience
Education
Projects
Skills
CV
```

Most content entities contain:

```text
id
displayOrder
isPublished
createdAt
updatedAt
```

This allows the administrator to control whether content is visible publicly.

---

# 25. Publishing Model

An administrator can create content without immediately publishing it.

For example:

```text
Project
    │
    ├── isPublished = false
    │       ↓
    │    Admin only
    │
    └── isPublished = true
            ↓
        Public website
```

Public endpoints therefore query published content only.

---

# 26. File Upload System

The system includes a file-management subsystem.

Initially:

```text
Client
 ↓
Express
 ↓
Upload Service
 ↓
Local Storage
```

Files can include:

```text
Profile images
Banner images
Certification images
Project images
CV PDFs
```

The database stores metadata such as:

```text
originalName
storedName
mimeType
size
type
path
url
```

The actual file and its database metadata are treated as separate concerns.

---

# 27. Storage Abstraction

The storage system should eventually use an abstraction:

```text
Storage Interface
       │
       ├── Local Storage
       │
       └── S3 Storage
```

This allows the application to initially use the IONOS filesystem while keeping the architecture ready for an object-storage provider later.

---

# 28. CV Generation

The CV subsystem allows the administrator to maintain structured career information.

The CV is generated from existing application data:

```text
Profile
Experience
Education
Skills
Certifications
Projects
        │
        ▼
   CV Generator
        │
        ▼
      PDF
        │
        ▼
    File Storage
```

The `CV` table can maintain generated versions.

Example:

```text
CV v1
CV v2
CV v3
CV v4
```

One version can be marked as current.

---

# 29. Background Jobs

Some operations should not block an HTTP request.

The system will use:

```text
Redis
+
BullMQ
```

for background processing.

Example:

```text
HTTP Request
     ↓
Create CV Job
     ↓
Return response
     ↓
Redis
     ↓
BullMQ
     ↓
CV Worker
     ↓
Generate PDF
```

Similarly, email processing can use:

```text
Email Queue
     ↓
Redis
     ↓
Email Worker
     ↓
SMTP / Email Provider
```

This prevents long-running operations from unnecessarily blocking API requests.

---

# 30. Contact System

The public website provides a contact form.

```text
Visitor
 ↓
Contact Form
 ↓
POST /api/contact
 ↓
Validation
 ↓
ContactMessage
 ↓
Database
```

The system can then enqueue an email notification:

```text
Contact Message
       ↓
BullMQ
       ↓
Email Worker
       ↓
SMTP Provider
       ↓
Administrator Email
```

---

# 31. Frontend Architecture

The frontend should be divided into two major areas.

```text
Frontend
│
├── Public Website
│
└── Admin Dashboard
```

A possible structure:

```text
src/
├── api/
├── components/
├── layouts/
├── pages/
│   ├── public/
│   └── admin/
├── hooks/
├── context/
├── routes/
├── types/
├── utils/
└── App.tsx
```

The frontend communicates exclusively with the API.

---

# 32. Frontend Authentication

The frontend maintains authentication state.

Conceptually:

```text
Login
  ↓
Access Token
  ↓
Authenticated API Requests
  ↓
Access Token expires
  ↓
Refresh Token
  ↓
New Access Token
```

Protected administrative routes should require authentication.

Example:

```text
/admin/projects
```

cannot be accessed by an unauthenticated visitor.

---

# 33. Public API

Public endpoints are intentionally separated from administrative endpoints.

Example:

```text
/api/public/profile
/api/public/projects
/api/public/skills
/api/public/experience
/api/public/education
/api/public/certifications
/api/public/interests
/api/public/cv
```

Administrative endpoints:

```text
/api/auth/*
/api/profile/*
/api/projects/*
/api/skills/*
/api/experience/*
/api/education/*
/api/certifications/*
/api/interests/*
/api/cv/*
/api/uploads/*
```

This separation makes access control easier to reason about.

---

# 34. Security Architecture

Security considerations include:

```text
Password hashing
JWT validation
Refresh-token revocation
Role-based authorization
Input validation
Rate limiting
CORS
HTTP security headers
File validation
File-size limits
SQL injection protection through Prisma
Environment variables
Secure production cookies where applicable
HTTPS
```

Secrets must never be committed to Git.

Example:

```text
.env
```

should remain outside version control.

A `.env.example` file should contain placeholders only.

---

# 35. Environment Configuration

Development:

```env
DATABASE_URL=...
JWT_SECRET=...
PORT=3000
```

Production values should be supplied through the IONOS server environment rather than committed to the repository.

Configuration should be centralized through:

```text
src/config/env.ts
```

This prevents environment variables from being accessed inconsistently throughout the application.

---

# 36. IONOS Deployment Architecture

The production application will run on an **IONOS VPS/server**.

The expected production architecture is:

```text
                    INTERNET
                        │
                        ▼
                  Domain / HTTPS
                        │
                        ▼
                     NGINX
                        │
            ┌───────────┴───────────┐
            │                       │
            ▼                       ▼
       React Frontend          Express API
            │                       │
            │                       ▼
            │                   PM2 / Node
            │                       │
            │                       ▼
            │                   Prisma
            │                       │
            │                       ▼
            │                  PostgreSQL
            │
            ▼
        Static Assets
```

Redis can run on the same server initially:

```text
IONOS VPS
│
├── Nginx
├── React application
├── Node.js API
├── PostgreSQL
├── Redis
└── BullMQ Workers
```

As traffic grows, services can be separated.

---

# 37. Nginx

Nginx acts as the public entry point.

For example:

```text
https://example.com
```

routes to the frontend.

API requests:

```text
https://example.com/api/*
```

are reverse-proxied to Express.

Conceptually:

```text
Browser
   │
   ▼
Nginx :443
   │
   ├── /       → React
   │
   └── /api/*  → Express :3000
```

Express does not need to be directly exposed to the public internet.

---

# 38. HTTPS

Production traffic should use HTTPS.

```text
HTTP
 ↓
Nginx
 ↓
HTTPS
 ↓
React / API
```

TLS certificates can be managed at the Nginx layer.

Authentication credentials and JWT-related traffic should never be transmitted over plain HTTP in production.

---

# 39. PM2

PM2 manages the Node.js backend process.

Example:

```text
PM2
 │
 └── ali-cms-api
       │
       └── Node.js
```

PM2 provides:

* Process management
* Automatic restarts
* Application logs
* Startup configuration
* Monitoring

---

# 40. PostgreSQL Production Database

PostgreSQL can initially run on the IONOS server.

```text
Express
   ↓
Prisma
   ↓
PostgreSQL
```

Database credentials are kept in environment variables.

Production database access should not be exposed publicly unless there is a specific operational requirement.

---

# 41. Docker

Docker can eventually package the application components.

Potential services:

```text
docker-compose.yml

services:

  api
  postgres
  redis
  worker
  nginx
```

This makes the development and production environments more reproducible.

However, the application should first be developed and understood without hiding the underlying infrastructure behind Docker.

---

# 42. CI/CD

GitHub Actions can automate deployment.

Conceptual pipeline:

```text
Developer
    │
    ▼
Git Push
    │
    ▼
GitHub
    │
    ▼
GitHub Actions
    │
    ├── Install dependencies
    ├── TypeScript check
    ├── Tests
    ├── Prisma validation
    ├── Build
    │
    ▼
IONOS Server
    │
    ├── Pull new version
    ├── Install/build
    ├── Run migrations
    └── Restart application
```

Production database migrations should be handled deliberately and safely.

---

# 43. Testing Strategy

Testing will be introduced at multiple levels.

## Unit Tests

Test individual pieces of logic:

```text
Password hashing
JWT functions
Validation
Services
Utilities
```

## Integration Tests

Test interaction between:

```text
Express
Prisma
PostgreSQL
```

Examples:

```text
Register user
Login user
Create project
Publish project
```

## API Tests

Endpoints can be tested using:

```text
Supertest
```

---

# 44. API Documentation

The backend will eventually expose OpenAPI documentation.

Example:

```text
/api/docs
```

The documentation should describe:

* Authentication
* Users
* Projects
* Experience
* Education
* Skills
* Certifications
* Uploads
* CV
* Contact

This creates a formal contract between frontend and backend.

---

# 45. Database Relationships

The primary relationships are:

```text
User
 ├── Profile
 ├── Accounts
 └── RefreshTokens

Project
 └── ProjectImages
```

The portfolio content is intentionally relatively independent because the system currently represents one person's portfolio.

If the CMS later becomes a multi-user platform, content entities can be associated with a `userId`.

---

# 46. Data Flow Example — Publishing a Project

Administrator creates a project:

```text
Admin Dashboard
      ↓
POST /api/projects
      ↓
JWT Authentication
      ↓
ADMIN Authorization
      ↓
Zod Validation
      ↓
Project Controller
      ↓
Project Service
      ↓
Project Repository
      ↓
Prisma
      ↓
PostgreSQL
```

The database might contain:

```text
name: Eventra
slug: eventra
isPublished: false
```

When the administrator publishes it:

```text
PATCH /api/projects/:id
```

changes:

```text
isPublished = true
```

The public API can now return it.

---

# 47. Data Flow Example — Public Website

A visitor opens:

```text
https://example.com/projects
```

The frontend requests:

```text
GET /api/public/projects
```

The backend performs:

```text
Controller
   ↓
Service
   ↓
Repository
   ↓
Prisma
   ↓
WHERE isPublished = true
```

The API returns the published projects.

React renders them.

The visitor never directly accesses PostgreSQL.

---

# 48. Data Flow Example — Login

```text
Browser
   │
   │ POST /api/auth/login
   ▼
Nginx
   │
   ▼
Express
   │
   ▼
Zod Validation
   │
   ▼
Auth Controller
   │
   ▼
Auth Service
   │
   ▼
Auth Repository
   │
   ▼
Prisma
   │
   ▼
PostgreSQL
   │
   ▼
User
   │
   ▼
bcrypt.compare()
   │
   ▼
JWT generation
   │
   ▼
Refresh token hash stored
   │
   ▼
Response
```

---

# 49. Project Directory

The overall backend structure is:

```text
ali-cms/
│
├── src/
│   │
│   ├── config/
│   │   ├── env.ts
│   │   ├── database.ts
│   │   └── redis.ts
│   │
│   ├── modules/
│   │   │
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.repository.ts
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.validation.ts
│   │   │   └── auth.types.ts
│   │   │
│   │   ├── users/
│   │   ├── profile/
│   │   ├── interests/
│   │   ├── certifications/
│   │   ├── experience/
│   │   ├── education/
│   │   ├── projects/
│   │   ├── skills/
│   │   ├── uploads/
│   │   ├── cv/
│   │   └── contact/
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── role.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── request-id.middleware.ts
│   │   ├── request-logger.middleware.ts
│   │   ├── rate-limit.middleware.ts
│   │   └── not-found.middleware.ts
│   │
│   ├── errors/
│   │   ├── app-error.ts
│   │   ├── authentication.error.ts
│   │   ├── authorization.error.ts
│   │   ├── conflict.error.ts
│   │   ├── not-found.error.ts
│   │   └── validation.error.ts
│   │
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── password.ts
│   │   ├── jwt.ts
│   │   ├── logger.ts
│   │   └── redis.ts
│   │
│   ├── queues/
│   │   ├── queue.ts
│   │   ├── email.queue.ts
│   │   └── cv.queue.ts
│   │
│   ├── workers/
│   │   ├── email.worker.ts
│   │   └── cv.worker.ts
│   │
│   ├── routes/
│   │   └── index.ts
│   │
│   ├── app.ts
│   └── server.ts
│
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
│
├── uploads/
│
├── tests/
│   ├── unit/
│   └── integration/
│
├── .env
├── .env.example
├── .gitignore
├── Dockerfile
├── docker-compose.yml
├── package.json
├── tsconfig.json
└── README.md
```

---

# 50. Development Strategy

The project will be implemented incrementally.

## Phase 1 — Foundation

```text
Node.js
TypeScript
Express
Environment configuration
PostgreSQL
Prisma
Pino
Error architecture
```

## Phase 2 — Authentication

```text
Registration
Login
bcrypt
JWT
Refresh tokens
Logout
Authentication middleware
Authorization middleware
```

## Phase 3 — OAuth

```text
Google OAuth
Identity linking
Account management
Authentication harmonization
```

## Phase 4 — Portfolio CMS

```text
Profile
Interests
Experience
Education
Skills
Projects
Certifications
```

## Phase 5 — Files

```text
Uploads
Validation
Storage abstraction
Images
CV files
```

## Phase 6 — Background Processing

```text
Redis
BullMQ
Email workers
CV workers
```

## Phase 7 — Advanced Backend

```text
Rate limiting
Caching
Security hardening
Testing
OpenAPI
```

## Phase 8 — Deployment

```text
Docker
Nginx
PM2
IONOS
HTTPS
CI/CD
Production database
Monitoring
```

---

# 51. Final Production Architecture

The intended production environment is:

```text
                         USERS
                           │
                           ▼
                    HTTPS / DOMAIN
                           │
                           ▼
                     ┌───────────┐
                     │   NGINX   │
                     └─────┬─────┘
                           │
             ┌─────────────┴─────────────┐
             │                           │
             ▼                           ▼
       React Frontend              Express API
                                         │
                                  ┌──────┴──────┐
                                  │             │
                                  ▼             ▼
                               Prisma        Redis
                                  │             │
                                  ▼             ▼
                             PostgreSQL      BullMQ
                                                │
                                      ┌─────────┴─────────┐
                                      ▼                   ▼
                                  Email Worker        CV Worker
```

All of these services can initially reside on the IONOS server, with the architecture designed so that individual components can later be moved to dedicated infrastructure if required.

---

# 52. Engineering Principles

The project follows several core principles:

### Separation of concerns

Each layer has a defined responsibility.

### Security by design

Passwords, tokens, secrets, files, and authorization are treated as security-sensitive resources.

### API-first architecture

The frontend communicates with the backend through a defined API rather than directly accessing the database.

### Database-driven content

Public portfolio content is stored in PostgreSQL rather than hardcoded in React.

### Modular backend

Features are organized into modules rather than one large application file.

### Centralized error handling

Application errors are handled consistently.

### Structured logging

Pino provides machine-readable logs suitable for debugging and production monitoring.

### Background processing

Long-running tasks such as email and PDF generation are moved to workers.

### Deployment portability

The application is designed to run locally, through Docker, and on an IONOS production server.

### Progressive complexity

The system is built incrementally so that each backend concept is understood before additional infrastructure is introduced.

---

# 53. System Objective

ALI CMS is not simply a portfolio website.

It is designed as a **production-oriented full-stack engineering project** demonstrating the architecture and implementation of a modern web application:

```text
Frontend
    +
REST API
    +
Authentication
    +
OAuth
    +
Authorization
    +
PostgreSQL
    +
Prisma
    +
Caching
    +
Background Jobs
    +
Email
    +
PDF Generation
    +
File Storage
    +
Testing
    +
API Documentation
    +
Docker
    +
CI/CD
    +
IONOS Production Infrastructure
```
