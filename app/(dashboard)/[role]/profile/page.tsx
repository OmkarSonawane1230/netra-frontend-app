'use client'
import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { updateUserProfile, changePassword } from '@/services/api';
import { UserIcon, Mail, Shield, Lock, Save, LogOut, Camera, ArrowLeft } from 'lucide-react';
import styles from '@/app/styles/views/ProfilePage.module.css';

interface ProfilePageProps {
  onBack?: () => void;
}

export default function ProfilePage({ onBack }: ProfilePageProps) {
  const { user, logout } = useAuth();

  // State for profile details
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  // State for password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setUsername(user.username || '');
    }
  }, [user]);

    const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setProfileError('');
        setProfileSuccess('');
        try {
            const updatedData = await updateUserProfile({ name: fullName });
            setProfileSuccess('Profile updated successfully!');
            // Update local user data if needed
            if (user) {
                // Update local state or trigger a re-fetch
                setFullName(updatedData.name || fullName);
            }
        } catch (error) {
            setProfileError(error instanceof Error ? error.message : 'An error occurred');
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');
        if (newPassword !== confirmPassword) {
            setPasswordError("New passwords do not match.");
            return;
        }
        try {
            await changePassword({ 
                current_password: currentPassword, 
                new_password: newPassword,
                confirm_password: confirmPassword
            });
            setPasswordSuccess('Password changed successfully!');
            // Clear fields
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            setPasswordError(error instanceof Error ? error.message : 'An error occurred');
        }
    };

    // Use the existing individual state handlers
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'name') {
            setFullName(value);
        } else if (name === 'email') {
            setUsername(value); // Assuming username is used for email
        } else if (name === 'currentPassword') {
            setCurrentPassword(value);
        } else if (name === 'newPassword') {
            setNewPassword(value);
        } else if (name === 'confirmPassword') {
            setConfirmPassword(value);
        }
    };

    const handleSaveProfile = () => {
        // Use the existing handleProfileSubmit logic
        const fakeEvent = { preventDefault: () => {} } as React.FormEvent<HTMLFormElement>;
        handleProfileSubmit(fakeEvent);
    };

    const handleChangePassword = () => {
        // Use the existing handlePasswordSubmit logic
        const fakeEvent = { preventDefault: () => {} } as React.FormEvent<HTMLFormElement>;
        handlePasswordSubmit(fakeEvent);
    };

    const handleLogout = () => {
        logout();
    };

  return (
    <div className={styles.profilePage}>
      <div className={styles.headerSection}>
        {onBack && (
          <button
            className={styles.backButton}
            onClick={onBack}
            data-testid="button-back"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
        )}
        <h1 className={styles.pageTitle}>Profile & Settings</h1>
      </div>

      <div className={styles.contentGrid}>
        <div className={styles.profileCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Profile Information</h2>
          </div>

          <div className={styles.profileAvatarSection}>
            <div className={styles.avatarWrapper}>
              <div className={styles.avatar}>
                <UserIcon size={48} />
              </div>
              <button className={styles.avatarButton} data-testid="button-change-photo">
                <Camera size={16} />
              </button>
            </div>
            <div className={styles.avatarInfo}>
              <h3 className={styles.userName} data-testid="text-user-name">{fullName || user?.fullName || 'User'}</h3>
              <div className={styles.roleInfo}>
                <Shield size={16} />
                <span data-testid="text-user-role">Administrator</span>
              </div>
            </div>
          </div>

          <div className={styles.formSection}>
            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.label}>
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={fullName}
                onChange={handleInputChange}
                className={styles.input}
                data-testid="input-name"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>
                <Mail size={16} />
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={username}
                onChange={handleInputChange}
                className={styles.input}
                data-testid="input-email"
              />
            </div>

            {profileError && (
              <div className={styles.errorMessage} data-testid="profile-error">
                {profileError}
              </div>
            )}
            {profileSuccess && (
              <div className={styles.successMessage} data-testid="profile-success">
                {profileSuccess}
              </div>
            )}

            <button
              className={styles.primaryButton}
              onClick={handleSaveProfile}
              data-testid="button-save-profile"
            >
              <Save size={18} />
              Save Profile
            </button>
          </div>
        </div>

        <div className={styles.settingsCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Security Settings</h2>
          </div>

          <div className={styles.formSection}>
            <div className={styles.formGroup}>
              <label htmlFor="currentPassword" className={styles.label}>
                <Lock size={16} />
                Current Password
              </label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={currentPassword}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="Enter current password"
                data-testid="input-current-password"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="newPassword" className={styles.label}>
                <Lock size={16} />
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={newPassword}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="Enter new password"
                data-testid="input-new-password"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword" className={styles.label}>
                <Lock size={16} />
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="Confirm new password"
                data-testid="input-confirm-password"
              />
            </div>

            {passwordError && (
              <div className={styles.errorMessage} data-testid="password-error">
                {passwordError}
              </div>
            )}
            {passwordSuccess && (
              <div className={styles.successMessage} data-testid="password-success">
                {passwordSuccess}
              </div>
            )}

            <button
              className={styles.primaryButton}
              onClick={handleChangePassword}
              data-testid="button-change-password"
            >
              <Lock size={18} />
              Change Password
            </button>
          </div>
        </div>

        <div className={styles.accountCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Account Actions</h2>
          </div>

          <div className={styles.actionSection}>
            <p className={styles.actionDescription}>
              Sign out of your account on this device.
            </p>
            <button
              className={styles.logoutButton}
              onClick={handleLogout}
              data-testid="button-logout"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
