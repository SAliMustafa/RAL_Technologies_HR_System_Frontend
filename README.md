# RAL HR System Frontend

React frontend for the RAL HR management system. The application provides separate workspaces for employees, managers, and HR administrators.

## Technology

- React 19
- React Router 7
- Vite 8
- Axios
- i18next and react-i18next
- Plain CSS with responsive layouts

## Setup

Install dependencies:

```bash
npm install
```

Create `frontend/.env`:

```env
VITE_BACK_END_SERVER_URL=http://localhost:3000
```

Start the development server:

```bash
npm run dev
```

Vite normally runs at `http://localhost:5173`.

## Commands

```bash
npm run dev      # Start the development server
npm run build    # Create a production build
npm run lint     # Run ESLint
npm run preview  # Preview the production build
```

## Authentication and layout

- JWTs are stored in `localStorage` and sent as Bearer tokens by Axios.
- Protected routes redirect unauthenticated users to `/sign-in`.
- Role-restricted routes use `ProtectedRoute`.
- The centered sign-in screen has no sidebar.
- Authenticated pages use the RAL-branded sidebar and logo.

## Employee workspace

Implemented features:

- Dashboard with live profile, today’s attendance, leave balances, document totals, expiry alerts, and check-in/check-out actions
- Personal profile
- Personal document list, upload, details, and preview
- Personal attendance history, filters, and record details
- Personal check-in/check-out history
- Leave balances
- Leave request creation, draft editing, submission, cancellation, deletion, and supporting attachments

| Route | Page |
| --- | --- |
| `/dashboard-employee` | Employee dashboard |
| `/MyProfile` | Personal profile |
| `/mydocuments` | Personal documents |
| `/documents/upload` | Upload document |
| `/documents/:documentId` | Document details |
| `/my-attendance` | Personal attendance |
| `/attendance/:id` | Attendance record details |
| `/my-checkins` | Personal check-ins |
| `/leave-allocations` | Personal leave balances |
| `/employee/leave-requests` | Personal leave requests |

## Manager workspace

Managers receive employee self-service navigation plus team-management pages.

Implemented features:

- Manager dashboard with team summary and shortcuts
- Personal profile, attendance, check-ins, leave requests, and leave balances
- Read-only direct-report directory with search and status filters
- Read-only direct-report details
- Team attendance summaries and employee/status/date filters
- Direct-report leave-request review, approval, and rejection
- Separate personal and team leave-balance views

| Route | Page |
| --- | --- |
| `/dashboard-manager` | Manager dashboard |
| `/manager/employees` | Direct reports |
| `/manager/employees/:employeeId` | Direct-report details |
| `/manager/attendance` | Team attendance |
| `/manager/leave-requests` | Team leave requests |
| `/leave-allocations?view=mine` | Personal leave balances |
| `/leave-allocations?view=team` | Team leave balances |

Manager document self-service is not exposed because the current personal-document API authorizes the `employee` role.

## HR administrator workspace

Implemented features:

- Dashboard summaries and shortcuts
- Employee directory, creation, update, and status management
- Department and holiday management
- Leave-type and allocation management
- Organization leave-request review
- Attendance review, correction, locking, and record details
- Check-in history
- Employee document upload, detail, preview, edit, review, rejection, and deactivation
- Audit-log list and details

| Route | Page |
| --- | --- |
| `/dashboard-Admin` | HR dashboard |
| `/employees` | Employee directory |
| `/employees/create` | Create employee |
| `/employees/:id` | Update employee |
| `/admin/departments` | Departments |
| `/admin/holidays` | Holidays |
| `/admin/leave-types` | Leave types |
| `/leave-allocations` | Leave allocations |
| `/admin/leave-requests` | Leave requests |
| `/admin/attendance` | Attendance management |
| `/admin/checkins` | Check-ins |
| `/admin/documents` | Documents |
| `/admin/documents/upload` | Upload employee document |
| `/admin/documents/:documentId` | Document details |
| `/admin/documents/:documentId/edit` | Edit document |
| `/admin/documents/:documentId/review` | Review document |
| `/admin/audit-logs` | Audit logs |
| `/admin/audit-logs/:auditLogId` | Audit-log details |

## Uploads

- Employee documents use multipart field `file`.
- Leave attachments use multipart field `document`.
- Accepted formats are PDF, JPG/JPEG, and PNG, up to 5 MB.
- Previews extract a filename from Linux or Windows paths before requesting `/image/<filename>`.

## Localization

English and Arabic locale files are in `src/locales/`. Some newer screens still contain English copy directly in their components.

## Current scope

Payroll, salary, company, designation, shift, and statutory-setting models exist in the backend, but they do not have complete frontend routes and are not presented as implemented frontend modules.
