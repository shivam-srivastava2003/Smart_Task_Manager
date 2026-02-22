# Smart Task Manager

A complete **FULLY RESPONSIVE** task management web application built with Node.js, Express, MongoDB, Mongoose, EJS, Passport authentication, Joi validation, and MVC architecture.

## Folder Structure

```bash
Smart_Task_Manager/
├── app.js
├── package.json
├── README.md
├── controllers/
│   ├── tasks.js
│   └── users.js
├── middleware/
│   └── index.js
├── models/
│   ├── task.js
│   └── user.js
├── public/
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── main.js
├── routes/
│   ├── tasks.js
│   └── users.js
├── utils/
│   ├── catchAsync.js
│   ├── ExpressError.js
│   └── validationSchemas.js
└── views/
    ├── auth/
    │   ├── login.ejs
    │   └── signup.ejs
    ├── layouts/
    │   └── boilerplate.ejs
    ├── partials/
    │   ├── flash.ejs
    │   └── navbar.ejs
    ├── tasks/
    │   ├── edit.ejs
    │   ├── index.ejs
    │   └── new.ejs
    └── error.ejs
```

## Installation Steps

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd Smart_Task_Manager
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start MongoDB**
   Ensure MongoDB is running locally at:
   ```
   mongodb://127.0.0.1:27017/smart-task-manager
   ```

4. **Set environment variables (optional)**
   ```bash
   export DB_URL=mongodb://127.0.0.1:27017/smart-task-manager
   export SESSION_SECRET=yourStrongSecret
   export PORT=8080
   ```

5. **Run the app**
   ```bash
   npm run dev
   ```
   or
   ```bash
   npm start
   ```

6. **Open in browser**
   ```
   http://localhost:8080
   ```

## Features

- User Signup/Login/Logout with Passport and hashed passwords
- Email OTP verification during signup and login access blocked until verification
- Session-based authentication
- Flash messages for success/error/validation feedback
- Forgot password flow with secure reset token and expiry
- Task CRUD operations (create, edit, delete, mark complete/pending)
- Task ownership protection
- Joi server-side validation
- Dashboard statistics (Total, Completed, Pending)
- Filters (status + priority)
- Priority color coding (Low/Medium/High)
- Overdue task highlighting
- MVC architecture with centralized error handling
