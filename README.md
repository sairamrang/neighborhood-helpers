# NeighborHood Helpers

A modern community marketplace platform connecting young entrepreneurs with local residents who need services. Built for millennials seeking trusted, local service providers while empowering the next generation to build their businesses.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

## Overview

NeighborHood Helpers is a full-stack web application that creates a trusted marketplace for local services. Young entrepreneurs can offer services like lawn care, tutoring, pet sitting, and more, while residents can easily find and book reliable help in their community.

**Key Differentiators:**
- Admin-approved providers ensure quality and safety
- Request-based booking system (not instant booking)
- Focus on young entrepreneurs building real business skills
- Community-first approach with local connections

## Features

### Current Features (Phase 1)

#### For Residents
- Browse vetted service providers by category
- View detailed provider profiles with bios and photos
- Send booking requests with preferred dates and notes
- Manage booking status (pending, confirmed, completed)
- Track booking history

#### For Service Providers
- Create professional profile with bio and photo
- List multiple services with custom pricing
- Set hourly or per-job rates
- Receive and manage booking requests
- Accept or decline requests
- Mark completed jobs

#### For Admins
- Review and approve new service providers
- View platform statistics
- Manage provider listings
- Ensure quality control before providers go live

#### Platform Features
- Secure authentication with email/password
- Mobile-responsive design
- Real-time updates
- Category-based service filtering
- Professional, millennial-focused UI

### Roadmap (Future Phases)

**Phase 2: Payments & Reviews**
- Stripe payment integration
- In-app payment processing
- Rating and review system
- Earnings dashboard for providers

**Phase 3: Mobile Apps**
- iOS native app
- Android native app
- Push notifications
- Location-based services

**Phase 4: Enhanced Features**
- Calendar scheduling integration
- Real-time chat between residents and providers
- Photo uploads for completed jobs
- Recurring bookings
- Multi-provider scheduling

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.x | UI framework |
| TypeScript | 5.x | Type safety |
| Vite | 7.x | Build tool & dev server |
| Tailwind CSS | 3.4.x | Styling framework |
| React Router | 6.x | Client-side routing |
| Supabase JS | 2.x | Auth & database client |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18+ | Runtime environment |
| Express | 4.x | Web framework |
| TypeScript | 5.x | Type safety |
| tsx | 4.x | TypeScript execution |
| dotenv | 16.x | Environment variables |

### Database & Infrastructure
| Service | Purpose |
|---------|---------|
| Supabase | PostgreSQL database, Authentication, Row Level Security |
| Vercel | Frontend hosting |
| Railway | Backend API hosting |

### Design System
- **Colors**: Professional blue (#3b82f6) and teal (#14b8a6) palette
- **Typography**: Inter (body), Plus Jakarta Sans (headings)
- **Components**: Clean, card-based layouts with subtle shadows
- **Approach**: Mobile-first, accessibility-focused

## Project Structure

```
neighborhood-helpers/
├── src/                          # Frontend React application
│   ├── components/              # Reusable UI components
│   │   └── Navbar.tsx           # Navigation component
│   ├── contexts/                # React Context providers
│   │   └── AuthContext.tsx      # Authentication state management
│   ├── lib/                     # Utilities and clients
│   │   └── supabase.ts          # Supabase client configuration
│   ├── pages/                   # Page components
│   │   ├── Landing.tsx          # Marketing landing page
│   │   ├── Login.tsx            # User login
│   │   ├── Signup.tsx           # User registration
│   │   ├── Dashboard.tsx        # User dashboard
│   │   ├── Services.tsx         # Browse services
│   │   ├── ServiceDetail.tsx    # Single service view
│   │   ├── Bookings.tsx         # Booking management
│   │   ├── ProviderProfile.tsx  # Provider profile management
│   │   └── Admin.tsx            # Admin dashboard
│   ├── App.tsx                  # Main app component & routing
│   ├── main.tsx                 # React entry point
│   └── index.css                # Global styles & Tailwind config
│
├── backend/                      # Node.js Express API
│   ├── src/
│   │   ├── routes/              # API route handlers
│   │   │   ├── services.ts      # Service CRUD operations
│   │   │   ├── bookings.ts      # Booking management
│   │   │   ├── providers.ts     # Provider profiles
│   │   │   └── admin.ts         # Admin operations
│   │   ├── middleware/          # Express middleware
│   │   │   └── auth.ts          # JWT authentication
│   │   ├── lib/                 # Backend utilities
│   │   │   └── supabase.ts      # Supabase admin client
│   │   └── index.ts             # Express app setup
│   ├── package.json
│   └── tsconfig.json
│
├── public/                       # Static assets
├── docs/                         # Documentation
│   ├── PRD.md                   # Product Requirements Document
│   ├── ARCHITECTURE.md          # Technical architecture
│   ├── API.md                   # API documentation
│   └── DEPLOYMENT.md            # Deployment guide
│
├── supabase-schema.sql          # Database schema & RLS policies
├── fix-admin-access.sql         # Local dev admin helper
├── package.json                 # Frontend dependencies
├── vite.config.ts               # Vite configuration
├── tailwind.config.js           # Tailwind CSS configuration
├── postcss.config.js            # PostCSS configuration
└── tsconfig.json                # TypeScript configuration
```

## Quick Start

### Prerequisites
- **Node.js** 18.x or higher
- **npm** 9.x or higher
- **Supabase account** (free tier works)
- **Git** for version control

### 1. Clone the Repository
```bash
git clone https://github.com/sairamrang/neighborhood-helpers.git
cd neighborhood-helpers
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Navigate to SQL Editor
3. Copy and run the contents of `supabase-schema.sql`
4. Get your credentials from Settings > API:
   - Project URL
   - Anon/Public Key
   - Service Role Key

### 3. Frontend Setup

```bash
# Install dependencies
npm install

# Create environment file
cat > .env << EOF
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
EOF

# Start development server
npm run dev
```

Frontend will be available at **http://localhost:5173**

### 4. Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create environment file
cat > .env << EOF
PORT=3001
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
SUPABASE_ANON_KEY=your_supabase_anon_key
ADMIN_EMAILS=your-email@example.com
EOF

# Start development server
npm run dev
```

Backend API will be available at **http://localhost:3001**

### 5. Create Your First Admin User

1. Sign up through the frontend at http://localhost:5173/signup
2. Use the email you added to `ADMIN_EMAILS` in backend `.env`
3. Access admin dashboard at http://localhost:5173/admin

## Database Schema

### Core Tables

#### `profiles`
User profile information extending Supabase auth
```sql
- id: UUID (FK to auth.users)
- email: TEXT
- full_name: TEXT
- user_type: TEXT ('resident' | 'provider')
- created_at: TIMESTAMP
```

#### `service_providers`
Provider-specific profile data
```sql
- id: UUID (PK)
- user_id: UUID (FK to profiles)
- bio: TEXT
- profile_image_url: TEXT
- is_approved: BOOLEAN (default: false)
- created_at: TIMESTAMP
```

#### `services`
Services offered by providers
```sql
- id: UUID (PK)
- provider_id: UUID (FK to service_providers)
- title: TEXT
- description: TEXT
- category: TEXT
- price: DECIMAL
- price_type: TEXT ('hourly' | 'per_job')
- is_active: BOOLEAN
- created_at: TIMESTAMP
```

#### `bookings`
Booking requests and their status
```sql
- id: UUID (PK)
- service_id: UUID (FK to services)
- resident_id: UUID (FK to profiles)
- provider_id: UUID (FK to service_providers)
- status: TEXT ('pending' | 'confirmed' | 'completed' | 'cancelled')
- booking_date: TIMESTAMP
- notes: TEXT
- created_at: TIMESTAMP
```

### Security

**Row Level Security (RLS)** is enabled on all tables with the following policies:

- Users can only read/update their own profiles
- Only approved providers are visible to residents
- Users can only manage their own bookings
- Providers can only manage their own services
- Admins have elevated permissions for approval workflows

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed security model.

## API Documentation

### Base URL
- Development: `http://localhost:3001/api`
- Production: `https://your-railway-app.railway.app/api`

### Authentication
All authenticated endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <supabase_jwt_token>
```

### Key Endpoints

#### Services
- `GET /services` - List all active services
- `GET /services/:id` - Get service details
- `POST /services` - Create service (auth required)
- `PUT /services/:id` - Update service (auth required)
- `DELETE /services/:id` - Delete service (auth required)

#### Bookings
- `GET /bookings` - List user's bookings (auth required)
- `POST /bookings` - Create booking request (auth required)
- `PATCH /bookings/:id/status` - Update status (auth required)

#### Providers
- `GET /providers` - List approved providers
- `POST /providers` - Create provider profile (auth required)
- `PUT /providers/:id` - Update profile (auth required)

#### Admin
- `GET /admin/pending-providers` - List pending approvals (admin only)
- `PATCH /admin/providers/:id/approval` - Approve/reject (admin only)

See [docs/API.md](docs/API.md) for complete API reference.

## Environment Variables

### Frontend (.env)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Backend (backend/.env)
```env
PORT=3001
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
ADMIN_EMAILS=admin1@example.com,admin2@example.com
```

## Deployment

### Frontend (Vercel)

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel --prod
   ```

3. Set environment variables in Vercel dashboard

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed deployment instructions.

### Backend (Railway)

1. Install Railway CLI:
   ```bash
   npm i -g @railway/cli
   ```

2. Deploy:
   ```bash
   cd backend
   railway login
   railway init
   railway up
   ```

3. Set environment variables in Railway dashboard

## Development Workflow

### Running Tests
```bash
# Frontend tests
npm test

# Backend tests
cd backend && npm test
```

### Code Formatting
```bash
# Format code
npm run format

# Lint code
npm run lint
```

### Building for Production
```bash
# Build frontend
npm run build

# Build backend
cd backend && npm run build
```

## Service Categories

The platform currently supports these service categories:
- Lawn Care
- Window Washing
- Snow Removal
- Pet Sitting
- Tutoring
- Car Detailing
- Photography
- Tech Support
- Other

Categories can be extended in the database schema.

## User Flows

### Resident Journey
1. Sign up with email/password
2. Browse services by category
3. View provider profiles and ratings
4. Send booking request with date and notes
5. Receive confirmation when provider accepts
6. Service is completed
7. Mark booking as complete

### Provider Journey
1. Sign up as service provider
2. Create profile with bio and photo
3. Add services with pricing
4. Wait for admin approval
5. Receive booking requests
6. Accept or decline requests
7. Complete services
8. Build reputation

### Admin Workflow
1. Log in with admin email
2. Review pending provider applications
3. Check provider profiles and services
4. Approve or reject applications
5. Monitor platform activity

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Submit a pull request

## Troubleshooting

### Common Issues

**Frontend won't start:**
- Check that `.env` file exists with correct Supabase credentials
- Verify Node.js version is 18+
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`

**Backend connection errors:**
- Verify Supabase Service Role Key is correct
- Check that backend `.env` has `dotenv.config()` being called
- Ensure port 3001 is not in use

**Database errors:**
- Confirm `supabase-schema.sql` was run successfully
- Check RLS policies are enabled
- Verify user has correct permissions

**Styling issues:**
- Kill Vite dev server and restart
- Clear Tailwind cache: `rm -rf .vite`
- Check `tailwind.config.js` for syntax errors

See [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) for more help.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- **Documentation**: [/docs](/docs)
- **Issues**: [GitHub Issues](https://github.com/sairamrang/neighborhood-helpers/issues)
- **Email**: srangachari@gmail.com

## Acknowledgments

Built with modern web technologies to empower young entrepreneurs and strengthen local communities.

---

**Version**: 1.0.0
**Last Updated**: October 2025
**Maintainer**: Sai Rangachari
