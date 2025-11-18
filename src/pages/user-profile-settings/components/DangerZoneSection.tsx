import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';

interface DangerZoneSectionProps {
  onAccountDelete?: () => void;
  onDataClear?: () => void;
}

const DangerZoneSection = ({ onAccountDelete, onDataClear }: DangerZoneSectionProps) => {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showClearDataConfirmation, setShowClearDataConfirmation] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [clearDataConfirmationText, setClearDataConfirmationText] = useState('');
  const [deleteAcknowledgments, setDeleteAcknowledgments] = useState({
    dataLoss: false,
    irreversible: false,
    backupTaken: false
  });
  const [clearDataAcknowledgments, setClearDataAcknowledgments] = useState({
    chatHistory: false,
    irreversible: false
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleDeleteAccount = async () => {
    if (deleteConfirmationText !== 'DELETE MY ACCOUNT' || 
        !deleteAcknowledgments.dataLoss || 
        !deleteAcknowledgments.irreversible || 
        !deleteAcknowledgments.backupTaken) {
      return;
    }

    setIsDeleting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate API call
      console.log('Account deletion initiated');
      onAccountDelete?.();
      
      // Redirect to goodbye page or login
      window.location.href = '/login';
    } catch (error) {
      console.error('Failed to delete account:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClearData = async () => {
    if (clearDataConfirmationText !== 'CLEAR ALL DATA' || 
        !clearDataAcknowledgments.chatHistory || 
        !clearDataAcknowledgments.irreversible) {
      return;
    }

    setIsClearing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      console.log('All chat data cleared');
      onDataClear?.();
      setShowClearDataConfirmation(false);
      setClearDataConfirmationText('');
      setClearDataAcknowledgments({ chatHistory: false, irreversible: false });
    } catch (error) {
      console.error('Failed to clear data:', error);
    } finally {
      setIsClearing(false);
    }
  };

  const isDeleteButtonEnabled = 
    deleteConfirmationText === 'DELETE MY ACCOUNT' &&
    deleteAcknowledgments.dataLoss &&
    deleteAcknowledgments.irreversible &&
    deleteAcknowledgments.backupTaken;

  const isClearDataButtonEnabled = 
    clearDataConfirmationText === 'CLEAR ALL DATA' &&
    clearDataAcknowledgments.chatHistory &&
    clearDataAcknowledgments.irreversible;

  return (
    <div className="bg-card border border-destructive/20 rounded-lg p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Icon name="AlertTriangle" size={20} className="text-destructive" />
        <h2 className="text-xl font-semibold text-destructive">Danger Zone</h2>
      </div>

      <div className="space-y-6">
        {/* Clear All Data */}
        <div className="border border-border rounded-lg p-4">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium text-foreground">Clear All Chat Data</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Permanently delete all your conversations, chat history, and related data. 
                Your account and profile information will remain intact.
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowClearDataConfirmation(true)}
              iconName="Trash2"
              iconPosition="left"
            >
              Clear Data
            </Button>
          </div>

          {showClearDataConfirmation && (
            <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4 space-y-4">
              <div className="flex items-center space-x-3">
                <Icon name="AlertCircle" size={20} className="text-destructive" />
                <h4 className="font-medium text-destructive">Confirm Data Clearing</h4>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-foreground">
                  This action will permanently delete:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• All chat conversations (127 chats)</li>
                  <li>• Message history (2,456 messages)</li>
                  <li>• Conversation metadata and timestamps</li>
                  <li>• Chat preferences and settings</li>
                </ul>

                <div className="space-y-2">
                  <Checkbox
                    label="I understand that all my chat history will be permanently deleted"
                    checked={clearDataAcknowledgments.chatHistory}
                    onChange={(e) => setClearDataAcknowledgments(prev => ({
                      ...prev,
                      chatHistory: e.target.checked
                    }))}
                  />
                  <Checkbox
                    label="I understand this action cannot be undone"
                    checked={clearDataAcknowledgments.irreversible}
                    onChange={(e) => setClearDataAcknowledgments(prev => ({
                      ...prev,
                      irreversible: e.target.checked
                    }))}
                  />
                </div>

                <Input
                  label="Type 'CLEAR ALL DATA' to confirm"
                  type="text"
                  value={clearDataConfirmationText}
                  onChange={(e) => setClearDataConfirmationText(e.target.value)}
                  placeholder="CLEAR ALL DATA"
                  className="font-mono"
                />
              </div>

              <div className="flex items-center justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowClearDataConfirmation(false);
                    setClearDataConfirmationText('');
                    setClearDataAcknowledgments({ chatHistory: false, irreversible: false });
                  }}
                  disabled={isClearing}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleClearData}
                  loading={isClearing}
                  disabled={!isClearDataButtonEnabled}
                  iconName="Trash2"
                  iconPosition="left"
                >
                  Clear All Data
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Delete Account */}
        <div className="border border-destructive/30 rounded-lg p-4">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium text-destructive">Delete Account</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Permanently delete your account and all associated data. This action cannot be undone 
                and you will lose access to all your conversations, settings, and profile information.
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteConfirmation(true)}
              iconName="UserX"
              iconPosition="left"
            >
              Delete Account
            </Button>
          </div>

          {showDeleteConfirmation && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 space-y-4">
              <div className="flex items-center space-x-3">
                <Icon name="Skull" size={20} className="text-destructive" />
                <h4 className="font-medium text-destructive">Confirm Account Deletion</h4>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-foreground">
                  <strong>This will permanently delete:</strong>
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• Your user account and profile</li>
                  <li>• All chat conversations and history</li>
                  <li>• Personal settings and preferences</li>
                  <li>• Any subscription or billing information</li>
                  <li>• All associated data and backups</li>
                </ul>

                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded p-3">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    <strong>Important:</strong> Account deletion is immediate and irreversible. 
                    Make sure you have exported any important data before proceeding.
                  </p>
                </div>

                <div className="space-y-2">
                  <Checkbox
                    label="I understand that all my data will be permanently lost"
                    checked={deleteAcknowledgments.dataLoss}
                    onChange={(e) => setDeleteAcknowledgments(prev => ({
                      ...prev,
                      dataLoss: e.target.checked
                    }))}
                  />
                  <Checkbox
                    label="I understand this action is irreversible"
                    checked={deleteAcknowledgments.irreversible}
                    onChange={(e) => setDeleteAcknowledgments(prev => ({
                      ...prev,
                      irreversible: e.target.checked
                    }))}
                  />
                  <Checkbox
                    label="I have exported or backed up any important data"
                    checked={deleteAcknowledgments.backupTaken}
                    onChange={(e) => setDeleteAcknowledgments(prev => ({
                      ...prev,
                      backupTaken: e.target.checked
                    }))}
                  />
                </div>

                <Input
                  label="Type 'DELETE MY ACCOUNT' to confirm"
                  type="text"
                  value={deleteConfirmationText}
                  onChange={(e) => setDeleteConfirmationText(e.target.value)}
                  placeholder="DELETE MY ACCOUNT"
                  className="font-mono"
                />
              </div>

              <div className="flex items-center justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteConfirmation(false);
                    setDeleteConfirmationText('');
                    setDeleteAcknowledgments({ dataLoss: false, irreversible: false, backupTaken: false });
                  }}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  loading={isDeleting}
                  disabled={!isDeleteButtonEnabled}
                  iconName="UserX"
                  iconPosition="left"
                >
                  {isDeleting ? 'Deleting Account...' : 'Delete My Account'}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Warning Notice */}
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Icon name="ShieldAlert" size={16} className="text-red-600 dark:text-red-400 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-900 dark:text-red-100 mb-1">Important Notice</h4>
              <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                <li>• These actions are permanent and cannot be reversed</li>
                <li>• We cannot recover your data once it has been deleted</li>
                <li>• Consider exporting your data before taking any destructive actions</li>
                <li>• Contact support if you need assistance with data management</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DangerZoneSection;