# DASIG-CORE — Frontend

**DASIG Consortium Oversight and Reporting Environment**

DASIG-CORE is a web-based KPI performance management platform for the DASIG Consortium (DOST-PCIEERD ReSEED Program). It replaces manual, fragmented KPI reporting across member Technology Business Incubators (TBIs) with one system for assigning KPIs to committees, recording progress, detecting at-risk and overdue KPIs, and generating AI-assisted consolidated reports.

This repository contains the **React web application**. The Spring Boot API is in [DASIG-CORE-Backend](https://github.com/KennyDevz/DASIG-CORE-Backend).

| | |
|---|---|
| **Live system** | https://www.dasig-core.site/ |
| **Backend API** | https://dasig-core.onrender.com |
| **Team** | 2627-sem2-it411-52 — Cebu Institute of Technology – University |

---

## Features by role

| Role | What they can do |
|---|---|
| **DASIG Admin** | Manage users, organizations and committees; create, edit, archive and delete KPIs; view all dashboards and KPI details with expected-pace trend; review and acknowledge alerts; generate, review and export AI-assisted reports |
| **Committee Lead** | View the committee dashboard; submit final values; review (approve or reject) Member submissions; receive notifications; explain overdue KPIs |
| **Member** | View assigned KPIs; submit progress with evidence files; track submission history and review results; receive notifications |

Users sign in with email and password or with **Microsoft (Entra ID) single sign-on**. New accounts must change their temporary password on first login.

## Tech stack

- React 19, TypeScript, Vite
- MUI (Material UI) components
- React Router
- MSAL (`@azure/msal-browser`, `@azure/msal-react`) for Microsoft Entra ID sign-in
- ESLint
- Deployed on **Vercel**

## Project structure

```
src/
├── features/
│   ├── auth/           # login, session, password change
│   ├── landing/        # landing page and Microsoft sign-in
│   ├── user/ organization/ committee/   # Module 1 administration
│   ├── dashboard/      # role-based dashboards, KPI management and details (Modules 2–3)
│   ├── kpisubmission/  # submit KPI, submission history and review (Module 3)
│   ├── alerts/         # Admin alerts and overdue explanations (Module 4)
│   ├── notification/   # Committee Lead and Member notifications (Module 4)
│   ├── report/         # AI-assisted report generation (Module 5)
│   └── shared/         # shared components and skeletons
├── lib/                # API client and MSAL configuration
├── routes.ts           # route paths
└── App.tsx             # routes and role guards
```

## Getting started (local development)

### Prerequisites

- Node.js 20.19 or newer and npm
- The backend running locally (see the backend README) or a deployed backend URL

### 1. Clone and install

```bash
git clone https://github.com/adamxparx/DASIG-CORE-Frontend.git
cd DASIG-CORE-Frontend
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and set:

| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | Backend URL. Leave unset locally (the Vite dev server proxies `/api` to `http://localhost:8080`). Production: `https://dasig-core.onrender.com` |
| `VITE_ENTRA_CLIENT_ID` | Microsoft Entra ID application (client) ID |
| `VITE_ENTRA_TENANT_ID` | Microsoft Entra ID tenant ID |

### 3. Run

```bash
npm run dev        # http://localhost:5173
```

### 4. Check and build

```bash
npx tsc -b         # type-check
npm run lint       # ESLint
npm run build      # production build into dist/
```

## Deployment

The frontend is deployed on **Vercel** from this repository's `main` branch and served at **https://www.dasig-core.site/** (custom domain) over HTTPS. `vercel.json` rewrites all paths to `index.html` so React Router can handle deep links such as `/dashboard/admin/alerts`. The production environment variables above are set in the Vercel project settings.

To deploy a new version: merge the reviewed pull request into `main`; Vercel builds (`npm run build`) and publishes it automatically.

## Demo access

Demo accounts for evaluation are provided separately in the submitted deployment documents.

## Team

| Member | Role |
|---|---|
| John Kenneth Devibar | Project Manager / Team Lead |
| Ronel C. Atillo | Developer |
| Mechole Angelou M. Auditor | QA / Test Lead, Developer |
| Christy Roan N. Reroma | Documentation Lead, Developer |
| Adam Cloyd H. Esparcia | Developer / DevOps |

Capstone Instructor: Sir Ralph P. Laviste · Team Adviser: Dr. Patrick L. Bacalso
