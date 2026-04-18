import dns from 'node:dns';

// Force use of Google Public DNS to resolve MongoDB Atlas hosts reliably on Windows
// This MUST happen before any database connections are attempted
dns.setServers(['8.8.8.8', '8.8.4.4']);

import path from 'path';
// Load .env ONLY in non-production environments to prevent Render/Vercel crashing on missing dev dependencies
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config({ path: path.join(__dirname, '../.env'), override: true });
}

import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import jwt from 'jsonwebtoken';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';

import { connectMongoDB, mongoConnected, testPostgresConnection, postgresConnected, testCloudinaryConnection, cloudinaryConnected } from './config/database';

import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import artworkRoutes from './routes/artworks';
import feedbackRoutes from './routes/feedback';
import chatRoutes from './routes/chats';
import competitionRoutes from './routes/competitions';
import leaderboardRoutes from './routes/leaderboards';
import searchRoutes from './routes/search';
import statsRoutes from './routes/stats';
import mediaRoutes from './routes/media';
import assetRoutes from './routes/assets';

const app = express();
const httpServer = createServer(app);



// --- SECURITY MIDDLEWARE ---
// 1. Helmet for Secure Headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "blob:", "https://media.giphy.com", "https://*.giphy.com"],
            connectSrc: ["'self'", "ws:", "wss:", "http://localhost:5007", "http://127.0.0.1:5007", "https://api.giphy.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            objectSrc: ["'none'"],
        },
    },
}));

// 2. NoSQL Injection Prevention
app.use(mongoSanitize());

// 3. Parameter Pollution Protection
app.use(hpp());

// 4. Rate Limiting
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per window
    message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', globalLimiter);

const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // Limit each IP to 20 login/register attempts per hour
    message: { success: false, message: 'Too many authentication attempts, please try again after an hour' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/auth/', authLimiter);

// 5. CORS Hardening
const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    process.env.FRONTEND_URL
].filter(Boolean) as string[];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, server-to-server)
        if (!origin) return callback(null, true);
        // Allow any Vercel preview/production deployment
        if (origin.endsWith('.vercel.app')) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use(express.json({ limit: '300mb' }));
app.use(express.urlencoded({ extended: true, limit: '300mb' }));



app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        service: 'picasso-backend',
        deploy_id: 'deploy_v2_secrets_fallback_fixed',
        timestamp: new Date().toISOString(),
        config: {
            hasJwtSecret: !!process.env.JWT_SECRET,
            hasCloudinary: !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY),
            hasMongoUri: !!process.env.MONGODB_URI,
            nodeEnv: process.env.NODE_ENV
        },
        connections: {
            mongoDB: mongoConnected, 
            postgres: postgresConnected,
            cloudinary: cloudinaryConnected 
        }
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/artworks', artworkRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/competitions', competitionRoutes);
app.use('/api/leaderboards', leaderboardRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/assets', assetRoutes);

// Catch-all 404 handler for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('🔥 Unhandled Error:', err.message);
    res.status(500).json({ success: false, message: 'Internal Server Error', error: err.message });
});



const PORT = process.env.PORT || 5007;

async function bootstrap() {
    try {
        console.log('🚀 Booting Picasso Backend v2 [Deploy: deploy_v2_secrets_fallback_fixed]...');
        console.log('Environment Diagnostics:');
        console.log(`- NODE_ENV: ${process.env.NODE_ENV}`);
        console.log(`- PORT: ${process.env.PORT || 5007}`);
        console.log(`- JWT_SECRET: ${process.env.JWT_SECRET ? 'PRESENT' : 'MISSING (USING FALLBACK)'}`);
        console.log(`- CLOUDINARY: ${process.env.CLOUDINARY_CLOUD_NAME ? 'CONFIGURED' : 'NOT CONFIGURED'}`);
        console.log(`- MONGO_URI: ${process.env.MONGODB_URI ? 'PRESENT' : 'MISSING'}`);
        
        const mongoOk = await connectMongoDB();
        if (!mongoOk) {
            console.error('❌ CRITICAL: MongoDB failure. Exiting.');
            process.exit(1);
        }

        // Optional connections - log warnings but don't crash
        try {
            await testPostgresConnection();
        } catch (e) {
            console.warn('⚠️ Non-critical: Postgres test skipped/failed');
        }

        try {
            await testCloudinaryConnection();
        } catch (e) {
            console.warn('⚠️ Non-critical: Cloudinary test skipped/failed');
        }

        httpServer.listen(PORT, () => {
            console.log(`✅ Core Server running on port ${PORT}`);
        });

    } catch (error) {
        console.error('❌ Boot failed with unexpected error:', error);
        process.exit(1);
    }
}

(async () => {
    await bootstrap();
})();
