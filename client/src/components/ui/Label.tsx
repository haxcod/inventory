import React from 'react';
import { cn } from '../../lib/utils';

type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement> & {
  size?: 'sm' | 'default' | 'lg';
  required?: boolean;
};

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, size = 'default', required = false, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        'block font-semibold leading-none text-gray-900 dark:text-white peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        {
          'text-sm': size === 'sm',
          'text-base': size === 'default',
          'text-lg': size === 'lg',
        },
        className
      )}
      {...props}
    >
      {props.children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  )
);
Label.displayName = 'Label';

export { Label };
