#!/bin/bash

echo "========================================"
echo "FinMate Admin Dashboard Setup"
echo "========================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "[1/5] Checking Node.js version..."
node --version
echo ""

echo "[2/5] Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "[ERROR] Failed to install dependencies"
    exit 1
fi
echo "Dependencies installed successfully!"
echo ""

echo "[3/5] Checking for .env file..."
if [ ! -f .env ]; then
    echo "[WARN] .env file not found. Creating from template..."
    cp .env.example .env
    echo ""
    echo "========================================"
    echo "IMPORTANT: Configure your .env file!"
    echo "========================================"
    echo "Please edit .env and add your Supabase credentials:"
    echo "  - REACT_APP_SUPABASE_URL"
    echo "  - REACT_APP_SUPABASE_ANON_KEY"
    echo ""
    read -p "Press Enter to open .env file..."
    ${EDITOR:-nano} .env
else
    echo ".env file found!"
fi
echo ""

echo "[4/5] Setup checklist"
echo "========================================"
echo "Please ensure you have completed:"
echo "  [?] Created .env file with Supabase credentials"
echo "  [?] Run database.sql in Supabase SQL Editor"
echo "  [?] Created admin user in Supabase Auth"
echo "  [?] Set is_admin = true for admin user"
echo "  [?] Enabled real-time replication"
echo ""
read -p "Have you completed all steps above? (y/n): " CONTINUE
if [ "$CONTINUE" != "y" ] && [ "$CONTINUE" != "Y" ]; then
    echo ""
    echo "Please complete the setup steps first!"
    echo "Refer to QUICKSTART.md for detailed instructions."
    exit 0
fi
echo ""

echo "[5/5] Starting development server..."
echo "========================================"
echo "Dashboard will open at http://localhost:3000"
echo "Press Ctrl+C to stop the server"
echo "========================================"
echo ""
npm start
