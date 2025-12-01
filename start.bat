@echo off
echo ========================================
echo   Invoice Generator - Full Stack App
echo ========================================
echo.

echo Checking MongoDB...
sc query MongoDB > nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: MongoDB service not found!
    echo Please install MongoDB or use MongoDB Atlas.
    echo.
    echo Download MongoDB: https://www.mongodb.com/try/download/community
    echo Or use MongoDB Atlas: https://www.mongodb.com/cloud/atlas
    echo.
    pause
)

echo Starting server...
echo.
echo Server will be available at: http://localhost:5000
echo API will be available at: http://localhost:5000/api
echo.

npm start
