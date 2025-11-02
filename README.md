# Parkify

Parkify is a small parking management application (backend + optional frontend) that helps manage floors, slots and bookings. It provides REST APIs for users to sign up / log in, view slots by floor, and for admins to manage slots and bookings.

Key features
- User signup & login (simple credential check)
- Create and list parking slots
- List slots by floor with booking-aware occupied status
- Automatic booking expiry handling (service updates expired bookings)
- Simple React/Vite frontend (optional) for interacting with the backend

Tech stack
- Java 11+ (Spring Boot)
- Spring Data JPA, Hibernate
- Spring Security (configured for API-only usage)
- H2 / any JDBC-compatible DB (configured in application.properties)
- Optional: React + Vite frontend (if present)

Prerequisites
- Java 11+ (JDK)
- Maven (or use the included Maven wrapper)
- Node.js & npm (if using the frontend)

Quick start — backend (macOS / Linux)
1. Run with Maven wrapper:
```bash
./mvnw spring-boot:run
```
2. Build artifact:
```bash
./mvnw clean package
java -jar target/*.jar
```

Quick start — frontend (if present)
1. Change to frontend folder (example locations: `frontend/` or `Parki/frontend/`)
```bash
cd frontend
npm install
npm run dev
```

Important API endpoints
- GET /api/floors/{floorId}/slots
  - Public endpoint that returns slot DTOs with current occupied state and reservations.
- GET /api/slots
  - Lists all slots.
- POST /api/slots
  - Create a slot (request body: Slot JSON).
- POST /api/users/signup
  - Create a user (request body: User JSON).
- POST /api/users/login
  - Authenticate (returns user entity on success).

Notes
- Security: SecurityConfig currently permits API requests to ease development/testing. Adjust for production.
- Passwords: Password encoding exists (BCrypt) — ensure you encode passwords on signup before saving in production.
- Database: Configure datasource in `src/main/resources/application.properties`. H2 works out of the box for development.
- Tests: Run backend tests:
```bash
./mvnw test
```

Project layout (high level)
- src/main/java/com/parkify/Park — Java backend sources
  - controller, service, model, dto, repositories, config
- frontend/ or Parki/frontend — optional React + Vite frontend

Contributing
- Follow existing code style.
- Add unit tests for new behavior and run `./mvnw test` before submitting PRs.

License
- Add a LICENSE file to the repo or specify an open-source license you prefer.

Contact
- Open an issue or PR in this repository for questions, fixes or feature requests.
