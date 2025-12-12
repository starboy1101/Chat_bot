import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import ErrorBoundary from "./components/ErrorBoundary";
import { NavigationStateProvider } from "./components/ui/NavigationStateProvider";
import NotFound from "./pages/NotFound";
import Login from './pages/login';
import ChatHistoryManagement from './pages/chat-history-management';
import MainChatInterface from './pages/main-chat-interface';
import UserProfileSettings from './pages/user-profile-settings';
import Register from './pages/register';

const Routes: React.FC = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <NavigationStateProvider>
          <ScrollToTop />
          <RouterRoutes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/chat-history-management" element={<ChatHistoryManagement />} />
            <Route path="/main-chat-interface" element={<MainChatInterface />} />
            <Route path="/user-profile-settings" element={<UserProfileSettings />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<NotFound />} />
          </RouterRoutes>
        </NavigationStateProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
