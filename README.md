# Chat_bot React

A modern React-based project utilizing the latest frontend technologies and tools for building responsive web applications.

## 🚀 Features

- **React 18** - React version with improved rendering and concurrent features
- **TypeScript** - Type-safe JavaScript for better development experience
- **Vite** - Lightning-fast build tool and development server
- **Redux Toolkit** - State management with simplified Redux setup
- **TailwindCSS** - Utility-first CSS framework with extensive customization
- **React Router v6** - Declarative routing for React applications
- **Data Visualization** - Integrated D3.js and Recharts for powerful data visualization
- **Form Management** - React Hook Form for efficient form handling
- **Animation** - Framer Motion for smooth UI animations
- **HTTP Client** - Axios for API requests
- **Icons** - Lucide React icon library
- **Date Utilities** - Date-fns for date manipulation
- **Class Utilities** - CVA and clsx for conditional styling
- **Testing** - Jest and React Testing Library setup

## 📋 Prerequisites

- Node.js (v14.x or higher)
- npm

## 🛠️ Installation

1. Install dependencies:
   ```bash
   npm install
   ```
   
2. Start the development server:
   ```bash
   npm start
   ```

## 📁 Project Structure

```
📂 Chat_bot
├── 📂 public/                     # Static assets and public files
│   ├── 📂 assets/                     # Project assets and resources
│   │   └── 📂 images/                     # Image assets
│   │       └── 📄 no_image.png                     # PNG image
│   ├── 📄 _redirects                     # File
│   └── 📄 manifest.json                     # JSON configuration
├── 📂 src/                     # Source code
│   ├── 📂 components/                     # React components
│   │   ├── 📂 ui/                     # UI components
│   │   │   ├── 📄 Button.tsx                     # React TypeScript component
│   │   │   ├── 📄 ChatHistoryPanel.tsx                     # React TypeScript component
│   │   │   ├── 📄 Checkbox.tsx                     # React TypeScript component
│   │   │   ├── 📄 dialog.tsx                     # React TypeScript component
│   │   │   ├── 📄 GuestAccessModal.tsx                     # React TypeScript component
│   │   │   ├── 📄 Header.tsx                     # React TypeScript component
│   │   │   ├── 📄 Input.tsx                     # React TypeScript component
│   │   │   ├── 📄 NavigationStateProvider.tsx                     # React TypeScript component
│   │   │   ├── 📄 Select.tsx                     # React TypeScript component
│   │   │   └── 📄 UserAccountMenu.tsx                     # React TypeScript component
│   │   ├── 📄 AppIcon.tsx                     # React TypeScript component
│   │   ├── 📄 AppImage.tsx                     # React TypeScript component
│   │   ├── 📄 ErrorBoundary.tsx                     # React TypeScript component
│   │   └── 📄 ScrollToTop.tsx                     # React TypeScript component
│   ├── 📂 lib/                     # Utility functions and libraries
│   │   └── 📄 utils.ts                     # TypeScript file
│   ├── 📂 pages/                     # Application pages
│   │   ├── 📂 chat-history-management/                     # Page components
│   │   │   ├── 📂 components/                     # React components
│   │   │   │   ├── 📄 BulkActionsBar.tsx                     # React TypeScript component
│   │   │   │   ├── 📄 ConversationCard.tsx                     # React TypeScript component
│   │   │   │   ├── 📄 EmptyState.tsx                     # React TypeScript component
│   │   │   │   ├── 📄 SearchAndFilters.tsx                     # React TypeScript component
│   │   │   │   └── 📄 StatsOverview.tsx                     # React TypeScript component
│   │   │   ├── 📂 types/                     # TypeScript type definitions
│   │   │   │   └── 📄 index.ts                     # TypeScript file
│   │   │   └── 📄 index.tsx                     # React TypeScript component
│   │   ├── 📂 login/                     # Page components
│   │   │   ├── 📂 components/                     # React components
│   │   │   │   ├── 📄 GuestAccess.tsx                     # React TypeScript component
│   │   │   │   ├── 📄 LoginForm.tsx                     # React TypeScript component
│   │   │   │   ├── 📄 LoginHeader.tsx                     # React TypeScript component
│   │   │   │   └── 📄 SecurityIndicator.tsx                     # React TypeScript component
│   │   │   ├── 📂 types/                     # TypeScript type definitions
│   │   │   │   └── 📄 index.ts                     # TypeScript file
│   │   │   └── 📄 index.tsx                     # React TypeScript component
│   │   ├── 📂 main-chat-interface/                     # Page components
│   │   │   ├── 📂 components/                     # React components
│   │   │   │   ├── 📄 ChatInput.tsx                     # React TypeScript component
│   │   │   │   ├── 📄 ChatMarkdown.tsx                     # React TypeScript component
│   │   │   │   ├── 📄 ConversationArea.tsx                     # React TypeScript component
│   │   │   │   ├── 📄 MessageBubble.tsx                     # React TypeScript component
│   │   │   │   └── 📄 WelcomeScreen.tsx                     # React TypeScript component
│   │   │   ├── 📂 types/                     # TypeScript type definitions
│   │   │   │   └── 📄 index.ts                     # TypeScript file
│   │   │   └── 📄 index.tsx                     # React TypeScript component
│   │   ├── 📂 register/                     # Page components
│   │   │   ├── 📂 components/                     # React components
│   │   │   │   ├── 📄 PasswordStrengthIndicator.tsx                     # React TypeScript component
│   │   │   │   ├── 📄 RegisterForm.tsx                     # React TypeScript component
│   │   │   │   ├── 📄 RegisterSuccessModal.tsx                     # React TypeScript component
│   │   │   │   └── 📄 SuccessMessage.tsx                     # React TypeScript component
│   │   │   ├── 📂 types/                     # TypeScript type definitions
│   │   │   │   └── 📄 index.ts                     # TypeScript file
│   │   │   └── 📄 index.tsx                     # React TypeScript component
│   │   ├── 📂 user-profile-settings/                     # Page components
│   │   │   ├── 📂 components/                     # React components
│   │   │   │   ├── 📄 ChatPreferencesSection.tsx                     # React TypeScript component
│   │   │   │   ├── 📄 DangerZoneSection.tsx                     # React TypeScript component
│   │   │   │   ├── 📄 NotificationSection.tsx                     # React TypeScript component
│   │   │   │   ├── 📄 ProfileSection.tsx                     # React TypeScript component
│   │   │   │   ├── 📄 SecuritySection.tsx                     # React TypeScript component
│   │   │   │   └── 📄 ThemeSection.tsx                     # React TypeScript component
│   │   │   ├── 📂 types/                     # TypeScript type definitions
│   │   │   │   └── 📄 index.ts                     # TypeScript file
│   │   │   └── 📄 index.tsx                     # React TypeScript component
│   │   └── 📄 NotFound.tsx                     # React TypeScript component
│   ├── 📂 styles/                     # CSS and styling files
│   │   ├── 📄 index.css                     # Stylesheet
│   │   └── 📄 tailwind.css                     # Stylesheet
│   ├── 📂 utils/                     # Utility functions
│   │   └── 📄 cn.ts                     # TypeScript file
│   ├── 📄 App.tsx                     # React TypeScript component
│   ├── 📄 index.tsx                     # React TypeScript component
│   └── 📄 Routes.tsx                     # React TypeScript component
├── 📄 .env                     # Environment variables
├── 📄 .gitignore                     # Git ignore rules
├── 📄 components.json                     # Component configuration
├── 📄 favicon.ico                     # Icon file
├── 📄 index.html                     # HTML page
├── 📄 package.json                     # NPM package configuration
├── 📄 postcss.config.js                     # PostCSS configuration
├── 📄 README.md                     # Project documentation
├── 📄 tailwind.config.js                     # Tailwind CSS configuration
├── 📄 tsconfig.json                     # TypeScript configuration
├── 📄 tsconfig.node.json                     # JSON configuration
└── 📄 vite.config.ts                     # TypeScript file
```

## 🧩 Adding Routes

To add new routes to the application, update the `src/Routes.tsx` file:

```tsx
import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
// Add your page imports here
import HomePage from "pages/HomePage";
import AboutPage from "pages/AboutPage";

const Routes: React.FC = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <RouterRoutes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          {/* Add more routes as needed */}
        </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
```

## 📜 Available Scripts

- `npm start` - Start the development server
- `npm run build` - Build the application for production
- `npm run serve` - Preview the production build locally

## 🎨 Styling

This project uses Tailwind CSS for styling. The configuration includes:

- Forms plugin for form styling
- Typography plugin for text styling
- Aspect ratio plugin for responsive elements
- Container queries for component-specific responsive design
- Fluid typography for responsive text
- Animation utilities

## 📱 Responsive Design

The app is built with responsive design using Tailwind CSS breakpoints.


## 📦 Deployment

Build the application for production:

```bash
npm run build
```

## 🙏 Acknowledgments

