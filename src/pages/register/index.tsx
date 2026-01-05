import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Icon from '../../components/AppIcon';
import RegisterForm from './components/RegisterForm';
import SuccessMessage from './components/SuccessMessage';
import { RegisterFormData, RegisterResponse } from './types';
import RegisterSuccessModal from "./components/RegisterSuccessModal";

const Register = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;


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

  const handleRegister = async (
    formData: RegisterFormData
  ): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          user_id: formData.user_id,
          password: formData.password
        })
      });

      const data = await response.json();

      // Backend error handling
      if (!response.ok || data?.success === false) {
        return {
          success: false,
          message: data?.message || "Registration failed"
        };
      }

      setShowSuccessPopup(true); 

      // Registration success
      return {
        success: true,
        message: data?.message || "Account created successfully"
      };

    } catch (error: any) {
      return {
        success: false,
        message: "Something went wrong. Please try again."
      };
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
    navigate('/chat');
  };

  // Handle back to login
  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <>
      <Helmet>
        <title>Create Account</title>
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
            <span className="font-semibold text-xl text-foreground">SwarAI</span>
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
              <div className="bg-card border border-border rounded-2xl shadow-elevated p-8">
                {/* Registration Header */}
                <div className="text-center">
                  <h1 className="text-3xl font-bold text-foreground mb-6">
                    Create Your Account
                  </h1>
                </div>

                {/* Registration Form */}
                <RegisterForm
                  onSubmit={handleRegister}
                  isLoading={isLoading}
                />

                <RegisterSuccessModal
                  open={showSuccessPopup}
                  onClose={() => setShowSuccessPopup(false)}
                  onProceed={() => navigate("/login")}
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
              © {new Date().getFullYear()} SwarAI. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Register;