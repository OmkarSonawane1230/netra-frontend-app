'use client'
import { useState, FormEvent } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from '@/app/components/ui/Dialog';
import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';
import { Label } from '@/app/components/ui/Label';
import { Textarea } from '@/app/components/ui/Textarea';
import styles from '@/app/styles/components/FormModal.module.css';

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'tel' | 'date' | 'select' | 'textarea' | 'time';
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  defaultValue?: string | number;
  rows?: number;
}

interface FormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  fields: FormField[];
  onSubmit: (data: Record<string, any>) => void | Promise<void>;
  submitText?: string;
  cancelText?: string;
  isLoading?: boolean;
  size?: 'sm' | 'default' | 'lg' | 'xl';
}

export function FormModal({
  open,
  onOpenChange,
  title,
  description,
  fields,
  onSubmit,
  submitText = 'Submit',
  cancelText = 'Cancel',
  isLoading = false,
  size = 'default',
}: FormModalProps) {
  const initialFormData = fields.reduce((acc, field) => {
    acc[field.name] = field.defaultValue || '';
    return acc;
  }, {} as Record<string, any>);

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    fields.forEach((field) => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.label} is required`;
      }
      
      if (field.type === 'email' && formData[field.name]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData[field.name])) {
          newErrors[field.name] = 'Invalid email format';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    await onSubmit(formData);
    
    setFormData(initialFormData);
    setErrors({});
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData(initialFormData);
      setErrors({});
      onOpenChange(false);
    }
  };

  const renderField = (field: FormField) => {
    const fieldId = `field-${field.name}`;
    const hasError = !!errors[field.name];

    switch (field.type) {
      case 'select':
        return (
          <div key={field.name} className={styles.formGroup}>
            <Label htmlFor={fieldId} className={styles.label}>
              {field.label}
              {field.required && <span className={styles.required}>*</span>}
            </Label>
            <select
              id={fieldId}
              name={field.name}
              value={formData[field.name]}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              className={`${styles.select} ${hasError ? styles.error : ''}`}
              required={field.required}
              disabled={isLoading}
              data-testid={`select-${field.name}`}
            >
              <option value="">{field.placeholder || `Select ${field.label}`}</option>
              {field.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {hasError && <span className={styles.errorText}>{errors[field.name]}</span>}
          </div>
        );

  case 'textarea':
        return (
          <div key={field.name} className={styles.formGroup}>
            <Label htmlFor={fieldId} className={styles.label}>
              {field.label}
              {field.required && <span className={styles.required}>*</span>}
            </Label>
            <Textarea
              id={fieldId}
              name={field.name}
              value={formData[field.name]}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
              disabled={isLoading}
              rows={field.rows || 4}
              className={hasError ? styles.error : ''}
              data-testid={`textarea-${field.name}`}
            />
            {hasError && <span className={styles.errorText}>{errors[field.name]}</span>}
          </div>
        );

      case 'time':
        return (
          <div key={field.name} className={styles.formGroup}>
            <Label htmlFor={fieldId} className={styles.label}>
              {field.label}
              {field.required && <span className={styles.required}>*</span>}
            </Label>
            <input
              id={fieldId}
              name={field.name}
              type="time"
              value={formData[field.name]}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
              disabled={isLoading}
              className={hasError ? styles.error : ''}
              data-testid={`input-${field.name}`}
            />
            {hasError && <span className={styles.errorText}>{errors[field.name]}</span>}
          </div>
        );
      default:
        return (
          <div key={field.name} className={styles.formGroup}>
            <Label htmlFor={fieldId} className={styles.label}>
              {field.label}
              {field.required && <span className={styles.required}>*</span>}
            </Label>
            <Input
              id={fieldId}
              name={field.name}
              type={field.type}
              value={formData[field.name]}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
              disabled={isLoading}
              className={hasError ? styles.error : ''}
              data-testid={`input-${field.name}`}
            />
            {hasError && <span className={styles.errorText}>{errors[field.name]}</span>}
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent size={size} onClose={handleClose}>
        <DialogHeader>
          <DialogTitle data-testid="modal-title">{title}</DialogTitle>
          {description && (
            <DialogDescription data-testid="modal-description">{description}</DialogDescription>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <DialogBody>
            <div className={styles.formContainer}>
              {fields.map((field) => renderField(field))}
            </div>
          </DialogBody>

          <DialogFooter>
            <Button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              data-testid="button-cancel"
            >
              {cancelText}
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              data-testid="button-submit"
            >
              {isLoading ? 'Submitting...' : submitText}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
