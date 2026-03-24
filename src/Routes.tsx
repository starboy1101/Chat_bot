import React from "react";
import { HashRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import ErrorBoundary from "./components/ErrorBoundary";
import { NavigationStateProvider } from "./components/ui/NavigationStateProvider";
import NotFound from "./pages/NotFound";
import Login from "./pages/login";
import ChatHistoryManagement from "./pages/chat-history-management";
import MainChatInterface from "./pages/main-chat-interface";
import UserProfileSettings from "./pages/user-profile-settings";
import Register from "./pages/register";
import DSPCalculator from "./pages/DSP-Lab/DSPCalculator";

const Routes: React.FC = () => {
  return (
    <HashRouter>
      <ErrorBoundary>
        <NavigationStateProvider>
          <ScrollToTop />
          <RouterRoutes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/history" element={<ChatHistoryManagement />} />
            <Route path="/chat" element={<MainChatInterface />} />
            <Route path="/profile" element={<UserProfileSettings />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dsp-lab" element={<DSPCalculator />} />
            <Route path="*" element={<NotFound />} />
          </RouterRoutes>
        </NavigationStateProvider>
      </ErrorBoundary>
    </HashRouter>
  );
};

export default Routes;
