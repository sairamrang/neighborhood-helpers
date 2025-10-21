# API Documentation
# NeighborHood Helpers

**Version**: 1.0
**Last Updated**: October 2025
**Base URL (Development)**: `http://localhost:3001/api`
**Base URL (Production)**: `https://your-app.railway.app/api`

---

## Table of Contents
1. [Authentication](#authentication)
2. [Services API](#services-api)
3. [Bookings API](#bookings-api)
4. [Providers API](#providers-api)
5. [Admin API](#admin-api)
6. [Error Handling](#error-handling)
7. [Rate Limiting](#rate-limiting)

---

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header.

### Getting a Token

Tokens are obtained through Supabase authentication (handled by frontend):

```javascript
// Frontend - Login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});

// Extract token
const token = data.session.access_token;
```

### Using the Token

```http
GET /api/bookings
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Expiration

- Tokens expire after 1 hour
- Supabase client automatically refreshes tokens
- Expired tokens return `401 Unauthorized`

---

## Services API

### List All Services

Retrieve all active services from approved providers.

**Endpoint**: `GET /api/services`

**Authentication**: Not required

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `category` | string | No | Filter by category (e.g., "Lawn Care") |
| `limit` | number | No | Number of results (default: 50, max: 100) |
| `offset` | number | No | Pagination offset (default: 0) |

**Request Example**:
```http
GET /api/services?category=Lawn%20Care&limit=10
```

**Response (200 OK)**:
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "provider_id": "660e8400-e29b-41d4-a716-446655440001",
      "title": "Professional Lawn Mowing",
      "description": "Weekly lawn mowing service including edging and cleanup",
      "category": "Lawn Care",
      "price": 25.00,
      "price_type": "per_job",
      "is_active": true,
      "created_at": "2025-10-01T10:30:00Z",
      "service_providers": {
        "profile_image_url": "https://example.com/avatar.jpg",
        "profiles": {
          "full_name": "Alex Johnson"
        }
      }
    }
  ]
}
```

---

### Get Single Service

Retrieve detailed information about a specific service.

**Endpoint**: `GET /api/services/:id`

**Authentication**: Not required

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | UUID | Yes | Service ID |

**Request Example**:
```http
GET /api/services/550e8400-e29b-41d4-a716-446655440000
```

**Response (200 OK)**:
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "provider_id": "660e8400-e29b-41d4-a716-446655440001",
    "title": "Professional Lawn Mowing",
    "description": "Weekly lawn mowing service including edging and cleanup. I use professional equipment and provide my own gas.",
    "category": "Lawn Care",
    "price": 25.00,
    "price_type": "per_job",
    "is_active": true,
    "created_at": "2025-10-01T10:30:00Z",
    "service_providers": {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "bio": "High school student with 2 years of lawn care experience. Reliable and hardworking!",
      "profile_image_url": "https://example.com/avatar.jpg",
      "is_approved": true,
      "profiles": {
        "full_name": "Alex Johnson",
        "email": "alex@example.com"
      }
    }
  }
}
```

**Error Response (404 Not Found)**:
```json
{
  "error": "Service not found"
}
```

---

### Create Service

Create a new service listing (providers only).

**Endpoint**: `POST /api/services`

**Authentication**: Required (Provider)

**Request Body**:
```json
{
  "title": "Window Washing - Interior & Exterior",
  "description": "Professional window cleaning service for all home windows",
  "category": "Window Washing",
  "price": 15.00,
  "price_type": "hourly"
}
```

**Field Validations**:
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `title` | string | Yes | 5-100 characters |
| `description` | string | No | Max 500 characters |
| `category` | string | Yes | Valid category |
| `price` | number | Yes | > 0, max 2 decimal places |
| `price_type` | string | Yes | "hourly" or "per_job" |

**Response (201 Created)**:
```json
{
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "provider_id": "660e8400-e29b-41d4-a716-446655440001",
    "title": "Window Washing - Interior & Exterior",
    "description": "Professional window cleaning service for all home windows",
    "category": "Window Washing",
    "price": 15.00,
    "price_type": "hourly",
    "is_active": true,
    "created_at": "2025-10-15T14:22:00Z"
  }
}
```

**Error Responses**:

**401 Unauthorized**:
```json
{
  "error": "Authentication required"
}
```

**400 Bad Request**:
```json
{
  "error": "Invalid input",
  "details": {
    "title": "Title is required",
    "price": "Price must be greater than 0"
  }
}
```

---

### Update Service

Update an existing service (owner only).

**Endpoint**: `PUT /api/services/:id`

**Authentication**: Required (Owner)

**Request Body** (all fields optional):
```json
{
  "title": "Premium Window Washing Service",
  "price": 18.00,
  "is_active": false
}
```

**Response (200 OK)**:
```json
{
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "title": "Premium Window Washing Service",
    "price": 18.00,
    "is_active": false,
    "updated_at": "2025-10-16T09:15:00Z"
  }
}
```

**Error Response (403 Forbidden)**:
```json
{
  "error": "You can only update your own services"
}
```

---

### Delete Service

Delete a service (owner only).

**Endpoint**: `DELETE /api/services/:id`

**Authentication**: Required (Owner)

**Response (204 No Content)**:
```
(Empty body)
```

**Error Response (403 Forbidden)**:
```json
{
  "error": "You can only delete your own services"
}
```

---

## Bookings API

### List My Bookings

Retrieve all bookings for the authenticated user.

**Endpoint**: `GET /api/bookings`

**Authentication**: Required

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | string | No | Filter by status: "pending", "confirmed", "completed", "cancelled" |
| `limit` | number | No | Number of results (default: 50) |

**Request Example**:
```http
GET /api/bookings?status=pending
Authorization: Bearer eyJhbGci...
```

**Response (200 OK)**:
```json
{
  "data": [
    {
      "id": "880e8400-e29b-41d4-a716-446655440003",
      "service_id": "550e8400-e29b-41d4-a716-446655440000",
      "resident_id": "990e8400-e29b-41d4-a716-446655440004",
      "provider_id": "660e8400-e29b-41d4-a716-446655440001",
      "status": "pending",
      "booking_date": "2025-10-20T10:00:00Z",
      "notes": "Please bring your own lawn mower if possible",
      "created_at": "2025-10-15T16:45:00Z",
      "services": {
        "title": "Professional Lawn Mowing",
        "category": "Lawn Care",
        "price": 25.00,
        "price_type": "per_job"
      },
      "service_providers": {
        "profiles": {
          "full_name": "Alex Johnson"
        }
      }
    }
  ]
}
```

**Notes**:
- Residents see bookings where they are the `resident_id`
- Providers see bookings where they are the `provider_id`

---

### Create Booking

Create a new booking request (residents only).

**Endpoint**: `POST /api/bookings`

**Authentication**: Required (Resident)

**Request Body**:
```json
{
  "service_id": "550e8400-e29b-41d4-a716-446655440000",
  "booking_date": "2025-10-20T10:00:00Z",
  "notes": "Please call 30 minutes before arrival"
}
```

**Field Validations**:
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `service_id` | UUID | Yes | Must be valid, active service |
| `booking_date` | ISO 8601 | Yes | Must be future date |
| `notes` | string | No | Max 500 characters |

**Response (201 Created)**:
```json
{
  "data": {
    "id": "880e8400-e29b-41d4-a716-446655440005",
    "service_id": "550e8400-e29b-41d4-a716-446655440000",
    "resident_id": "990e8400-e29b-41d4-a716-446655440004",
    "provider_id": "660e8400-e29b-41d4-a716-446655440001",
    "status": "pending",
    "booking_date": "2025-10-20T10:00:00Z",
    "notes": "Please call 30 minutes before arrival",
    "created_at": "2025-10-15T17:00:00Z"
  }
}
```

**Error Responses**:

**400 Bad Request** (Duplicate booking):
```json
{
  "error": "You already have a pending booking for this service"
}
```

**400 Bad Request** (Invalid date):
```json
{
  "error": "Booking date must be in the future"
}
```

---

### Update Booking Status

Update the status of a booking (resident or provider).

**Endpoint**: `PATCH /api/bookings/:id/status`

**Authentication**: Required (Involved party)

**Request Body**:
```json
{
  "status": "confirmed"
}
```

**Valid Status Transitions**:
| Current Status | Allowed Next Status | Who Can Update |
|----------------|---------------------|----------------|
| `pending` | `confirmed`, `cancelled` | Provider or Resident |
| `confirmed` | `completed`, `cancelled` | Provider or Resident |
| `completed` | (none) | (locked) |
| `cancelled` | (none) | (locked) |

**Response (200 OK)**:
```json
{
  "data": {
    "id": "880e8400-e29b-41d4-a716-446655440005",
    "status": "confirmed",
    "updated_at": "2025-10-16T08:30:00Z"
  }
}
```

**Error Responses**:

**400 Bad Request** (Invalid transition):
```json
{
  "error": "Cannot change status from completed to confirmed"
}
```

**403 Forbidden**:
```json
{
  "error": "You can only update bookings you're involved in"
}
```

---

## Providers API

### List Approved Providers

Get all approved service providers.

**Endpoint**: `GET /api/providers`

**Authentication**: Not required

**Response (200 OK)**:
```json
{
  "data": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "bio": "High school student with 2 years of experience in lawn care and general outdoor maintenance.",
      "profile_image_url": "https://example.com/avatar.jpg",
      "is_approved": true,
      "created_at": "2025-09-15T12:00:00Z",
      "profiles": {
        "full_name": "Alex Johnson",
        "email": "alex@example.com"
      }
    }
  ]
}
```

---

### Get Single Provider

Get details of a specific provider.

**Endpoint**: `GET /api/providers/:id`

**Authentication**: Not required

**Response (200 OK)**:
```json
{
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "bio": "High school student with 2 years of experience...",
    "profile_image_url": "https://example.com/avatar.jpg",
    "is_approved": true,
    "services": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "title": "Professional Lawn Mowing",
        "category": "Lawn Care",
        "price": 25.00,
        "price_type": "per_job"
      }
    ]
  }
}
```

---

### Create Provider Profile

Create a provider profile (authenticated users only).

**Endpoint**: `POST /api/providers`

**Authentication**: Required

**Request Body**:
```json
{
  "bio": "Experienced in lawn care and snow removal. Available weekends and after school.",
  "profile_image_url": "https://example.com/my-photo.jpg"
}
```

**Field Validations**:
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `bio` | string | No | Max 500 characters |
| `profile_image_url` | string | No | Valid URL |

**Response (201 Created)**:
```json
{
  "data": {
    "id": "aa0e8400-e29b-41d4-a716-446655440006",
    "user_id": "bb0e8400-e29b-41d4-a716-446655440007",
    "bio": "Experienced in lawn care and snow removal...",
    "profile_image_url": "https://example.com/my-photo.jpg",
    "is_approved": false,
    "created_at": "2025-10-15T18:00:00Z"
  }
}
```

**Error Response (400 Bad Request)**:
```json
{
  "error": "Provider profile already exists for this user"
}
```

---

### Update Provider Profile

Update your provider profile (owner only).

**Endpoint**: `PUT /api/providers/:id`

**Authentication**: Required (Owner)

**Request Body**:
```json
{
  "bio": "Updated bio with more experience details",
  "profile_image_url": "https://example.com/new-photo.jpg"
}
```

**Response (200 OK)**:
```json
{
  "data": {
    "id": "aa0e8400-e29b-41d4-a716-446655440006",
    "bio": "Updated bio with more experience details",
    "profile_image_url": "https://example.com/new-photo.jpg",
    "updated_at": "2025-10-16T10:00:00Z"
  }
}
```

---

### Get My Provider Profile

Get your own provider profile and services.

**Endpoint**: `GET /api/providers/me/profile`

**Authentication**: Required (Provider)

**Response (200 OK)**:
```json
{
  "data": {
    "id": "aa0e8400-e29b-41d4-a716-446655440006",
    "bio": "Experienced in lawn care...",
    "is_approved": false,
    "services": [
      {
        "id": "cc0e8400-e29b-41d4-a716-446655440008",
        "title": "Lawn Mowing",
        "price": 20.00,
        "is_active": true
      }
    ]
  }
}
```

**Error Response (404 Not Found)**:
```json
{
  "error": "Provider profile not found. Please create a provider profile first."
}
```

---

## Admin API

All admin endpoints require admin authentication (user email in `ADMIN_EMAILS`).

### List Pending Providers

Get all providers awaiting approval.

**Endpoint**: `GET /api/admin/pending-providers`

**Authentication**: Required (Admin)

**Response (200 OK)**:
```json
{
  "data": [
    {
      "id": "dd0e8400-e29b-41d4-a716-446655440009",
      "bio": "I want to offer tutoring services in math and science",
      "profile_image_url": "https://example.com/tutor.jpg",
      "is_approved": false,
      "created_at": "2025-10-14T15:30:00Z",
      "profiles": {
        "full_name": "Sarah Miller",
        "email": "sarah@example.com"
      },
      "services": [
        {
          "id": "ee0e8400-e29b-41d4-a716-446655440010",
          "title": "Math Tutoring - High School",
          "category": "Tutoring",
          "price": 30.00,
          "price_type": "hourly"
        }
      ]
    }
  ]
}
```

---

### Approve/Reject Provider

Approve or reject a provider application.

**Endpoint**: `PATCH /api/admin/providers/:id/approval`

**Authentication**: Required (Admin)

**Request Body**:
```json
{
  "is_approved": true
}
```

**Response (200 OK)**:
```json
{
  "data": {
    "id": "dd0e8400-e29b-41d4-a716-446655440009",
    "is_approved": true,
    "updated_at": "2025-10-16T11:00:00Z"
  }
}
```

**To Reject** (set `is_approved: false` and provider record is deleted):
```json
{
  "message": "Provider rejected and removed"
}
```

---

### List All Providers

Get all providers (approved and pending).

**Endpoint**: `GET /api/admin/providers`

**Authentication**: Required (Admin)

**Response (200 OK)**:
```json
{
  "data": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "is_approved": true,
      "created_at": "2025-09-15T12:00:00Z",
      "profiles": {
        "full_name": "Alex Johnson"
      }
    },
    {
      "id": "dd0e8400-e29b-41d4-a716-446655440009",
      "is_approved": false,
      "created_at": "2025-10-14T15:30:00Z",
      "profiles": {
        "full_name": "Sarah Miller"
      }
    }
  ]
}
```

---

### Get Platform Statistics

Get platform-wide statistics.

**Endpoint**: `GET /api/admin/stats`

**Authentication**: Required (Admin)

**Response (200 OK)**:
```json
{
  "data": {
    "total_users": 245,
    "total_residents": 180,
    "total_providers": 65,
    "approved_providers": 52,
    "pending_providers": 13,
    "total_services": 127,
    "active_services": 119,
    "total_bookings": 342,
    "pending_bookings": 28,
    "confirmed_bookings": 15,
    "completed_bookings": 287,
    "cancelled_bookings": 12
  }
}
```

---

## Error Handling

### Standard Error Format

All errors follow this format:

```json
{
  "error": "Human-readable error message",
  "details": {} // Optional additional context
}
```

### HTTP Status Codes

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Invalid input, validation errors |
| 401 | Unauthorized | Missing or invalid auth token |
| 403 | Forbidden | Valid auth but insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource (e.g., duplicate booking) |
| 500 | Internal Server Error | Server-side error |

### Common Error Examples

**Missing Authentication**:
```json
{
  "error": "Authentication required",
  "details": "No authorization token provided"
}
```

**Invalid Token**:
```json
{
  "error": "Invalid or expired token",
  "details": "Please log in again"
}
```

**Validation Error**:
```json
{
  "error": "Validation failed",
  "details": {
    "title": "Title is required",
    "price": "Price must be a positive number"
  }
}
```

**Permission Denied**:
```json
{
  "error": "Permission denied",
  "details": "You can only update your own services"
}
```

---

## Rate Limiting

Currently no rate limiting is implemented. Future implementation will use:

- **Anonymous requests**: 100 requests/minute
- **Authenticated requests**: 1000 requests/minute
- **Admin requests**: Unlimited

Rate limit headers (future):
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1634567890
```

---

## API Versioning

Current version: `v1` (implied, no version in URL)

Future versioning strategy:
- URL-based: `/api/v2/services`
- Backwards compatibility for 6 months
- Deprecation warnings in response headers

---

## CORS Configuration

**Allowed Origins** (Production):
- `https://your-app.vercel.app`
- `https://custom-domain.com`

**Allowed Methods**:
- GET, POST, PUT, PATCH, DELETE, OPTIONS

**Allowed Headers**:
- Authorization, Content-Type

---

**Document End**
