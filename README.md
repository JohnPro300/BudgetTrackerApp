<<<<<<< HEAD
# Budget Tracker App

A RESTful budget tracking API built with Node.js, Express, MongoDB, and Mongoose.

## Features

- User Registration and Login 
- JWT Authentication 
- Role-Based Access Control (Admin and Standard Users) 
- Add/edit/delete and view Transaction (income and expenses) 
- Dynamic Category Management (Category customisation)
- Set monthly/category budget limits, track spending and limit. 
- Data validation: it is to ensure the correct data types 
- Report Generation 
- Search & Filter Engine 
- Budget Notifications (budget limit warnings, reminders) 

## Tech Stack

- Node.js
- Express
- MongoDB / Mongoose
- JSON Web Tokens (JWT)
- Nodemailer for email notifications
- Express-validator for input validation
- Express-rate-limit for basic security

## Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB available locally or remotely
- SMTP credentials for email notifications

### Install dependencies

```bash
npm install
```

### Environment Variables

Create a `.env` file in the project root and configure the following values:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost/budget_tracker
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-email-password
EMAIL_FROM="Budget Tracker <your-email@example.com>"
```

> For Gmail SMTP, use an app password with 2FA enabled.

### Run the app

```bash
npm start
```

The API will be available at `http://localhost:5000`.

## API Overview

Base route: `/api`

### Authentication

- `POST /api/auth/register` — register a new user
- `POST /api/auth/login` — authenticate and receive tokens
- `POST /api/auth/refresh` — refresh access token
- `POST /api/auth/logout` — logout user (protected)
- `GET /api/auth/me` — get current user profile (protected)

### Transactions

Protected routes under `/api/transactions`:

- `GET /api/transactions` — list transactions with filters
- `GET /api/transactions/:id` — get a single transaction
- `POST /api/transactions` — create a transaction
- `PUT /api/transactions/:id` — update a transaction
- `DELETE /api/transactions/:id` — delete a transaction

### Budgets

Protected routes under `/api/budgets`:

- `GET /api/budgets` — list budgets for current user
- `GET /api/budgets/:id` — get budget details
- `POST /api/budgets` — create a budget
- `PUT /api/budgets/:id` — update a budget
- `DELETE /api/budgets/:id` — delete a budget

### Categories

Protected routes under `/api/categories`:

- `GET /api/categories` — list categories
- `GET /api/categories/:id` — get category details
- `POST /api/categories` — create a category
- `PUT /api/categories/:id` — update a category
- `DELETE /api/categories/:id` — delete a category

### Reports

Protected routes under `/api/reports`:

- `GET /api/reports/summary` — monthly summary report
- `GET /api/reports/by-category` — spending by category
- `GET /api/reports/budget-performance` — budget performance metrics
- `GET /api/reports/history` — budget history

### Users (Admin only)

Protected routes under `/api/users` for admin users:

- `GET /api/users` — list all users
- `GET /api/users/:id` — get user details
- `PATCH /api/users/:id/status` — toggle user active status
- `PATCH /api/users/:id/role` — change user role
- `DELETE /api/users/:id` — delete a user

## Budget Alerts

When an expense transaction is created or updated, the app checks relevant budgets and sends email alerts if:

- Spending reaches 80% of the budget limit
- Spending exceeds 100% of the budget limit

Alerts are tracked per budget so the same email is not repeatedly sent for the same threshold.

## Notes

- The app uses bearer token authentication for protected endpoints.
- Customize categories and budgets per user.
- The health check endpoint is available at `GET /api/health`.

## License

This project is provided as-is.
=======
# BudgetTrackerApp
Budget Tracker App: A modern budgeting backend with user auth, transactions, categories, budgets, reports, and email support. Built with Node.js, organized controllers/services/models, and ready for secure financial tracking and reporting.
>>>>>>> b4daf0e3944c87500a9ed6632788d32f6b0c7596
