# CLAUDE.md - Developer Guidelines for VendorBridge ERP

## Project Overview
VendorBridge is an enterprise-grade Procurement & Vendor Management ERP platform. It manages the complete procurement lifecycle from vendor registration to reporting and analytics.

---

## Pre-Implementation Checklist
1. **Authoritative Reference**: Always consult this `CLAUDE.md` file before any code change.
2. **Workflows**: Fully align changes with the procurement lifecycle stage under development.
3. **Folder Structure**: Reuse existing components, hooks, services, and patterns. Do not introduce conflicting architectures.
4. **Types**: Use strict TypeScript. Never use `any`.
5. **Security**: Validate all inputs using Zod, enforce JWT authentication, and implement Role-Based Access Control (RBAC).

---

## Development & Build Commands

### Backend Commands
- **Install dependencies**: `npm install` (in `backend/` folder)
- **Start dev server**: `npm run dev` (runs backend with hot-reload)
- **Prisma Studio**: `npx prisma studio` (to view database records)
- **Database Migration**: `npx prisma migrate dev`
- **Database Generate**: `npx prisma generate`
- **Run tests**: `npm test`

### Frontend Commands
- **Install dependencies**: `npm install` (in `frontend/` folder)
- **Start dev server**: `npm run dev` (Vite dev server)
- **Build production bundle**: `npm run build`
- **Preview build**: `npm run preview`
- **Lint code**: `npm run lint`

---

## Technical Stack & Standards

### Frontend
- **Framework**: React 18 + TypeScript + React Router v6
- **State Management**: Zustand (client state), TanStack Query (server state)
- **Styling**: Tailwind CSS + shadcn/ui
- **Forms & Validation**: React Hook Form + Zod
- **Data Table**: TanStack Table (use/reuse the existing `DataTable` component)
- **Charts**: Recharts
- **Aesthetic Principles**: Harmonious palettes, dark mode support, glassmorphism elements, micro-animations, modern typography.

### Backend
- **Framework**: Node.js + Express.js + TypeScript
- **Database & ORM**: PostgreSQL + Prisma ORM
- **Authentication**: JWT-based secure session handling
- **Validation**: Zod schema validation for all request payloads
- **Architecture**: Service layers for business logic, controller layers for request routing, middleware for authentication/validation. Keep controllers thin.

---

## Business Workflows
The procurement lifecycle consists of 12 sequential stages:
1. **Vendor Registration**: Public/private onboarding flow.
2. **Vendor Verification**: Admin review, document check, status update (Pending -> Approved/Rejected).
3. **RFQ (Request For Quotation) Creation**: Procurement officer initiates RFQ with items, deadlines, terms.
4. **RFQ Distribution**: System notifies matching verified vendors.
5. **Vendor Quotation Submission**: Vendors submit prices, terms, and delivery schedules.
6. **Quotation Comparison**: Multi-dimensional analysis board comparing bids side-by-side.
7. **Approval Workflow**: Configurable multi-level approval stages for selected quotations.
8. **Purchase Order (PO) Generation**: Automatic PO creation upon quotation approval.
9. **Purchase Order Fulfillment**: Vendor updates shipping/delivery status.
10. **Invoice Submission**: Vendor uploads invoices tied to PO line items.
11. **Invoice Approval**: Three-way matching (PO, Delivery, Invoice) and finance release.
12. **Reporting & Analytics**: Dashboards for spending, vendor performance (KPIs), cycle times.

---

## Coding Guidelines & Quality Standards

### General Standards
- **TypeScript**: Strict typing is mandatory. No `any` type allowed. Define interfaces or types explicitly.
- **DRY, KISS, SOLID**: Avoid duplicating logic. Prefer utility functions and reusable components.
- **Error Handling**: Implement enterprise-grade global error boundaries on the frontend, and consistent REST error response structures on the backend.
- **Database**: Maintain relational integrity. Always use transactions when writing to multiple tables.

### Frontend Component Requirements
- Must be reusable, responsive (Mobile, Tablet, Desktop), and accessible.
- Support loading, error, empty, and disabled states.
- Follow the VendorBridge Design System. Maintain consistent spacing, typography, and colors.
- Reuse existing components: `DataTable`, `StatusBadge`, `PageHeader`, `ConfirmDialog`, `FileUpload`.

### Backend API Standards
- Enforce strict input validation using Zod middlewares.
- Protect all authenticated routes and implement Role-Based Access Control (RBAC).
- Return consistent JSON responses:
  - Success: `{ success: true, data: ... }`
  - Error: `{ success: false, error: { message: "...", details: ... } }`

---

## Response Structure Requirements
When generating output or discussing changes, follow this structure:
1. **Summary**: What is being done.
2. **Business Impact**: How this affects the user/procurement flow.
3. **Root Cause**: (For bugs only) Why the issue occurred.
4. **Analysis**: Analysis of the architectural/code implications.
5. **Implementation Plan**: Step-by-step implementation roadmap.
6. **Code Changes**: The exact code changes.
7. **Database Changes**: Database migrations or schema updates.
8. **API Changes**: New or modified REST endpoints.
9. **Security Considerations**: Authentication, authorization, input validation checks.
10. **Risks & Tradeoffs**: Potential architectural risks, performance impacts.
11. **Testing Checklist**: How to test happy paths, error paths, validations.
12. **Future Improvements**: Suggested next steps.
