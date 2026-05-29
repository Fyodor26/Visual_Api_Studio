# Visual API Studio 🚀

A modern full-stack API testing platform inspired by Postman and Insomnia.

Visual API Studio allows developers to create, organize, test, share, and manage HTTP API requests using a sleek modern UI with a powerful backend proxy architecture.

---

# 🌟 Features

## ⚡ API Request Testing

Supports all major HTTP methods:

* GET
* POST
* PUT
* PATCH
* DELETE
* HEAD
* OPTIONS

---

## 🧠 Smart Request Builder

### Supports

* Query Params
* Headers
* JSON Body
* Raw Text Body
* Dynamic Environment Variables

Example:

```bash id="it2e9h"
{{baseUrl}}/users
```

---

## 📂 Collections

Organize APIs into collections:

* Auth APIs
* User APIs
* Payment APIs
* Testing APIs
* Microservices APIs

---

## 🌍 Environment Variables

Create reusable environments:

```env id="hl2e4f"
baseUrl=https://api.example.com
token=abc123
```

Used automatically in requests.

---

## 📊 Response Viewer

Displays:

* Status Code
* Response Time
* Response Size
* Response Headers
* JSON Response Formatting

---

## ☁️ Cloud Sharing

Generate public shareable request links:

```bash id="k5ktlw"
https://your-app.netlify.app/s/abc123
```

---

## 🔐 Authentication System

* Signup
* Login
* JWT Authentication
* Persistent Sessions
* Logout

---

## 🎨 Modern UI

Built with:

* Dark Mode UI
* Responsive Design
* Modern Dashboard
* Code Editor
* Beautiful Animations

---

# 🏗️ Tech Stack

# Frontend

* React
* TypeScript
* TanStack Router
* Zustand
* TailwindCSS
* Shadcn UI
* Lucide React
* React Query

---

# Backend

* Node.js
* Express.js
* MongoDB
* JWT Authentication
* bcrypt
* Mongoose

---

# Database

* MongoDB Atlas

---

# DevOps

* Docker
* Docker Compose
* Render Deployment
* Netlify Deployment

---

# ☁️ Deployment Architecture

| Service    | Platform      |
| ---------- | ------------- |
| Frontend   | Netlify       |
| Backend    | Render        |
| Database   | MongoDB Atlas |
| Containers | Docker        |

---

# 🚀 Production Architecture

```txt id="lnv6yc"
Browser
   ↓
Netlify Frontend
   ↓
Render Backend API
   ↓
MongoDB Atlas Database
   ↓
External APIs
```

---

# 🧠 Core Concepts Used

This project demonstrates:

* REST APIs
* Proxy Servers
* JWT Authentication
* State Management
* Environment Variables
* Request Serialization
* Cloud Sharing
* Fullstack Routing
* Dockerized Infrastructure
* Production Deployment

---

# 📁 Project Structure

```txt id="wxq6b1"
client/
│
├── components/
│   ├── studio/
│   └── ui/
│
├── routes/
├── lib/
├── styles.css
└── main.tsx

server/
│
├── routes/
├── controllers/
├── middleware/
├── models/
├── utils/
└── server.js
```

---

# ⚙️ Environment Variables

# Frontend `.env`

```env id="aqwy7l"
VITE_API_URL=https://your-render-backend.onrender.com
```

---

# Backend `.env`

```env id="6ok7ud"
PORT=5000

MONGO_URI=your_mongodb_atlas_connection_string

JWT_SECRET=your_secret_key

CLIENT_URL=https://your-netlify-app.netlify.app
```

---

# 🔥 Installation

# 1. Clone Repository

```bash id="kg5yxq"
git clone https://github.com/Fyodor26/Visual_Api_Studio
```

---

# 2. Frontend Setup

```bash id="m5j5nh"
cd client

npm install

npm run dev
```

Frontend runs on:

```bash id="2h5dzh"
http://localhost:8080
```

---

# 3. Backend Setup

```bash id="td4xjz"
cd server

npm install

npm run dev
```

Backend runs on:

```bash id="0sc2ny"
http://localhost:5000
```

---

# 🐳 Docker Support

# Frontend Dockerfile

```dockerfile id="0y5kzy"
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

RUN npm install -g serve

COPY --from=builder /app/dist ./dist

EXPOSE 8080

CMD ["npm", "run", "dev"]
```

---

# Backend Dockerfile

```dockerfile id="rq0d4f"
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "run", "dev"]
```

---

# Docker Compose

```yaml id="avw7o8"
version: "3.9"

services:
  frontend:
    build: ./client

    ports:
      - "8080:8080"

    depends_on:
      - backend

  backend:
    build: ./server

    ports:
      - "5000:5000"

    environment:
      MONGO_URI: your_mongodb_atlas_connection
      JWT_SECRET: supersecret

  # Optional local MongoDB container if not using Atlas
  mongo:
    image: mongo

    ports:
      - "27017:27017"
```

---

# 🔐 Authentication Flow

# Signup

```txt id="w6l2w7"
User submits form
↓
Password hashed with bcrypt
↓
Stored in MongoDB Atlas
↓
JWT token generated
↓
Frontend stores token
```

---

# Login

```txt id="xhzrj5"
Frontend sends credentials
↓
Backend validates user
↓
JWT token returned
↓
User session persisted
```

---

# 🌍 Request Execution Flow

```txt id="m9m89f"
Frontend UI
   ↓
runRequest()
   ↓
Backend Proxy API
   ↓
External API
   ↓
Response
   ↓
Frontend Response Viewer
```

---

# 🧠 Why Backend Proxy Exists

Browsers block many APIs because of CORS.

Your backend acts like a proxy:

```txt id="d7mtfe"
Browser → Backend → External API
```

This allows unrestricted API testing.

---

# ☁️ Share System

```txt id="02sp6g"
Save Request
     ↓
MongoDB Atlas
     ↓
Generate Share ID
     ↓
Public URL
```

---

# 📚 Advanced Features

* Environment Variable Interpolation
* Persistent State with Zustand
* Request History
* Dynamic Tabs
* JSON Beautifier
* Request Sharing
* Response Analytics

---

# 🚀 Future Improvements

Potential upgrades:

* GraphQL Support
* WebSocket Testing
* AI API Generation
* API Mocking
* Team Collaboration
* Workspace System
* OAuth2 Authentication
* Import Postman Collections
* API Monitoring
* Request Diffing
* Rate Limiting
* Redis Caching

---

# 📜 License

MIT License

---

# 👨‍💻 Author

Built by YOU 🚀
