# Docker Compose development environment for EV Fleet Rental System

## Quick Start

### Start all services (MySQL + App):
```bash
docker-compose up -d
```

### Start only MySQL (for local development):
```bash
docker-compose up -d mysql
```

Then run the Spring Boot app locally:
```bash
cd be
mvn spring-boot:run
```

### View logs:
```bash
docker-compose logs -f
```

### Stop all services:
```bash
docker-compose down
```

### Reset database (delete all data):
```bash
docker-compose down -v
```

## Access Points

- **API**: http://localhost:8080/api/v1/vehicles
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **MySQL**: localhost:3306

## Database Credentials

| Property | Value |
|----------|-------|
| Host | localhost (or `mysql` inside Docker network) |
| Port | 3306 |
| Database | ev_fleet |
| Username | evfleet |
| Password | evfleet123 |
| Root Password | root123 |

## Connect to MySQL CLI:
```bash
docker exec -it ev-fleet-mysql mysql -u evfleet -pevfleet123 ev_fleet
```
