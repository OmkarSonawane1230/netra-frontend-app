import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    icon?: React.ReactNode;
    href?: string;
}

function Button({
    icon,
    children,
    className,
    ...props
}: ButtonProps) {
    const combinedClassName = `
    ${className}
    ${icon ? 'btn-icon' : 'btn-default'}
    btn
  `.trim();

  return (
    <button className={combinedClassName} {...props}>
      {icon && icon}
      {children}
    </button>
  );
}

export { Button };