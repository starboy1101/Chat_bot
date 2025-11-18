import React from 'react';
import Icon from '../../../components/AppIcon';

const LoginHeader = () => {
  return (
    <div className="text-center mb-8">
      {/* Logo */}
      <div className="flex items-center justify-center space-x-3 mb-6">
        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
          <Icon name="MessageSquare" size={24} color="white" />
        </div>
        <h1 className="text-2xl font-semibold text-foreground">ChatBot Pro</h1>
      </div>

      {/* Welcome Text */}
      <div className="space-y-2">
        <h2 className="text-xl font-medium text-foreground">Welcome back</h2>
        <p className="text-muted-foreground">
          Sign in to your account to continue your conversations
        </p>
      </div>
    </div>
  );
};

export default LoginHeader;