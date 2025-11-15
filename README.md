# 🚀 Secure Task Management System

A production-ready **Task Management System** with **Role-Based Access Control (RBAC)** and **2-level organizational hierarchy**, built in an NX monorepo.

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Setup Instructions](#-setup-instructions)
- [Data Model](#-data-model)
- [Access Control Implementation](#-access-control-implementation)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Future Considerations](#-future-considerations)

---

## ✨ Features

### Backend (NestJS)

- ✅ **JWT Authentication** - Real authentication with bcrypt password hashing
- ✅ **Role-Based Access Control** - Owner, Admin, Viewer roles with hierarchy
- ✅ **2-Level Organization Hierarchy** - Parent-child organization relationships
- ✅ **Organization Scoping** - Users only see tasks from their org + child orgs
- ✅ **Audit Logging** - Track all significant actions (login, task CRUD, permission denials)
- ✅ **Secure API Endpoints** - All endpoints protected with JWT + RBAC guards
- ✅ **SQLite Database** - TypeORM with automatic migrations

### Frontend (Angular)

- ✅ **Login UI** - Beautiful gradient design with JWT authentication
- ✅ **Task Dashboard** - Create, edit, delete tasks with real-time updates
- ✅ **Kanban Board** - Visual task management with To Do, In Progress, Done columns
- ✅ **Drag & Drop** - Reorder tasks and change status by dragging between columns
- ✅ **Checklist/Subtasks** - Add checklist items to tasks with completion tracking
- ✅ **Progress Visualization** - Elegant progress bars on each card showing checklist completion
- ✅ **Dark/Light Mode** - Global theme toggle with persistent preference
- ✅ **Filtering & Sorting** - Filter by category, sort by date/title/category
- ✅ **RBAC UI** - Admin/Owner see action buttons, Viewer has read-only access
- ✅ **Responsive Design** - Seamless mobile to desktop experience
- ✅ **State Management** - Angular signals for reactive state
- ✅ **HTTP Interceptor** - Automatic JWT attachment to API requests

### Testing

- ✅ **48 Total Passing Tests** - Backend: 29 tests, Frontend: 19 tests
- ✅ **Backend Tests** - RBAC, JWT auth, tasks service, audit logging
- ✅ **Frontend Tests** - Authentication, task CRUD, component logic
- ✅ **Comprehensive Coverage** - All critical business logic tested

### Bonus Features

- ✅ **Drag-and-Drop** - Angular CDK for intuitive task reordering and status changes
- ✅ **Task Completion Visualization** - Progress bars on cards based on checklist completion
- ✅ **Dark/Light Mode Toggle** - Global theme with localStorage persistence

---

## 🏗️ Architecture

### NX Monorepo Structure

```
turbovets-task-manager/
├── apps/
│   ├── api/                    # NestJS backend
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── auth/      # Authentication & RBAC guards
│   │   │   │   ├── tasks/     # Task management with org scoping
│   │   │   │   ├── audit/     # Audit logging service
│   │   │   │   └── users/     # User management
│   │   │   ├── entities/      # TypeORM entities
│   │   │   └── main.ts        # App entry point with seeding
│   │   └── jest.config.cjs    # Jest configuration
│   ├── api-e2e/               # E2E tests
│   └── dashboard/             # Angular frontend
│       ├── src/app/
│       │   ├── components/    # Reusable UI components (TaskForm)
│       │   ├── pages/         # Page components (Login, TaskList)
│       │   ├── services/      # Angular services (Auth, Task)
│       │   ├── guards/        # Route guards (AuthGuard)
│       │   └── models/        # TypeScript interfaces (Task, User)
├── libs/
│   ├── data/                  # Shared TypeScript interfaces & DTOs
│   │   └── src/role.enum.ts  # Role enum (Owner, Admin, Viewer)
│   └── auth/                  # Reusable RBAC logic
│       └── src/rbac.ts        # Role hierarchy helpers
└── package.json              # Root package.json with workspaces
```

### Why NX?

- **Modular** - Shared libraries (`data`, `auth`) promote code reuse
- **Scalable** - Independent apps can be deployed separately
- **Type-Safe** - Shared TypeScript interfaces ensure consistency
- **Efficient** - Caching and incremental builds speed up development

---

## 🚀 Setup Instructions

### Prerequisites

- Node.js v18+ and npm
- Git

### 1. Clone & Install

```bash
git clone <repository-url>
cd turbovets-task-manager
npm install
```

### 2. Environment Configuration

Create `.env` file in the project root:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Database (SQLite)
DATABASE_PATH=./data/task-management.db

# Server
PORT=3000
NODE_ENV=development
```

### 3. Build & Run the Backend API

**Terminal 1 - Backend:**

```bash
# Step 1: Build the API
npx nx build api

# Step 2: Serve the API (development mode with hot-reload)
npx nx serve api
```

The API will be available at: **http://localhost:3000/api**

**Production Build:**

```bash
npx nx build api
node dist/apps/api/main.js
```

### 4. Build & Run the Frontend Dashboard

**Terminal 2 - Frontend:**

```bash
# Step 1: Build the dashboard
npx nx build dashboard

# Step 2: Serve the dashboard (development mode with hot-reload)
npx nx serve dashboard
```

The dashboard will be available at: **http://localhost:4200**

### 🎯 Quick Start Guide

1. **Open Terminal 1** → Run backend:

   ```bash
   npx nx serve api
   ```

   ✅ Wait for: `🚀 Application is running on: http://localhost:3000/api`

2. **Open Terminal 2** → Run frontend:

   ```bash
   npx nx serve dashboard
   ```

   ✅ Wait for: `Application bundle generation complete`

3. **Open Browser** → Navigate to: `http://localhost:4200`

4. **Login** with demo credentials:

   - **Email:** `admin@techcorp.com`
   - **Password:** `password123`

5. **Start managing tasks!** ✨

### 5. Database Seeding

The application automatically seeds the database on first run with complete demo data.

**Seeded Data:**

- **3 Organizations:** TechCorp (parent), TechCorp Sales (child), FinanceInc
- **4 Users** with roles and memberships
- **3 Sample tasks** demonstrating org hierarchy

**Test Users:**

| Email               | Password    | Role   | Organization |
| ------------------- | ----------- | ------ | ------------ |
| owner@techcorp.com  | password123 | Owner  | TechCorp     |
| admin@techcorp.com  | password123 | Admin  | TechCorp     |
| viewer@techcorp.com | password123 | Viewer | TechCorp     |
| admin@finance.com   | password123 | Admin  | FinanceInc   |

**Demo Note:** Admin users at TechCorp can see tasks from both TechCorp AND TechCorp Sales (2-level hierarchy in action!).

### 6. Run Tests

**Backend Tests (29 tests):**

```bash
# Run all backend tests
npx nx test api

# Run specific test file
npx nx test api --testPathPattern="auth.service.spec"

# Test with coverage
npx nx test api --coverage
```

**Frontend Tests (19 tests):**

```bash
# Run all frontend tests
npx nx test dashboard

# Run specific test file
npx nx test dashboard --testPathPattern="auth.service.spec"

# Test with coverage
npx nx test dashboard --coverage
```

**Run All Tests:**

```bash
npx nx run-many --target=test --all
```

---

## 📊 Data Model

### Entity Relationship Diagram

```
┌─────────────────┐
│  Organization   │
│  ─────────────  │
│  id (PK)        │◄──┐
│  name           │   │
│  parentId (FK)  │───┘ (2-level hierarchy)
│  parent         │
│  children[]     │
└─────────────────┘
        │
        │ 1:N
        ▼
┌─────────────────┐
│   Membership    │
│  ─────────────  │
│  id (PK)        │
│  userId (FK)    │
│  orgId (FK)     │
│  role (enum)    │
└─────────────────┘
        │
        │ N:1
        ▼
┌─────────────────┐        ┌─────────────────┐
│      User       │◄───────│      Task       │
│  ─────────────  │  N:1   │  ─────────────  │
│  id (PK)        │        │  id (PK)        │
│  email          │        │  title          │
│  passwordHash   │        │  description    │
│  displayName    │        │  category       │
└─────────────────┘        │  createdById    │
        │                  │  assigneeId     │
        │                  │  organizationId │
        │                  └─────────────────┘
        │ 1:N
        ▼
┌─────────────────┐
│    AuditLog     │
│  ─────────────  │
│  id (PK)        │
│  userId (FK)    │
│  orgId (FK)     │
│  taskId (FK)    │
│  action         │
│  details (JSON) │
│  createdAt      │
└─────────────────┘
```

### Key Entities

#### User

- Stores authentication credentials (email, passwordHash)
- Links to organizations via Membership table
- Can have multiple memberships (future: multi-org support)

#### Organization

- **2-level hierarchy** via `parentId` self-reference
- Parent orgs can see child org tasks
- Used for scoping all data access

#### Membership

- Join table between User and Organization
- Stores user's **role** (Owner, Admin, Viewer)
- Unique constraint on `(userId, organizationId)`

#### Task

- Core business entity
- Belongs to exactly one Organization
- Has creator (`createdBy`) and optional assignee
- Category field for filtering (e.g., "Work", "Personal")

#### AuditLog

- Immutable event log
- Tracks: login, task CRUD, permission denials
- Stores structured `details` as JSON

---

## 🔐 Access Control Implementation

### Role Hierarchy

```
Owner (highest privileges)
  ├─ Can do everything Admin can do
  └─ Can view audit logs

Admin
  ├─ Can create, update, delete tasks
  ├─ Can view audit logs
  └─ Cannot manage organization settings

Viewer (read-only)
  └─ Can only view tasks
```

### Implementation Components

#### 1. **Role Enum** (`libs/data/src/role.enum.ts`)

```typescript
export enum Role {
  OWNER = 'owner',
  ADMIN = 'admin',
  VIEWER = 'viewer',
}
```

#### 2. **RBAC Helper** (`libs/auth/src/rbac.ts`)

```typescript
export function isAdminOrAbove(role: Role): boolean {
  return role === Role.OWNER || role === Role.ADMIN;
}
```

#### 3. **JWT Strategy** (`api/src/app/auth/jwt.strategy.ts`)

- Validates JWT tokens
- Attaches user + role + organizationId to request
- Uses Passport + `@nestjs/passport`

#### 4. **Roles Guard** (`api/src/app/auth/roles.guard.ts`)

```typescript
@RequireRole(Role.ADMIN, Role.OWNER) // Decorator
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    // 1. Get required roles from decorator metadata
    // 2. Extract user from request (set by JwtAuthGuard)
    // 3. Check if user's role satisfies requirements
    // 4. Throw ForbiddenException if not authorized
  }
}
```

#### 5. **Organization Scoping** (`api/src/app/tasks/tasks.service.ts`)

```typescript
private async getAccessibleOrganizationIds(userOrgId: string) {
  const accessibleIds = [userOrgId];

  // Find child organizations (2-level hierarchy)
  const childOrgs = await this.orgRepo.find({
    where: { parentId: userOrgId },
  });

  accessibleIds.push(...childOrgs.map(org => org.id));
  return accessibleIds;
}
```

### How JWT Auth Integrates with RBAC

1. **User logs in** → `POST /auth/login`

   - Validates credentials with bcrypt
   - Generates JWT with payload: `{ sub: userId, email, role, organizationId }`
   - Returns `accessToken`

2. **Client includes JWT** in all requests:

   ```
   Authorization: Bearer <accessToken>
   ```

3. **Request Pipeline**:

   ```
   Request
     → JwtAuthGuard (validates token, attaches user to request)
     → RolesGuard (checks user role against @RequireRole decorator)
     → Controller method (executes if authorized)
   ```

4. **Organization Scoping** in services:
   - Extract `user.memberships[0].organization.id` from request
   - Query only accessible org IDs (user's org + children)
   - Throw `NotFoundException` if resource not in scope

---

## 📡 API Documentation

Base URL: `http://localhost:3000/api`

### Authentication

#### `POST /auth/login`

Login and receive JWT token.

**Request:**

```json
{
  "email": "admin@techcorp.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "admin@techcorp.com",
    "displayName": "Alice Admin",
    "role": "admin",
    "organizationId": "uuid"
  }
}
```

### Tasks

All task endpoints require `Authorization: Bearer <token>` header.

#### `GET /tasks`

List all tasks accessible to the user (their org + child orgs).

**Authorization:** All authenticated users (Viewer, Admin, Owner)

**Response:**

```json
[
  {
    "id": "uuid",
    "title": "Complete Q4 Report",
    "description": "Finalize quarterly financial report",
    "category": "Work",
    "createdBy": { "id": "uuid", "displayName": "Alice Admin" },
    "assignee": { "id": "uuid", "displayName": "Bob Developer" },
    "organization": { "id": "uuid", "name": "TechCorp" },
    "createdAt": "2025-11-14T00:00:00.000Z",
    "updatedAt": "2025-11-14T00:00:00.000Z"
  }
]
```

#### `POST /tasks`

Create a new task.

**Authorization:** Admin, Owner only

**Request:**

```json
{
  "title": "New Task",
  "description": "Task description",
  "category": "Work",
  "assigneeId": "uuid" (optional)
}
```

**Response:** Created task object

#### `PUT /tasks/:id`

Update an existing task.

**Authorization:** Admin, Owner only (must be in accessible org)

**Request:**

```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "category": "Personal"
}
```

**Response:** Updated task object

**Errors:**

- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Task doesn't exist or not in accessible org

#### `DELETE /tasks/:id`

Delete a task.

**Authorization:** Admin, Owner only (must be in accessible org)

**Response:** `204 No Content`

**Errors:**

- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Task doesn't exist or not in accessible org

### Audit Logs

#### `GET /audit-log`

View audit logs for the user's organization (+ child orgs).

**Authorization:** Admin, Owner only

**Query Parameters:**

- (None currently - returns last 100 logs)

**Response:**

```json
[
  {
    "id": "uuid",
    "action": "create_task",
    "user": { "id": "uuid", "displayName": "Alice Admin" },
    "organization": { "id": "uuid", "name": "TechCorp" },
    "task": { "id": "uuid", "title": "Task Title" },
    "details": {
      "taskTitle": "Task Title",
      "timestamp": "2025-11-14T00:00:00.000Z"
    },
    "createdAt": "2025-11-14T00:00:00.000Z"
  }
]
```

**Audit Actions:**

- `login` - User logged in
- `create_task` - Task created
- `update_task` - Task updated
- `delete_task` - Task deleted
- `permission_denied` - Access denied

---

## 🧪 Testing

### Test Coverage

**Total: 29 tests passing**

| Test Suite              | Tests | Description                          |
| ----------------------- | ----- | ------------------------------------ |
| `roles.guard.spec.ts`   | 5     | RBAC guard logic, role hierarchy     |
| `auth.service.spec.ts`  | 7     | JWT auth, login, password validation |
| `tasks.service.spec.ts` | 8     | CRUD, org scoping, 2-level hierarchy |
| `audit.service.spec.ts` | 5     | Audit logging, org scoping           |
| Other                   | 4     | App, users, placeholder tests        |

### Key Test Scenarios

#### RBAC Tests

- ✅ Owner can access Admin endpoints (role hierarchy)
- ✅ Admin can access Admin endpoints
- ✅ Viewer cannot access Admin endpoints
- ✅ Unauthenticated users are rejected

#### Authentication Tests

- ✅ Valid credentials return JWT
- ✅ Invalid email/password throw UnauthorizedException
- ✅ JWT includes role and organizationId
- ✅ Login event is audit logged

#### Organization Scoping Tests

- ✅ Users see tasks from their org
- ✅ Users see tasks from child orgs (2-level hierarchy)
- ✅ Users cannot access tasks from other orgs
- ✅ CRUD operations respect org boundaries

#### Audit Logging Tests

- ✅ Login events are logged
- ✅ Task CRUD events are logged with details
- ✅ Audit logs are scoped to org + children
- ✅ Timestamps and metadata are captured

### Running Tests

```bash
# All tests
npx nx test api

# Specific test file
npx nx test api --testPathPattern="auth.service"

# Watch mode
npx nx test api --watch

# Coverage report
npx nx test api --coverage
```

### Manual API Testing (PowerShell)

Below are step-by-step commands to test all API endpoints. These examples use PowerShell (Windows) and `Invoke-WebRequest`.

#### 1️⃣ Login & Get JWT Token

```powershell
$response = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body '{"email":"admin@techcorp.com","password":"password123"}'

$data = $response.Content | ConvertFrom-Json
$token = $data.accessToken

Write-Host "✅ Login successful!"
Write-Host "User: $($data.user.email) | Role: $($data.user.role)"
```

**Expected Response:**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "e02ddfd3-b482-4f91-8b12-bb96d464c17a",
    "email": "admin@techcorp.com",
    "role": "admin",
    "organizationId": "88d1d365-d7c3-4685-99dc-c3ab36ed5262"
  }
}
```

#### 2️⃣ List All Tasks (GET /tasks)

```powershell
$response = Invoke-WebRequest -Uri "http://localhost:3000/api/tasks" `
    -Method GET `
    -Headers @{Authorization="Bearer $token"}

$tasks = $response.Content | ConvertFrom-Json
$tasks | Select-Object title, category, status | Format-Table
```

**Expected Response:**

```
title                 category status
-----                 -------- ------
Complete Q4 Report    Work     pending
Review Sales Pipeline Work     in-progress
Team Building Event   Personal completed
```

#### 3️⃣ Create a Task (POST /tasks)

```powershell
$response = Invoke-WebRequest -Uri "http://localhost:3000/api/tasks" `
    -Method POST `
    -ContentType "application/json" `
    -Headers @{Authorization="Bearer $token"} `
    -Body '{"title":"API Test Task","description":"Testing API responses","category":"Work","status":"in-progress"}'

$newTask = $response.Content | ConvertFrom-Json
Write-Host "✅ Created task ID: $($newTask.id)"
$taskId = $newTask.id
```

**Expected Response:**

```json
{
  "id": "99fe22b7-a7e4-4ea3-b31a-215442ce7e94",
  "title": "API Test Task",
  "description": "Testing API responses",
  "category": "Work",
  "status": "in-progress",
  "createdAt": "2025-11-14T09:42:01.234Z",
  "updatedAt": "2025-11-14T09:42:01.234Z"
}
```

#### 4️⃣ Update a Task (PUT /tasks/:id)

```powershell
$response = Invoke-WebRequest -Uri "http://localhost:3000/api/tasks/$taskId" `
    -Method PUT `
    -ContentType "application/json" `
    -Headers @{Authorization="Bearer $token"} `
    -Body '{"title":"Updated Task Title","status":"completed"}'

$updated = $response.Content | ConvertFrom-Json
Write-Host "✅ Updated: $($updated.title) - Status: $($updated.status)"
```

**Expected Response:**

```json
{
  "id": "99fe22b7-a7e4-4ea3-b31a-215442ce7e94",
  "title": "Updated Task Title",
  "description": "Testing API responses",
  "category": "Work",
  "status": "completed",
  "updatedAt": "2025-11-14T09:42:06.789Z"
}
```

#### 5️⃣ View Audit Logs (GET /audit-log)

```powershell
$response = Invoke-WebRequest -Uri "http://localhost:3000/api/audit-log" `
    -Method GET `
    -Headers @{Authorization="Bearer $token"}

$audit = $response.Content | ConvertFrom-Json
$audit.logs | Select-Object -First 5 action, userEmail, createdAt | Format-Table
```

**Expected Response:**

```
action      userEmail              createdAt
------      ---------              ---------
update_task admin@techcorp.com     2025-11-14T09:42:06.000Z
create_task admin@techcorp.com     2025-11-14T09:42:01.000Z
login       admin@techcorp.com     2025-11-14T09:41:50.000Z
```

#### 6️⃣ Delete a Task (DELETE /tasks/:id)

```powershell
$response = Invoke-WebRequest -Uri "http://localhost:3000/api/tasks/$taskId" `
    -Method DELETE `
    -Headers @{Authorization="Bearer $token"}

Write-Host "✅ Task deleted successfully (Status: $($response.StatusCode))"
```

**Expected Response:** HTTP 200 (empty body)

#### 7️⃣ Test RBAC - Viewer Cannot Create

```powershell
# Login as Viewer
$viewerResp = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body '{"email":"viewer@techcorp.com","password":"password123"}'

$viewerToken = ($viewerResp.Content | ConvertFrom-Json).accessToken

# Try to create task (should fail with 403)
try {
    $fail = Invoke-WebRequest -Uri "http://localhost:3000/api/tasks" `
        -Method POST `
        -ContentType "application/json" `
        -Headers @{Authorization="Bearer $viewerToken"} `
        -Body '{"title":"Should Fail"}'

    Write-Host "❌ FAILED: Viewer was able to create task!" -ForegroundColor Red
} catch {
    Write-Host "✅ RBAC working - Viewer blocked (403 Forbidden)" -ForegroundColor Green
}
```

**Expected Response:**

```
403 Forbidden - {"statusCode":403,"message":"Forbidden resource","error":"Forbidden"}
```

#### 8️⃣ Test Organization Scoping

```powershell
# Login as FinanceInc admin (different org)
$financeResp = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body '{"email":"admin@finance.com","password":"password123"}'

$financeToken = ($financeResp.Content | ConvertFrom-Json).accessToken

# Get tasks (should only see FinanceInc tasks, not TechCorp tasks)
$financeTasks = Invoke-WebRequest -Uri "http://localhost:3000/api/tasks" `
    -Method GET `
    -Headers @{Authorization="Bearer $financeToken"}

$taskList = $financeTasks.Content | ConvertFrom-Json
Write-Host "FinanceInc admin sees $($taskList.Count) tasks (should not include TechCorp tasks)"
```

**Expected Behavior:** Users from FinanceInc cannot see TechCorp tasks (organization scoping enforced).

---

## 🔮 Future Considerations

### Security Enhancements

#### JWT Refresh Tokens

- **Current:** Single long-lived access token
- **Future:** Short-lived access token (15min) + refresh token (7 days)
- **Benefit:** Reduced exposure window if token is compromised

#### CSRF Protection

- **Current:** API-only (no browser state)
- **Future:** If adding cookie-based auth, implement CSRF tokens
- **Benefit:** Prevent cross-site request forgery attacks

#### RBAC Caching

- **Current:** Role check on every request via guard
- **Future:** Cache role permissions in Redis
- **Benefit:** Reduce database queries for high-traffic scenarios

### Scalability

#### Permission Checks Optimization

- **Current:** Database query for each org scoping check
- **Future:**
  - Cache accessible org IDs per user session
  - Use Redis for fast lookups
  - Invalidate on org structure changes
- **Benefit:** 10x faster permission checks

#### Advanced Role Delegation

- **Current:** Fixed 3-role hierarchy (Owner > Admin > Viewer)
- **Future:**
  - Custom roles with granular permissions
  - Role templates (e.g., "Project Manager")
  - Permission inheritance
- **Benefit:** More flexible access control

#### Multi-Tenancy

- **Current:** 2-level org hierarchy (parent-child)
- **Future:**
  - Unlimited org depth
  - Cross-org task sharing
  - Team-level permissions
- **Benefit:** Support complex organizational structures

### Production Readiness

- [ ] Add rate limiting (express-rate-limit)
- [ ] Implement helmet for security headers
- [ ] Add request validation with class-validator
- [ ] Set up structured logging (Winston)
- [ ] Configure CORS for production domains
- [ ] Add health check endpoint
- [ ] Set up database migrations (TypeORM)
- [ ] Add monitoring (APM, error tracking)

---

## 📝 Notes

- **Database:** SQLite used for simplicity. For production, switch to PostgreSQL.
- **Frontend:** Angular dashboard scaffold exists but is not implemented in this phase.
- **Audit Logs:** Currently write to database. For high volume, consider write-only log aggregation service.
- **JWT Secret:** Change `JWT_SECRET` in `.env` for production deployments.

---

## 🤝 Contributing

This is a coding challenge project. For production use, consider the security and scalability enhancements listed above.

---

**Built with** ❤️ **using NestJS, TypeORM, NX, and Jest**
