import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Icon from '../../components/AppIcon';
import RegisterForm from './components/RegisterForm';
import SuccessMessage from './components/SuccessMessage';
import { RegisterFormData, RegisterResponse } from './types';

const Register = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = savedTheme ? savedTheme === 'dark' : systemPrefersDark;
    
    setIsDarkMode(isDark);
    
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Mock registration API call
  const handleRegister = async (formData: RegisterFormData): Promise<void> => {
    setIsLoading(true);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock validation - check for existing email
      const existingEmails = ['admin@example.com', 'test@example.com', 'user@example.com'];
      
      if (existingEmails.includes(formData.email.toLowerCase())) {
        throw new Error('An account with this email already exists');
      }

      // Mock successful registration
      const mockResponse: RegisterResponse = {
        success: true,
        message: 'Account created successfully',
        user: {
          id: 'user_' + Date.now(),
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName
        },
        requiresVerification: true
      };

      if (mockResponse.success) {
        setRegisteredEmail(formData.email);
        setRegistrationSuccess(true);
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Mock resend verification email
  const handleResendEmail = async (): Promise<void> => {
    setIsResending(true);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock success - in real app, this would call the resend API
      console.log('Verification email resent to:', registeredEmail);
    } catch (error) {
      console.error('Failed to resend email:', error);
    } finally {
      setIsResending(false);
    }
  };

  // Handle continue after registration
  const handleContinue = () => {
    // In a real app, you might redirect to a verification pending page
    // or directly to the main interface if verification is not required
    navigate('/main-chat-interface');
  };

  // Handle back to login
  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <>
      <Helmet>
        <title>Create Account - ChatBot Pro</title>
        <meta name="description" content="Create your ChatBot Pro account and start having intelligent conversations with our AI assistant." />
        <meta name="keywords" content="register, sign up, create account, chatbot, AI assistant" />
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Icon name="MessageSquare" size={18} color="white" />
            </div>
            <span className="font-semibold text-xl text-foreground">ChatBot Pro</span>
          </div>
          
          {!registrationSuccess && (
            <button
              onClick={handleBackToLogin}
              className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Icon name="ArrowLeft" size={16} />
              <span className="text-sm">Back to Login</span>
            </button>
          )}
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            {!registrationSuccess ? (
              <div className="space-y-8">
                {/* Registration Header */}
                <div className="text-center">
                  <h1 className="text-3xl font-bold text-foreground mb-2">
                    Create Your Account
                  </h1>
                  <p className="text-muted-foreground">
                    Join ChatBot Pro and start having intelligent conversations
                  </p>
                </div>

                {/* Registration Form */}
                <RegisterForm
                  onSubmit={handleRegister}
                  isLoading={isLoading}
                />
              </div>
            ) : (
              <SuccessMessage
                email={registeredEmail}
                onResendEmail={handleResendEmail}
                onContinue={handleContinue}
                isResending={isResending}
              />
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="p-6 border-t border-border">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground">
              <button className="hover:text-foreground transition-colors">
                Terms of Service
              </button>
              <button className="hover:text-foreground transition-colors">
                Privacy Policy
              </button>
              <button className="hover:text-foreground transition-colors">
                Help Center
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} ChatBot Pro. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Register;