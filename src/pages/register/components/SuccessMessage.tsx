import React from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

interface SuccessMessageProps {
  email: string;
  onResendEmail: () => void;
  onContinue: () => void;
  isResending: boolean;
  className?: string;
}

const SuccessMessage = ({ 
  email, 
  onResendEmail, 
  onContinue, 
  isResending, 
  className = '' 
}: SuccessMessageProps) => {
  return (
    <div className={`w-full max-w-md mx-auto text-center ${className}`}>
      {/* Success Icon */}
      <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
        <Icon name="CheckCircle" size={32} className="text-green-600 dark:text-green-400" />
      </div>

      {/* Success Title */}
      <h2 className="text-2xl font-semibold text-foreground mb-4">
        Account Created Successfully!
      </h2>

      {/* Success Message */}
      <div className="space-y-4 mb-8">
        <p className="text-muted-foreground">
          We've sent a verification email to:
        </p>
        <div className="p-3 bg-muted rounded-lg">
          <p className="font-medium text-foreground break-all">
            {email}
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          Please check your email and click the verification link to activate your account.
        </p>
      </div>

      {/* Email Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-3">
          <Icon name="Info" size={16} className="text-blue-600 dark:text-blue-400 mt-0.5" />
          <div className="text-left">
            <p className="text-sm text-blue-800 dark:text-blue-200 font-medium mb-1">
              Didn't receive the email?
            </p>
            <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Check your spam or junk folder</li>
              <li>• Make sure the email address is correct</li>
              <li>• Wait a few minutes for delivery</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button
          variant="outline"
          size="lg"
          fullWidth
          onClick={onResendEmail}
          loading={isResending}
          disabled={isResending}
          iconName="Mail"
          iconPosition="left"
        >
          {isResending ? 'Sending...' : 'Resend Verification Email'}
        </Button>

        <Button
          variant="default"
          size="lg"
          fullWidth
          onClick={onContinue}
          iconName="ArrowRight"
          iconPosition="right"
        >
          Continue to ChatBot Pro
        </Button>
      </div>

      {/* Additional Help */}
      <div className="mt-8 pt-6 border-t border-border">
        <p className="text-xs text-muted-foreground mb-2">
          Need help with verification?
        </p>
        <button className="text-xs text-primary hover:text-primary/80 transition-colors">
          Contact Support
        </button>
      </div>
    </div>
  );
};

export default SuccessMessage;