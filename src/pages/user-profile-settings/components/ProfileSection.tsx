import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { UserProfile, FormErrors } from '../types';

interface ProfileSectionProps {
  profile: UserProfile;
  onProfileUpdate: (profile: Partial<UserProfile>) => void;
  isLoading?: boolean;
}

const ProfileSection = ({ profile, onProfileUpdate, isLoading = false }: ProfileSectionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>(profile);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setEditedProfile(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!editedProfile.name?.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!editedProfile.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editedProfile.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (editedProfile.website && !/^https?:\/\/.+/.test(editedProfile.website)) {
      newErrors.website = 'Please enter a valid URL (starting with http:// or https://)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      onProfileUpdate(editedProfile);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setErrors({});
    setIsEditing(false);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Icon name="User" size={20} className="text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Profile Information</h2>
        </div>
        {!isEditing && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            iconName="Edit"
            iconPosition="left"
            disabled={isLoading}
          >
            Edit Profile
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {/* Avatar Section */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            {profile.avatar ? (
              <Image
                src={profile.avatar}
                alt={`${profile.name}'s profile picture showing professional headshot`}
                className="w-20 h-20 rounded-full object-cover border-2 border-border"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center border-2 border-border">
                <span className="text-xl font-medium text-primary-foreground">
                  {getInitials(profile.name)}
                </span>
              </div>
            )}
            {isEditing && (
              <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors">
                <Icon name="Camera" size={16} color="white" />
              </button>
            )}
          </div>
          <div>
            <h3 className="text-lg font-medium text-foreground">{profile.name}</h3>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Joined {formatDate(profile.joinedDate)}
            </p>
          </div>
        </div>

        {/* Profile Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            type="text"
            value={isEditing ? editedProfile.name || '' : profile.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            error={errors.name}
            disabled={!isEditing}
            required
          />

          <Input
            label="Email Address"
            type="email"
            value={isEditing ? editedProfile.email || '' : profile.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            error={errors.email}
            disabled={!isEditing}
            required
          />

          <Input
            label="Location"
            type="text"
            value={isEditing ? editedProfile.location || '' : profile.location || ''}
            onChange={(e) => handleInputChange('location', e.target.value)}
            placeholder="City, Country"
            disabled={!isEditing}
          />

          <Input
            label="Website"
            type="url"
            value={isEditing ? editedProfile.website || '' : profile.website || ''}
            onChange={(e) => handleInputChange('website', e.target.value)}
            placeholder="https://example.com"
            error={errors.website}
            disabled={!isEditing}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Bio</label>
          <textarea
            value={isEditing ? editedProfile.bio || '' : profile.bio || ''}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            placeholder="Tell us about yourself..."
            disabled={!isEditing}
            rows={4}
            className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed resize-none"
          />
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-border">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleSave}
              loading={isSaving}
              iconName="Save"
              iconPosition="left"
            >
              Save Changes
            </Button>
          </div>
        )}

        {/* Account Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">127</div>
            <div className="text-xs text-muted-foreground">Total Chats</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">2.4k</div>
            <div className="text-xs text-muted-foreground">Messages</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">15</div>
            <div className="text-xs text-muted-foreground">Days Active</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">98%</div>
            <div className="text-xs text-muted-foreground">Satisfaction</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;