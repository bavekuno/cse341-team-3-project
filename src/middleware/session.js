import session from 'express-session';
import connectMongoDBSession from 'connect-mongodb-session';

const MongoDBStore = connectMongoDBSession(session);
const sessionLifetimeMs = 24 * 60 * 60 * 1000;

const createSessionMiddleware = () => {
    const secret = process.env.SESSION_SECRET;
    const connectionString = process.env.MONGODB_URI;
    const databaseName = process.env.MONGODB_DB_NAME || 'practice';

    if (!secret) {
        throw new Error('SESSION_SECRET is required.');
    }

    if (!connectionString) {
        throw new Error('MONGODB_URI is required for session storage.');
    }

    const store = new MongoDBStore({
        uri: connectionString,
        databaseName,
        collection: 'sessions',
        expires: sessionLifetimeMs
    });

    store.on('error', (error) => {
        console.error('Session store error:', error.message);
    });

    return session({
        name: 'kizuna.sid',
        secret,
        store,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV?.toLowerCase() === 'production',
            maxAge: sessionLifetimeMs
        }
    });
};

export default createSessionMiddleware;