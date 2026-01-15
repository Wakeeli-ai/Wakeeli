#!/bin/bash

# Wakeeli Docker Startup Script

echo "🚀 Starting Wakeeli with Docker..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from example..."
    cp docker-compose.env.example .env
    echo "⚠️  Please edit .env and add your API keys before continuing!"
    echo "   Required: OPENAI_API_KEY, WHATSAPP_TOKEN, WHATSAPP_VERIFY_TOKEN, WHATSAPP_PHONE_NUMBER_ID"
    read -p "Press Enter after you've edited .env..."
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Build and start
echo "🔨 Building and starting containers..."
docker-compose up -d --build

echo ""
echo "✅ Wakeeli is starting up!"
echo ""
echo "📍 Access points:"
echo "   Frontend:  http://localhost:3000"
echo "   Backend:   http://localhost:8000"
echo "   API Docs:  http://localhost:8000/docs"
echo ""
echo "📊 View logs: docker-compose logs -f"
echo "🛑 Stop:     docker-compose down"
echo ""
