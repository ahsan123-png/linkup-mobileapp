# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.



### Complete Folder Stucture

```
linkup-mobile/
├── app/                              # Expo Router - SCREENS/ROUTES
│   ├── (auth)/                       # Authentication route group
│   │   ├── _layout.tsx              # Auth layout
│   │   ├── login.tsx                # Login screen
│   │   └── register.tsx             # Register screen
│   ├── (tabs)/                       # Main tabs route group
│   │   ├── _layout.tsx              # Tabs layout
│   │   ├── chat.tsx                 # Chat list screen
│   │   ├── calls.tsx                # Calls screen
│   │   └── profile.tsx              # Profile screen
│   ├── chat/                         # Individual chat routes
│   │   ├── _layout.tsx              # Chat layout
│   │   └── [id].tsx                 # Dynamic chat screen
│   ├── _layout.tsx                   # Root layout
│   └── index.tsx                     # Splash screen
├── components/                       # REUSABLE COMPONENTS
│   ├── auth/
│   │   └── AuthContext.tsx          # Authentication context
│   ├── chat/
│   │   ├── FriendRequestContext.tsx # Friend requests context
│   │   ├── ChatWindow.tsx           # Chat interface component
│   │   ├── MessageBubble.tsx        # Message component
│   │   ├── ChatInput.tsx            # Message input component
│   │   └── TypingIndicator.tsx      # Typing animation
│   ├── calls/
│   │   ├── CallManager.tsx          # Call management
│   │   ├── CallModal.tsx            # Active call modal
│   │   ├── DialingModal.tsx         # Outgoing call modal
│   │   └── IncomingCallModal.tsx    # Incoming call modal
│   ├── common/
│   │   ├── LoadingSpinner.tsx       # Loading component
│   │   ├── Modal.tsx                # Reusable modal
│   │   ├── Button.tsx               # Custom button
│   │   └── Avatar.tsx               # User avatar component
│   └── ai/
│       └── AiAssistant.tsx          # AI chat integration
├── hooks/                            # CUSTOM HOOKS
│   ├── useAuth.ts                   # Auth hook
│   ├── useWebSocket.ts              # WebSocket hook
│   ├── useCallManager.ts            # Call management hook
│   ├── useFriendRequests.ts         # Friend requests hook
│   └── useChat.ts                   # Chat functionality hook
├── utils/                            # UTILITIES & HELPERS
│   ├── constants.ts                 # App constants
│   ├── helpers.ts                   # Helper functions
│   ├── storage.ts                   # Storage utilities
│   ├── notifications.ts             # Push notifications
│   └── sounds.ts                    # Sound management
├── types/                            # TYPE DEFINITIONS
│   └── index.ts                     # All TypeScript types
├── assets/                           # STATIC ASSETS
│   ├── images/
│   │   ├── icons/
│   │   │   ├── app-icon.png
│   │   │   └── splash-icon.png
│   │   ├── avatars/
│   │   │   └── default-avatar.png
│   │   └── backgrounds/
│   │       └── chat-bg.jpg
│   ├── sounds/
│   │   ├── message.mp3
│   │   ├── notification.mp3
│   │   ├── ringtone.mp3
│   │   └── call-end.mp3
│   └── fonts/
│       └── (font files)
├── config/                           # APP CONFIGURATION
│   ├── app.config.ts
│   └── theme.ts
└── Root files:
    ├── .env                          # Environment variables
    ├── .gitignore
    ├── app.json                      # Expo config
    ├── babel.config.js               # Babel config
    ├── metro.config.js               # Metro bundler config
    ├── tailwind.config.js            # Tailwind CSS config
    ├── tsconfig.json                 # TypeScript config
    ├── package.json
    ├── package-lock.json
    └── README.md
```