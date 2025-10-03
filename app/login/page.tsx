"use client"
import { useState } from 'react';
import { EyeIcon, EyeOffIcon, UserIcon, LockIcon } from 'lucide-react';
import styles from '@/app/styles/views/LoginPage.module.css';
import { useAuth } from '../context/AuthContext';

import { useUI } from '../context/UIContext';
import { Button } from '../components/ui/Button';

// interface LoginPageProps {
//     onLogin: (credentials: { username: string; password: string }) => void;
// }

export default function LoginPage() {
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<{ username?: string; password?: string }>({});

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear errors when user starts typing
        if (errors[name as keyof typeof errors]) {
            setErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }
    };

    const validateForm = () => {
        const newErrors: { username?: string; password?: string } = {};

        if (!formData.username.trim()) {
            newErrors.username = 'Username is required';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        }
        // else if (formData.password.length < 6) {
        //     newErrors.password = 'Password must be at least 6 characters';
        // }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            // Simulate API call
            await login(formData.username, formData.password);
            console.log('Login attempt with:', { username: formData.username, password: '[HIDDEN]' });
        } catch (error) {
            console.error('Login error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.loginContainer}>
            <div className={styles.loginCard}>
                <div className={styles.loginHeader}>
                    <div className={styles.logo}>
                        <div className={styles.logoIcon}>
                            <UserIcon size={32} />
                        </div>
                        <h1 className={styles.logoText}>Netra</h1>
                    </div>
                    <p className={styles.subtitle}>Educational Management System</p>
                </div>

                <form onSubmit={handleLogin} className={styles.loginForm}>
                    <div className={styles.formGroup}>
                        <label htmlFor="username" className={styles.label}>
                            Username
                        </label>
                        <div className={styles.inputContainer}>
                            <UserIcon size={20} className={styles.inputIcon} />
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleInputChange}
                                className={`${styles.input} ${errors.username ? styles.inputError : ''}`}
                                placeholder="Enter your username"
                                data-testid="input-username"
                            />
                        </div>
                        {errors.username && (
                            <span className={styles.errorMessage} data-testid="error-username">
                                {errors.username}
                            </span>
                        )}
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="password" className={styles.label}>
                            Password
                        </label>
                        <div className={styles.inputContainer}>
                            <LockIcon size={20} className={styles.inputIcon} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                                placeholder="Enter your password"
                                data-testid="input-password"
                            />
                            <Button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className={styles.passwordToggle}
                                data-testid="button-toggle-password"
                                title={showPassword ? 'Hide password' : 'Show password'}
                                icon={showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                            />

                            {/* <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className={styles.passwordToggle}
                                data-testid="button-toggle-password"
                                title={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                            </button> */}
                        </div>
                        {errors.password && (
                            <span className={styles.errorMessage} data-testid="error-password">
                                {errors.password}
                            </span>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`${styles.loginButton} ${isLoading ? styles.loading : ''}`}
                        data-testid="button-login"
                    >
                        {isLoading ? (
                            <>
                                <div className={styles.spinner}></div>
                                Signing in...
                            </>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>

                <div className={styles.loginFooter}>
                    <a href="#" className={styles.forgotPassword} data-testid="link-forgot-password">
                        Forgot your password?
                    </a>
                    <p className={styles.helpText}>
                        Need help? Contact your system administrator
                    </p>
                </div>
            </div>
        </div>
    );
}