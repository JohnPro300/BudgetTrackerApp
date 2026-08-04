
# Budget Tracker App

A RESTful budget tracking API built with Node.js, Express and Mongoose.
## Features

- User Registration and Login  
- JWT Authentication  
- Role-Based Access Control (Admin and Standard Users)  
- Add/edit/delete and view Transaction (income and expenses)  
- Dynamic Category Management (Category customisation) 
- Set monthly/category budget limits, track spending and limit.  
- Generate Budget Reports  
- View Budget History 
- Search & Filter Engine 
- Data Input Validation and Error Handling 
- External Email Service (send email notifications or budget alerts 
to the users if a user exceeds 80% or 100% of their monthly 
budget)

## Tech Stack

- Node.js
- Express
- MongoDB + Mongoose
- JWT authentication
- Nodemailer email alerts
- express-validator input validation
- express-rate-limit security

## Quick start

1. Install dependencies

```bash
npm install
```

2. Create a `.env` file in the project root with these values:

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

3. Start development mode

```bash
npm run dev
```

4. Open the API at:

```text
http://localhost:5000
```

## Main API routes

### Authentication

- `POST /api/auth/register` — register new user
- `POST /api/auth/login` — login and receive tokens
- `POST /api/auth/refresh` — refresh access token
- `POST /api/auth/logout` — logout current user
- `GET /api/auth/me` — get current user profile

### Transactions

- `GET /api/transactions` — list all transactions
- `GET /api/transactions/:id` — get one transaction
- `POST /api/transactions` — add a transaction
- `PUT /api/transactions/:id` — update a transaction
- `DELETE /api/transactions/:id` — delete a transaction

### Budgets

- `GET /api/budgets` — list budgets
- `GET /api/budgets/:id` — get budget details
- `POST /api/budgets` — create a budget
- `PUT /api/budgets/:id` — update a budget
- `DELETE /api/budgets/:id` — delete a budget

### Categories

- `GET /api/categories` — list categories
- `GET /api/categories/:id` — get category details
- `POST /api/categories` — create a category
- `PUT /api/categories/:id` — update a category
- `DELETE /api/categories/:id` — delete a category

### Reports

- `GET /api/reports/summary` — monthly spending summary
- `GET /api/reports/by-category` — spending per category
- `GET /api/reports/budget-performance` — budget progress metrics
- `GET /api/reports/history` — budget history

### Admin user management

- `GET /api/users` — list users
- `GET /api/users/:id` — get user details
- `PATCH /api/users/:id/status` — change active status
- `PATCH /api/users/:id/role` — update user role
- `DELETE /api/users/:id` — delete user

## Budget alerts

The app sends email notifications when budget usage reaches:

- 80% of the budget
- 100% or more of the budget

## Notes

- Protected endpoints require a bearer token
- Categories, budgets, and transactions are user-specific
- Use `npm start` for production and `npm run dev` for development

## License

This project is provided as-is.
