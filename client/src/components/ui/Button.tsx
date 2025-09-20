import React from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link' | 'gradient';
  size?: 'sm' | 'default' | 'lg' | 'icon';
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          // Base styles
          'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:pointer-events-none ring-offset-background',
          'hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0',
          
          // Size variants
          {
            'h-9 px-4 text-sm': size === 'sm',
            'h-12 px-6 text-base': size === 'default',
            'h-14 px-8 text-lg': size === 'lg',
            'h-12 w-12': size === 'icon',
          },
          
          // Color variants
          {
            'bg-blue-600 text-white hover:bg-blue-700 shadow-md': variant === 'primary',
            'bg-gray-600 text-white hover:bg-gray-700 shadow-md': variant === 'secondary',
            'bg-red-600 text-white hover:bg-red-700 shadow-md': variant === 'destructive',
            'border-2 border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500': variant === 'outline',
            'bg-transparent text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800': variant === 'ghost',
            'underline-offset-4 hover:underline text-blue-600 dark:text-blue-400': variant === 'link',
            'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-xl hover:shadow-2xl border-2 border-blue-400': variant === 'gradient',
          },
          
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button };
