# VendorBridge ERP 🚀

> **VendorBridge** is a modern, full-stack ERP Procurement & Vendor Management Platform built for the **ODOO Hackathon 2026**. It streamlines the entire procurement lifecycle—from RFQ creation and vendor bidding to multi-stage approvals, purchase order generation, automated PDF invoice creation, and audit log tracking.

---

## 🏗️ Architecture & Tech Stack

VendorBridge is built as a monorepo using **npm Workspaces** for seamless package management and workspace integration.

### Frontend
* **Core:** React 18, Vite, TypeScript
* **Styling:** Tailwind CSS, Lucide React (Icons)
* **State Management:** Zustand
* **Data Fetching:** TanStack React Query (Axios-based API client)
* **Tables:** TanStack React Table (for paginated, sortable procurement lists)
* **Analytics:** Recharts (interactive dashboards and procurement metrics)

### Backend
* **Core:** Node.js, Express, TypeScript
* **ORM:** Prisma
* **Database:** SQLite (local SQL file)
* **Validation:** Zod (runtime type safety for API requests)
* **Document Generation:** PDFKit (automates PDF invoice rendering)
* **Authentication:** JSON Web Tokens (JWT) & BcryptJS (password hashing)

---

## ✨ Key Features

1. **Role-Based Workspaces:**
   * **Purchaser/Admin:** Create RFQs, assign vendors, review quotes, track POs, and view live audit trails.
   * **Approver:** Dynamic multi-stage approval dashboard for quotation vetting.
   * **Vendor:** View assigned RFQs, submit quotation bids with custom line-item pricing, and download generated invoices.

2. **Procurement Lifecycle Automation:**
   * **Request for Quotation (RFQ):** Structure RFQs with itemized unit specifications, deadlines, and delivery/payment terms.
   * **Quotation Bidding:** Allow vendors to submit itemized quotes. 
   * **Two-Stage Approvals:** Approvers review quotations sequentially based on amount limits and business criteria.
   * **Purchase Orders (POs):** Automatically convert approved quotations into structured POs (e.g. `PO-2026-XXXX`).
   * **PDF Invoicing:** Dynamically generates professional, download-ready PDF invoices.

3. **System Integrity & Analytics:**
   * **Real-time Audit Logs:** Full event-driven auditing across `VENDOR`, `RFQ`, `APPROVAL`, `INVOICE`, and `SYSTEM` domains.
   * **Interactive Dashboards:** Visual metrics on vendor ratings, total spent, approval delays, and active RFQ statuses.

---

## 🛠️ Local Development Setup

### 1. Prerequisites
Ensure you have the following installed on your machine:
* [Node.js](https://nodejs.org/) (v18.x or higher)
* [npm](https://www.npmjs.com/) (v9.x or higher)

### 2. Installation
Clone the repository and install all workspace dependencies from the root directory:
```bash
git clone https://github.com/Smit-2806/odoo-2k26.git
cd odoo-2k26
npm install
```

### 3. Environment Configuration
Create the local `.env` files for both the root and the backend packages:

* **Root Environment File:**
  Copy `.env.example` to `.env` in the root folder:
  ```bash
  cp .env.example .env
  ```
  Set your environment variables (e.g. `PORT`, `DATABASE_URL`, `JWT_SECRET`).

* **Backend Environment File:**
  Ensure you configure `backend/.env` with your specific API keys:
  ```env
  PORT=5000
  DATABASE_URL="file:./database/dev.db"
  JWT_SECRET="your_secure_jwt_secret_key"
  GEMINI_API_KEY="your_google_gemini_api_key"
  ```

### 4. Database Setup (Prisma & SQLite)
Generate the Prisma client and apply database migrations locally:
```bash
# Generate the DB client
npm run prisma:generate

# Apply migrations and seed mock data (users, vendors, RFQs)
npm run prisma:migrate
```

### 5. Running the Application
Launch both the **frontend (Vite)** and **backend (Express)** concurrently using:
```bash
npm run dev
```

* **Frontend URL:** `http://localhost:5173` (by default)
* **Backend API URL:** `http://localhost:5000`

---

## 📁 Repository Structure
```
├── backend/                     # Express REST API (TypeScript)
│   ├── prisma/                  # Prisma Schemas & Database Seeds
│   └── src/                     # Source Code (API controllers, services, middlewares)
├── frontend/                    # Vite React SPA (TypeScript)
│   └── src/                     # Pages, Components, State, and Utilities
├── docs/                        # Architectural documentation and guides
├── package.json                 # Monorepo workspaces config
└── README.md                    # This file
```
