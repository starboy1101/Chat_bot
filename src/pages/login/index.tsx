import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import LoginHeader from './components/LoginHeader';
import LoginForm from './components/LoginForm';
import GuestAccess from './components/GuestAccess';
import SecurityIndicator from './components/SecurityIndicator';
import { LoginFormData, LoginFormErrors, LoginState, AuthUser } from './types';

const Login = () => {
  const navigate = useNavigate();
  const [loginState, setLoginState] = useState<LoginState>({
    isLoading: false,
    errors: {},
    showPassword: false
  });

  const mockCredentials = {
    email: 'demo@chatbotpro.com',
    password: 'Demo123!'
  };

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      navigate('/main-chat-interface');
    }
  }, [navigate]);

  const validateForm = (data: LoginFormData): LoginFormErrors => {
    const errors: LoginFormErrors = {};

    if (!data.email) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!data.password) {
      errors.password = 'Password is required';
    } else if (data.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }

    return errors;
  };

  const handleLogin = async (formData: LoginFormData): Promise<void> => {
    setLoginState(prev => ({ ...prev, isLoading: true, errors: {} }));

    try {
      // Validate form
      const validationErrors = validateForm(formData);
      if (Object.keys(validationErrors).length > 0) {
        setLoginState(prev => ({
          ...prev,
          isLoading: false,
          errors: validationErrors
        }));
        return;
      }

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Check credentials against mock data
      if (formData.email === mockCredentials.email && formData.password === mockCredentials.password) {
        // Mock successful authentication
        const mockUser: AuthUser = {
          id: '1',
          name: 'Demo User',
          email: formData.email,
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
        };

        // Store authentication data
        localStorage.setItem('authToken', 'mock-jwt-token-12345');
        localStorage.setItem('user', JSON.stringify(mockUser));
        
        if (formData.rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        }

        // Navigate to main chat interface
        navigate('/main-chat-interface');
      } else {
        // Invalid credentials
        setLoginState(prev => ({
          ...prev,
          isLoading: false,
          errors: {
            general: `Invalid credentials. Use: ${mockCredentials.email} / ${mockCredentials.password}`
          }
        }));
      }
    } catch (error) {
      setLoginState(prev => ({
        ...prev,
        isLoading: false,
        errors: {
          general: 'An unexpected error occurred. Please try again.'
        }
      }));
    }
  };

  const handleForgotPassword = () => {
    // In a real app, this would navigate to forgot password page
    alert('Forgot password functionality would be implemented here. For demo, use: demo@chatbotpro.com / Demo123!');
  };

  const handleGuestAccess = () => {
    // Set guest mode flag
    localStorage.setItem('guestMode', 'true');
    localStorage.setItem('authToken', 'guest-token');
    
    // Navigate to main chat interface
    navigate('/main-chat-interface');
  };

  return (
    <>
      <Helmet>
        <title>Sign In - ChatBot Pro</title>
        <meta name="description" content="Sign in to ChatBot Pro to access your personalized AI chat experience with secure authentication and chat history management." />
      </Helmet>

      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Main Login Card */}
          <div className="bg-card border border-border rounded-2xl shadow-elevated p-8">
            <LoginHeader />
            
            <LoginForm
              onSubmit={handleLogin}
              onForgotPassword={handleForgotPassword}
              isLoading={loginState.isLoading}
              errors={loginState.errors}
            />
            
            <div className="mt-8">
              <GuestAccess onGuestAccess={handleGuestAccess} />
            </div>
          </div>

          {/* Security Indicators */}
          <SecurityIndicator className="mt-6" />

        </div>
      </div>
    </>
  );
};

export default Login;