# ChatFlow 💬

ChatFlow is a real-time chat application built using the MERN stack
and Socket.IO. It allows users to communicate through chat rooms
with text messages, images, and voice notes.

## 🚀 Features

- User registration and login
- Secure authentication using JWT
- Real-time messaging with Socket.IO
- Chat rooms
- Image sharing
- Voice messages
- Message persistence using MongoDB
- Online user tracking
- Room-based communication
- Role-based access (Owner, Admin, Member)
- Reply-to-message functionality

## 🛠️ Tech Stack

### Frontend
- React.js
- Vite
- JavaScript
- CSS

### Backend
- Node.js
- Express.js
- Socket.IO
- MongoDB
- Mongoose
- JWT Authentication
- Cloudinary

## 📁 Project Structure

chat-collaboration-app/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── socket/
│   └── server.js
│
├── frontend/
│   ├── public/
│   └── src/
│
├── .gitignore
└── README.md

## ⚙️ Getting Started

### Prerequisites

- Node.js
- npm
- MongoDB Atlas account
- Cloudinary account

### Installation

1. Clone the repository:

   git clone https://github.com/manoj15533/ChatFlow.git

2. Navigate to the project folder:

   cd ChatFlow

3. Install backend dependencies:

   cd backend
   npm install

4. Configure your backend environment variables in a `.env` file.

   Never upload your `.env` file or expose API keys,
   database credentials, or JWT secrets.

5. Start the backend server using the script configured
   in backend/package.json.

6. Open another terminal and install frontend dependencies:

   cd frontend
   npm install

7. Start the frontend using the script configured
   in frontend/package.json.

## 👨‍💻 Author

Manoj Puthran

GitHub: https://github.com/manoj15533
