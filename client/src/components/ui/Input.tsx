import React from 'react';
import { cn } from '../../lib/utils';

type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'filled';
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, size = 'default', variant = 'default', ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Base styles
          'flex w-full rounded-xl border-2 bg-background px-4 py-3 text-base font-medium transition-all duration-200',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          'placeholder:text-muted-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          
          // Size variants
          {
            'h-10 px-3 py-2 text-sm': size === 'sm',
            'h-12 px-4 py-3 text-base': size === 'default',
            'h-14 px-5 py-4 text-lg': size === 'lg',
          },
          
          // Color variants
          {
            'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-blue-500': variant === 'default',
            'border-gray-300 dark:border-gray-500 bg-transparent text-gray-900 dark:text-white focus:border-blue-500 focus:ring-blue-500': variant === 'outline',
            'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-blue-500': variant === 'filled',
          },
          
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
