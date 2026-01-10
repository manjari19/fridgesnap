#!/bin/bash
# Quick start script for FridgeSnap development

echo "🧊 Starting FridgeSnap..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "🚀 Starting development server..."
echo ""
echo "The app will open at http://localhost:3000"
echo "Press Ctrl+C to stop"
echo ""

npm start
