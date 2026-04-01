# Stage 1: Build the React frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./

# Use relative API path so frontend calls same-origin backend
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Stage 2: Python backend serving both API and frontend
FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application code
COPY backend/ .

# Copy compiled frontend build into backend's frontend_dist directory
COPY --from=frontend-builder /frontend/dist ./frontend_dist

EXPOSE 8000

RUN chmod +x start.sh
CMD ["bash", "start.sh"]
