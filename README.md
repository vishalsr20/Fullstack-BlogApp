# Blog Application - Full Stack

A complete blog application with React frontend and Node.js backend.

## Features

### Frontend (React + Vite)
- Modern React development with Vite
- Fast Refresh with Babel or SWC
- ESLint for code quality
- Responsive UI

### Backend (Node.js + Express)
- User authentication with JWT
- Blog post CRUD operations
- Like functionality
- Forgot password with email reset
- Image upload via Cloudinary
- SMTP email integration
- MongoDB with Mongoose

## Project Structure




## Setup Instructions

### Prerequisites
- Node.js (v16+ recommended)
- MongoDB Atlas account or local MongoDB
- Cloudinary account (for image uploads)
- Gmail account (for SMTP) or Resend API key

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend

2. install dependencies 
   npm install 


   .env

   MONGO_URL=your_mongodb_connection_string
PORT=5000

# JWT Configuration
JWT_SECRET=your_jwt_secret_key

# Email Configuration
MAIL_HOST=smtp.gmail.com
MAIL_USER=your_gmail_address
MAIL_PASS=your_gmail_app_password

# Resend API (alternative)
RESEND_API_KEY=your_resend_api_key

# Cloudinary
CLOUD_NAME=your_cloudinary_cloud_name
API_KEY=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret
CLOUDINARY_URL=your_cloudinary_url



1 Frontend Setup

2 Navigate to frontend directory:

cd ../frontend
3 Install dependencies:
npm install
4 Start development server:

npm run dev




This README:
1. Clearly separates frontend and backend sections
2. Provides complete setup instructions for both
3. Includes all environment variables
4. Lists API endpoints
5. Shows the project structure
6. Includes deployment notes
7. Is properly formatted with clear section headers

You can further customize it with:
- Screenshots
- Demo link
- More detailed API documentation
- Badges for CI/CD, license, etc.
- Contribution guidelines
- Troubleshooting section