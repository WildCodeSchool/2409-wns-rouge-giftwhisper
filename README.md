# 🎁 GiftWhisper

Secret Santa Management Platform

GiftWhisper is a modern web application designed to facilitate Secret Santa gift exchanges with an intuitive interface and robust backend architecture.

## 📋 Table of Contents

- [Overview](#-overview)
- [Technical Stack](#️-technical-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Docker Services](#-docker-services)
- [Useful Commands](#️-useful-commands)
- [Development](#-development)
- [Database](#️-database)
- [Continuous Integration (CI)](#-continuous-integration-ci)
- [Deployment](#-deployment)

## 🔍 Overview

GiftWhisper is built with a modern full-stack architecture, featuring a GraphQL API backend and a React frontend, all containerized with Docker for easy development and deployment.

## 🛠️ Technical Stack

### Frontend

- **React 19** - JavaScript library for building user interfaces
- **TypeScript** - JavaScript with syntax for types
- **Vite** - Fast build tool and development server
- **Tailwind CSS v4** - Utility-first CSS framework
- **Apollo Client** - GraphQL client for React
- **React Hook Form** - Form management with validation
- **shadcn/ui** - Reusable components built with Radix UI and Tailwind CSS
- **Socket.IO Client** - Real-time communication

### Backend

- **Node.js** - Runtime environment
- **TypeScript** - JavaScript with syntax for types
- **Apollo Server** - GraphQL server implementation
- **Type-GraphQL** - GraphQL schema and resolvers using TypeScript decorators
- **TypeORM** - ORM for database operations
- **Express** - Web framework
- **Socket.IO** - Real-time bidirectional event-based communication
- **Argon2** - Password hashing
- **Nodemailer** - Email sending functionality
- **Jest** - Testing framework

### Infrastructure

- **Docker & Docker Compose** - Containerization and orchestration
- **PostgreSQL** - Primary database
- **pgAdmin** - Database administration interface
- **Nginx** - Reverse proxy and load balancer

## 📁 Project Structure

```
giftwhisper/
├── backend/                 # Backend API (Node.js + GraphQL)
│   ├── src/
│   │   ├── entities/        # TypeORM entities
│   │   ├── resolvers/       # GraphQL resolvers
│   │   ├── queries/         # Database queries
│   │   ├── decorators/      # Custom decorators
│   │   └── index.ts         # Server entry point
│   ├── Dockerfile
│   └── package.json
├── frontend/                # Frontend application (React + Vite)
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── api/             # GraphQL queries and mutations
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utility functions
│   │   └── App.tsx          # Main application component
│   ├── Dockerfile
│   └── package.json
├── nginx/                   # Nginx configuration
├── docs/                    # Project documentation
├── .github/                 # GitHub Actions workflows
│   └── workflows/
│       ├── main-client.yml
│       ├── main-server.yml
│       ├── staging-client.yml
│       └── staging-server.yml
├── compose.yml              # Development Docker Compose
├── compose.prod.yml         # Production Docker Compose
└── .env.example             # Environment variables template
```

## 📋 Prerequisites

- **Docker** and **Docker Compose** (recommended)
- **Node.js** (version 18 or higher) - if running without Docker
- **PostgreSQL** - if running without Docker

## 🚀 Installation

### Option 1: Using Docker (Recommended)

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd giftwhisper
   ```

2. **Configure environment variables:**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration. Most values can stay as default, but you'll need to:

   - Generate a `JWT_SECRET_KEY`
   - Ask a team member for SMTP credentials if you need to test email functionality

3. **Start all services:**

   ```bash
   docker-compose up -d
   ```

4. **Access the application:**
   - **Frontend:** http://localhost:8000
   - **Backend GraphQL Playground:** http://localhost:5500/graphql
   - **pgAdmin:** http://localhost:5050 (admin@admin.com / admin)

### Option 2: Manual Installation

1. **Clone and setup:**

   ```bash
   git clone <repository-url>
   cd giftwhisper
   cp .env.example .env
   ```

2. **Setup PostgreSQL database manually**

3. **Install and run backend:**

   ```bash
   cd backend
   npm install
   npm run start
   ```

4. **Install and run frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 🐳 Docker Services

The application uses Docker Compose with the following services:

| Service     | Port | Description                       |
| ----------- | ---- | --------------------------------- |
| **front**   | 5173 | React frontend application        |
| **back**    | 5500 | Node.js GraphQL API               |
| **nginx**   | 8000 | Reverse proxy (main access point) |
| **db**      | 3001 | PostgreSQL database               |
| **db-test** | 3002 | PostgreSQL test database          |
| **pgadmin** | 5050 | Database administration interface |

## ⌨️ Useful Commands

### Docker

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f [service_name]

# Rebuild services
docker-compose up --build
```

### Backend Development

```bash
cd backend

# Install dependencies
npm install

# Start development server
npm run start

# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Watch mode for tests
npm run test:unit:watch
npm run test:integration:watch
```

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Preview production build
npm run preview
```

## 💻 Development

### Backend (GraphQL API)

The backend is built with TypeORM and Type-GraphQL, providing a robust GraphQL API with:

- **Authentication & Authorization** - JWT-based auth with Argon2 password hashing
- **Real-time Communication** - Socket.IO integration
- **Email Functionality** - Nodemailer for notifications
- **Database Management** - TypeORM with PostgreSQL
- **Testing** - Jest for unit and integration tests

Key files:

- `src/index.ts` - Server entry point
- `src/entities/` - Database models
- `src/resolvers/` - GraphQL resolvers
- `src/auth.ts` - Authentication logic

### Frontend (React + Vite)

The frontend is a modern React application with:

- **GraphQL Integration** - Apollo Client for data management
- **Modern UI** - Tailwind CSS with shadcn/ui components
- **Type Safety** - Full TypeScript coverage
- **Form Handling** - React Hook Form with Zod validation
- **Real-time Updates** - Socket.IO client integration

Key files:

- `src/App.tsx` - Main application component
- `src/components/` - Reusable UI components
- `src/api/` - GraphQL queries and mutations
- `src/hooks/` - Custom React hooks

## 🗄️ Database

The application uses PostgreSQL with TypeORM for database operations:

- **Primary Database:** `giftwhisper` (port 3001)
- **Test Database:** `giftwhisper_test` (port 3002)
- **Administration:** pgAdmin available at http://localhost:5050

## 🚀 Continuous Integration (CI)

The project includes GitHub Actions workflows for automated testing and deployment:

### Staging Workflows

- **staging-client.yml** - Frontend testing and deployment to staging
- **staging-server.yml** - Backend testing with PostgreSQL and deployment

### Production Workflows

- **main-client.yml** - Production frontend deployment
- **main-server.yml** - Production backend deployment with full test suite

Each workflow includes:

- Dependency installation
- Code linting (where applicable)
- Test execution
- Docker image building and pushing to Docker Hub

### Environment Variables for CI

Configure these secrets in your GitHub repository:

- `DOCKERHUB_USERNAME` & `DOCKERHUB_TOKEN` - Docker Hub credentials
- `TEST_POSTGRES_USER` & `TEST_POSTGRES_PASSWORD` - Test database credentials

## 🤝 Contributing

### Branch Protection & Workflow

Both `main` and `staging` branches are protected and require pull requests for all changes. Direct pushes are not allowed.

#### Development Workflow

1. **Feature Development:**

   ```bash
   # Create a new feature branch from staging
   git checkout staging
   git pull origin staging
   git checkout -b feature/your-feature-name

   # Develop your feature
   # ...

   # Push and create PR to staging
   git push origin feature/your-feature-name
   ```

2. **Pull Request to Staging:**

   - Open a PR from your feature branch to `staging`
   - Ensure all CI checks pass
   - Request code review from team members
   - Merge after approval

3. **Production Deployment:**
   - Once features are tested and validated on staging
   - Open a PR from `staging` to `main`
   - This triggers production deployment after merge

#### Branch Strategy

- **`main`** - Production branch (protected)
- **`staging`** - Pre-production testing branch (protected)
- **`feature/*`** - Individual feature branches
- **`fix/*`** - Bug fix branches
- **`hotfix/*`** - Critical production fixes

## 📧 Email Configuration

For email functionality, configure SMTP settings in your `.env` file. For Gmail:

1. Enable 2-factor authentication
2. Generate an App Password
3. Use the App Password as `SMTP_PASSWORD`

## 🔧 Troubleshooting

### Common Issues

**Port conflicts:**

```bash
# Check if ports are in use
sudo netstat -tlnp | grep :8000
sudo netstat -tlnp | grep :5500
```

**Database connection issues:**

```bash
# Reset database
docker-compose down -v
docker-compose up -d
```

**Permission issues with volumes:**

```bash
# Fix volume permissions
sudo chown -R $USER:$USER ./backend/src
sudo chown -R $USER:$USER ./frontend/src
```

## 🚀 Deployment

Le projet utilise une pipeline CI/CD complète avec GitHub Actions et DockerHub :

- **Staging** : Déploiement automatique via webhook DockerHub
- **Production** : Déploiement manuel pour un contrôle maximal

Pour la documentation complète du déploiement, consultez : **[docs/Deploiement.md](docs/Deploiement.md)**

Cette documentation couvre :

- Architecture de déploiement et flux CI/CD
- Configuration des environnements (staging/production)
- Déploiement automatique (staging) vs manuel (production)
- Commandes de déploiement manuel et rollback
- Monitoring, logs et troubleshooting

## 📚 Additional Resources

- [TypeORM Documentation](https://typeorm.io/)
- [Apollo GraphQL Documentation](https://www.apollographql.com/docs/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
