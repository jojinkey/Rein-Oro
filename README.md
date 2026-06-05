# Rein Oro

Luxury Gourmet Dry Fruits & Makhanas commerce application.

## Directory Structure

- `frontend/`: React + Vite single page application.
- `backend/`: Express server with SQLite database.

## Getting Started

### Prerequisites

- Node.js (v22+ recommended for built-in `node:sqlite` support)
- npm or yarn

### Installation

Install dependencies for both frontend and backend projects:

```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### Running the Application

You will need to run the backend and frontend in separate terminal windows:

#### 1. Start the Backend Server
```bash
cd backend
npm start
```
The backend server runs on `http://localhost:5000`.

#### 2. Start the Frontend Dev Server
```bash
cd frontend
npm run dev
```
The frontend dev server runs on `http://localhost:3000` (or `http://localhost:3001` if port 3000 is occupied).
