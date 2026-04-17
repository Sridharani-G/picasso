# Arthub Platform Startup Guide

## Prerequisites

Before running the Arthub platform, you need to install and configure the following services:

### 1. MongoDB
- Download MongoDB Community Server from: https://www.mongodb.com/try/download/community
- Install MongoDB according to the official documentation
- Make sure the MongoDB service is running on port 27017
- Or start MongoDB manually using: `mongod`

### 2. PostgreSQL (optional, depending on your setup)
- Download PostgreSQL from: https://www.postgresql.org/download/
- Install and configure PostgreSQL
- Make sure the PostgreSQL service is running on port 5432

## Starting the Application

### Option 1: Quick Start (Frontend only, backend APIs won't work without DB)

1. Open a terminal/command prompt
2. Navigate to the backend directory: `cd backend`
3. Install dependencies: `npm install`
4. Build the backend: `npm run build` (or `npx tsc`)
5. Start the backend: `npm run dev` (this will show errors without MongoDB)
6. Open another terminal window
7. Navigate to the frontend directory: `cd frontend`
8. Install dependencies: `npm install`
9. Start the frontend: `npm run dev`
10. Open your browser and visit: http://localhost:3000

### Option 2: Full Start (with databases)

1. Install and start MongoDB service
2. Install and start PostgreSQL service (if needed)
3. Navigate to the backend directory: `cd backend`
4. Install dependencies: `npm install`
5. Build the backend: `npm run build` (or `npx tsc`)
6. Start the backend: `npm run dev`
7. Open another terminal window
8. Navigate to the frontend directory: `cd frontend`
9. Install dependencies: `npm install`
10. Start the frontend: `npm run dev`
11. Open your browser and visit: http://localhost:3000

## Troubleshooting

### MongoDB Connection Error
If you see an error like "ECONNREFUSED ::1:27017", MongoDB is not running. Please:
- Ensure MongoDB is installed
- Start the MongoDB service
- Or run `mongod` in a separate terminal window

### Email Configuration
The application uses email for OTP verification. If you don't configure email:
- Edit the `.env` file in the backend directory
- Set EMAIL_USER and EMAIL_PASS to your email credentials
- Or leave them empty to use mock email functionality (as currently configured)

### Port Conflicts
If you get port conflict errors:
- Check if ports 3000 (frontend) and 5001 (backend) are available
- Modify the PORT in backend/.env if needed
- Modify the port in frontend package.json if needed

## Running with Docker (Alternative)

If you have Docker installed, you can run MongoDB using:
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

Then follow the steps in "Option 2: Full Start".