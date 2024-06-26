# Chat APP

## Tech Used

- **Langauge**: TypeScript (Both Frontend and Backend)
- **Frontend**: React
- **Styling**: Tailwind CSS
- **Backend**: Node.js (Express & Socket.io)
- **ORM**: Prisma
- **Database**: MongoDB
- **File Storage**: Firebase Storage

## Installation

### Frontend

- Direct to frontend directory
```
cd frontend
```

- Install packages
```
npm install --force
```

- Create environment file in `frontend` directory
- Start the frontend (for developing)
```
npm start
```

### Backend

- Direct to backend directory
```
cd backend
```

- Install packages
```
npm install
```

- Create environment file in `backend` directory
- In case there is no `nodemon` installed, you can use `nodemon` to run the backend
```
npm install -g nodemon
```

- Generateting prisma client
```
npx prisma generate
```

- Start the backend server (for developing)
```
nodemon index.ts
```
