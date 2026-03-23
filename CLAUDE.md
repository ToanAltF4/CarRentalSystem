# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

EV Fleet Car Rental System — a full-stack web application for managing electric vehicle rentals. Supports five user roles: CUSTOMER, ADMIN, OPERATOR, STAFF, DRIVER.

## Commands

### Backend (Spring Boot — `be/`)
```bash
cd be
mvn clean package -DskipTests   # Build JAR
mvn test                         # Run all tests
mvn test -Dtest=ClassName        # Run a single test class
java -jar target/car-rental-system-be-0.0.1-SNAPSHOT.jar  # Run built JAR
```
Backend runs on **port 8080**. API docs at `http://localhost:8080/swagger-ui.html`.

### Frontend (React/Vite — `fe/`)
```bash
cd fe
npm install      # Install dependencies
npm run dev      # Dev server (HMR)
npm run build    # Production build → dist/
npm run lint     # ESLint
npm run preview  # Preview production build
```
Dev server runs on **port 5173** by default (not 4000 — 4000 is used in Docker/production).

### Docker (full stack)
```bash
docker-compose up -d    # Start all services (MySQL, phpMyAdmin, backend, frontend)
docker-compose down     # Stop all services
```

### Windows scripts (root)
- `start.bat` — starts backend + frontend + Cloudflare tunnel
- `stop.bat` — stops all services
- `rebuild.bat` — triggers a rebuild

## Architecture

### Project Structure
```
CarRentalSystem/
├── be/                  # Spring Boot 3.4.1 (Java 21)
├── fe/                  # React 19 + Vite 7
└── docker-compose.yml
```

### Backend Layers (`be/src/main/java/com/carrentalsystem/`)
| Layer | Path | Purpose |
|---|---|---|
| Entity | `entity/` | JPA entities (24 total) |
| Repository | `repository/` | Spring Data JPA repos + custom queries |
| Service | `service/` + `service/impl/` | Business logic interfaces + implementations |
| Controller | `controller/` | REST API endpoints (18 controllers) |
| DTO | `dto/` | Request/Response objects |
| Mapper | `mapper/` | MapStruct entity↔DTO converters |
| Security | `security/` | JWT filter, role-based access |
| Config | `config/` | Security, CORS, R2 storage, email config |
| Specification | `specification/` | JPA specs for dynamic filtering |
| Exception | `exception/` | Custom exceptions |

All REST endpoints are prefixed `/api/v1/` (or `/api/` for auth/payments).

### Frontend Structure (`fe/src/`)
| Directory | Purpose |
|---|---|
| `pages/` | Page components organized by role: `admin/`, `operator/`, `staff/`, `driver/` |
| `components/` | Reusable components; `routes/` has role-based guards (PrivateRoute, OperatorRoute, etc.) |
| `services/` | Axios API service layer (one file per domain) |
| `context/AuthContext.jsx` | Global auth state (tokens, user info) |
| `App.jsx` | Route tree |

### Authentication & API Communication
- JWT tokens stored in `localStorage`; `Authorization: Bearer <token>` on every request
- `fe/src/services/api.js` — central Axios instance with request/response interceptors
- On 401: interceptor auto-calls `/api/auth/refresh`, retries original request; on failure redirects to `/login`
- API base URL controlled by `VITE_API_BASE_URL` env var (defaults to `http://localhost:8080/api`)

### Database
- **MySQL 8.0**, schema `ev_fleet`
- **Flyway** manages migrations (`be/src/main/resources/db/migration/V1__…V30__…`)
- Flyway is **disabled by default** (`FLYWAY_ENABLED=false`); enable via env var when schema changes are needed
- DDL auto is set to `none` — never let Hibernate manage the schema
- Current migration: **V30** (`V30__invoice_many_to_one_and_type.sql` — untracked, pending)

### Key Domain Entities
- `users` + `roles` — auth, RBAC
- `vehicles` + `vehicle_categories` + `pricing` — vehicle catalog and rates
- `bookings` — core rental reservation (links vehicle, user, rental_type, pickup_method)
- `invoices` — payment records; many-to-one with booking (added in V30)
- `inspections` — pickup/return vehicle condition reports
- `driver_pricing` / `delivery_pricing` — extra fees for with-driver or delivery rental types

### External Integrations
| Service | Purpose | Config keys |
|---|---|---|
| Cloudflare R2 (S3-compatible) | Image/document storage | `R2_*` env vars |
| VNPay | Payment gateway (sandbox by default) | `VNP_*` env vars |
| Gmail SMTP | Email notifications/OTP | `MAIL_*` env vars |
| OpenAI | Chat assistant feature | `OPENAI_API_KEY`, `OPENAI_MODEL` |
| Cloudflare Tunnel | Production networking to `fpt.tokyo` | `setup-tunnel.bat` |
| Leaflet + OpenStreetMap/OSRM | Maps and routing | Proxied via Vite dev server |

### Environment Variables
Backend reads from `be/env.example` (or `be/env.production`) at startup. Key variables:
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD`
- `JWT_SECRET`, `JWT_EXPIRATION_MS`, `REFRESH_TOKEN_EXPIRATION_DAYS`
- `FLYWAY_ENABLED` — set to `true` to run pending migrations
- `R2_*`, `VNP_*`, `MAIL_*`, `OPENAI_API_KEY`

Frontend: set `VITE_API_BASE_URL` in `fe/.env` (e.g., `http://localhost:8080/api`).

## Important Conventions

- **MapStruct** is used for all entity↔DTO mapping — add mapper interface methods rather than manual mapping
- **Spring Security** uses `@PreAuthorize` annotations on controller methods for role checks
- **Specifications** (`specification/`) are used for dynamic query filtering (e.g., vehicle search with multiple optional filters)
- **Lombok** is used on all entities and many DTOs (`@Data`, `@Builder`, `@NoArgsConstructor`, etc.)
- Database column names use `snake_case`; Java fields use `camelCase` (mapped via Hibernate naming strategy)
- Vietnamese language support: all DB text columns use `utf8mb4_unicode_ci`
- The `BookingWizardModal.jsx` component (~52KB) handles the entire multi-step booking flow on the frontend
