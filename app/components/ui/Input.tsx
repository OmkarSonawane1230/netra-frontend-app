import { forwardRef, InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
  inputSize?: 'sm' | 'default' | 'lg'
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error = false, inputSize = 'default', ...props }, ref) => {
    const baseClasses = 'input'
    const sizeClasses = `input-${inputSize}`
    const errorClasses = error ? 'input-error' : ''
    
    const combinedClassName = [
      baseClasses,
      sizeClasses,
      errorClasses,
      className
    ].filter(Boolean).join(' ')

    return (
      <input
        ref={ref}
        className={combinedClassName}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'

export { Input }