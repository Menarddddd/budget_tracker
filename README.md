# 🏦 Budget Tracker API

A production-ready REST API for personal budget management built with
FastAPI and PostgreSQL. Features automatic budget cycle management,
expense tracking, custom categories, and a full authentication system
with email verification.

🌐 **Live Demo:** https://budget-tracker-liart-nu.vercel.app
📖 **API Docs:** https://budget-tracker-api.fly.dev/docs

---

## ✨ Features

### 👤 Authentication & Security
- User registration with **email verification**
- Secure login with **JWT access + refresh token rotation**
- Forgot password and reset password via email
- OAuth2 compliant authentication flow

### 💰 Budget Cycles
- Create a budget with a **start date** and **amount**
- Backend **automatically tracks** the active cycle
- When a cycle ends, a **new cycle is created automatically**
  with the same budget amount
- Users can **edit** their budget amount at any time
- Only **one active cycle** per user enforced at the database level

### 📊 Dashboard
- Summary of the **current active cycle**
- Total **spent** vs **remaining** budget
- Breakdown by **category**

### 🧾 Expenses
- Create, read, update, and delete expenses
- Attach expenses to **categories**
- Expenses are tied to the **active budget cycle**

### 🗂️ Categories
- **Default categories** seeded automatically on startup
- Users can create their own **custom categories**
- Full CRUD on custom categories

### 👤 Profile Management
- Update personal information
- Change email (with re-verification)
- Change password

### 🛡️ Admin Panel
- View all users and their details
- Promote users to **admin** or demote them
- Delete users
- Create, edit, and delete **default categories**

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | FastAPI |
| **Language** | Python 3.12 |
| **Database** | PostgreSQL (Neon Serverless) |
| **ORM** | SQLAlchemy (async) |
| **Migrations** | Alembic |
| **Driver** | asyncpg |
| **Auth** | JWT (OAuth2) |
| **Validation** | Pydantic v2 |
| **Package Manager** | uv |
| **Containerization** | Docker |
| **CI/CD** | GitHub Actions |
| **Backend Host** | Fly.io |
| **Frontend Host** | Vercel |
| **Email** | Gmail SMTP |

## 🚀 CI/CD Pipeline
Every push to `main` automatically deploys both
frontend and backend.


## ⚙️ Environment Variables

Create a `.env` file in the root of the project:

```env
# Database
DATABASE_URL=postgresql+asyncpg://user:password@host/dbname?ssl=require
DATABASE_USERNAME=your_db_username
DATABASE_PASSWORD=your_db_password
DATABASE_NAME=your_db_name

# JWT
ACCESS_SECRET_KEY=your_access_secret_key
ACCESS_MINUTES_EXPIRE=30
REFRESH_SECRET_KEY=your_refresh_secret_key
REFRESH_DAYS_EXPIRE=7
ALGORITHM=HS256

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_USERNAME=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password


🔧 Running Locally without Docker
Prerequisites:
Python 3.12+
uv
PostgreSQL

# Clone the repo
git clone https://github.com/Menarddddd/budget_tracker.git
cd budget_tracker

# Install dependencies
uv sync

# Copy and fill env file
cp .env.example .env

# Run migrations
uv run alembic upgrade head

# Start the server
uv run uvicorn app.main:app --reload --port 8000
API Docs available at: http://localhost:8000/docs


📡 API Endpoints
Auth
Method	Endpoint	Description
POST	/auth/register	Register new user
POST	/auth/login	Login and get tokens
POST	/auth/refresh	Refresh access token
GET	/auth/verify-email	Verify email with token
POST	/auth/resend-verification-email	Resend verification email
POST	/auth/reset-password	Request password reset
POST	/auth/verify-reset-password	Reset password with token

Users
Method	Endpoint	Description
GET	/users/me	Get current user profile
PUT	/users/me	Update profile
PUT	/users/me/password	Change password
PUT	/users/me/email	Request email change

Budget Cycles
Method	Endpoint	Description
POST	/budget-cycles	Create a new budget cycle
GET	/budget-cycles/active	Get current active cycle
PUT	/budget-cycles/{id}	Edit budget amount

Expenses
Method	Endpoint	Description
POST	/expenses	Create an expense
GET	/expenses	Get all expenses
PUT	/expenses/{id}	Update an expense
DELETE	/expenses/{id}	Delete an expense
Categories
Method	Endpoint	Description
GET	/categories	Get all categories
POST	/categories	Create custom category
PUT	/categories/{id}	Update custom category
DELETE	/categories/{id}	Delete custom category
GET	/dashboard	Get current cycle summary

Admin
Method	Endpoint	Description
GET	/admin/users	Get all users
GET	/admin/users/{id}	Get user details
PUT	/admin/users/{id}	Promote/demote admin
DELETE	/admin/users/{id}	Delete user
POST	/admin/categories	Create default category
PUT	/admin/categories/{id}	Edit default category
DELETE	/admin/categories/{id}	Delete default category
Full interactive API documentation available at:
https://budget-tracker-api.fly.dev/docs

🗄️ Database Schema
users
├── id
├── username
├── email
├── password (hashed)
├── is_verified
├── is_admin
└── created_at

budget_cycles
├── id
├── user_id (FK → users)
├── budget_amount
├── start_date
├── end_date
├── is_active
└── created_at

expenses
├── id
├── user_id (FK → users)
├── cycle_id (FK → budget_cycles)
├── category_id (FK → categories)
├── amount
├── description
└── created_at

categories
├── id
├── name
├── is_default
└── user_id (FK → users, null if default)

tokens
├── id
├── user_id (FK → users)
├── token
├── type
└── expires_at
---

📦 Deployment
Backend (Fly.io)
Bash

fly launch
fly secrets set DATABASE_URL="..." ACCESS_SECRET_KEY="..." ...
fly deploy
Database (Neon)
Bash

# Run migrations against Neon
alembic upgrade head
Frontend (Vercel)
Import GitHub repo on Vercel
Set Root Directory to frontend
Add VITE_API_URL environment variable
Deploy
