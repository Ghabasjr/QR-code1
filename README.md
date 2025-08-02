# E-Commerce Mobile Application

A comprehensive cross-platform e-commerce mobile application built with **Expo React Native**, featuring modern UI, secure payments, real-time order tracking, and a complete shopping experience.

## 🎯 Project Objectives

1. **User-Friendly Interface** - Modern, intuitive design using Material Design principles
2. **Secure Payment Integration** - Stripe payment gateway for cashless transactions
3. **Real-Time Order Tracking** - Live tracking with location updates and delivery estimates
4. **Customer Dashboard** - Complete product catalog, shopping cart, and order history

## 🚀 Features

### Core Features
- ✅ **User Authentication** - Firebase Auth with email/password and social login
- ✅ **Product Catalog** - Browse products with categories, search, and filters
- ✅ **Shopping Cart** - Add/remove items, quantity management, price calculations
- ✅ **Secure Checkout** - Stripe integration for payment processing
- ✅ **Order Management** - Create, track, and manage orders
- ✅ **Real-Time Tracking** - Live order status updates and location tracking
- ✅ **User Dashboard** - Profile management, order history, wishlist
- ✅ **Push Notifications** - Order updates and promotional notifications

### Technical Features
- 📱 Cross-platform (iOS & Android) with **Expo CLI**
- 🎨 Modern UI with NativeBase components
- 🔄 State management with Redux Toolkit
- 💾 Offline support with Redux Persist
- 🔐 Secure authentication and data storage
- 🌐 Real-time data sync with Firebase Firestore
- 📊 Analytics and crash reporting ready

## 🛠 Tech Stack

### Frontend
- **Expo React Native** - Cross-platform mobile development
- **Expo CLI** - Development platform and tools
- **TypeScript** - Type-safe development
- **NativeBase** - UI component library
- **React Navigation** - Navigation solution

### State Management
- **Redux Toolkit** - State management
- **Redux Persist** - Offline state persistence
- **React Hook Form** - Form validation

### Backend & Services
- **Firebase Auth** - User authentication
- **Firebase Firestore** - NoSQL database
- **Firebase Messaging** - Push notifications
- **Stripe** - Payment processing

### Additional Libraries
- **React Native Vector Icons** - Icon library
- **React Native Animatable** - Animations
- **React Native Maps** - Location services
- **Axios** - HTTP client

## 🚀 Getting Started with Expo CLI

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Expo CLI** - Install globally: `npm install -g @expo/cli`
- **EAS CLI** - Install globally: `npm install -g eas-cli`
- **Expo Go app** on your mobile device (for testing)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ecommerce-mobile-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Install Expo CLI globally (if not already installed)**
   ```bash
   npm install -g @expo/cli
   npm install -g eas-cli
   ```

4. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   FIREBASE_API_KEY=your_firebase_api_key
   FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   FIREBASE_APP_ID=your_app_id
   STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
   ```

5. **Configure Firebase**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication, Firestore, and Messaging
   - Update `src/config/firebase.ts` with your Firebase config

6. **Configure Stripe**
   - Create a Stripe account at [Stripe Dashboard](https://dashboard.stripe.com)
   - Get your publishable key and update the configuration

### 📱 Running the App with Expo CLI

#### Development Mode
```bash
# Start the Expo development server
expo start

# Or use specific commands:
npm start          # Start Expo dev server
npm run android    # Run on Android emulator/device
npm run ios        # Run on iOS simulator/device
npm run web        # Run on web browser
```

#### Using Expo Go App
1. Install **Expo Go** from App Store (iOS) or Google Play (Android)
2. Run `expo start` in your terminal
3. Scan the QR code with your device camera (iOS) or Expo Go app (Android)

#### Using Simulators/Emulators
```bash
# For iOS Simulator (macOS only)
expo start --ios

# For Android Emulator
expo start --android

# For web browser
expo start --web
```

### 🏗️ Building for Production with EAS

#### Setup EAS Build
```bash
# Login to Expo account
eas login

# Configure EAS build
eas build:configure
```

#### Build Commands
```bash
# Build for Android (APK for testing)
eas build --platform android --profile preview

# Build for iOS (TestFlight)
eas build --platform ios --profile preview

# Build for Production
eas build --platform all --profile production
```

#### Submit to App Stores
```bash
# Submit to Google Play Store
eas submit --platform android

# Submit to App Store
eas submit --platform ios
```

## 📁 Project Structure

```
├── App.tsx                 # Main app component
├── app.json               # Expo configuration
├── eas.json               # EAS build configuration
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── babel.config.js        # Babel configuration
├── metro.config.js        # Metro bundler configuration
├── assets/                # Static assets (images, fonts)
├── src/
│   ├── components/        # Reusable UI components
│   ├── config/           # Configuration files
│   ├── navigation/       # Navigation setup
│   ├── screens/          # Screen components
│   │   ├── auth/        # Authentication screens
│   │   └── ...          # Other screens
│   ├── services/         # API services
│   ├── store/           # Redux store and slices
│   ├── theme/           # UI theme configuration
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Utility functions
└── .env.example          # Environment variables template
```

## 🔧 Expo CLI Specific Configuration

### app.json Configuration
The `app.json` file contains all Expo-specific configuration:
- App metadata (name, version, icon)
- Platform-specific settings
- Permissions and capabilities
- Build and deployment settings

### EAS Build Configuration
The `eas.json` file configures build profiles:
- **development**: For development builds
- **preview**: For testing (APK/TestFlight)
- **production**: For app store releases

### Metro Configuration
The `metro.config.js` configures the bundler for:
- Asset handling
- Module resolution
- Transformation rules

## 🚀 Deployment with Expo

### Development Deployment
```bash
# Publish to Expo's CDN (for Expo Go)
expo publish

# Create development build
eas build --profile development
```

### Production Deployment
```bash
# Build for app stores
eas build --profile production

# Submit to stores
eas submit
```

### OTA Updates
```bash
# Push over-the-air updates
expo publish

# Or using EAS Update
eas update
```

## 🧪 Testing with Expo

```bash
# Run unit tests
npm test

# Test on multiple devices with Expo Go
expo start
# Scan QR code on different devices

# Test builds
eas build --profile preview
```

## 📚 Expo CLI Commands Reference

### Essential Commands
```bash
expo --help              # Show all commands
expo start               # Start development server
expo start --tunnel      # Start with tunnel for external access
expo build:android       # Build Android APK (legacy)
expo build:ios          # Build iOS IPA (legacy)
expo publish            # Publish to Expo's CDN
expo eject              # Eject to bare React Native (not recommended)
```

### EAS Commands
```bash
eas login               # Login to Expo account
eas build              # Build with EAS Build
eas submit             # Submit to app stores
eas update             # Send OTA updates
eas branch             # Manage update branches
```

## 🔐 Security Features

- Secure authentication with Firebase
- Encrypted data storage with Expo SecureStore
- PCI-compliant payment processing with Stripe
- Input validation and sanitization
- Secure API communication
- App signing and integrity checks

## 🌟 Expo-Specific Advantages

- **Fast Development**: Hot reloading and live updates
- **Easy Testing**: Test on real devices with Expo Go
- **No Native Setup**: No need for Xcode/Android Studio for development
- **OTA Updates**: Push updates without app store approval
- **Rich Ecosystem**: Pre-built components and APIs
- **Easy Deployment**: Simplified build and submission process

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Test with Expo Go app
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- Email: support@ecommerce-app.com
- Expo Documentation: [docs.expo.dev](https://docs.expo.dev)
- Issues: [GitHub Issues](https://github.com/your-repo/issues)

## 🙏 Acknowledgments

- Expo team for the amazing development platform
- React Native community for excellent libraries
- Firebase for backend services
- Stripe for payment processing
- NativeBase for UI components

---

**Built with ❤️ using Expo React Native CLI**