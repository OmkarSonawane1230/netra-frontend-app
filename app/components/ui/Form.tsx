import { forwardRef, HTMLAttributes, FormHTMLAttributes, LabelHTMLAttributes } from 'react'

interface FormProps extends FormHTMLAttributes<HTMLFormElement> {
  layout?: 'vertical' | 'horizontal' | 'inline'
  loading?: boolean
}

const Form = forwardRef<HTMLFormElement, FormProps>(
  ({ className = '', layout = 'vertical', loading = false, ...props }, ref) => {
    const baseClasses = 'form'
    const layoutClasses = layout !== 'vertical' ? `form-${layout}` : ''
    const loadingClasses = loading ? 'form-loading' : ''
    
    const combinedClassName = [
      baseClasses,
      layoutClasses,
      loadingClasses,
      className
    ].filter(Boolean).join(' ')

    return (
      <form
        ref={ref}
        className={combinedClassName}
        {...props}
      />
    )
  }
)

Form.displayName = 'Form'

const FormItem = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className = '', ...props }, ref) => (
    <div
      ref={ref}
      className={`form-item ${className}`}
      {...props}
    />
  )
)

FormItem.displayName = 'FormItem'

const FormLabel = forwardRef<HTMLLabelElement, LabelHTMLAttributes<HTMLLabelElement> & { invalid?: boolean; required?: boolean }>(
  ({ className = '', invalid = false, required = false, children, ...props }, ref) => {
    const baseClasses = 'form-label'
    const invalidAttr = invalid ? { 'data-invalid': '' } : {}
    
    return (
      <label
        ref={ref}
        className={`${baseClasses} ${className}`}
        {...invalidAttr}
        {...props}
      >
        {children}
        {required && <span className="required">*</span>}
      </label>
    )
  }
)

FormLabel.displayName = 'FormLabel'

const FormControl = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className = '', ...props }, ref) => (
    <div
      ref={ref}
      className={`form-control ${className}`}
      {...props}
    />
  )
)

FormControl.displayName = 'FormControl'

const FormDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className = '', ...props }, ref) => (
    <p
      ref={ref}
      className={`form-description ${className}`}
      {...props}
    />
  )
)

FormDescription.displayName = 'FormDescription'

interface FormMessageProps extends HTMLAttributes<HTMLParagraphElement> {
  state?: 'error' | 'success' | 'default'
}

const FormMessage = forwardRef<HTMLParagraphElement, FormMessageProps>(
  ({ className = '', state = 'default', ...props }, ref) => {
    const stateAttr = state !== 'default' ? { 'data-state': state } : {}
    
    return (
      <p
        ref={ref}
        className={`form-message ${className}`}
        {...stateAttr}
        {...props}
      />
    )
  }
)

FormMessage.displayName = 'FormMessage'

const FormActions = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement> & { align?: 'start' | 'center' | 'end' | 'between' }>(
  ({ className = '', align = 'end', ...props }, ref) => {
    const baseClasses = 'form-actions'
    const alignClasses = align !== 'end' ? (align === 'center' ? 'centered' : align === 'start' ? 'start' : 'between') : ''
    
    const combinedClassName = [
      baseClasses,
      alignClasses,
      className
    ].filter(Boolean).join(' ')

    return (
      <div
        ref={ref}
        className={combinedClassName}
        {...props}
      />
    )
  }
)

FormActions.displayName = 'FormActions'

export { 
  Form, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormDescription, 
  FormMessage, 
  FormActions 
}