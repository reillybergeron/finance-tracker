# Finance Tracker

Full-stack personal finance app for logging expenses and viewing **spending analytics**: SQL-backed rollups by category and month, **derived KPIs** (rolling averages, period-over-period change), **named business-rule checks**, and an interactive **Chart.js** dashboard. Built as a portfolio project with **Spring Boot**, **PostgreSQL**, and **React**.

<!-- Optional: add your live site when deployed -->
<!-- **Live demo:** https://your-demo.example.com -->

## Highlights

- **Dashboard** — Line charts (yearly + recent monthly), bar and pie charts for category mix, overview stats, **server-derived KPIs** (MoM / YoY %, trailing 3- and 12-month averages), and a **business rule evaluation** panel (integrity, concentration, spend velocity, budget pressure).
- **Reporting pipeline** — `FinancialReportingService` loads rollups via **native PostgreSQL** `SUM` / `GROUP BY` queries (not `findAll()` over the fact table), then computes KPIs and rule outcomes in Java.
- **Indexes** — The `transactions` entity declares JPA **`@Index`** on `date` and `category` so aggregates and sorts can use indexed access paths (created/updated when Hibernate `ddl-auto` runs against Postgres).
- **Date-range reporting** — `GET /api/transactions/reports/summary` accepts optional **`from`** and **`to`** query parameters (`YYYY-MM-DD`) to restrict rollups to an inclusive window; omit both for full history.
- **Transactions** — Create, list (paginated, newest first), and delete records.
- **Validation** — **Bean Validation** on a dedicated `CreateTransactionRequest` DTO for creates; structured **400** JSON for validation and bad request errors; the React form mirrors the same rules client-side.
- **Persistence** — JPA/Hibernate with PostgreSQL; schema managed with `ddl-auto` for local development.
- **Sample data** — On an empty database, `DataSeeder` can load **500,000** synthetic transactions spread across roughly the **last 10 calendar years** so charts and pagination are meaningful (the component skips seeding if the table is non-empty—clear the table to re-seed).

## Tech stack

| Layer    | Technologies |
|----------|----------------|
| Frontend | React 19, Create React App, Axios, Chart.js / react-chartjs-2, DM Sans (see `public/index.html`) |
| Backend  | Spring Boot 4, Spring Web MVC, Spring Data JPA, **spring-boot-starter-validation** |
| Database | PostgreSQL |
| Build    | Maven (backend), npm (frontend) |

## Architecture

```text
Browser (React SPA)
        │  HTTP (JSON)
        ▼
Spring Boot — REST (/api/transactions …)
        │
        ├── FinancialReportingService  →  KPI + business-rule logic
        │
        └── TransactionRepository      →  native SQL aggregates (SUM / GROUP BY)
        │
        ▼
PostgreSQL — transactions (indexed date, category)
```

The UI talks to the API using **`REACT_APP_API_BASE_URL`**. If it is unset, it defaults to `http://localhost:8080`, so `npm start` works with no extra config. For a hosted demo, set that variable in your static host’s build settings to your public API URL (HTTPS). See `frontend/.env.example`.

## Reporting and business rules

Summary data is built as follows:

1. **SQL rollups** — Total spend, totals grouped by **category**, and totals grouped by **calendar month** (`TO_CHAR(date, 'YYYY-MM')`), optionally filtered by **`from` / `to`**.
2. **Derived KPIs** — Examples: month-over-month and year-over-year **percentage change**, **trailing three-month** and **twelve-month** averages, average monthly/yearly spend, **category share** (% of lifetime spend in the selected window).
3. **Named rules** (each returns `ruleId`, `severity`, `message`) — Including **aggregation integrity** (category and monthly sums vs headline total), **category concentration** (threshold on largest share), **spend velocity MoM** (large % swings), and **budget pressure** (current month vs trailing-12 baseline). Rule thresholds are constants in `FinancialReportingService` today; they can be externalized to config later.

## Prerequisites

- **JDK** compatible with the backend (`pom.xml` targets Java **26**; adjust the `<java.version>` property if your environment uses an older LTS).
- **Node.js** (LTS recommended) and npm.
- **PostgreSQL** with a database the app can connect to (default name: `finance_tracker`).

## Run locally (quickstart)

### 1) Create the database

In `psql` (or your SQL client):

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

## API overview

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/transactions` | Paginated list (`page`, `size`; default sort by date descending). |
| `GET` | `/api/transactions/{id}` | Single transaction. |
| `POST` | `/api/transactions` | Create; JSON body validated via **`CreateTransactionRequest`** (non-blank category ≤100 chars, **positive** amount, **date not in the future**, description ≤500 chars). Invalid body → **400** with `message` / `errors`. |
| `DELETE` | `/api/transactions/{id}` | Delete by id. |
| `GET` | `/api/transactions/reports/summary` | Reporting payload: `totalSpent`, `totalTransactions`, `categoryTotals`, `monthlyTotals`, **`kpis`**, **`businessRules`**. Optional query params **`from`**, **`to`** (`ISO-8601` date) inclusive; invalid range (`from` after `to`) → **400**. |

`GET` list returns a Spring `Page` JSON shape; the React transaction list uses the `content` array.

## Project layout

```text
finance-tracker/
├── backend/
│   └── src/main/java/com/reilly/backend/
│       ├── controller/          REST + ValidationExceptionHandler
│       ├── dto/                 CreateTransactionRequest (validated create DTO)
│       ├── model/               Transaction entity (+ table indexes)
│       ├── reporting/           FinancialReportingService
│       ├── repository/          JPA + native aggregate queries
│       └── DataSeeder.java      optional large synthetic load
├── frontend/                    React SPA (dashboard, transactions, shared styles)
└── README.md
```

## UI notes

- **Layout** — Sidebar navigation, card-based content, dark theme tokens in `src/index.css` (see `.app-shell`, `.panel`, `.stat-grid`, `.form-error`, `.rules-list`).
- **Dashboard** — Fetches `/api/transactions/reports/summary` and renders Chart.js charts plus KPI and rule sections when the API returns those objects.

## Configuration notes

- **Secrets:** Database credentials for local development belong in `application-local.properties` (ignored by Git). The committed `application.properties` uses environment variables for non-local setups.
- **CORS:** The API allows all origins (`@CrossOrigin(origins = "*")`) for ease of local development; tighten this before any production deployment.

## License

This project is provided as-is for portfolio and learning purposes.
