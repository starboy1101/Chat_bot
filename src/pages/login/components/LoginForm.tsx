import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';
import { LoginFormData, LoginFormErrors } from '../types';

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => Promise<void>;
  onForgotPassword: () => void;
  isLoading: boolean;
  errors: LoginFormErrors;
}

const LoginForm = ({ onSubmit, onForgotPassword, isLoading, errors }: LoginFormProps) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginFormData>({
    user_id: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (field: keyof LoginFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = field === 'rememberMe' ? e.target.checked : e.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="User ID"
        type="text"
        placeholder="Enter your user ID"
        value={formData.user_id}
        onChange={handleInputChange('user_id')}
        error={errors.user_id}
        required
        disabled={isLoading}
        className="w-full rounded-xl"
      />

      {/* Password Input */}
      <div className="relative">
        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleInputChange('password')}
          error={errors.password}
          required
          disabled={isLoading}
          className="w-full pr-12 rounded-xl"
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute right-3 top-9 text-muted-foreground hover:text-foreground transition-colors"
          disabled={isLoading}
        >
          <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={18} />
        </button>
      </div>

      {/* Remember Me Checkbox */}
      <div className="flex items-center justify-between">
        <Checkbox
          label="Remember me"
          checked={formData.rememberMe}
          onChange={handleInputChange('rememberMe')}
          disabled={isLoading}
        />
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-sm text-primary hover:text-primary/80 transition-colors"
          disabled={isLoading}
        >
          Forgot password?
        </button>
      </div>

      {/* General Error Message */}
      {errors.general && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <div className="flex items-center space-x-2">
            <Icon name="AlertCircle" size={16} className="text-destructive" />
            <span className="text-sm text-destructive">{errors.general}</span>
          </div>
        </div>
      )}

      {/* Sign In Button */}
      <Button
        type="submit"
        variant="default"
        size="lg"
        fullWidth
        loading={isLoading}
        disabled={isLoading || !formData.user_id || !formData.password}
        className="h-12 rounded-xl"
      >
        {isLoading ? 'Signing In...' : 'Sign In'}
      </Button>

      {/* Create Account Link */}
      <div className="text-center">
        <span className="text-sm text-muted-foreground">Don't have an account? </span>
        <button
          type="button"
          onClick={() => navigate('/register')}
          className="text-sm text-primary hover:text-primary/80 transition-colors font-medium"
          disabled={isLoading}
        >
          Create Account
        </button>
      </div>
    </form>
  );
};

export default LoginForm;