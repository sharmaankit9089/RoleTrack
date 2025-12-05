# RoleTrack

## 🌐 Live Demo Links

- **Frontend Live:** https://role-track.vercel.app/
- **Backend API Base URL:** https://roletrack-backend.onrender.com/api/v1  


A full-stack task management application with role-based access control (RBAC). Features user authentication, task management, and an admin panel for user and task management.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Admin Features](#admin-features)
- [Testing](#testing)
- [Security](#security)
- [Documentation](#documentation)

## ✨ Features

- **User Authentication**: Register and login with JWT tokens
- **Task Management**: Create, read, update, and delete tasks
- **Role-Based Access Control**: User and Admin roles with different permissions
- **Admin Dashboard**: Manage users and view all tasks
- **Input Validation**: Express validator for request validation
- **API Documentation**: Swagger UI for interactive API docs
- **Password Security**: Bcrypt for password hashing
- **CORS Support**: Cross-origin resource sharing enabled

## 🛠 Tech Stack

**Backend:**
- Node.js + Express.js
- MongoDB with Mongoose ODM
- JWT for authentication
- Bcryptjs for password hashing
- Express Validator for input validation
- Swagger UI for API documentation

**Frontend:**
- React 18
- Vite build tool
- Vanilla CSS

## 📁 Project Structure

```
RoleTrack/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # MongoDB connection setup
│   │   ├── middleware/
│   │   │   ├── auth.js               # JWT authentication middleware
│   │   │   └── authorize.js          # Role-based authorization middleware
│   │   ├── models/
│   │   │   ├── user.js               # User schema
│   │   │   └── task.js               # Task schema
│   │   ├── routes/
│   │   │   ├── auth.js               # Authentication routes
│   │   │   ├── tasks.js              # Task management routes
│   │   │   └── admin.js              # Admin routes
│   │   ├── docs/
│   │   │   └── swagger.js            # Swagger configuration
│   │   ├── scripts/
│   │   │   ├── checkDb.js            # Database check utility
│   │   │   └── createAdmin.js        # Admin creation script
│   │   ├── tests/
│   │   │   └── auth.test.js          # Authentication tests
│   │   ├── app.js                    # Express app setup
│   │   └── index.js                  # Server entry point
│   ├── .env                          # Environment variables
│   ├── package.json
│   └── README.md
├── frontend/
│   ├── src/
│   │   ├── AdminPanel.jsx            # Admin dashboard component
│   │   ├── App.jsx                   # Main app component
│   │   ├── api.js                    # API client
│   │   ├── main.jsx                  # React entry point
│   │   └── styles.css                # Global styles
│   ├── index.html
│   ├── main.js
│   ├── styles.css
│   ├── vite.config.js
│   └── package.json
└── README.md                         # This file
```

## 📋 Prerequisites

- **Node.js**: v14 or higher
- **npm**: v6 or higher
- **MongoDB**: Local instance or MongoDB Atlas account

## 🚀 Installation

### Backend Setup

1. Navigate to the backend directory:
```powershell
cd backend
```

2. Install dependencies:
```powershell
npm install
```

3. Create a `.env` file in the backend directory (already provided):
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/roletrack
MONGO_URI_TEST=mongodb+srv://username:password@cluster.mongodb.net/roletrack_test
JWT_SECRET=your_jwt_secret_key
PORT=3000
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin123!
```

### Frontend Setup

1. Navigate to the frontend directory:
```powershell
cd frontend
```

2. Install dependencies:
```powershell
npm install
```

## ⚙️ Configuration

### MongoDB Connection
Update `MONGO_URI` in `.env` with your MongoDB connection string:
- **Local MongoDB**: `mongodb://localhost:27017/roletrack`
- **MongoDB Atlas**: `mongodb+srv://username:password@cluster.mongodb.net/roletrack`

### JWT Secret
Change `JWT_SECRET` in `.env` to a strong random string for production.

### Admin Credentials
Default admin credentials are set in `.env`:
- Email: `admin@example.com`
- Password: `Admin123!`

## 🏃 Running the Application

### Start Backend (Development)

```powershell
cd backend
npm run dev
```

The server will start on `http://localhost:3000`

### Start Frontend (Development)

```powershell
cd frontend
npm run dev
```

The frontend will typically start on `http://localhost:5173`

### Create Admin User

```powershell
cd backend
npm run create-admin
```

This creates an admin user with credentials from `.env`

### Build Frontend for Production

```powershell
cd frontend
npm run build
```

## 📡 API Endpoints

### Base URL: `http://localhost:3000/api/v1`

### Authentication Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|----------------|
| `POST` | `/auth/register` | Register a new user | No |
| `POST` | `/auth/login` | Login user | No |
| `GET` | `/auth/me` | Get current user | Yes |

### Task Routes (All require authentication)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|----------------|
| `GET` | `/tasks` | List user tasks (admins can use `?all=true`) | Yes |
| `POST` | `/tasks` | Create a new task | Yes |
| `GET` | `/tasks/:id` | Get specific task | Yes |
| `PUT` | `/tasks/:id` | Update task | Yes |
| `DELETE` | `/tasks/:id` | Delete task | Yes |

### Admin Routes (Require admin role)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/admin/users` | List all users |
| `GET` | `/admin/users/:id/tasks` | Get tasks for specific user |
| `PATCH` | `/admin/users/:id/role` | Change user role |
| `DELETE` | `/admin/users/:id` | Delete user |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | API health check |

## 👨‍💼 Admin Features

Admin users have special privileges:

1. **View All Tasks**: Use `GET /api/v1/tasks?all=true` to see all tasks
2. **Assign Tasks**: Create tasks for other users with `user` field
3. **Manage Users**: Change user roles, view all users
4. **Admin Dashboard**: Access the admin panel in the frontend

### Admin Panel Features:
- View all users
- View all tasks
- Change user roles
- Delete users
- Monitor system activity

## 🧪 Testing

Run the test suite:

```powershell
cd backend
npm test
```

Tests are located in `backend/tests/auth.test.js`

## 🔒 Security

### Important Security Notes

1. **Environment Variables**: Never commit `.env` file to version control. The provided `.env` contains test credentials.
2. **JWT Secret**: Use a strong, random string for `JWT_SECRET` in production
3. **Password Hashing**: All passwords are hashed with bcryptjs before storage
4. **Input Validation**: All inputs are validated using express-validator
5. **CORS**: Enable only trusted origins in production
6. **Credential Rotation**: Rotate MongoDB credentials before deploying to production

### Before Going Live:
- [ ] Change MongoDB credentials
- [ ] Generate a strong JWT_SECRET
- [ ] Update CORS configuration
- [ ] Remove test credentials from `.env`
- [ ] Enable HTTPS
- [ ] Set up rate limiting
- [ ] Configure firewall rules

## 📚 API Documentation

### Interactive Swagger UI

Access the interactive API documentation at:
```
http://localhost:3000/api-docs
```

The Swagger UI allows you to:
- View all endpoints
- Try out API calls
- See request/response examples
- Understand parameter requirements

### API Index

Get a list of all available endpoints:
```
GET http://localhost:3000/api/v1
```

## 🔄 Workflow Example

### 1. Register a User
```bash
POST /auth/register
Content-Type: application/json

{
  "name": "Ankit Sharma",
  "email": "ankit@gmail.com",
  "password": "123456"
}
```

### 2. Login
```bash
POST /auth/login
Content-Type: application/json

{
  "email": "ankit@gmail.com",
  "password": "123456"
}
```

Response includes JWT token.

### 3. Create a Task
```bash
POST /tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Complete project",
  "description": "Finish the RoleTrack project"
}
```

### 4. Get Tasks
```bash
GET /tasks
Authorization: Bearer <token>
```

## 📝 Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `MONGO_URI` | - | MongoDB connection string (required) |
| `MONGO_URI_TEST` | - | MongoDB connection string for tests |
| `JWT_SECRET` | `dev_jwt_secret_change_me` | Secret key for JWT signing |
| `PORT` | `3000` | Server port |
| `ADMIN_EMAIL` | `admin@example.com` | Default admin email |
| `ADMIN_PASSWORD` | `Admin123!` | Default admin password |

## 🐛 Troubleshooting

### MongoDB Connection Error
- Verify MongoDB is running
- Check `MONGO_URI` in `.env`
- Ensure network access in MongoDB Atlas (if using cloud)

### JWT Authentication Fails
- Verify token is being sent in `Authorization` header
- Check that `JWT_SECRET` is set correctly
- Ensure token hasn't expired

### Port Already in Use
Change `PORT` in `.env` or kill the process using port 3000

### CORS Errors
Add your frontend URL to the CORS configuration in `backend/src/app.js`

## 📞 Support

For issues or questions, please check:
1. `.env` configuration
2. MongoDB connection
3. API documentation at `/api-docs`
4. Test files for usage examples

## 📄 License

MIT License - See LICENSE file for details


**Last Updated**: December 2025
#


