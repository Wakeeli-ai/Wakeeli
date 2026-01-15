@echo off
REM Wakeeli Docker Startup Script for Windows

echo 🚀 Starting Wakeeli with Docker...

REM Check if .env exists
if not exist .env (
    echo 📝 Creating .env file from example...
    copy docker-compose.env.example .env
    echo ⚠️  Please edit .env and add your API keys before continuing!
    echo    Required: OPENAI_API_KEY, WHATSAPP_TOKEN, WHATSAPP_VERIFY_TOKEN, WHATSAPP_PHONE_NUMBER_ID
    pause
)

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running. Please start Docker and try again.
    pause
    exit /b 1
)

REM Build and start
echo 🔨 Building and starting containers...
docker-compose up -d --build

echo.
echo ✅ Wakeeli is starting up!
echo.
echo 📍 Access points:
echo    Frontend:  http://localhost:3000
echo    Backend:   http://localhost:8000
echo    API Docs:  http://localhost:8000/docs
echo.
echo 📊 View logs: docker-compose logs -f
echo 🛑 Stop:     docker-compose down
echo.
pause
