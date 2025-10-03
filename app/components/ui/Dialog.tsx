import { forwardRef, HTMLAttributes, ReactNode, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface DialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: ReactNode
}

const Dialog = ({ open = false, onOpenChange, children }: DialogProps) => {
  const [isOpen, setIsOpen] = useState(open)
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    setIsOpen(open)
    if (open) {
      setIsClosing(false)
    }
  }, [open])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      setIsOpen(false)
      setIsClosing(false)
      onOpenChange?.(false)
    }, 200)
  }

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return createPortal(
    <div 
      className={`dialog-overlay ${isClosing ? 'closing' : ''}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose()
        }
      }}
    >
      {children}
    </div>,
    document.body
  )
}

Dialog.displayName = 'Dialog'

const DialogTrigger = forwardRef<HTMLButtonElement, HTMLAttributes<HTMLButtonElement> & { asChild?: boolean }>(
  ({ children, ...props }, ref) => (
    <button ref={ref} {...props}>
      {children}
    </button>
  )
)

DialogTrigger.displayName = 'DialogTrigger'

interface DialogContentProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'default' | 'lg' | 'xl' | 'full'
  onClose?: () => void
  showClose?: boolean
}

const DialogContent = forwardRef<HTMLDivElement, DialogContentProps>(
  ({ className = '', size = 'default', onClose, showClose = true, children, ...props }, ref) => {
    const baseClasses = 'dialog-content'
    const sizeClasses = size !== 'default' ? `dialog-content-${size}` : ''
    
    const combinedClassName = [
      baseClasses,
      sizeClasses,
      className
    ].filter(Boolean).join(' ')

    return (
      <div
        ref={ref}
        className={combinedClassName}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        {showClose && (
          <button 
            className="dialog-close"
            onClick={onClose}
            aria-label="Close dialog"
          >
            ×
          </button>
        )}
        {children}
      </div>
    )
  }
)

DialogContent.displayName = 'DialogContent'

const DialogHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className = '', ...props }, ref) => (
    <div
      ref={ref}
      className={`dialog-header ${className}`}
      {...props}
    />
  )
)

DialogHeader.displayName = 'DialogHeader'

const DialogTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className = '', ...props }, ref) => (
    <h2
      ref={ref}
      className={`dialog-title ${className}`}
      {...props}
    />
  )
)

DialogTitle.displayName = 'DialogTitle'

const DialogDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className = '', ...props }, ref) => (
    <p
      ref={ref}
      className={`dialog-description ${className}`}
      {...props}
    />
  )
)

DialogDescription.displayName = 'DialogDescription'

const DialogBody = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className = '', ...props }, ref) => (
    <div
      ref={ref}
      className={`dialog-body ${className}`}
      {...props}
    />
  )
)

DialogBody.displayName = 'DialogBody'

const DialogFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className = '', ...props }, ref) => (
    <div
      ref={ref}
      className={`dialog-footer ${className}`}
      {...props}
    />
  )
)

DialogFooter.displayName = 'DialogFooter'

export { 
  Dialog, 
  DialogTrigger, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogBody, 
  DialogFooter 
}