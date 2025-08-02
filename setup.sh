#!/bin/bash

echo "🚀 Setting up E-Commerce Expo React Native App..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16 or higher."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

echo "✅ Node.js and npm are installed."

# Install Expo CLI globally if not already installed
if ! command -v expo &> /dev/null; then
    echo "📦 Installing Expo CLI globally..."
    npm install -g @expo/cli
else
    echo "✅ Expo CLI is already installed."
fi

# Install EAS CLI globally if not already installed
if ! command -v eas &> /dev/null; then
    echo "📦 Installing EAS CLI globally..."
    npm install -g eas-cli
else
    echo "✅ EAS CLI is already installed."
fi

# Install project dependencies
echo "📦 Installing project dependencies..."
npm install

# Create .env file from template if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your Firebase and Stripe credentials."
else
    echo "✅ .env file already exists."
fi

# Create assets directory if it doesn't exist
if [ ! -d "assets" ]; then
    echo "📁 Creating assets directory..."
    mkdir -p assets
    echo "📝 Please add your app icons and splash screen to the assets/ directory."
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your Firebase and Stripe credentials"
echo "2. Add your app icons to assets/ directory"
echo "3. Run 'expo start' to start development"
echo ""
echo "Commands to get started:"
echo "  expo start          # Start development server"
echo "  expo start --ios     # Run on iOS simulator"
echo "  expo start --android # Run on Android emulator"
echo "  expo start --web     # Run on web browser"
echo ""
echo "Happy coding! 🚀"