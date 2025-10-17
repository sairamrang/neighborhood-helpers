# NeighborHood Helpers

A community platform connecting young entrepreneurs with residents who need services. This application fosters an entrepreneurial mindset in youth while strengthening neighborhood connections.

## Features

### Phase 1 (Current)
- **Dual User Types**: Residents and Service Providers
- **Authentication**: Email/password signup and login
- **Service Provider Profiles**: Bio, photo, and service listings
- **Service Management**: Create, edit, and manage multiple services with categories
- **Service Browsing**: Filter and search services by category
- **Booking System**: Request-based booking with accept/decline workflow
- **Admin Dashboard**: Approve service providers before they go live
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS

### Future Enhancements
- Payment integration
- iOS and Android mobile apps
- Rating and review system
- Real-time notifications
- Calendar scheduling
- Photo upload for services

## Tech Stack

### Frontend
- **React** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Supabase JS Client** for authentication and database

### Backend
- **Node.js** with Express
- **TypeScript**
- **Supabase** for PostgreSQL database and authentication

### Deployment
- **Frontend**: Vercel
- **Backend**: Railway
- **Database**: Supabase (PostgreSQL)

## Project Structure

```
neighborhood-helpers/
├── src/                        # Frontend source code
│   ├── components/            # Reusable components
│   ├── contexts/              # React contexts (Auth)
│   ├── lib/                   # Utilities and Supabase client
│   ├── pages/                 # Page components
│   ├── App.tsx                # Main app component
│   └── main.tsx               # Entry point
├── backend/                    # Backend API
│   ├── src/
│   │   ├── routes/            # API routes
│   │   ├── middleware/        # Auth middleware
│   │   └── index.ts           # Express app
│   └── package.json
├── supabase-schema.sql        # Database schema
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Vercel account (for deployment)
- Railway account (for deployment)

### 1. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the contents of `supabase-schema.sql`
3. Get your project credentials:
   - Project URL
   - Anon/Public Key
   - Service Role Key (keep this secret!)

### 2. Frontend Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Run development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

### 3. Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in the backend directory:
```env
PORT=3001
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
SUPABASE_ANON_KEY=your_supabase_anon_key
ADMIN_EMAILS=admin@example.com,another@example.com
```

4. Run development server:
```bash
npm run dev
```

The backend API will be available at `http://localhost:3001`

### 4. Deploy to Vercel (Frontend)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Add environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### 5. Deploy to Railway (Backend)

1. Install Railway CLI:
```bash
npm i -g @railway/cli
```

2. Login and initialize:
```bash
railway login
cd backend
railway init
```

3. Add environment variables in Railway dashboard:
   - `PORT` (Railway will set this automatically)
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY`
   - `SUPABASE_ANON_KEY`
   - `ADMIN_EMAILS`

4. Deploy:
```bash
railway up
```

## Database Schema

### Tables

#### profiles
- User profiles (extends Supabase auth.users)
- Fields: id, email, full_name, user_type (resident/provider)

#### service_providers
- Service provider profiles
- Fields: id, user_id, bio, profile_image_url, is_approved

#### services
- Services offered by providers
- Fields: id, provider_id, title, description, category, price, price_type

#### bookings
- Booking requests
- Fields: id, service_id, resident_id, provider_id, status, booking_date, notes

### Security
- Row Level Security (RLS) enabled on all tables
- Users can only view/edit their own data
- Service providers must be approved to be visible
- Admins can approve/reject providers

## User Flows

### For Residents
1. Sign up with email/password
2. Browse available services by category
3. View service details and provider profiles
4. Send booking requests with preferred date/time
5. View and manage bookings
6. Cancel pending bookings

### For Service Providers
1. Sign up with email/password as a provider
2. Create provider profile (bio, photo)
3. Add services with details (title, description, category, price)
4. Wait for admin approval
5. Receive and manage booking requests
6. Accept/decline booking requests
7. Mark bookings as completed

### For Admins
1. Access admin dashboard at `/admin`
2. View pending provider approvals
3. Review provider profiles and services
4. Approve or reject providers

## Service Categories
- Lawn Care
- Window Washing
- Snow Shoveling
- Pet Sitting
- Tutoring
- Car Washing
- Other

## API Endpoints

### Services
- `GET /api/services` - List all active services
- `GET /api/services/:id` - Get service details
- `POST /api/services` - Create service (auth required)
- `PUT /api/services/:id` - Update service (auth required)
- `DELETE /api/services/:id` - Delete service (auth required)

### Bookings
- `GET /api/bookings` - List user's bookings (auth required)
- `POST /api/bookings` - Create booking (auth required)
- `PATCH /api/bookings/:id/status` - Update booking status (auth required)

### Providers
- `GET /api/providers` - List approved providers
- `GET /api/providers/:id` - Get provider details
- `POST /api/providers` - Create provider profile (auth required)
- `PUT /api/providers/:id` - Update provider profile (auth required)
- `GET /api/providers/me/profile` - Get current user's provider profile (auth required)

### Admin
- `GET /api/admin/pending-providers` - List pending approvals (admin only)
- `PATCH /api/admin/providers/:id/approval` - Approve/reject provider (admin only)
- `GET /api/admin/providers` - List all providers (admin only)
- `GET /api/admin/stats` - Platform statistics (admin only)

## Contributing

This is a community project to help young entrepreneurs. Contributions are welcome!

## License

MIT

## Support

For questions or issues, please open an issue in the repository.
