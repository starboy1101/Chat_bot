import React from 'react';
import { PasswordStrength } from '../types';

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
}

const PasswordStrengthIndicator = ({ password, className = '' }: PasswordStrengthIndicatorProps) => {
  const calculatePasswordStrength = (password: string): PasswordStrength => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    const score = Object.values(requirements).filter(Boolean).length;
    
    let label = '';
    let color = '';
    
    switch (score) {
      case 0:
      case 1:
        label = 'Very Weak';
        color = 'bg-red-500';
        break;
      case 2:
        label = 'Weak';
        color = 'bg-orange-500';
        break;
      case 3:
        label = 'Fair';
        color = 'bg-yellow-500';
        break;
      case 4:
        label = 'Good';
        color = 'bg-blue-500';
        break;
      case 5:
        label = 'Strong';
        color = 'bg-green-500';
        break;
      default:
        label = 'Very Weak';
        color = 'bg-red-500';
    }

    return { score, label, color, requirements };
  };

  const strength = calculatePasswordStrength(password);

  if (!password) return null;

  return (
    <div className={`mt-2 ${className}`}>
      {/* Strength Bar */}
      <div className="flex space-x-1 mb-2">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={`h-1 flex-1 rounded-full transition-colors duration-200 ${
              level <= strength.score ? strength.color : 'bg-gray-200 dark:bg-gray-700'
            }`}
          />
        ))}
      </div>

      {/* Strength Label */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground">Password Strength:</span>
        <span className={`text-sm font-medium ${
          strength.score >= 4 ? 'text-green-600 dark:text-green-400' :
          strength.score >= 3 ? 'text-blue-600 dark:text-blue-400' :
          strength.score >= 2 ? 'text-yellow-600 dark:text-yellow-400': 'text-red-600 dark:text-red-400'
        }`}>
          {strength.label}
        </span>
      </div>

      {/* Requirements List */}
      <div className="space-y-1">
        <div className={`flex items-center space-x-2 text-xs ${
          strength.requirements.length ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
        }`}>
          <div className={`w-1 h-1 rounded-full ${
            strength.requirements.length ? 'bg-green-500' : 'bg-gray-400'
          }`} />
          <span>At least 8 characters</span>
        </div>
        <div className={`flex items-center space-x-2 text-xs ${
          strength.requirements.uppercase ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
        }`}>
          <div className={`w-1 h-1 rounded-full ${
            strength.requirements.uppercase ? 'bg-green-500' : 'bg-gray-400'
          }`} />
          <span>One uppercase letter</span>
        </div>
        <div className={`flex items-center space-x-2 text-xs ${
          strength.requirements.lowercase ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
        }`}>
          <div className={`w-1 h-1 rounded-full ${
            strength.requirements.lowercase ? 'bg-green-500' : 'bg-gray-400'
          }`} />
          <span>One lowercase letter</span>
        </div>
        <div className={`flex items-center space-x-2 text-xs ${
          strength.requirements.number ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
        }`}>
          <div className={`w-1 h-1 rounded-full ${
            strength.requirements.number ? 'bg-green-500' : 'bg-gray-400'
          }`} />
          <span>One number</span>
        </div>
        <div className={`flex items-center space-x-2 text-xs ${
          strength.requirements.special ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
        }`}>
          <div className={`w-1 h-1 rounded-full ${
            strength.requirements.special ? 'bg-green-500' : 'bg-gray-400'
          }`} />
          <span>One special character</span>
        </div>
      </div>
    </div>
  );
};

export default PasswordStrengthIndicator;