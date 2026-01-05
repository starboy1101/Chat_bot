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
  const BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
  const [loginState, setLoginState] = useState<LoginState>({
    isLoading: false,
    errors: {},
    showPassword: false
  });

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    const rememberMe = localStorage.getItem('rememberMe') === 'true';
    const guestMode = localStorage.getItem('guestMode') === 'true';

    if (authToken && rememberMe && !guestMode) {
      navigate('/chat');
    }
  }, [navigate]);

  const validateForm = (data: LoginFormData): LoginFormErrors => {
    const errors: LoginFormErrors = {};

    // if (!data.email) {
    //   errors.email = 'Email address is required';
    // } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    //   errors.email = 'Please enter a valid email address';
    // }

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
      const validationErrors = validateForm(formData);
      if (Object.keys(validationErrors).length > 0) {
        setLoginState(prev => ({
          ...prev,
          isLoading: false,
          errors: validationErrors
        }));
        return;
      }

      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          user_id: formData.user_id,      
          password: formData.password
        })
      });

      const result = await response.json();

      if (!result.success) {
        setLoginState(prev => ({
          ...prev,
          isLoading: false,
          errors: {
            general: result.message || "Invalid user ID or password"
          }
        }));
        return;
      }

      localStorage.setItem("authToken", result.token);
      localStorage.setItem(
        "user",
        JSON.stringify({
          user_id: formData.user_id,
        })
      );

      if (formData.rememberMe) {
        localStorage.setItem("rememberMe", "true");
      } else {
        localStorage.removeItem("rememberMe");
        localStorage.removeItem("authToken");
      }

      navigate("/chat");

    } catch (error) {
      setLoginState(prev => ({
        ...prev,
        isLoading: false,
        errors: {
          general: "Something went wrong. Please try again."
        }
      }));
    }
  };


  const handleForgotPassword = () => {
    // In a real app, this would navigate to forgot password page
    alert('Forgot password functionality would be implemented here. For demo, use: demo@chatbotpro.com / Demo123!');
  };

  const handleGuestAccess = () => {
    localStorage.setItem('guestMode', 'true');
    localStorage.removeItem("user");
    sessionStorage.setItem('authToken', 'guest-token');

    navigate('/chat');
  };

  return (
    <>
      <Helmet>
        <title>SwarAI</title>
        <meta name="description" content="Sign in to ChatBot Pro to access your personalized AI chat experience with secure authentication and chat history management." />
      </Helmet>

      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
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

          <SecurityIndicator className="mt-6" />

        </div>
      </div>
    </>
  );
};

export default Login;