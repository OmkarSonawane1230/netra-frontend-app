import { forwardRef, TextareaHTMLAttributes } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', error = false, ...props }, ref) => {
    const baseClasses = 'textarea'
    const errorClasses = error ? 'input-error' : ''
    
    const combinedClassName = [
      baseClasses,
      errorClasses,
      className
    ].filter(Boolean).join(' ')

    return (
      <textarea
        ref={ref}
        className={combinedClassName}
        {...props}
      />
    )
  }
)

Textarea.displayName = 'Textarea'

export { Textarea }