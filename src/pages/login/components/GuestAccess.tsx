import React from 'react';

import Button from '../../../components/ui/Button';
import { GuestAccessProps } from '../types';

const GuestAccess = ({ onGuestAccess, className = '' }: GuestAccessProps) => {
  return (
    <div className={`text-center ${className}`}>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-background text-muted-foreground">Or continue as guest</span>
        </div>
      </div>

      <div className="mt-6">
        <Button
          variant="outline"
          size="lg"
          fullWidth
          onClick={onGuestAccess}
          iconName="UserCheck"
          iconPosition="left"
          className="h-12"
        >
          Continue as Guest
        </Button>
        <p className="mt-2 text-xs text-muted-foreground">
          Try ChatBot Pro without creating an account. Limited features available.
        </p>
      </div>
    </div>
  );
};

export default GuestAccess;