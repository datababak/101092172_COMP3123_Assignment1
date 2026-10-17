# COMP3123 — Assignment 1

## Employee Management REST API

A backend REST API developed using Node.js, Express.js, MongoDB, and Mongoose for COMP3123 — Full Stack Development I.

The application allows users to register, log in, and manage employee records securely. Each employee belongs to a specific user, and JWT authentication ensures that users can access only their own employees.

## Features

- User registration with unique usernames and email addresses
- Secure password hashing using bcrypt
- Login using username or email
- JWT-based authentication
- Employee Create, Read, Update, and Delete (CRUD) operations
- Employee ownership protection
- Input validation and appropriate HTTP status codes
- MongoDB Atlas integration using Mongoose
- HTTP security headers using Helmet
- API rate limiting using express-rate-limit
- HTTP request logging using Morgan
- Centralized error handling
- API health-check endpoint
- Environment variables for sensitive configuration

## Technologies

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js | REST API framework |
| MongoDB Atlas | Cloud database |
| Mongoose | MongoDB object modeling |
| bcrypt | Password hashing |
| jsonwebtoken | JWT authentication |
| dotenv | Environment configuration |
| Helmet | HTTP security headers |
| express-rate-limit | API request limiting |
| Morgan | HTTP request logging |
| Nodemon | Development server |
| Postman | API testing |

## Project Structure

```text
COMP3123_Assignment1/
|
|-- config/
|   |-- db.js
|
|-- controllers/
|   |-- UserController.js
|   |-- EmployeeController.js
|
|-- middleware/
|   |-- authMiddleware.js
|   |-- errorMiddleware.js
|
|-- models/
|   |-- UserModel.js
|   |-- EmployeeModel.js
|
|-- routes/
|   |-- UserRoutes.js
|   |-- EmployeeRoutes.js
|
|-- logs/
|   |-- access.log (generated locally, ignored by Git)
|
|-- .env (local configuration, ignored by Git)
|-- .env.example
|-- .gitignore
|-- package.json
|-- package-lock.json
|-- README.md
|-- server.js
```

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/datababak/10172_COMP3123_Assignment1.git
```

Navigate to the project directory:

```bash
cd 10172_COMP3123_Assignment1
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root.

Use `.env.example` as a template:

```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Replace the placeholders with your MongoDB Atlas connection string and a secure JWT secret.

The MongoDB database used for this assignment is:

`comp3123_assignment1`

**Security:** The `.env` file is excluded from Git tracking. Do not commit database credentials or JWT secrets.

### 4. Start the Server

For development:

```bash
npx nodemon server.js
```

Alternatively:

```bash
node server.js
```

When MongoDB is connected successfully, the terminal displays:

```text
MongoDB connected successfully
Server running at http://localhost:3000
```

## API Base URL

```text
http://localhost:3000
```

## API Endpoints

| Method | Endpoint | Description | Authentication | Success Status |
|---|---|---|---|---|
| POST | `/api/v1/user/signup` | Register a user | No | 201 |
| POST | `/api/v1/user/login` | Log in and obtain JWT | No | 200 |
| GET | `/api/v1/emp/employees` | Retrieve the user's employees | Yes | 200 |
| POST | `/api/v1/emp/employees` | Create an employee | Yes | 201 |
| GET | `/api/v1/emp/employees/:eid` | Retrieve an employee by ID | Yes | 200 |
| PUT | `/api/v1/emp/employees/:eid` | Update an employee | Yes | 200 |
| DELETE | `/api/v1/emp/employees?eid=...` | Delete an employee | Yes | 204 |

The application also provides:

```http
GET /health
```

Expected response:

```json
{
  "status": "OK",
  "message": "Employee Management API is running"
}
```

## User Registration

### POST `/api/v1/user/signup`

Example request body:

```json
{
  "username": "testuser1",
  "email": "testuser1@example.com",
  "password": "TestPassword123!"
}
```

**Successful response:** `201 Created`

Passwords are hashed using bcrypt before being stored in MongoDB.

The API checks for duplicate usernames and email addresses.

## User Login

### POST `/api/v1/user/login`

Users can log in using either their username or email address.

Example using username:

```json
{
  "username": "testuser1",
  "password": "TestPassword123!"
}
```

Example using email:

```json
{
  "email": "testuser1@example.com",
  "password": "TestPassword123!"
}
```

**Successful response:** `200 OK`

Example response:

```json
{
  "message": "Login successful",
  "token": "JWT_TOKEN_HERE",
  "user": {
    "id": "USER_ID_HERE",
    "username": "testuser1",
    "email": "testuser1@example.com"
  }
}
```

The generated JWT expires after one hour.

## JWT Authentication

All employee endpoints require JWT authentication.

In Postman:

1. Log in to obtain a JWT.
2. Open the employee API request.
3. Select **Authorization**.
4. Choose **Bearer Token**.
5. Paste the JWT into the Token field.
6. Send the request.

Alternatively, the HTTP authorization header can be written as:

```http
Authorization: Bearer JWT_TOKEN_HERE
```

Requests without a valid token receive `401 Unauthorized`.

## Employee Management

### 1. Create Employee

**POST `/api/v1/emp/employees`**

Example request body:

```json
{
  "first_name": "John",
  "last_name": "Smith",
  "email": "john.smith@example.com",
  "position": "Software Developer",
  "salary": 82000,
  "date_of_joining": "2025-06-15",
  "department": "IT"
}
```

**Successful response:** `201 Created`

The employee is automatically associated with the authenticated user.

The client cannot specify or change the employee's owner.

### 2. Get All Employees

**GET `/api/v1/emp/employees`**

**Successful response:** `200 OK`

Returns the employees belonging to the authenticated user.

Employees belonging to other users are excluded.

### 3. Get Employee by ID

**GET `/api/v1/emp/employees/:eid`**

Example:

```http
GET /api/v1/emp/employees/EMPLOYEE_ID
```

**Successful response:** `200 OK`

The API searches using both the employee ID and the authenticated user's ID.

An employee that does not exist or does not belong to the authenticated user returns `404 Not Found`.

### 4. Update Employee

**PUT `/api/v1/emp/employees/:eid`**

Example:

```http
PUT /api/v1/emp/employees/EMPLOYEE_ID
```

Example request body:

```json
{
  "salary": 85000
}
```

**Successful response:** `200 OK`

Only approved employee fields may be updated.

The API rejects attempts to modify the protected `user` ownership field.

This implementation supports updating selected employee fields.

### 5. Delete Employee

**DELETE `/api/v1/emp/employees?eid=EMPLOYEE_ID`**

Example:

```http
DELETE /api/v1/emp/employees?eid=EMPLOYEE_ID
```

**Successful response:** `204 No Content`

The response body is empty.

The API deletes the employee only when it belongs to the authenticated user.

## Employee Data Model

Each employee document contains the following fields:

| Field | Type | Description |
|---|---|---|
| `first_name` | String | Employee first name |
| `last_name` | String | Employee last name |
| `email` | String | Employee email |
| `position` | String | Job position |
| `salary` | Number | Employee salary |
| `date_of_joining` | Date | Joining date |
| `department` | String | Department |
| `user` | ObjectId | Reference to employee owner |
| `created_at` | Date | Creation timestamp |
| `updated_at` | Date | Last update timestamp |

MongoDB automatically generates a unique `_id` for each document.

Mongoose manages the user-to-employee relationship using an ObjectId reference.

## Input Validation

The API validates employee data before creating or updating records.

Validation rules include:

| Field | Rule |
|---|---|
| First name | String, 2–50 characters |
| Last name | String, 2–50 characters |
| Email | Valid email format |
| Position | String, 2–100 characters |
| Salary | Positive finite number |
| Joining date | Valid date using YYYY-MM-DD |
| Department | String, 2–100 characters |
| Employee ID | Valid 24-character hexadecimal MongoDB ObjectId |
| User ownership | Cannot be changed through the employee API |

Employee creation requires all seven employee information fields.

The update endpoint accepts selected fields but rejects unsupported fields.

Invalid employee information returns `400 Bad Request`.

## Security

### Password Hashing

User passwords are hashed using bcrypt before being saved to MongoDB.

Plaintext passwords are not returned in API responses.

### JWT Authentication

Employee routes are protected using JWT authentication middleware.

The middleware verifies the token and identifies the authenticated user.

### Employee Ownership

Employees belong to specific users.

Employee retrieval, update, and deletion operations check both:

- The employee's MongoDB ID
- The authenticated user's ID

Cross-user access attempts return `404 Not Found`.

### Helmet

Helmet adds HTTP security headers, including:

- `X-Content-Type-Options`
- `X-Frame-Options`
- `Content-Security-Policy`

### Rate Limiting

Two rate limiters are configured:

| Scope | Limit | Window |
|---|---|---|
| General `/api` endpoints | 100 requests per IP | 15 minutes |
| Login endpoint | 10 requests per IP | 15 minutes |

Requests that exceed the limit receive `429 Too Many Requests`.

The login limiter counts all login requests, including unsuccessful and successful attempts.

### Request Logging

Morgan records HTTP requests in:

```text
logs/access.log
```

Requests are also displayed in the terminal.

Log entries include request methods, URLs, response status codes, and timestamps.

The local `.log` files are excluded from Git tracking.

### Error Handling

The application uses middleware for unmatched routes and errors passed to Express.

An unknown endpoint returns:

```json
{
  "message": "Route not found"
}
```

Malformed JSON requests return:

```json
{
  "message": "Invalid JSON format"
}
```

Individual controllers also handle expected validation and database errors.

## HTTP Status Codes

| Status | Meaning | Example |
|---|---|---|
| 200 | OK | Successful login, GET, or PUT |
| 201 | Created | User or employee created |
| 204 | No Content | Employee deleted |
| 400 | Bad Request | Invalid or missing information |
| 401 | Unauthorized | Missing or invalid JWT |
| 404 | Not Found | Employee not found or access denied |
| 409 | Conflict | Duplicate username or email |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Unexpected application error |

## Testing

The REST API was tested using Postman, curl, and MongoDB Atlas.

Tests include:

- Successful user registration
- Duplicate-user rejection
- Login with username
- Login with email
- Invalid login credentials
- Missing JWT
- Invalid JWT
- Valid JWT authentication
- Employee creation
- Retrieving all employees
- Retrieving one employee by ID
- Updating an employee
- Deleting an employee
- Cross-user GET access rejection
- Cross-user PUT access rejection
- Cross-user DELETE access rejection
- Missing employee fields
- Invalid salary
- Invalid employee email
- Invalid joining date
- Rejection of ownership modifications
- Unknown API route
- Login rate limiting
- HTTP security headers
- Morgan request logging
- Malformed JSON requests

Screenshots document successful operations and error responses.

A Postman collection can be imported to reproduce API requests.

## Git and Environment Security

The `.gitignore` file excludes:

- `node_modules/`
- `.env`
- Other private environment files
- `logs/*.log`
- `.DS_Store`
- Personal development notes

The `.env.example` file is included to document the required environment variables without exposing credentials.

## Course Information

**Course:** COMP3123 — Full Stack Development I  
**Assignment:** Assignment 1 — Employee Management REST API  
**Semester:** Fall 2026