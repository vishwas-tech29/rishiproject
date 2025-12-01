# 🚀 Quick Start Guide

## Prerequisites Check

### 1. Node.js ✅
Already installed (you just ran npm install successfully!)

### 2. MongoDB
You need MongoDB running. Choose one option:

#### Option A: Install MongoDB Locally (Recommended for Development)

**Download & Install:**
1. Go to: https://www.mongodb.com/try/download/community
2. Download MongoDB Community Server for Windows
3. Install with default settings
4. MongoDB will run as a Windows service automatically

**Verify Installation:**
```powershell
# Check if MongoDB service is running
sc query MongoDB

# Or start MongoDB service
net start MongoDB
```

#### Option B: Use MongoDB Atlas (Cloud - Free Tier Available)

1. Go to: https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create a free cluster (M0)
4. Get connection string
5. Update `.env` file:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/invoice-generator?retryWrites=true&w=majority
   ```

## 🎯 Start the Application

### Method 1: Using Start Script (Easiest)
```powershell
# Double-click start.bat
# OR run in terminal:
.\start.bat
```

### Method 2: Using npm
```powershell
# Development mode (auto-reload on changes)
npm run dev

# Production mode
npm start
```

### Method 3: Using Node directly
```powershell
node server/server.js
```

## 📱 Access the Application

Once started, you'll see:
```
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🚀 Invoice Generator Server Running                ║
║                                                       ║
║   📍 Port: 5000                                       ║
║   🌍 Environment: development                         ║
║   📊 API: http://localhost:5000/api                   ║
║   🌐 Frontend: http://localhost:5000                  ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
```

**Open your browser:** http://localhost:5000

## 🎓 First Steps

### 1. Register an Account
- Click "Login to Save Online"
- Switch to "Register" tab
- Create your account

### 2. Create Your First Invoice
- Fill in company details
- Add client information
- Customize line items
- Set pricing
- Click "Save to Cloud" 💾

### 3. Manage Invoices
- Click "My Invoices" 📂
- View all saved invoices
- Click to load and edit
- Update status (draft → sent → paid)

## 🔧 Troubleshooting

### MongoDB Connection Error
```
❌ MongoDB Connection Error: connect ECONNREFUSED
```
**Solution:** 
- Install MongoDB locally OR
- Use MongoDB Atlas cloud database
- Update `.env` with correct connection string

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:**
```powershell
# Change port in .env file
PORT=3000

# Or kill process using port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Dependencies Error
```powershell
# Reinstall dependencies
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

## 📚 Next Steps

1. **Customize Company Details** - Update default company info
2. **Create Invoice Templates** - Save common invoice formats
3. **Export PDFs** - Print invoices to PDF
4. **Track Payments** - Update invoice status
5. **View Analytics** - Check invoice statistics

## 🆘 Need Help?

- Check `README_FULLSTACK.md` for detailed documentation
- API documentation in README_FULLSTACK.md
- MongoDB setup guide above

## 🎉 You're All Set!

Your full-stack invoice generator is ready to use!

**Features Available:**
- ✅ Cloud database storage
- ✅ User authentication
- ✅ Multiple invoice management
- ✅ Search and filter
- ✅ Print/PDF export
- ✅ Responsive design
- ✅ Offline mode

Happy invoicing! 🚀
