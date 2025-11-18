import React from 'react';
import Icon from '../../../components/AppIcon';
import { WelcomeScreenProps } from '../types';

const WelcomeScreen = ({ 
  onStartChat, 
  suggestions = [], 
  className = '' 
}: WelcomeScreenProps) => {
  return (
    <div className={`flex flex-col items-center justify-center min-h-[60vh] px-4 ${className}`}>
      {/* Logo and Welcome */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Icon name="MessageSquare" size={32} color="white" />
        </div>
        <h1 className="text-3xl font-semibold text-foreground mb-2">
          Welcome to ChatBot Pro
        </h1>
        <p className="text-muted-foreground text-lg max-w-md">
          Your AI-powered assistant is ready to help. Start a conversation or choose from the suggestions below.
        </p>
      </div>
    </div>
  );
};

export default WelcomeScreen;