import { forwardRef } from 'react';
import type { LucideProps } from 'lucide-react';

export interface SvgIconProps extends Omit<LucideProps, 'ref'> {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

export const SvgIcon = forwardRef<SVGSVGElement, SvgIconProps>(
  ({ icon: Icon, size = 24, color = 'currentColor', strokeWidth = 2, ...props }, ref) => (
    <Icon
      ref={ref}
      width={size}
      height={size}
      stroke={color}
      strokeWidth={strokeWidth}
      {...props}
    />
  )
);

SvgIcon.displayName = 'SvgIcon';
