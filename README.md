# 🚀  Nexus - A Language Exchange Platform

A real-time video chat application built for learning new languages by directly communicating with native speakers. Using technologies like MERN stack and Stream for video calls.

## ✨ Features

- � User Authentication
- 🤝 Friend Request System
- 📹 Real-time Video Calls
- 🌙 32+ daisyUI Themes
- 🔔 Real-time Notifications
- 💬 Chat Integration
- 🛡️ Protected Routes
- 🎨 Modern UI with TailwindCSS

## 🛠️ Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Stream Account (for video calls)

## ⚙️ Environment Variables

Before running the project, you need to set up your environment variables. Copy `.env.example` to `.env` in both frontend and backend directories and fill in your values:

### Backend (`/backend/.env`)
```
PORT=5001
NODE_ENV=development
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
STREAM_API_KEY=your_stream_api_key
STREAM_API_SECRET=your_stream_secret
CLIENT_URL=http://localhost:5173
```

### Frontend (`/frontend/.env`)
```
VITE_STREAM_API_KEY=your_stream_api_key
```

## � Installation & Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd Project_Nexus
```

2. **Install Dependencies**

For Backend:
```bash
cd backend
npm install
```

For Frontend:
```bash
cd frontend
npm install
```

3. **Start the Development Servers**

In the backend directory:
```bash
npm run dev
```

In the frontend directory:
```bash
npm run dev
```

The backend will run on `http://localhost:5001` and the frontend on `http://localhost:5173`.

## 📝 Notes

- Make sure MongoDB is running locally or you have a valid MongoDB Atlas URI
- Ensure all environment variables are properly set before starting the application
- The frontend uses Vite for development and building

