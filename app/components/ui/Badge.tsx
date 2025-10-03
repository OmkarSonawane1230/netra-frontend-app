import { forwardRef, HTMLAttributes } from 'react'

interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'success' | 'warning' | 'info' | 'error'
  size?: 'sm' | 'default' | 'lg'
  dot?: boolean
  dismissible?: boolean
  onDismiss?: () => void
}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ 
    className = '', 
    variant = 'default', 
    size = 'default', 
    dot = false,
    dismissible = false,
    onDismiss,
    children,
    ...props 
  }, ref) => {
    const baseClasses = 'badge'
    const variantClasses = `badge-${variant}`
    const sizeClasses = size !== 'default' ? `badge-${size}` : ''
    const dotClasses = dot ? 'badge-dot' : ''
    const dismissibleClasses = dismissible ? 'badge-dismissible' : ''
    
    const combinedClassName = [
      baseClasses,
      variantClasses,
      sizeClasses,
      dotClasses,
      dismissibleClasses,
      className
    ].filter(Boolean).join(' ')

    return (
      <div
        ref={ref}
        className={combinedClassName}
        {...props}
      >
        {children}
        {dismissible && (
          <button 
            className="badge-close"
            onClick={onDismiss}
            aria-label="Remove badge"
          >
            ×
          </button>
        )}
      </div>
    )
  }
)

Badge.displayName = 'Badge'

export { Badge }