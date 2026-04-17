import dotenv from 'dotenv';
import path from 'path';

// Load .env FIRST before mongoose or other env-dependent modules
dotenv.config({ path: path.join(__dirname, '../../.env'), override: true });

import mongoose from 'mongoose';
import { Pool } from 'pg';
import { MongoMemoryServer } from 'mongodb-memory-server';
import bcrypt from 'bcryptjs';
import { v2 as cloudinary } from 'cloudinary';
import User from '../models/User';
import Category from '../models/Category';
import Artwork from '../models/Artwork';
import Asset from '../models/Asset';




const enableInMemoryMongo = process.env.ENABLE_IN_MEMORY_MONGO === 'true';
let mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/picasso';
mongoUri = mongoUri.replace('localhost', '127.0.0.1');

export let mongoConnected = false;
export let postgresConnected = false;
export let cloudinaryConnected = false;
let mongoListenersRegistered = false;

const registerMongoListeners = () => {
    if (mongoListenersRegistered) return;
    mongoListenersRegistered = true;

    mongoose.connection.on('connected', () => {
        console.log('🔄 MongoDB connected event');
        mongoConnected = true;
    });

    mongoose.connection.on('error', (err) => {
        console.error('❌ MongoDB runtime error:', err.message);
        mongoConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
        console.warn('⚠️ MongoDB disconnected! Attempting to reconnect...');
        mongoConnected = false;
    });

    mongoose.connection.on('reconnected', () => {
        console.log('✅ MongoDB reconnected!');
        mongoConnected = true;
    });
};

// Initialize Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const connectMongoDB = async (): Promise<boolean> => {
    try {
        console.log('🔌 Attempting MongoDB connection to:', mongoUri.split('@')[1] || mongoUri);

        if (mongoose.connection.readyState === 1) {
            mongoConnected = true;
            console.log('✅ MongoDB already connected');
            return true;
        }

        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000
        });

        registerMongoListeners();
        mongoConnected = true;
        console.log('✅ MongoDB connected successfully to:', mongoUri.split('//')[1]?.split('/')[0]);
        return true;
    } catch (error) {
        const err = error as any;
        const message = String(err?.message || err);
        const shouldFallback = err?.code === 'ECONNREFUSED'
            || message.includes('ECONNREFUSED')
            || err?.name === 'MongoNetworkError'
            || message.includes('failed to connect')
            || message.includes('server selection error')
            || message.includes('Could not connect to any servers')
            || message.includes('timed out');

        if (shouldFallback && enableInMemoryMongo) {
            console.warn('⚠️ MongoDB connection failed:', message);
            console.warn('🚀 Starting In-Memory MongoDB Fallback...');
            try {
                const mongod = await MongoMemoryServer.create();
                const uri = mongod.getUri();
                console.log('✨ In-Memory MongoDB started at:', uri);
                await mongoose.connect(uri);
                registerMongoListeners();
                mongoConnected = true;
                console.log('✅ Connected to In-Memory MongoDB');
                await seedTestUser();
                return true;
            } catch (fallbackError) {
                console.error('❌ Failed to start In-Memory MongoDB:', (fallbackError as Error).message);
                mongoConnected = false;
                return false;
            }
        }

        if (shouldFallback && !enableInMemoryMongo) {
            console.error('❌ MongoDB connection refused and in-memory fallback is disabled.');
            console.error('   ▶ Start your local MongoDB server or set ENABLE_IN_MEMORY_MONGO=true for temporary fallback.');
        }

        if (message.includes('authentication failed')) {
            console.error('❌ MongoDB Authentication Failed: Check your MONGODB_URI credentials.');
        } else {
            console.error('❌ MongoDB connection failed:', message);
        }

        mongoConnected = false;
        return false;
    }
};

async function seedTestUser() {
    try {
        const userCount = await User.countDocuments();
        if (userCount === 0) {
            console.log('🌱 Seeding initial test data...');
            
            // Create test users
            const users = [
                { username: 'testartist', email: 'test@example.com', password: 'password123', role: 'artist', bio: 'Test artist account', isVerified: true },
                { username: 'noviceartist', email: 'novice@example.com', password: 'password123', role: 'artist', bio: 'Novice artist', isVerified: true },
                { username: 'masterartist', email: 'master@example.com', password: 'password123', role: 'artist', bio: 'Master artist', isVerified: true },
                { username: 'galleryadmin', email: 'admin@example.com', password: 'password123', role: 'admin', bio: 'Gallery admin', isVerified: true }
            ];

            const createdUsers = [];
            for (const userData of users) {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(userData.password, salt);
                
                const user = await User.create({
                    username: userData.username,
                    email: userData.email,
                    password: hashedPassword,
                    role: userData.role,
                    bio: userData.bio,
                    isVerified: userData.isVerified
                });
                createdUsers.push(user);
            }

            // Create categories
            const adminUser = createdUsers.find(u => u.role === 'admin');
            if (adminUser) {
                await Category.create([
                    { name: 'Painting', description: 'Digital and traditional paintings', createdBy: adminUser._id },
                    { name: 'Illustration', description: 'Character and concept illustrations', createdBy: adminUser._id },
                    { name: 'Photography', description: 'Digital and film photography', createdBy: adminUser._id },
                    { name: 'Sculpture', description: '3D and digital sculptures', createdBy: adminUser._id },
                    { name: 'Animation', description: 'Animated works and motion graphics', createdBy: adminUser._id },
                    { name: 'Graphic Design', description: 'Logos, posters, and design work', createdBy: adminUser._id }
                ]);
            }

            // Create sample artworks
            const sampleArtworks = [
                {
                    title: 'Sunset Over Mountains',
                    description: 'A beautiful landscape painting of mountains during sunset.',
                    category: 'Painting',
                    style: 'landscape',
                    techniques: ['digital painting'],
                    mediaType: 'image' as const,
                    mediaUrl: 'https://images.unsplash.com/photo-1579887534636-0b42f677fa83?w=600&h=600&fit=crop',
                    tags: ['landscape', 'sunset', 'mountains'],
                    views: 245,
                    isForSale: true,
                    price: 99.99
                }
            ];

            for (let i = 0; i < sampleArtworks.length; i++) {
                const artworkData = sampleArtworks[i];
                const randomUser = createdUsers[i % createdUsers.length];
                
                await Artwork.create({
                    ...artworkData,
                    artist: randomUser._id,
                    likes: [],
                    saves: [],
                    comments: [],
                    trendVotes: 0,
                    trendVoters: [],
                    collaborators: []
                });
            }

            console.log('✅ Test data seeded successfully');
            console.log('🔐 Test login: test@example.com / password123');
        }
    } catch (error) {
        console.error('❌ Failed to seed test data:', (error as Error).message);
    }
}

export const setMongoUri = (uri: string) => {
    mongoUri = uri.replace('localhost', '127.0.0.1');
};



const pgUser = process.env.POSTGRES_USER || 'postgres';
const pgHost = process.env.POSTGRES_HOST || 'localhost';
const pgDatabase = process.env.POSTGRES_DB || 'art_community';
const pgPassword = process.env.POSTGRES_PASSWORD || 'postgres';
const pgPort = parseInt(process.env.POSTGRES_PORT || '5432');
const enablePostgres = process.env.ENABLE_POSTGRES === 'true';

export const pgPool = new Pool({
    user: pgUser,
    host: pgHost,
    database: pgDatabase,
    password: pgPassword,
    port: pgPort,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

export const testPostgresConnection = async (): Promise<boolean> => {
    if (!enablePostgres) {
        console.log('⚪ PostgreSQL is disabled (ENABLE_POSTGRES is not true). Skipping connection.');
        postgresConnected = false;
        return false;
    }
    try {
        console.log('🔌 Attempting PostgreSQL connection to:', pgHost + ':' + pgPort);
        const client = await pgPool.connect();
        await client.query('SELECT NOW()');
        client.release();
        postgresConnected = true;
        console.log('✅ PostgreSQL connected successfully to:', pgHost + ':' + pgPort);
        return true;
    } catch (error) {
        const errMsg = (error as Error).message;
        console.warn('⚠️ PostgreSQL connection failed:', errMsg);
        
        if (errMsg.includes('ECONNREFUSED')) {
            console.warn('   💡 PostgreSQL server not running. Start it with: postgres -D "C:\\Program Files\\PostgreSQL\\16\\data"');
            console.warn('   💡 Or use: pg_ctl -D "C:\\Program Files\\PostgreSQL\\16\\data" -l logfile start');
        } else if (errMsg.includes('does not exist')) {
            console.warn('   💡 Database "' + pgDatabase + '" does not exist. Create it with:');
            console.warn('      CREATE DATABASE ' + pgDatabase + ';');
        } else if (errMsg.includes('password')) {
            console.warn('   💡 Check PostgreSQL credentials in .env file');
        }
        
        postgresConnected = false;
        return false;
    }
};

export const testCloudinaryConnection = async (): Promise<boolean> => {
    try {
        if (!process.env.CLOUDINARY_CLOUD_NAME) {
            console.warn('⚠️ Cloudinary not configured - CLOUDINARY_CLOUD_NAME missing');
            cloudinaryConnected = false;
            return false;
        }

        console.log('🔌 Attempting Cloudinary connection...');
        await cloudinary.api.ping();
        cloudinaryConnected = true;
        console.log('✅ Cloudinary connected successfully');
        return true;
    } catch (error) {
        console.warn('⚠️ Cloudinary connection failed:', (error as Error).message);
        console.warn('   💡 Check .env file for CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET');
        cloudinaryConnected = false;
        return false;
    }
};
