import React from 'react';
import Icon from '../../../components/AppIcon';
import { SecurityIndicatorProps } from '../types';

const SecurityIndicator = ({ className = '' }: SecurityIndicatorProps) => {
  return (
    <div className={`flex items-center justify-center space-x-4 text-xs text-muted-foreground ${className}`}>
      <div className="flex items-center space-x-1">
        <Icon name="Shield" size={14} className="text-success" />
        <span>SSL Secured</span>
      </div>
      <div className="flex items-center space-x-1">
        <Icon name="Lock" size={14} className="text-success" />
        <span>256-bit Encryption</span>
      </div>
      <div className="flex items-center space-x-1">
        <Icon name="CheckCircle" size={14} className="text-success" />
        <span>GDPR Compliant</span>
      </div>
    </div>
  );
};

export default SecurityIndicator;