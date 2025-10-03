'use client'
import { useState } from 'react';
import { UserIcon, Mail, Shield, Lock, Save, LogOut, Camera, ArrowLeft } from 'lucide-react';
import styles from '@/app/styles/views/ProfilePage.module.css';

interface ProfilePageProps {
  onBack?: () => void;
}

export default function ProfilePage({ onBack }: ProfilePageProps) {
  const [formData, setFormData] = useState({
    name: 'Admin User',
    email: 'admin@college.edu',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveProfile = () => {
    console.log('Saving profile:', formData);
    // API call will be implemented by user
  };

  const handleChangePassword = () => {
    console.log('Changing password');
    // API call will be implemented by user
  };

  const handleLogout = () => {
    console.log('Logging out');
    // Logout logic will be implemented by user
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
              <h3 className={styles.userName} data-testid="text-user-name">{formData.name}</h3>
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
                value={formData.name}
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
                value={formData.email}
                onChange={handleInputChange}
                className={styles.input}
                data-testid="input-email"
              />
            </div>

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
                value={formData.currentPassword}
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
                value={formData.newPassword}
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
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="Confirm new password"
                data-testid="input-confirm-password"
              />
            </div>

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
