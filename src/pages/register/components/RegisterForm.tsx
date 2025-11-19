import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';
import { RegisterFormData, RegisterFormErrors, ValidationResult } from '../types';

interface RegisterFormProps {
  onSubmit: (data: RegisterFormData) => Promise<{ success: boolean; message?: string }>;
  isLoading: boolean;
  className?: string;
}

const RegisterForm = ({ onSubmit, isLoading, className = '' }: RegisterFormProps) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: '',
    lastName: '',
    user_id: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
    agreeToPrivacy: false
  });

  const [errors, setErrors] = useState<RegisterFormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (name: keyof RegisterFormData, value: any): ValidationResult => {
    switch (name) {
      case 'firstName':
        if (!value.trim()) return { isValid: false, error: 'First name is required' };
        if (value.trim().length < 2) return { isValid: false, error: 'First name must be at least 2 characters' };
        return { isValid: true };

      case 'lastName':
        if (!value.trim()) return { isValid: false, error: 'Last name is required' };
        if (value.trim().length < 2) return { isValid: false, error: 'Last name must be at least 2 characters' };
        return { isValid: true };

      case 'user_id':
        if (!value.trim()) return { isValid: false, error: 'Email is required' };
        // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        // if (!emailRegex.test(value)) return { isValid: false, error: 'Please enter a valid email address' };
        return { isValid: true };

      case 'password':
        if (!value) return { isValid: false, error: 'Password is required' };
        if (value.length < 8) return { isValid: false, error: 'Password must be at least 8 characters' };
        const hasUpper = /[A-Z]/.test(value);
        const hasLower = /[a-z]/.test(value);
        const hasNumber = /\d/.test(value);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);
        if (!hasUpper || !hasLower || !hasNumber || !hasSpecial) {
          return { isValid: false, error: 'Password must contain uppercase, lowercase, number, and special character' };
        }
        return { isValid: true };

      case 'confirmPassword':
        if (!value) return { isValid: false, error: 'Please confirm your password' };
        if (value !== formData.password) return { isValid: false, error: 'Passwords do not match' };
        return { isValid: true };

      case 'agreeToTerms':
        if (!value) return { isValid: false, error: 'You must agree to the Terms of Service' };
        return { isValid: true };

      case 'agreeToPrivacy':
        if (!value) return { isValid: false, error: 'You must agree to the Privacy Policy' };
        return { isValid: true };

      default:
        return { isValid: true };
    }
  };

  const handleInputChange = (name: keyof RegisterFormData, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Real-time validation for touched fields
    if (touched[name]) {
      const validation = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: validation.error
      }));
    }

    // Special case for confirm password when password changes
    if (name === 'password' && touched.confirmPassword) {
      const confirmValidation = validateField('confirmPassword', formData.confirmPassword);
      setErrors(prev => ({
        ...prev,
        confirmPassword: confirmValidation.error
      }));
    }
  };

  const handleBlur = (name: keyof RegisterFormData) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const validation = validateField(name, formData[name]);
    setErrors(prev => ({
      ...prev,
      [name]: validation.error
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: RegisterFormErrors = {};
    let isValid = true;

    Object.keys(formData).forEach(key => {
      const validation = validateField(key as keyof RegisterFormData, formData[key as keyof RegisterFormData]);
      if (!validation.isValid) {
        newErrors[key as keyof RegisterFormErrors] = validation.error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

  try {
    const result = await onSubmit(formData);

    if (result && result.success === false) {
      if (result.message === "User already exists") {
        setErrors(prev => ({
          ...prev,
          general: "User already exists. Please log in."
        }));
        return;
      }

      setErrors(prev => ({
        ...prev,
        general: result.message || "Registration failed. Please try again."
      }));
      return;
    }
  } catch (error: any) {
    const backendMessage = error?.response?.data?.message;

    if (backendMessage === "User already exists") {
      setErrors(prev => ({
        ...prev,
        general: "User already exists. Please log in."
      }));
      return;
    }

    setErrors(prev => ({
      ...prev,
      general: backendMessage || "Registration failed. Please try again."
    }));
  }
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Error */}
        {errors.general && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center space-x-2">
              <Icon name="AlertCircle" size={16} className="text-red-600 dark:text-red-400" />
              <span className="text-sm text-red-600 dark:text-red-400">{errors.general}</span>
            </div>
          </div>
        )}

        {/* Name Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="First Name"
            type="text"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            onBlur={() => handleBlur('firstName')}
            error={errors.firstName}
            placeholder="Enter your first name"
            required
            disabled={isLoading}
          />
          <Input
            label="Last Name"
            type="text"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            onBlur={() => handleBlur('lastName')}
            error={errors.lastName}
            placeholder="Enter your last name"
            required
            disabled={isLoading}
          />
        </div>

        {/* Email Field */}
        <Input
          label="User ID"
          type="text"
          value={formData.user_id}
          onChange={(e) => handleInputChange('user_id', e.target.value)}
          onBlur={() => handleBlur('user_id')}
          error={errors.user_id}
          placeholder="Enter your email address"
          required
          disabled={isLoading}
        />

        {/* Password Field */}
        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            onBlur={() => handleBlur('password')}
            error={errors.password}
            placeholder="Create a strong password"
            required
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-8 text-muted-foreground hover:text-foreground transition-colors"
            disabled={isLoading}
          >
            <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={16} />
          </button>
          <PasswordStrengthIndicator password={formData.password} />
        </div>

        {/* Confirm Password Field */}
        <div className="relative">
          <Input
            label="Confirm Password"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            onBlur={() => handleBlur('confirmPassword')}
            error={errors.confirmPassword}
            placeholder="Confirm your password"
            required
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-8 text-muted-foreground hover:text-foreground transition-colors"
            disabled={isLoading}
          >
            <Icon name={showConfirmPassword ? 'EyeOff' : 'Eye'} size={16} />
          </button>
        </div>

        {/* Terms and Privacy Checkboxes */}
        <div className="space-y-4">
          <Checkbox
            label="I agree to the Terms of Service"
            checked={formData.agreeToTerms}
            onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
            error={errors.agreeToTerms}
            required
            disabled={isLoading}
          />
          <Checkbox
            label="I agree to the Privacy Policy"
            checked={formData.agreeToPrivacy}
            onChange={(e) => handleInputChange('agreeToPrivacy', e.target.checked)}
            error={errors.agreeToPrivacy}
            required
            disabled={isLoading}
          />
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="default"
          size="lg"
          fullWidth
          loading={isLoading}
          disabled={isLoading}
          className="mt-8"
        >
          Create Account
        </Button>

        {/* Login Link */}
        <div className="text-center pt-4">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <button
              type="button"
              onClick={handleLoginClick}
              className="text-primary hover:text-primary/80 font-medium transition-colors"
              disabled={isLoading}
            >
              Sign in here
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;