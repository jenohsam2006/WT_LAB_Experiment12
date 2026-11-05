# Experiment No. 12: Full Stack Web Application Development Using Node.js, React.js and MongoDB

An enterprise-grade, modern, and fully functional **Educational Course Portal** featuring end-to-end full stack architecture. The system enables students to explore accredited engineering courses, enroll in specialized tracks, and administrators to perform complete real-time CRUD (Create, Read, Update, Delete) student management operations backed by a native **MongoDB** database.

---

## 🌟 Key Highlights & Design

- **Theme & UI**: Professional blue, white, and purple aesthetic with glassmorphism, responsive data tables, animated badges, and modern typography.
- **Hero Catchphrase**: *"Learn Today, Lead Tomorrow"*
- **6 Specialization Tracks**:
  1. **Web Development** (12 Weeks • Beginner to Advanced)
  2. **Python Programming** (10 Weeks • Beginner to Intermediate)
  3. **Java Programming** (12 Weeks • Intermediate)
  4. **Data Science** (14 Weeks • Intermediate to Advanced)
  5. **Artificial Intelligence** (16 Weeks • Advanced)
  6. **Database Management System** (8 Weeks • All Levels)
- **MongoDB Node.js Driver**: Pure native driver operations (`insertOne`, `find().toArray()`, `updateOne` with `$set`, `deleteOne`) without simulated or in-memory replacements.
- **RESTful Express API**: Decoupled architecture serving validated JSON responses and department query filters.
- **React.js + Vite**: Responsive Single Page Application using React Hooks (`useState`, `useEffect`) and native `fetch()` calls.

---

## 🏗️ Architecture & Project Structure

```
Experiment12/
│
├── backend/
│   ├── server.js          # Express.js REST API with native MongoDB Driver
│   ├── package.json       # Backend dependencies (express, mongodb, cors, dotenv)
│   ├── .env               # Environment configuration (PORT=5000, MONGO_URI)
│   └── test-api.js        # Automated CLI verification script for all 4 CRUD methods
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx        # Complete React application with Course & Dashboard features
│   │   ├── App.css        # Responsive blue/white/purple styling system
│   │   └── main.jsx       # React DOM root entrypoint
│   ├── index.html         # HTML5 shell with Google Fonts & responsive viewport
│   ├── vite.config.js     # Vite configuration with backend proxy
│   └── package.json       # React, Vite, and Lucide Icons dependencies
│
└── README.md              # Complete technical documentation & experiment guide
```

---

## 🛠️ Technologies Used

| Tier | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React.js 18, Vite | Component-driven reactive UI, fast HMR |
| **Styling** | HTML5, CSS3, Modern Flex/Grid | Blue, white, and purple palette |
| **Icons** | Lucide-React | Modern stroke icons for tech stacks & actions |
| **Backend** | Node.js, Express.js | REST API, middleware, routing, CORS |
| **Database** | MongoDB & MongoDB Node.js Driver | Native client, connection pooling, ObjectId handling |
| **Config** | Dotenv | Environment variables (`MONGO_URI`, `PORT`) |

---

## 🔌 MongoDB Database Integration

- **Database Name**: `EducationalPortal`
- **Collection Name**: `Students`
- **Driver**: Native `mongodb` (v6+)
- **Environment Variable**: `MONGO_URI=mongodb://127.0.0.1:27017/EducationalPortal`

### Compulsory CRUD Operations Implemented:

1. **CREATE**:
   - `collection.insertOne(newStudent)`
   - Stores Student Name, Register Number, Department, Course, and Timestamp.
2. **READ**:
   - `collection.find({}).toArray()`
   - Retrieves all student records or filters by department using regex: `collection.find({ department: /.../i }).toArray()`.
3. **UPDATE**:
   - `collection.updateOne({ _id: new ObjectId(id) }, { $set: updateData })`
   - Updates student name, register number, department, and course.
4. **DELETE**:
   - `collection.deleteOne({ _id: new ObjectId(id) })`
   - Permanently deletes student record by MongoDB `ObjectId`.

---

## 📡 REST API Endpoints

All endpoints are hosted at `http://localhost:5000/api`:

| Method | Endpoint | Description | MongoDB Operation |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Health & MongoDB connection status check | `db.command({ ping: 1 })` |
| `GET` | `/api/students` | Retrieve all registered students | `find({}).toArray()` |
| `GET` | `/api/students?department=CSE` | Department-based search & filtering | `find({ department }).toArray()` |
| `POST` | `/api/students` | Register a new student | `insertOne()` |
| `PUT` | `/api/students/:id` | Update existing student record | `updateOne({ _id }, { $set })` |
| `DELETE`| `/api/students/:id` | Remove a student record | `deleteOne({ _id })` |

---

## 🚀 Execution Guide

### Step 1: Start MongoDB
Ensure MongoDB is running locally on port 27017 (or configure your MongoDB Atlas connection string in `backend/.env`).

```bash
# Default connection string in backend/.env:
# MONGO_URI=mongodb://127.0.0.1:27017/EducationalPortal
```

### Step 2: Backend Installation & Launch
Open a terminal in the project root:

```bash
cd backend
npm install
npm start
```
*The Express backend will start on **`http://localhost:5000`** and connect to the `EducationalPortal` database.*

### Step 3: Frontend Installation & Launch
Open a second terminal in the project root:

```bash
cd frontend
npm install
npm run dev
```
*Vite will launch the frontend on **`http://localhost:5173`**.*

### Step 4: Open in Browser
Visit **`http://localhost:5173`** to access the complete Educational Course Portal.

---

## 🧪 Verification & Automated Test Suite

A standalone test script is provided in `backend/test-api.js` to verify all MongoDB Driver operations directly:

```bash
cd backend
node test-api.js
```

Expected output:
```text
--- Testing MongoDB Node.js Driver Directly ---
1. [CREATE] insertOne() successful. Inserted ID: 6aeb66...
2. [READ] find({}).toArray() count: 3
2b. [READ] find({ department: /CSE/i }) count: 1
3. [UPDATE] updateOne() with $set modifiedCount: 1
4. [DELETE] deleteOne() deletedCount: 1
--- ALL MONGODB DRIVER CRUD OPERATIONS VERIFIED SUCCESSFULLY! ---
```

