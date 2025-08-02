# 🚀 Quick Start Guide - Expo CLI

Get your E-Commerce app running in minutes with Expo CLI!

## ⚡ Super Quick Setup (5 minutes)

### 1. Prerequisites Check
```bash
# Make sure you have these installed:
node --version    # Should be v16+
npm --version     # Should be v7+
```

### 2. Install Expo CLI
```bash
# Install Expo CLI globally
npm install -g @expo/cli

# Install EAS CLI for building
npm install -g eas-cli

# Verify installation
expo --version
eas --version
```

### 3. Clone & Setup
```bash
# Clone the repository
git clone <your-repo-url>
cd ecommerce-mobile-app

# Run the setup script (Linux/macOS)
./setup.sh

# OR manually install dependencies
npm install
```

### 4. Configure Environment
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your credentials
# (You can use placeholder values for initial testing)
```

### 5. Start Development
```bash
# Start the Expo development server
expo start

# This will open a browser with QR code
# Scan with Expo Go app or press 'i'/'a' for simulators
```

## 📱 Testing Options

### Option 1: Expo Go App (Recommended for beginners)
1. Install **Expo Go** on your phone:
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. Run `expo start` in terminal
3. Scan QR code with your phone camera (iOS) or Expo Go app (Android)

### Option 2: iOS Simulator (macOS only)
```bash
expo start --ios
# Automatically opens iOS Simulator
```

### Option 3: Android Emulator
```bash
expo start --android
# Opens Android Emulator (requires Android Studio setup)
```

### Option 4: Web Browser
```bash
expo start --web
# Opens in your default browser
```

## 🔧 Essential Expo CLI Commands

```bash
# Development
expo start              # Start development server
expo start --clear      # Start with cleared cache
expo start --tunnel     # Use tunnel for external access

# Building (requires EAS account)
eas login              # Login to your Expo account
eas build:configure    # Configure build settings
eas build --platform android --profile preview  # Build APK
eas build --platform ios --profile preview      # Build for TestFlight

# Updates
expo publish           # Publish to Expo's CDN (legacy)
eas update            # Send over-the-air updates (new)

# Utilities
expo install <package> # Install Expo-compatible packages
expo doctor           # Check for common issues
expo whoami           # Check logged-in account
```

## 🎯 First Run Checklist

- [ ] Node.js v16+ installed
- [ ] Expo CLI installed globally
- [ ] Project dependencies installed (`npm install`)
- [ ] `.env` file created and configured
- [ ] Expo Go app installed on phone (optional)
- [ ] `expo start` command working
- [ ] App loads on device/simulator

## 🐛 Common Issues & Solutions

### Issue: "Command not found: expo"
**Solution:**
```bash
npm install -g @expo/cli
# Or if using yarn:
yarn global add @expo/cli
```

### Issue: Metro bundler issues
**Solution:**
```bash
expo start --clear
# Or reset metro cache:
npx expo start --clear
```

### Issue: Can't connect to development server
**Solution:**
```bash
expo start --tunnel
# This creates a tunnel accessible from anywhere
```

### Issue: iOS Simulator not opening
**Solution:**
- Install Xcode from Mac App Store
- Run: `xcode-select --install`
- Open Xcode and accept license agreements

### Issue: Android Emulator not working
**Solution:**
- Install Android Studio
- Create an Android Virtual Device (AVD)
- Start emulator before running `expo start --android`

## 🔑 Configuration Tips

### Firebase Setup (Optional for initial testing)
1. Create project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication, Firestore, Messaging
3. Copy config to `.env` file

### Stripe Setup (Optional for initial testing)
1. Create account at [Stripe Dashboard](https://dashboard.stripe.com)
2. Get test publishable key
3. Add to `.env` file

## 📱 Development Workflow

1. **Start Development:**
   ```bash
   expo start
   ```

2. **Make Changes:**
   - Edit files in `src/` directory
   - See changes instantly with hot reload

3. **Test Features:**
   - Use Expo Go for quick testing
   - Use simulators for more realistic testing

4. **Build for Testing:**
   ```bash
   eas build --profile preview
   ```

5. **Deploy Updates:**
   ```bash
   eas update
   ```

## 🎉 You're Ready!

Your Expo React Native e-commerce app is now ready for development!

### Next Steps:
1. Customize the app theme in `src/theme/`
2. Add your own products in mock data
3. Configure real Firebase and Stripe accounts
4. Add your app icons and splash screen
5. Start building new features!

### Need Help?
- [Expo Documentation](https://docs.expo.dev)
- [React Native Documentation](https://reactnative.dev)
- [NativeBase Documentation](https://docs.nativebase.io)

Happy coding! 🚀