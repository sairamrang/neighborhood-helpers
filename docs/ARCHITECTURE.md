# Technical Architecture Documentation
# NeighborHood Helpers

**Version**: 1.0
**Last Updated**: October 2025
**Author**: Sai Rangachari

---

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Technology Stack](#technology-stack)
4. [Frontend Architecture](#frontend-architecture)
5. [Backend Architecture](#backend-architecture)
6. [Database Architecture](#database-architecture)
7. [Authentication & Authorization](#authentication--authorization)
8. [Security Model](#security-model)
9. [API Design](#api-design)
10. [Deployment Architecture](#deployment-architecture)
11. [Performance Considerations](#performance-considerations)
12. [Scalability Strategy](#scalability-strategy)

---

## System Overview

NeighborHood Helpers is a modern, serverless full-stack web application built with a React frontend, Node.js backend, and Supabase as the database and authentication provider.

### Architecture Style
- **Pattern**: Three-tier architecture (Presentation, Application, Data)
- **Approach**: JAMstack with serverless functions
- **Communication**: RESTful APIs with JWT authentication
- **Database**: PostgreSQL with Row Level Security (RLS)

### Key Architectural Principles

1. **Separation of Concerns**: Frontend, backend, and database are independently deployable
2. **Stateless Backend**: No session storage, JWT-based auth
3. **Security-First**: RLS at database level + middleware at API level
4. **Mobile-First**: Responsive design, optimized for all devices
5. **Scalability**: Serverless architecture for automatic scaling

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                         │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           React SPA (Vite + TypeScript)                │  │
│  │                                                         │  │
│  │  Components:  Navbar, Dashboard, Services, Bookings    │  │
│  │  Contexts:    AuthContext (global state)               │  │
│  │  Router:      React Router (client-side routing)       │  │
│  │  Styling:     Tailwind CSS                             │  │
│  │  Client:      Supabase JS Client (auth + queries)      │  │
│  └───────────────────────────────────────────────────────┘  │
│                            │                                  │
│                            │ HTTPS/WSS                        │
└────────────────────────────┼──────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Vercel     │    │   Railway    │    │   Supabase   │
│   (Static    │    │   (Backend   │    │   (Database  │
│    Host)     │    │    API)      │    │   + Auth)    │
└──────────────┘    └──────────────┘    └──────────────┘
                             │                    │
                             ▼                    │
                    ┌──────────────┐              │
                    │   Express    │              │
                    │   REST API   │              │
                    │              │              │
                    │   Routes:    │              │
                    │   - Services │              │
                    │   - Bookings │◄─────────────┘
                    │   - Providers│   Supabase
                    │   - Admin    │   Client
                    └──────────────┘   (Admin SDK)
                             │
                             ▼
                    ┌──────────────┐
                    │  Middleware  │
                    │   - Auth     │
                    │   - CORS     │
                    │   - Error    │
                    └──────────────┘
```

---

## Technology Stack

### Frontend Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Framework** | React | 18.x | UI library with hooks and context |
| **Language** | TypeScript | 5.x | Type safety and better DX |
| **Build Tool** | Vite | 7.x | Fast dev server with HMR |
| **Routing** | React Router | 6.x | Client-side routing |
| **Styling** | Tailwind CSS | 3.4.x | Utility-first CSS framework |
| **HTTP Client** | Supabase JS | 2.x | Database queries + Auth |
| **State Management** | React Context | Built-in | Global auth state |
| **Forms** | React Hooks | Built-in | Form handling |

#### Frontend File Structure
```
src/
├── components/          # Reusable UI components
│   └── Navbar.tsx       # Navigation component
├── contexts/            # React Context providers
│   └── AuthContext.tsx  # Authentication state
├── lib/                 # Utilities and clients
│   └── supabase.ts      # Supabase client config
├── pages/               # Page components (routes)
│   ├── Landing.tsx      # Public landing page
│   ├── Login.tsx        # Login page
│   ├── Signup.tsx       # Registration page
│   ├── Dashboard.tsx    # User dashboard
│   ├── Services.tsx     # Browse services
│   ├── ServiceDetail.tsx # Single service view
│   ├── Bookings.tsx     # Booking management
│   ├── ProviderProfile.tsx # Provider profile
│   └── Admin.tsx        # Admin dashboard
├── App.tsx              # Root component with routing
├── main.tsx             # React entry point
└── index.css            # Global styles + Tailwind
```

### Backend Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Runtime** | Node.js | 18+ | JavaScript runtime |
| **Framework** | Express | 4.x | Web framework |
| **Language** | TypeScript | 5.x | Type safety |
| **Execution** | tsx | 4.x | TypeScript execution without build step |
| **Database Client** | Supabase JS | 2.x | Supabase admin client |
| **Environment** | dotenv | 16.x | Environment variable management |
| **CORS** | cors | 2.8.x | Cross-origin resource sharing |

#### Backend File Structure
```
backend/
├── src/
│   ├── routes/          # API route handlers
│   │   ├── services.ts  # Service CRUD operations
│   │   ├── bookings.ts  # Booking management
│   │   ├── providers.ts # Provider profiles
│   │   └── admin.ts     # Admin operations
│   ├── middleware/      # Express middleware
│   │   └── auth.ts      # JWT authentication
│   ├── lib/             # Backend utilities
│   │   └── supabase.ts  # Supabase admin client
│   └── index.ts         # Express app setup
├── package.json         # Dependencies
└── tsconfig.json        # TypeScript config
```

### Infrastructure Stack

| Service | Purpose | Tier |
|---------|---------|------|
| **Supabase** | PostgreSQL database + Authentication | Free/Pro |
| **Vercel** | Frontend hosting + CDN | Free/Pro |
| **Railway** | Backend API hosting | Free/Pro |
| **GitHub** | Version control + CI/CD | Free |

---

## Frontend Architecture

### Component Architecture

#### Component Hierarchy
```
App
├── AuthContext Provider
│   ├── Navbar (persistent across routes)
│   └── Route Components
│       ├── Landing
│       ├── Login
│       ├── Signup
│       ├── Dashboard
│       ├── Services
│       ├── ServiceDetail
│       ├── Bookings
│       ├── ProviderProfile
│       └── Admin
```

#### State Management

**Global State (AuthContext)**
```typescript
interface AuthContextType {
  user: User | null;           // Supabase auth user
  profile: Profile | null;     // Custom user profile
  loading: boolean;            // Auth loading state
  signIn: (email, password) => Promise<void>;
  signUp: (email, password, name, type) => Promise<void>;
  signOut: () => Promise<void>;
}
```

**Local State (Component State)**
- Form inputs
- Loading states
- Error messages
- UI interactions

### Routing Strategy

```typescript
// Protected routes require authentication
<Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />

// Public routes accessible without auth
<Route path="/" element={<Landing />} />
<Route path="/login" element={<Login />} />

// Role-based routes (admin only)
<Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
```

### Data Flow

1. **Component mounts** → Calls useEffect
2. **useEffect triggers** → Fetches data from Supabase
3. **Supabase query** → Returns data or error
4. **Component updates state** → Re-renders with data
5. **User interaction** → Triggers mutation
6. **Mutation executes** → Updates database
7. **Optimistic update** → UI updates immediately
8. **Confirmation** → Database confirms change

### API Communication

**Frontend → Supabase (Direct)**
- Used for: Read operations (GET services, bookings)
- Why: Faster, no backend hop, RLS handles security
- Example:
  ```typescript
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('is_active', true);
  ```

**Frontend → Backend → Supabase**
- Used for: Complex operations, admin operations
- Why: Business logic, additional validation, admin permissions
- Example: Provider approval (admin only)

---

## Backend Architecture

### API Layer Structure

```
Express App
├── Middleware (global)
│   ├── CORS (allow frontend domain)
│   ├── JSON body parser
│   └── Request logging
│
├── Routes
│   ├── /api/services
│   │   ├── GET /           # List services
│   │   ├── GET /:id        # Get service
│   │   ├── POST /          # Create service (auth)
│   │   ├── PUT /:id        # Update service (auth)
│   │   └── DELETE /:id     # Delete service (auth)
│   │
│   ├── /api/bookings
│   │   ├── GET /           # List bookings (auth)
│   │   ├── POST /          # Create booking (auth)
│   │   └── PATCH /:id/status # Update status (auth)
│   │
│   ├── /api/providers
│   │   ├── GET /           # List providers
│   │   ├── GET /:id        # Get provider
│   │   ├── POST /          # Create provider (auth)
│   │   ├── PUT /:id        # Update provider (auth)
│   │   └── GET /me/profile # Get own profile (auth)
│   │
│   └── /api/admin
│       ├── GET /pending-providers # List pending (admin)
│       ├── PATCH /providers/:id/approval # Approve (admin)
│       ├── GET /providers  # List all (admin)
│       └── GET /stats      # Platform stats (admin)
│
└── Error Handler
    └── Global error catching and formatting
```

### Middleware Chain

```typescript
Request
  ↓
CORS Middleware (allow origins)
  ↓
Body Parser (JSON)
  ↓
Auth Middleware (verify JWT) ← Optional, route-specific
  ↓
Admin Middleware (check admin) ← Optional, admin routes only
  ↓
Route Handler
  ↓
Response / Error Handler
```

### Authentication Middleware

```typescript
// Verifies Supabase JWT token
export const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  req.user = user; // Attach user to request
  next();
};
```

### Admin Middleware

```typescript
// Checks if user email is in admin list
export const requireAdmin = async (req, res, next) => {
  const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];

  if (!adminEmails.includes(req.user.email)) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  next();
};
```

---

## Database Architecture

### Database Schema (PostgreSQL)

#### Entity Relationship Diagram

```
┌─────────────┐
│ auth.users  │ (Supabase managed)
│             │
│ - id (PK)   │
│ - email     │
└──────┬──────┘
       │
       │ 1:1
       │
┌──────▼──────────┐
│   profiles      │
│                 │
│ - id (PK, FK)   │◄───────────────┐
│ - email         │                │
│ - full_name     │                │
│ - user_type     │                │
│ - created_at    │                │
└─────────────────┘                │
       │                           │
       │ 1:1 (if provider)         │
       │                           │
┌──────▼──────────────┐            │
│ service_providers   │            │
│                     │            │
│ - id (PK)           │            │
│ - user_id (FK) ─────┘            │
│ - bio               │            │
│ - profile_image_url │            │
│ - is_approved       │            │
│ - created_at        │            │
└──────┬──────────────┘            │
       │                           │
       │ 1:N                       │
       │                           │
┌──────▼──────────┐                │
│    services     │                │
│                 │                │
│ - id (PK)       │                │
│ - provider_id (FK)               │
│ - title         │                │
│ - description   │                │
│ - category      │                │
│ - price         │                │
│ - price_type    │                │
│ - is_active     │                │
│ - created_at    │                │
└──────┬──────────┘                │
       │                           │
       │ 1:N                       │
       │                           │
┌──────▼────────────┐              │
│     bookings      │              │
│                   │              │
│ - id (PK)         │              │
│ - service_id (FK) │              │
│ - resident_id (FK)├──────────────┘
│ - provider_id (FK)│
│ - status          │
│ - booking_date    │
│ - notes           │
│ - created_at      │
└───────────────────┘
```

#### Table Definitions

**profiles**
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('resident', 'provider')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**service_providers**
```sql
CREATE TABLE service_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  bio TEXT,
  profile_image_url TEXT,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**services**
```sql
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  price_type TEXT NOT NULL CHECK (price_type IN ('hourly', 'per_job')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**bookings**
```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  resident_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  booking_date TIMESTAMPTZ NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Indexes

```sql
-- Improve query performance
CREATE INDEX idx_services_provider ON services(provider_id);
CREATE INDEX idx_services_category ON services(category);
CREATE INDEX idx_services_active ON services(is_active);
CREATE INDEX idx_bookings_resident ON bookings(resident_id);
CREATE INDEX idx_bookings_provider ON bookings(provider_id);
CREATE INDEX idx_bookings_service ON bookings(service_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_providers_approved ON service_providers(is_approved);
```

---

## Authentication & Authorization

### Authentication Flow

```
1. User enters email + password
   ↓
2. Frontend calls supabase.auth.signInWithPassword()
   ↓
3. Supabase validates credentials
   ↓
4. Returns JWT token + user object
   ↓
5. Frontend stores session (automatically handled by Supabase)
   ↓
6. AuthContext updates with user + profile
   ↓
7. Protected routes now accessible
```

### Authorization Levels

| Level | Access | Implementation |
|-------|--------|----------------|
| **Public** | Anyone (not logged in) | No auth middleware |
| **Authenticated** | Any logged-in user | `authenticate` middleware |
| **Provider** | Service providers only | RLS policy + user_type check |
| **Admin** | Designated admins | `requireAdmin` middleware |

### JWT Token Structure

```json
{
  "sub": "uuid-user-id",
  "email": "user@example.com",
  "role": "authenticated",
  "iat": 1234567890,
  "exp": 1234571490
}
```

Tokens are:
- Issued by Supabase
- Valid for 1 hour
- Automatically refreshed by Supabase client
- Verified on backend using Supabase admin SDK

---

## Security Model

### Row Level Security (RLS) Policies

RLS ensures users can only access their own data, even if they bypass the frontend.

#### profiles Table Policies

```sql
-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Profiles created via trigger on auth.users insert
```

#### service_providers Table Policies

```sql
-- Everyone can view approved providers
CREATE POLICY "Approved providers are viewable by everyone"
  ON service_providers FOR SELECT
  USING (is_approved = true);

-- Providers can view their own profile even if not approved
CREATE POLICY "Providers can view own profile"
  ON service_providers FOR SELECT
  USING (auth.uid() = user_id);

-- Providers can update their own profile
CREATE POLICY "Providers can update own profile"
  ON service_providers FOR UPDATE
  USING (auth.uid() = user_id);

-- Providers can insert their own profile
CREATE POLICY "Providers can create own profile"
  ON service_providers FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

#### services Table Policies

```sql
-- Everyone can view services from approved providers
CREATE POLICY "Active services from approved providers are viewable"
  ON services FOR SELECT
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM service_providers sp
      WHERE sp.id = provider_id AND sp.is_approved = true
    )
  );

-- Providers can manage their own services
CREATE POLICY "Providers can manage own services"
  ON services FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM service_providers sp
      WHERE sp.id = provider_id AND sp.user_id = auth.uid()
    )
  );
```

#### bookings Table Policies

```sql
-- Residents can view their own bookings
CREATE POLICY "Residents can view own bookings"
  ON bookings FOR SELECT
  USING (auth.uid() = resident_id);

-- Providers can view bookings for their services
CREATE POLICY "Providers can view their bookings"
  ON bookings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM service_providers sp
      WHERE sp.id = provider_id AND sp.user_id = auth.uid()
    )
  );

-- Residents can create bookings
CREATE POLICY "Residents can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (auth.uid() = resident_id);

-- Users can update bookings they're involved in
CREATE POLICY "Users can update relevant bookings"
  ON bookings FOR UPDATE
  USING (
    auth.uid() = resident_id
    OR EXISTS (
      SELECT 1 FROM service_providers sp
      WHERE sp.id = provider_id AND sp.user_id = auth.uid()
    )
  );
```

### Security Best Practices

1. **Never trust frontend**: All security enforced at DB and API level
2. **Validate all inputs**: Backend validates even if frontend validates
3. **Use parameterized queries**: Prevent SQL injection
4. **HTTPS only**: All production traffic encrypted
5. **Environment variables**: Secrets never committed to code
6. **RLS enabled**: No direct database access without RLS check
7. **JWT expiration**: Tokens expire and auto-refresh
8. **CORS restricted**: Only allowed origins can call API

---

## API Design

### RESTful Conventions

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| GET | /api/services | List all services | No |
| GET | /api/services/:id | Get single service | No |
| POST | /api/services | Create service | Yes (provider) |
| PUT | /api/services/:id | Update service | Yes (owner) |
| DELETE | /api/services/:id | Delete service | Yes (owner) |
| GET | /api/bookings | List my bookings | Yes |
| POST | /api/bookings | Create booking | Yes |
| PATCH | /api/bookings/:id/status | Update status | Yes (involved party) |

### Response Format

**Success Response (200/201)**
```json
{
  "data": {
    "id": "uuid",
    "title": "Lawn Mowing",
    "price": 25.00
  }
}
```

**Error Response (400/401/403/500)**
```json
{
  "error": "Error message",
  "details": "Additional context (optional)"
}
```

### Status Codes

- `200` OK - Successful GET/PUT/PATCH
- `201` Created - Successful POST
- `204` No Content - Successful DELETE
- `400` Bad Request - Invalid input
- `401` Unauthorized - Missing/invalid token
- `403` Forbidden - Insufficient permissions
- `404` Not Found - Resource doesn't exist
- `500` Internal Server Error - Server error

---

## Deployment Architecture

### Frontend (Vercel)

```
GitHub Push → Vercel Build → CDN Distribution
    ↓
Automatic deployment on main branch
    ↓
Environment variables injected
    ↓
Vite build process (npm run build)
    ↓
Static files served via Vercel CDN
    ↓
HTTPS + custom domain support
```

**Build Configuration**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": "vite"
}
```

### Backend (Railway)

```
GitHub Push → Railway Build → Container Deployment
    ↓
Automatic deployment on main branch
    ↓
Environment variables injected
    ↓
TypeScript compilation (tsx watch)
    ↓
Express server running on assigned port
    ↓
HTTPS + auto-generated domain
```

**Railway Configuration**
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "cd backend && npm start",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

### Database (Supabase)

- **Hosting**: Managed PostgreSQL (AWS)
- **Backups**: Daily automated backups
- **Replication**: Multi-region support
- **Monitoring**: Built-in dashboard
- **Scaling**: Automatic connection pooling

---

## Performance Considerations

### Frontend Optimization

1. **Code Splitting**: Routes lazy-loaded
2. **Tree Shaking**: Unused code removed by Vite
3. **Asset Optimization**: Images, CSS minified
4. **Caching**: Browser caching via Vercel CDN
5. **Lazy Loading**: Components loaded on demand

### Backend Optimization

1. **Connection Pooling**: Supabase handles DB connections
2. **Query Optimization**: Indexed columns for fast lookups
3. **Stateless Design**: No session storage, horizontal scaling
4. **Compression**: Response compression enabled

### Database Optimization

1. **Indexes**: All foreign keys and commonly queried columns indexed
2. **RLS Performance**: Policies optimized to avoid full table scans
3. **Query Limits**: Pagination for large result sets
4. **Materialized Views**: Future optimization for complex aggregations

---

## Scalability Strategy

### Current Capacity (Free Tier)
- **Users**: 10,000+ concurrent
- **Database**: 500 MB storage, unlimited rows
- **API**: Unlimited requests
- **Bandwidth**: 100 GB/month (Vercel)

### Scaling Plan

**Phase 1: 0-1K Users**
- Current architecture sufficient
- Monitor metrics

**Phase 2: 1K-10K Users**
- Upgrade Supabase to Pro tier
- Add database read replicas
- Implement caching layer (Redis)

**Phase 3: 10K-100K Users**
- Add CDN for static assets
- Implement queue system for async tasks
- Database sharding by geography

**Phase 4: 100K+ Users**
- Microservices architecture
- Dedicated database clusters
- Multi-region deployment
- Load balancing

---

## Monitoring & Observability

### Metrics to Track

**Application Metrics**
- Request latency (p50, p95, p99)
- Error rate by endpoint
- Active user count
- Database query performance

**Business Metrics**
- New signups per day
- Booking creation rate
- Provider approval rate
- Average booking confirmation time

**Infrastructure Metrics**
- Database connection count
- API server CPU/memory
- CDN cache hit rate
- SSL certificate expiration

### Tools

- **Vercel Analytics**: Frontend performance
- **Railway Metrics**: Backend resource usage
- **Supabase Dashboard**: Database performance
- **GitHub Actions**: CI/CD pipeline status

---

**Document End**
