🚀 Blog Application – Full Stack with AI Integration

A modern full-stack blog platform built with React (Vite) and Node.js (Express), featuring AI-powered blog creation, contextual AI assistant, and intelligent search.

🌟 Features
🖥️ Frontend (React + Vite)

⚡ Modern React development with Vite

🔥 Fast Refresh (Babel / SWC)

🧹 ESLint for code quality

📱 Fully responsive UI (Mobile + Desktop)

🔍 Advanced keyword-based search

❤️ Like system with real-time UI update

🤖 Floating AI Blog Assistant

🧠 AI-powered blog generation page

✨ Modern animated chat interface

⚙️ Backend (Node.js + Express)

🔐 JWT Authentication

👤 User registration & login

📝 Blog CRUD operations

❤️ Like functionality

🔁 Forgot password with email reset

☁️ Image upload via Cloudinary

📧 SMTP email integration (Gmail / Resend)

🗄️ MongoDB with Mongoose

🔎 Multi-field search (Title, Category, Author, Tags)

🤖 AI-powered blog generation (Gemini API)

🧠 Context-aware Blog AI Assistant

🤖 AI Features
✨ 1. AI Blog Generation

Users can:

Generate blog content using AI

Provide topic or prompt

Get structured, formatted blog content

Edit and publish generated content

Powered by:

Google Gemini API (gemini-1.5-flash / 2.5-flash)

💬 2. AI Blog Assistant (Context-Aware)

Floating assistant available across the platform.

🔹 HOME Mode

Suggest latest blogs

Suggest top 5 blogs

Suggest most liked blog

Recommend categories

Answer platform-related questions

🔹 BLOG Mode

Summarize current blog

Explain content

Provide improvement suggestions

Give structured feedback

Show metadata (author, date, likes)

Provide readability suggestions

⚠️ Off-topic questions are restricted — assistant responds only about platform/blogs.

🔎 3. Smart Search

Users can search by:

Title

Category

Author name

Tags

Content keywords

MongoDB powered $or search with regex or text indexing.

Example:

/search?q=ai

🧠 4. Intelligent Blog Ranking

AI + Logic based features:

Latest blog detection

Top 5 blogs by likes

Most liked blog

Structured numbered responses

Clean formatted chat output

📂 Project Structure
blog-app/
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── helper/
│   ├── middleware/
│   ├── config/
│   └── index.js
│
├── frontend/
│   ├── components/
│   ├── pages/
│   ├── assets/
│   ├── APIRoutes.js
│   └── main.jsx
│
└── README.md

⚙️ Setup Instructions
📌 Prerequisites

Node.js (v16+ recommended)

MongoDB Atlas account or local MongoDB

Cloudinary account

Gmail account (App Password) OR Resend API

Google Gemini API key

🛠 Backend Setup
cd backend
npm install


Create .env file:

MONGO_URL=your_mongodb_connection_string
PORT=5000

JWT_SECRET=your_jwt_secret_key

MAIL_HOST=smtp.gmail.com
MAIL_USER=your_gmail_address
MAIL_PASS=your_gmail_app_password

RESEND_API_KEY=your_resend_api_key

CLOUD_NAME=your_cloudinary_cloud_name
API_KEY=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret
CLOUDINARY_URL=your_cloudinary_url

GOOGLE_API_KEY=your_gemini_api_key


Start backend:

npm run dev

🖥 Frontend Setup
cd frontend
npm install
npm run dev

🔗 API Endpoints
Authentication

POST /api/auth/register

POST /api/auth/login

POST /api/auth/forgot-password

POST /api/auth/reset-password

Blogs

POST /api/blog/create

GET /api/blog/:id

PUT /api/blog/:id

DELETE /api/blog/:id

PUT /api/blog/like/:id

Search

GET /api/blog/search?q=keyword

AI

POST /api/blog/ai-generate

POST /api/blog/ai-assistant

🚀 Deployment Notes

Frontend:

Vercel / Netlify

Backend:

Render / Railway / Cyclic / DigitalOcean

Environment variables must be configured in deployment dashboard.

🔐 Security Features

JWT-based authentication

Protected routes

Input validation

AI hallucination control (strict prompt engineering)

Off-topic AI restriction

Token expiration handling

📈 Future Improvements

🔥 Trending algorithm (likes + recency weight)

🧠 AI semantic search

📊 Analytics dashboard

🏷️ Advanced tag filtering

💬 Real-time chat history storage

📌 Save blogs feature

🌙 Dark mode

🤝 Contribution

Fork the repository

Create a feature branch

Commit changes

Open pull request

📜 License

MIT License

💡 Author

Built with ❤️ by Vishal Rathod
