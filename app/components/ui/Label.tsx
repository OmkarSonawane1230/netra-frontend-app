import { forwardRef, LabelHTMLAttributes } from 'react'

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  size?: 'sm' | 'default' | 'lg'
  required?: boolean
}

const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className = '', size = 'default', required = false, children, ...props }, ref) => {
    const baseClasses = 'label'
    const sizeClasses = size !== 'default' ? `label-${size}` : ''
    
    const combinedClassName = [
      baseClasses,
      sizeClasses,
      className
    ].filter(Boolean).join(' ')

    return (
      <label
        ref={ref}
        className={combinedClassName}
        {...props}
      >
        {children}
        {required && <span className="required">*</span>}
      </label>
    )
  }
)

Label.displayName = 'Label'

export { Label }