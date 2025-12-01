const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Import routes
const invoiceRoutes = require('./routes/invoiceRoutes');
const userRoutes = require('./routes/userRoutes');

// Initialize Express app
const app = express();

// ===========================
// MIDDLEWARE
// ===========================

// Security headers
app.use(helmet({
    contentSecurityPolicy: false, // Disable for development
}));

// Compression
app.use(compression());

// CORS
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5000',
    credentials: true
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// ===========================
// DATABASE CONNECTION
// ===========================

const connectDB = async () => {
    try {
        let mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/invoice-generator';

        // Check if we should use in-memory database
        if (process.env.USE_MEMORY_DB === 'true') {
            console.log('🔄 Starting in-memory MongoDB server...');
            const { MongoMemoryServer } = require('mongodb-memory-server');
            const mongod = await MongoMemoryServer.create();
            mongoUri = mongod.getUri();
            console.log('✅ In-memory MongoDB started');
        }

        const conn = await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

        if (process.env.USE_MEMORY_DB === 'true') {
            console.log('⚠️  Using IN-MEMORY database - data will be lost on restart');
            console.log('💡 To use persistent storage, install MongoDB or use MongoDB Atlas');
        }
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        console.log('\n⚠️  MongoDB is not running!');
        console.log('\n📋 QUICK FIX OPTIONS:\n');
        console.log('Option 1: Use In-Memory Database (Testing)');
        console.log('  - Set USE_MEMORY_DB=true in .env file');
        console.log('  - Run: npm install mongodb-memory-server --save-dev');
        console.log('  - Restart server\n');
        console.log('Option 2: Install MongoDB Locally');
        console.log('  - Download: https://www.mongodb.com/try/download/community');
        console.log('  - Install and start MongoDB service');
        console.log('  - Run: net start MongoDB\n');
        console.log('Option 3: Use MongoDB Atlas (Cloud)');
        console.log('  - Sign up: https://www.mongodb.com/cloud/atlas');
        console.log('  - Create free cluster');
        console.log('  - Update MONGODB_URI in .env file\n');

        process.exit(1);
    }
};

connectDB();

// ===========================
// API ROUTES
// ===========================

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Invoice Generator API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        database: process.env.USE_MEMORY_DB === 'true' ? 'In-Memory (Testing)' : 'MongoDB'
    });
});

// API Routes
app.use('/api/invoices', invoiceRoutes);
app.use('/api/users', userRoutes);

// Serve frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// ===========================
// ERROR HANDLING
// ===========================

// 404 Handler
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);

    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// ===========================
// SERVER START
// ===========================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🚀 Invoice Generator Server Running                ║
║                                                       ║
║   📍 Port: ${PORT}                                      ║
║   🌍 Environment: ${process.env.NODE_ENV || 'development'}                      ║
║   💾 Database: ${process.env.USE_MEMORY_DB === 'true' ? 'In-Memory (Testing)' : 'MongoDB'}           ║
║   📊 API: http://localhost:${PORT}/api                 ║
║   🌐 Frontend: http://localhost:${PORT}                ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝

${process.env.USE_MEMORY_DB === 'true' ? `
⚠️  TESTING MODE - Using In-Memory Database
   Data will be lost when server restarts
   For production, use MongoDB or MongoDB Atlas
` : ''}
✨ Ready to create invoices!
📖 Open http://localhost:${PORT} in your browser
    `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Rejection:', err);
    process.exit(1);
});

module.exports = app;
