import express from 'express';
import helmet from 'helmet';

import path from 'path';
import { fileURLToPath } from 'url';

import adminRoutes from './routes/admin.js';
import authRoutes from './routes/auth.js';
import clientsRoute from './routes/clients.js';
import dashboardRoute from './routes/dashboard.js';
import eventsRoute from './routes/events.js';
import guestsRoute from './routes/guests.js';
import settingsRoute from './routes/settings.js';
import uploadRoutes from './routes/upload.js';
import userRoutes from './routes/users.js';

import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import morgan from 'morgan';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFound } from './middlewares/notfound.js';

dotenv.config();

import swaggerUi from 'swagger-ui-express';
import { limiter } from './middlewares/rateLimiter.js';
import { swaggerSpec } from './utils/swagger.js';


const app = express();
const PORT = process.env.PORT || 5000


app.use(helmet())
app.use(express.json());


app.use(cors(
    {
        origin: ["http://localhost:5173", "https://dugsiiye.com"]
    }
))

app.use(limiter);


if (process.env.NODE_ENV == "development") {
    app.use(morgan('dev'))
}

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// routes middleware

// diiwan gelin routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/events', eventsRoute);
app.use('/api/clients', clientsRoute);
app.use('/api/guests', guestsRoute);
app.use('/api/settings', settingsRoute);
app.use('/api/dashboard', dashboardRoute);

app.get('/api/health', (req, res) => {
    res.json("Server is working... 😊");
})



// Server fronted in Production

if (process.env.NODE_ENV === "production") {

    const __dirname = path.dirname(fileURLToPath(import.meta.url));

    app.use(express.static(path.join(__dirname, '../frontend/dist')));

    // Serve the frontend app

    app.get(/.*/, (req, res) => {
        res.send(path.join(__dirname, '..', 'frontend', 'dist', 'index.html'));
    })
}



// last route-level middleware
app.use(notFound);

app.use(errorHandler);

// connect to mongodb

mongoose.connect(process.env.NODE_ENV == "development" ? process.env.MONGO_URI_DEV : process.env.MONGO_URI_PRO)
    .then(() => console.log("✅ MongoDB connected locally"))
    .catch((err) => console.log("❌ Connection err:", err))

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})