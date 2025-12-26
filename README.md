# Internal Task Force

> 🚧 **Work In Progress** 🚧

A comprehensive internal project management and ticketing system designed for multi-disciplinary teams. This application handles project scopes, tickets, comments, and notifications with strict Role-Based Access Control (RBAC).

🔗 **Live Demo:** [https://internal-task-force-web-21ob.vercel.app](https://internal-task-force-web-21ob.vercel.app)

## Features

- **Multi-Team Support**: Specialized views for Software, Structural, Electrical, and Environmental teams.
- **RBAC (Role-Based Access Control)**:
  - **Admins**: Full access to all projects and settings.
  - **Leads**: Manage team scopes, assign tickets, and toggle cross-team commenting.
  - **Engineers**: View tickets, update status, and comment (if allowed).
- **Ticket Management**: Create, assign, and track technical tickets through their lifecycle.
- **Collaboration**: Internal commenting system with configurable cross-team visibility.
- **Real-time Notifications**: Alerts for ticket assignments and status changes.

## Demo Credentials

You can use the following credentials to test different roles.
**Password for all users:** `password123`

| Username      | Role         | Team       | Capabilities                                       |
| :------------ | :----------- | :--------- | :------------------------------------------------- |
| `admin`       | **Admin**    | -          | Full control, create projects, manage all tickets. |
| `sw_lead`     | **Lead**     | Software   | Manage Software team tasks, assign engineers.      |
| `sw_eng`      | **Engineer** | Software   | Work on assigned tickets, update status.           |
| `struct_lead` | **Lead**     | Structural | Manage Structural team tasks.                      |
| `elec_eng`    | **Engineer** | Electrical | Work on assigned Electrical tickets.               |

## Getting Started

### Prerequisites

- Node.js (v18+)
- pnpm or npm
- MySQL Database

### Installation

1.  **Clone the repository**

    ```bash
    git clone <repository_url>
    cd internal-task-force
    ```

2.  **Install Dependencies**

    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in `apps/api` with your database configuration:

    ```env
    DATABASE_URL="mysql://user:password@localhost:3306/internal_task_force"
    JWT_SECRET="your_secret_key"
    ```

4.  **Database Migration & Seed**

    ```bash
    cd apps/api
    npx prisma migrate dev
    npm run seed
    ```

5.  **Run Locally**
    The project uses a monorepo structure. You can run both the API and Web client:

    _Backend (API)_

    ```bash
    cd apps/api
    npm run dev
    ```

    _Frontend (Web)_

    ```bash
    cd apps/web
    npm run dev
    ```

## Tech Stack

- **Frontend**: React, Vite, TailwindCSS
- **Backend**: Node.js, Express, GraphQL Yoga
- **Database**: MySQL, Prisma ORM
- **Authentication**: JWT-based auth with secure cookies
