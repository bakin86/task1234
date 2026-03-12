# Microservice Architecture — Node.js + Prisma + MySQL

```
Frontend / Postman
      ↓
API Gateway (port 3000)
  ├── /api/users  → User Service  (port 3001)
  └── /api/orders → Order Service (port 3002)
```

---

## 1. MySQL Database тохируулах

```sql
CREATE DATABASE user_service_db;
CREATE DATABASE order_service_db;
```

---

## 2. User Service

```bash
cd user-service
cp .env.example .env
# .env дотор DATABASE_URL-ийг тохируул

npm install
npx prisma migrate dev --name init
node prisma/seed.js
npm run dev
# → http://localhost:3001
```

### Endpoints
| Method | URL          | Тайлбар              |
|--------|--------------|----------------------|
| GET    | /users       | Бүх хэрэглэгч        |
| GET    | /users/:id   | Нэг хэрэглэгч        |
| GET    | /health      | Health check         |

---

## 3. Order Service

```bash
cd order-service
cp .env.example .env
# .env дотор DATABASE_URL-ийг тохируул

npm install
npx prisma migrate dev --name init
node prisma/seed.js
npm run dev
# → http://localhost:3002
```

### Endpoints
| Method | URL          | Тайлбар        |
|--------|--------------|----------------|
| GET    | /orders      | Бүх захиалга   |
| GET    | /orders/:id  | Нэг захиалга   |
| GET    | /health      | Health check   |

---

## 4. API Gateway

```bash
cd api-gateway
cp .env.example .env

npm install
npm run dev
# → http://localhost:3000
```

### Endpoints
| Method | URL              | Auth | Role  | Тайлбар                    |
|--------|------------------|------|-------|----------------------------|
| POST   | /auth/token      | ❌   | —     | Test token үүсгэх          |
| GET    | /api/users       | ✅   | any   | User Service proxy         |
| GET    | /api/users/:id   | ✅   | any   | User Service proxy         |
| GET    | /api/orders      | ✅   | any   | Order Service proxy        |
| GET    | /api/orders/:id  | ✅   | any   | Order Service proxy        |
| GET    | /api/admin       | ✅   | ADMIN | Admin зөвхөн               |
| GET    | /api/dashboard   | ✅   | any   | Users + Orders нэгтгэсэн   |
| GET    | /health          | ❌   | —     | Gateway health check       |

---

## 5. Postman-аар туршлага хийх

### Алхам 1: Token авах
```
POST http://localhost:3000/auth/token
Content-Type: application/json

{
  "name": "Temuulen",
  "role": "ADMIN"
}
```
Response: `{ "token": "eyJ..." }`

### Алхам 2: Token ашиглан request явуул
```
GET http://localhost:3000/api/users
Authorization: Bearer eyJ...
```

### Алхам 3: Rate limit туршлага
5 удаа дарааллан request явуулахад 429 авна:
```json
{ "message": "Too many requests", "retryAfter": "58 seconds" }
```

### Алхам 4: Admin route туршлага
USER role-той token-оор:
```
GET http://localhost:3000/api/admin
→ 403 { "message": "Forbidden" }
```

ADMIN role-той token-оор:
```
GET http://localhost:3000/api/admin
→ 200 { "message": "Welcome to admin panel" }
```

---

## Task Summary

| Task | Агуулга                    | Файл                              |
|------|----------------------------|-----------------------------------|
| 1    | User Service               | user-service/src/index.js         |
| 2    | Order Service              | order-service/src/index.js        |
| 3    | API Gateway proxy          | api-gateway/src/index.js          |
| 4    | JWT Authentication         | api-gateway/src/middlewares/auth.js |
| 5A   | Role-based access (ADMIN)  | api-gateway/src/middlewares/role.js |
| 5B   | Rate Limiting (5 req/min)  | api-gateway/src/middlewares/rateLimit.js |
| C1   | Request Logging            | api-gateway/src/middlewares/logger.js |
| C2   | Dashboard endpoint         | api-gateway/src/index.js (/api/dashboard) |
| C3   | Error handling             | api-gateway/src/index.js (proxy error handlers) |
