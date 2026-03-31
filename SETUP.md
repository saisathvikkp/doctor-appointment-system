# Doctor Appointment System - Setup Guide

## Port Configuration
- **Frontend**: Runs on `http://localhost:3000`
- **Backend**: Runs on `http://localhost:5000`

## Starting the Application

### Step 1: Start the Backend Server
```bash
cd backend
python app.py
# or
node server.js
```
**Make sure the backend is running on port 5000 before starting the frontend!**

### Step 2: Start the Frontend (in a new terminal)
```bash
cd frontend
npm start
```

## Important Notes
- ✅ Always start the **BACKEND FIRST** on port 5000
- ✅ Then start the **FRONTEND** - it will run on port 3000
- ✅ Both ports should be the same every time you restart
- ✅ If you get "Network Error", check that port 5000 is running the backend

## Troubleshooting Network Error
1. Check that backend server is running on port 5000
2. Open terminal and run: `netstat -an | findstr :5000` (Windows)
3. If port 5000 is not in use, start your backend server
4. Refresh the browser after backend is running

## Port Already in Use?
If port 3000 or 5000 is already in use, kill the process:
```bash
# Windows - Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or change backend port in application code and update api.js
```
