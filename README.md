# Parkify
Parkify

A full-stack parking management web app (backend in Java / Spring Boot, frontend in JavaScript).
This repository contains the codebase for Parkify — a minimal parking reservation/management system with user auth, parking-lot management, booking, and admin tools.

Repository: Bigchungusfloopa/Parkify. 
GitHub

Table of contents

Project overview

Features

Tech stack

Architecture & folders

Prerequisites

Local setup — backend

Local setup — frontend

Database setup

Environment variables

API examples

Running tests

Deployment suggestions

Contributing

Roadmap / TODOs

Troubleshooting

License & contact

Project overview

Parkify aims to simplify parking lot management and booking. It provides:

User registration and authentication.

List and manage parking lots/spots.

Book (reserve) a parking spot for a time window.

Admin dashboard for monitoring bookings and occupancy.

This repository contains a Java backend (Spring Boot) and a JavaScript frontend. Language breakdown on the repo shows JavaScript, Java, CSS as primary languages. 
GitHub

Features

User signup / login (JWT or session-based).

CRUD for parking lots and parking spots.

Booking creation, cancellation, and history.

Search/availability check by location/time.

Admin endpoints for analytics (occupancy, revenue).

Responsive frontend UI (React/Vue/vanilla JS — adjust if your frontend framework differs).

Tech stack

Backend: Java + Spring Boot (Maven)

Frontend: JavaScript (React recommended)

Persistence: MySQL / PostgreSQL (can be swapped for H2 in dev)

Build tools: Maven (backend), npm / yarn (frontend)

Auth: JWT (recommended)

Extras: Docker (optional), GitHub Actions (CI)

Architecture & folders (recommended)
/ (root)
├─ /parkify-backend/        # Spring Boot application (pom.xml, src/main/java, src/main/resources)
├─ /parkify-frontend/       # Frontend app (package.json, src/)
├─ README.md
├─ pom.xml (root workspace or parent POM)


If your repo already uses a single module layout, adapt commands below to your structure.

Prerequisites

Java 17+ (LTS) or the version your pom.xml expects

Maven 3.6+

Node.js 16+ and npm / yarn

MySQL or PostgreSQL instance (or Docker)

Git

Local setup — Backend (Spring Boot)

Clone repo:

git clone https://github.com/Bigchungusfloopa/Parkify.git
cd Parkify


Open the backend module (if it’s Parki or parkify-backend):

cd Parki        # or the folder that contains the Spring Boot project


Update src/main/resources/application.properties or application.yml with DB credentials (see env section below).

Build & run with Maven:

mvn clean package
mvn spring-boot:run
# or
java -jar target/parkify-0.0.1-SNAPSHOT.jar


Backend will start on http://localhost:8080 (unless configured otherwise).

Local setup — Frontend

Open frontend folder:

cd parkify-frontend   # change to actual frontend folder name


Install dependencies:

npm install
# or
yarn


Start dev server:

npm run start
# or
yarn start


Frontend default: http://localhost:3000 (adjust proxy to backend port if needed).

Database setup

MySQL (example):

CREATE DATABASE parkify_db;
CREATE USER 'parkify_user'@'localhost' IDENTIFIED BY 'strongpassword';
GRANT ALL PRIVILEGES ON parkify_db.* TO 'parkify_user'@'localhost';
FLUSH PRIVILEGES;


For dev only: you can use H2 in-memory DB to avoid external DB setup (spring.datasource.url=jdbc:h2:mem:testdb).

Environment variables / application properties

Example application.properties keys (replace values with your own):

spring.datasource.url=jdbc:mysql://localhost:3306/parkify_db
spring.datasource.username=parkify_user
spring.datasource.password=strongpassword
spring.jpa.hibernate.ddl-auto=update
server.port=8080

# JWT (if used)
jwt.secret=YOUR_SECRET_KEY
jwt.expiration=86400000


For frontend, typical .env:

REACT_APP_API_URL=http://localhost:8080/api

API examples (suggested endpoints)

Adjust paths to match your controllers. These are typical endpoints for a project like this.

Auth

POST /api/auth/register — body: {name, email, password}

POST /api/auth/login — body: {email, password} → returns JWT

User

GET /api/users/{id} — get profile

Parking lots / spots

GET /api/parks — list parking lots

POST /api/parks — create parking lot (admin)

GET /api/parks/{id}/spots — list spots for a lot

POST /api/parks/{id}/spots — add a spot

Booking

POST /api/bookings — create booking {userId, spotId, startTime, endTime}

GET /api/bookings/user/{userId} — user bookings

PUT /api/bookings/{id}/cancel — cancel booking

Admin

GET /api/admin/occupancy?start=&end= — occupancy stats

Running tests

Backend (Maven):

mvn test


Frontend (if React + Jest):

npm test

Deployment suggestions

Containerize backend and database via Docker. Example Dockerfile for Spring Boot:

FROM eclipse-temurin:17-jre
ARG JAR_FILE=target/*.jar
COPY ${JAR_FILE} app.jar
ENTRYPOINT ["java","-jar","/app.jar"]


Use Docker Compose for multi-service (backend + db + frontend) during staging.

Deploy backend to a cloud VM/container service (AWS ECS, GCP Cloud Run, Heroku). Serve frontend via Netlify / Vercel / S3+CloudFront.

Contributing

Fork the repo

Create a feature branch: git checkout -b feat/parking-availability

Commit changes, push, and open a PR.

Add clear PR description, link to issue (if any), and screenshots for UI changes.

Code style

Follow existing code style (format with mvn formatter or Prettier for JS).

Include unit tests for new backend endpoints.

Roadmap / TODOs (suggested)

 Add JWT-based auth and refresh tokens.

 Implement real-time occupancy updates (WebSockets).

 Add payments (Stripe/PayPal) for paid reservations.

 Mobile-friendly UI or dedicated mobile app.

 Role-based access: admin, attendant, user.

 Integration tests and CI pipeline.

Troubleshooting

Build fails with dependency errors: run mvn clean and check your pom.xml versions.

CORS errors: enable CORS in backend or configure proxy in frontend package.json.

DB connection refused: ensure DB is running and credentials match application.properties.
