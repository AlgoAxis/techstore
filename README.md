# TechStore – Full-Stack E-Commerce Platform

A complete end-to-end e-commerce application built with **Spring Boot**, **React**, **PostgreSQL**, and **Docker**, featuring secure authentication, product management, cart, orders, and payment flow (Stripe Dummy Mode).

---

## 🚀 Tech Stack

### **Backend – Spring Boot**
- Spring Web, Spring Security (JWT)
- Spring Data JPA (Hibernate)
- PostgreSQL
- Stripe (Mock PaymentIntent)
- Dockerized service

### **Frontend – React**
- React Router
- Redux Toolkit
- Tailwind CSS
- Stripe Checkout (dummy mode)
- Axios API Client

### **DevOps**
- Docker & Docker Compose
- Environment-based configuration
- VS Code development workflow

---

## 🎯 Key Features

### 🔐 Authentication & Users
- JWT login & registration  
- Role-based access (`USER`, `ADMIN`)
- Secure password hashing (BCrypt)

### 🛒 Products & Categories
- Product list + filtering  
- Category hierarchy  
- Product details  
- Image gallery  
- Stock & brand metadata  

### 🛍 Shopping Cart
- Add/remove items  
- Update quantity  
- Auto price calculation  
- Persistent cart per user  

### 📦 Orders
- Create orders from cart  
- Order history  
- Status tracking (PENDING → PAID)  
- Shipping address support  

### 💳 Payments (Dummy Stripe Mode)
- Fake PaymentIntent generator  
- Success/Failure flow  
- No real Stripe keys needed  

### ⭐ Reviews
- User ratings  
- Average rating per product
  

## 🐳 Running with Docker

```bash
docker compose up --build

Services available at:
Service	URL
Frontend	http://localhost:3000
Backend API	http://localhost:8080
PostgreSQL	localhost:5432
💻 Running Locally (Dev Mode)
Backend

cd backend
mvn spring-boot:run

Frontend

cd frontend
npm start

PostgreSQL (local container)

docker run -d --name techstore-db \
  -e POSTGRES_DB=techstore \
  -e POSTGRES_USER=techstore_user \
  -e POSTGRES_PASSWORD=techstore_pass \
  -p 5432:5432 postgres:15-alpine

🔧 Environment Variables
Backend (.env)

SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/techstore
SPRING_DATASOURCE_USERNAME=techstore_user
SPRING_DATASOURCE_PASSWORD=techstore_pass
JWT_SECRET=your-secret-key
STRIPE_API_KEY=dummy_key

Frontend (.env)

REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_STRIPE_PUBLIC_KEY=dummy_public_key

📦 Database Seeding

The application auto-seeds:

    Admin user

    Test users

    Categories

    Products

    Default carts

Roles are created using:

INSERT INTO roles (name)
VALUES ('ROLE_USER'), ('ROLE_ADMIN')
ON CONFLICT DO NOTHING;

👨‍💻 Author

Swapnil Bhalekar
Full Stack Developer
TechStore E-Commerce Platform

