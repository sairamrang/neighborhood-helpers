#!/bin/bash

echo "🏘️  NeighborHood Helpers Setup Script"
echo "====================================="
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found. Creating from .env.example..."
    cp .env.example .env
    echo "✅ Created .env file"
    echo "⚠️  Please edit .env and add your Supabase credentials"
    echo ""
else
    echo "✅ .env file already exists"
    echo ""
fi

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install
if [ $? -eq 0 ]; then
    echo "✅ Frontend dependencies installed"
    echo ""
else
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi

# Setup backend
cd backend

# Check if backend .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  No backend .env file found. Creating from .env.example..."
    cp .env.example .env
    echo "✅ Created backend .env file"
    echo "⚠️  Please edit backend/.env and add your Supabase credentials"
    echo ""
else
    echo "✅ Backend .env file already exists"
    echo ""
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
npm install
if [ $? -eq 0 ]; then
    echo "✅ Backend dependencies installed"
    echo ""
else
    echo "❌ Failed to install backend dependencies"
    exit 1
fi

cd ..

echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env with your Supabase credentials"
echo "2. Edit backend/.env with your Supabase credentials"
echo "3. Run 'npm run dev' in one terminal for the frontend"
echo "4. Run 'cd backend && npm run dev' in another terminal for the backend"
echo ""
echo "📖 See QUICKSTART.md for detailed setup instructions"
