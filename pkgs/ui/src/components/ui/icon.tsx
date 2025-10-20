import { cva, type VariantProps } from "class-variance-authority";
import { type LucideIcon, type LucideProps } from "lucide-react";
import * as React from "react";

import { cn } from "../../lib/utils";

const iconVariants = cva("shrink-0 transition-colors", {
  variants: {
    size: {
      xs: "size-3",
      sm: "size-4",
      default: "size-5",
      md: "size-6",
      lg: "size-8",
      xl: "size-10",
      "2xl": "size-12",
    },
    variant: {
      default: "text-foreground",
      primary: "text-primary",
      secondary: "text-secondary",
      muted: "text-muted-foreground",
      accent: "text-accent-foreground",
      destructive: "text-destructive",
      success: "text-green-600 dark:text-green-500",
      warning: "text-yellow-600 dark:text-yellow-500",
      info: "text-blue-600 dark:text-blue-500",
    },
  },
  defaultVariants: {
    size: "default",
    variant: "default",
  },
});

export interface IconProps
  extends Omit<LucideProps, "size" | "ref">,
    VariantProps<typeof iconVariants> {
  icon: LucideIcon;
  /** Override size with custom value (number will be converted to pixels) */
  customSize?: number;
}

const Icon = React.forwardRef<SVGSVGElement, IconProps>(
  (
    { icon: IconComponent, size, variant, customSize, className, ...props },
    ref,
  ) => {
    return (
      <IconComponent
        ref={ref}
        size={customSize}
        className={cn(iconVariants({ size, variant }), className)}
        {...props}
      />
    );
  },
);

Icon.displayName = "Icon";

export { Icon, iconVariants };
