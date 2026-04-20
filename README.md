# Finance Tracker

Full-stack personal finance app for logging expenses and viewing **spending summaries**: totals by category, by month, and aggregate metrics. Built as a portfolio project to practice a realistic **React** single-page UI backed by a **Spring Boot** REST API and **PostgreSQL**.

<!-- Optional: add your live site when deployed -->
<!-- **Live demo:** https://your-demo.example.com -->

## Highlights

- **Dashboard** — Charts and KPIs driven by a dedicated reporting endpoint (`/api/transactions/reports/summary`).
- **Transactions** — Create, list (paginated, newest first), and delete records.
- **REST API** — CRUD plus summary aggregation implemented in Java.
- **Persistence** — JPA/Hibernate with PostgreSQL; schema managed with `ddl-auto` for local development.
- **Sample data** — On an empty database, a startup seeder can load a large synthetic dataset so charts and pagination are meaningful (disable `DataSeeder` if you prefer a clean slate).

## Tech stack

| Layer    | Technologies |
|----------|----------------|
| Frontend | React 19, Create React App, Axios, Chart.js / react-chartjs-2 |
| Backend  | Spring Boot 4, Spring Web MVC, Spring Data JPA |
| Database | PostgreSQL |
| Build    | Maven (backend), npm (frontend) |

## Architecture

```text
Browser (React SPA)
        │  HTTP (JSON)
        ▼
Spring Boot — /api/transactions …
        │
        ▼
PostgreSQL — transactions table
```

The UI talks to the API using **`REACT_APP_API_BASE_URL`**. If it is unset, it defaults to `http://localhost:8080`, so `npm start` works with no extra config. For a hosted demo, set that variable in your static host’s build settings to your public API URL (HTTPS). See `frontend/.env.example`.

## Prerequisites

- **JDK** compatible with the backend (`pom.xml` targets Java **26**; adjust the `<java.version>` property if your environment uses an older LTS).
- **Node.js** (LTS recommended) and npm.
- **PostgreSQL** with a database the app can connect to (default name: `finance_tracker`).

## Run locally (quickstart)

If you just want to run the app on your machine with the defaults, follow this.

### 1) Create the database

In `psql` (or your SQL client), create the database:

```sql
CREATE DATABASE finance_tracker;
```

### 2) Start the backend API (Spring Boot)

From the repo root in **PowerShell**:

```powershell
cd backend
Copy-Item .\src\main\resources\application-local.properties.example .\src\main\resources\application-local.properties
notepad .\src\main\resources\application-local.properties
.\mvnw.cmd spring-boot:run
```

- Edit `application-local.properties` and set your local PostgreSQL password (and username if needed).
- The API runs on **`http://localhost:8080`** by default.

### 3) Start the frontend (React)

Open a **second** PowerShell window/tab:

```powershell
cd frontend
npm install
npm start
```

- The UI runs on **`http://localhost:3000`**.
- By default the frontend calls the API at **`http://localhost:8080`** (via `REACT_APP_API_BASE_URL`, which defaults to that value when unset).

### Troubleshooting (common)

- **Port already in use**: something else is using `8080` or `3000` — stop it or change the port.
- **Database auth failed**: double-check `application-local.properties` credentials match your local Postgres.
- **Java version mismatch**: this project targets Java **26**. If you’re on an older JDK, lower `<java.version>` in `backend/pom.xml` to your installed version.

## Getting started

### 1. Database

Create a database (example name matches default config):

```sql
CREATE DATABASE finance_tracker;
```

### 2. Backend

From the `backend` directory:

1. Copy `src/main/resources/application-local.properties.example` to `application-local.properties` and set your **local** PostgreSQL password. That file is **gitignored** and must not be committed.
2. Start the API:

```powershell
.\mvnw.cmd spring-boot:run
```

`spring-boot:run` is configured to use the **`local`** profile so `application-local.properties` is loaded (no need to set `SPRING_PROFILES_ACTIVE` for Maven). If you run the packaged JAR instead, use `SPRING_PROFILES_ACTIVE=local` or set `SPRING_DATASOURCE_*` as below.

For hosted or CI environments, omit the `local` profile and set:

- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`

### 3. Frontend

From the `frontend` directory:

```bash
npm install
npm start
```

The app opens in the browser (default CRA port **3000**). With no env file, requests go to **`http://localhost:8080`**, so start the backend on port **8080** first.

To point at a different API while developing, add `frontend/.env.development.local` (gitignored by CRA) with:

```bash
REACT_APP_API_BASE_URL=https://your-api.example.com
```

Restart `npm start` after changing env files. For production builds (`npm run build`), set the same variable in your host’s UI so the bundle embeds the correct API origin.

## API overview

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/transactions` | Paginated list (`page`, `size` query params; default sort by date descending). |
| `GET` | `/api/transactions/{id}` | Single transaction. |
| `POST` | `/api/transactions` | Create (JSON body: category, amount, date, description). |
| `DELETE` | `/api/transactions/{id}` | Delete by id. |
| `GET` | `/api/transactions/reports/summary` | Aggregates: total spent, counts, totals by category and by month. |

`GET` list returns a Spring `Page` JSON shape; the React client uses the `content` array where applicable.

## Project layout

```text
finance-tracker/
├── backend/          Spring Boot service (Maven)
├── frontend/         React app (Create React App)
└── README.md
```

## Configuration notes

- **Secrets:** Database credentials for local development belong in `application-local.properties` (ignored by Git). The committed `application.properties` uses environment variables only for the password unless overridden by profile-specific config.
- **CORS:** The API allows all origins (`@CrossOrigin(origins = "*")`) for ease of local development; tighten this before any production deployment.

## License

This project is provided as-is for portfolio and learning purposes.
