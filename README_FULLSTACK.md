# 🚀 Full-Stack Invoice Generator

A **production-ready** full-stack invoice generator with Node.js backend, MongoDB database, and RESTful API.

## 📋 Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)

## ✨ Features

### Backend Features
- ✅ **RESTful API** - Complete CRUD operations for invoices
- ✅ **User Authentication** - JWT-based auth with bcrypt password hashing
- ✅ **MongoDB Database** - Persistent data storage
- ✅ **Data Validation** - Mongoose schema validation
- ✅ **Security** - Helmet, CORS, compression
- ✅ **Error Handling** - Comprehensive error management
- ✅ **Search & Filter** - Advanced invoice search
- ✅ **Statistics** - Invoice analytics and reporting

### Frontend Features
- ✅ **Cloud Sync** - Save/load invoices from database
- ✅ **Offline Mode** - Works without authentication
- ✅ **Real-time Preview** - Live invoice updates
- ✅ **Print/PDF Export** - Professional output
- ✅ **Responsive Design** - Works on all devices
- ✅ **User Management** - Login/register functionality

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing

### Frontend
- **HTML5** - Structure
- **CSS3** - Styling
- **Vanilla JavaScript** - No framework dependencies
- **Fetch API** - HTTP requests

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas cloud)
- npm or yarn

### Step 1: Clone and Install Dependencies

```powershell
# Navigate to project directory
cd c:\Users\VISHWAS\rishiproject

# Install dependencies
npm install
```

### Step 2: Setup Environment Variables

```powershell
# Copy example env file
Copy-Item .env.example -Destination .env

# Edit .env file with your configuration
notepad .env
```

Required environment variables:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/invoice-generator
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5000
```

### Step 3: Setup MongoDB

**Option A: Local MongoDB**
```powershell
# Install MongoDB Community Edition
# Download from: https://www.mongodb.com/try/download/community

# Start MongoDB service
net start MongoDB
```

**Option B: MongoDB Atlas (Cloud)**
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

### Step 4: Start the Server

```powershell
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Server will start at: **http://localhost:5000**

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment | development |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/invoice-generator |
| `JWT_SECRET` | Secret key for JWT | (required) |
| `JWT_EXPIRE` | Token expiration | 7d |
| `CLIENT_URL` | Frontend URL for CORS | http://localhost:3000 |

## 🎯 Usage

### 1. Access the Application
Open your browser and navigate to: **http://localhost:5000**

### 2. Register/Login
- Click "Login to Save Online" button
- Register a new account or login
- Your invoices will now sync to the cloud

### 3. Create Invoice
- Fill in company details
- Add client information
- Add line items
- Set pricing
- Click "Save to Cloud" to save to database

### 4. Manage Invoices
- Click "My Invoices" to view all saved invoices
- Click any invoice to load and edit
- Update and save changes

### 5. Print/Export
- Click "Print / Save PDF" to generate PDF
- Use browser's print dialog to save as PDF

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication
Include JWT token in headers:
```
Authorization: Bearer <your-token>
```

### Endpoints

#### User Routes

**Register User**
```http
POST /api/users/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "company": {
    "name": "My Company"
  }
}
```

**Login**
```http
POST /api/users/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Get Profile**
```http
GET /api/users/me
Authorization: Bearer <token>
```

#### Invoice Routes

**Get All Invoices**
```http
GET /api/invoices?page=1&limit=10&status=draft
Authorization: Bearer <token>
```

**Get Single Invoice**
```http
GET /api/invoices/:id
Authorization: Bearer <token>
```

**Create Invoice**
```http
POST /api/invoices
Authorization: Bearer <token>
Content-Type: application/json

{
  "company": {
    "name": "Company Name",
    "tagline": "Tagline",
    "logo": "CN"
  },
  "invoice": {
    "number": "INV001",
    "date": "2025-12-01",
    "validUntil": "2025-12-31"
  },
  "client": {
    "name": "Client Name",
    "company": "Client Company",
    "address": "Address",
    "contact": "1234567890"
  },
  "project": {
    "name": "Project Name",
    "delivery": "2 weeks",
    "maintenance": "6 months"
  },
  "items": [
    { "description": "Item 1" },
    { "description": "Item 2" }
  ],
  "pricing": {
    "packageCost": 10000,
    "discountName": "Discount",
    "discountAmount": 1000
  }
}
```

**Update Invoice**
```http
PUT /api/invoices/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  // Same structure as create
}
```

**Delete Invoice**
```http
DELETE /api/invoices/:id
Authorization: Bearer <token>
```

**Update Status**
```http
PATCH /api/invoices/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "paid"
}
```

**Get Statistics**
```http
GET /api/invoices/stats
Authorization: Bearer <token>
```

**Search Invoices**
```http
GET /api/invoices/search/:query
Authorization: Bearer <token>
```

## 📁 Project Structure

```
rishiproject/
├── server/
│   ├── controllers/
│   │   ├── invoiceController.js    # Invoice business logic
│   │   └── userController.js       # User business logic
│   ├── models/
│   │   ├── Invoice.js              # Invoice schema
│   │   └── User.js                 # User schema
│   ├── routes/
│   │   ├── invoiceRoutes.js        # Invoice routes
│   │   └── userRoutes.js           # User routes
│   ├── middleware/
│   │   └── auth.js                 # Authentication middleware
│   └── server.js                   # Main server file
├── public/
│   ├── index.html                  # Frontend HTML
│   ├── styles.css                  # Frontend CSS
│   └── script.js                   # Frontend JavaScript
├── .env                            # Environment variables
├── .env.example                    # Environment template
├── package.json                    # Dependencies
└── README.md                       # Documentation
```

## 🔒 Security Features

- **Password Hashing** - bcrypt with salt rounds
- **JWT Authentication** - Secure token-based auth
- **Input Validation** - Mongoose schema validation
- **CORS Protection** - Configured CORS policy
- **Helmet** - Security headers
- **Rate Limiting** - (Can be added)
- **SQL Injection Protection** - MongoDB NoSQL

## 🚀 Deployment

### Deploy to Heroku

```powershell
# Install Heroku CLI
# Login to Heroku
heroku login

# Create app
heroku create invoice-generator-app

# Set environment variables
heroku config:set MONGODB_URI=your-mongodb-uri
heroku config:set JWT_SECRET=your-secret
heroku config:set NODE_ENV=production

# Deploy
git push heroku main
```

### Deploy to Railway/Render

1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically

## 🧪 Testing

```powershell
# Test API health
curl http://localhost:5000/api/health

# Test with Postman
# Import the API endpoints and test
```

## 📝 License

MIT License - Free to use for personal and commercial projects

## 🤝 Contributing

Contributions welcome! Please follow these steps:
1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create pull request

## 📧 Support

For issues and questions:
- Create an issue on GitHub
- Email: support@example.com

## 🎉 Acknowledgments

- MongoDB for database
- Express.js for backend framework
- JWT for authentication
- All open-source contributors

---

**Built with ❤️ for professional invoice management**
