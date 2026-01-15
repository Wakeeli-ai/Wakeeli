# 🐳 Docker Setup Guide for Wakeeli

This guide will help you run Wakeeli using Docker and Docker Compose.

## 📋 Prerequisites

1. **Docker** installed ([Download Docker](https://www.docker.com/get-started))
2. **Docker Compose** (usually included with Docker Desktop)
3. **API Keys** (OpenAI, WhatsApp) - see `QUICK_START.md` for details

## 🚀 Quick Start

### 1. Set Up Environment Variables

```bash
# Copy the example env file
cp docker-compose.env.example .env

# Edit .env and add your API keys
# Required:
# - OPENAI_API_KEY
# - WHATSAPP_TOKEN
# - WHATSAPP_VERIFY_TOKEN
# - WHATSAPP_PHONE_NUMBER_ID
```

### 2. Build and Start All Services

```bash
# Build and start all containers
docker-compose up -d

# Or build and start with logs visible
docker-compose up
```

### 3. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

### 4. Stop the Application

```bash
# Stop all containers
docker-compose down

# Stop and remove volumes (deletes database data)
docker-compose down -v
```

## 📁 Project Structure

```
Wakeeli/
├── docker-compose.yml          # Orchestrates all services
├── backend/
│   ├── Dockerfile              # Backend container definition
│   └── .dockerignore
├── frontend/
│   ├── Dockerfile              # Frontend container definition
│   ├── nginx.conf              # Nginx configuration
│   └── .dockerignore
└── .env                        # Your environment variables
```

## 🏗️ Services

### 1. **Database (PostgreSQL)**
- **Port**: 5432
- **User**: wakeeli_user
- **Password**: wakeeli_password
- **Database**: wakeeli_db
- **Volume**: `postgres_data` (persists data)

### 2. **Backend API**
- **Port**: 8000
- **Framework**: FastAPI
- **Auto-reloads** on code changes (development mode)

### 3. **Frontend**
- **Port**: 3000
- **Framework**: React + Vite
- **Server**: Nginx (production build)

## 🔧 Common Commands

### View Logs

```bash
# All services
docker-compose logs

# Specific service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs db

# Follow logs (live)
docker-compose logs -f backend
```

### Rebuild After Code Changes

```bash
# Rebuild specific service
docker-compose build backend
docker-compose up -d backend

# Rebuild all services
docker-compose build
docker-compose up -d
```

### Access Container Shell

```bash
# Backend container
docker-compose exec backend bash

# Database container
docker-compose exec db psql -U wakeeli_user -d wakeeli_db
```

### Database Operations

```bash
# Create a database backup
docker-compose exec db pg_dump -U wakeeli_user wakeeli_db > backup.sql

# Restore from backup
docker-compose exec -T db psql -U wakeeli_user wakeeli_db < backup.sql

# Reset database (⚠️ deletes all data)
docker-compose down -v
docker-compose up -d
```

## 🐛 Troubleshooting

### Port Already in Use

If ports 3000, 8000, or 5432 are already in use:

1. **Option 1**: Stop the conflicting service
2. **Option 2**: Change ports in `docker-compose.yml`:
   ```yaml
   ports:
     - "3001:80"  # Frontend
     - "8001:8000"  # Backend
     - "5433:5432"  # Database
   ```

### Database Connection Issues

```bash
# Check if database is healthy
docker-compose ps

# View database logs
docker-compose logs db

# Restart database
docker-compose restart db
```

### Frontend Can't Connect to Backend

1. Check that backend is running: `docker-compose ps`
2. Check backend logs: `docker-compose logs backend`
3. Verify `VITE_API_URL` in frontend build matches your backend URL
4. Rebuild frontend: `docker-compose build frontend`

### Container Won't Start

```bash
# Check logs for errors
docker-compose logs

# Remove and recreate containers
docker-compose down
docker-compose up -d

# If still failing, rebuild from scratch
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

## 🔒 Security Notes

1. **Never commit `.env` file** - it contains sensitive keys
2. **Change default passwords** in production
3. **Use secrets management** for production deployments
4. **Update `.env`** with strong passwords before sharing

## 📦 Production Deployment

For production, consider:

1. **Use environment-specific configs** (`.env.production`)
2. **Enable HTTPS** (use reverse proxy like Traefik or Nginx)
3. **Set up proper secrets management** (Docker Secrets, AWS Secrets Manager, etc.)
4. **Use managed databases** (AWS RDS, Google Cloud SQL)
5. **Add monitoring** (Prometheus, Grafana)
6. **Set resource limits** in docker-compose.yml

Example production docker-compose additions:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

## 🚢 Sharing Your Docker Setup

To share your app:

1. **Create a `.env.example`** (already done: `docker-compose.env.example`)
2. **Ensure `.env` is in `.gitignore`**
3. **Share the repository** with:
   - `docker-compose.yml`
   - `Dockerfile` files
   - `docker-compose.env.example`
   - This guide (`DOCKER_SETUP.md`)

Recipients just need to:
```bash
git clone <your-repo>
cd Wakeeli
cp docker-compose.env.example .env
# Edit .env with their keys
docker-compose up -d
```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [FastAPI Docker Guide](https://fastapi.tiangolo.com/deployment/docker/)
- [React Docker Guide](https://mherman.org/blog/dockerizing-a-react-app/)

---

**Happy Dockerizing! 🐳**
