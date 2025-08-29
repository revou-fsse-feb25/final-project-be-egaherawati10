# Hera Clinic EMR – Backend

A NestJS + Prisma + PostgreSQL backend for the Hera Clinic EMR system.  
Supports authentication/authorization (JWT in cookies), patient management, medical records, prescriptions, pharmacy, services, and payments.

---

## 🚀 Tech Stack
- **NestJS** (modular backend framework)
- **Prisma ORM** (PostgreSQL)
- **JWT authentication** with HttpOnly cookies
- **Role-based access control** (capability matrix + guards)
- **Swagger** API docs (`/docs`)
- **Throttling** via `@nestjs/throttler`
- **CSRF Guard** for browser security

---

## 🧩 ERD


## 📂 Project Structure
src/
auth/ # login/register/refresh/logout/profile
users/ # user CRUD
patients/ # patient profiles
medical-records/ # medical records + items
prescriptions/ # prescriptions + items
services/ # clinic services
service-items/ # service definitions
payments/ # payments + payment items
common/ # guards, decorators, capabilities
prisma/ # Prisma service + schema
app.module.ts # main app module
main.ts # bootstrap


---

## ⚙️ Setup

### 1. Install dependencies
```bash
npm install

2. Configure environment

Create a .env file at project root:

# Server
PORT=3000
CORS_ORIGINS=http://localhost:3001

# Database
DATABASE_URL="postgresql://postgres:KDvFRrQnxHXSWMprTPajYhhXaxMPRIMT@turntable.proxy.rlwy.net:14083/railway"

# JWT
JWT_ACCESS_SECRET=super-long-random
JWT_REFRESH_SECRET=even-longer-random
ACCESS_TTL=15m
REFRESH_TTL=7d

# CSRF
CSRF_ALLOWED_ORIGINS=http://localhost:3000

3. Run database migrations
npx prisma migrate dev


(Optional: seed sample data)

npm run seed

4. Start the server
npm run start:dev


Backend will run on: http://localhost:3000/api

🔑 Authentication

Login: POST /api/auth/login → sets access & refresh cookies

Refresh: POST /api/auth/refresh → rotates cookies

Logout: POST /api/auth/logout → clears cookies & revokes sessions

Profile: GET /api/auth/profile → returns current user

Cookies:

access: short-lived (15m), HttpOnly

refresh: long-lived (7d), HttpOnly

🛡 Guards

JwtAuthGuard → validates access token (from cookie or header)

PolicyGuard → enforces CAPABILITIES by role

CsrfGuard → requires X-CSRF-Token = csrf cookie for mutating requests

Public decorator → marks endpoints that skip guards

📖 API Docs

Swagger available at:

http://localhost:3000/docs


Supports both Bearer JWT and Cookie JWT auth.

🧪 Testing

Use Postman or curl:

curl -i -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}' \
  -c cookies.txt


Then:

curl -i http://localhost:3000/api/auth/profile \
  -b cookies.txt

📝 Scripts

npm run start:dev – start in dev (watch mode)

npm run build – build project

npm run start:prod – run compiled code

npx prisma studio – open Prisma GUI

📌 Notes

Ensure PostgreSQL is running locally or in Docker.

Update .env secrets in production.

For Vercel/Netlify frontend integration, configure backend CORS & CSRF origins.

👥 Roles

Admin: full access

Doctor: manage medical records, services, & prescriptions

Pharmacist: manage prescriptions & medicines

Cashier: manage payments

Registration Clerk: manage patients & medical records

Patient: read-only access to their own data