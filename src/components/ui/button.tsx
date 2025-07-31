import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary hover:shadow-glow hover:-translate-y-0.5",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:shadow-glow hover:-translate-y-0.5",
        outline:
          "border border-border bg-transparent text-foreground hover:bg-card hover:text-card-foreground hover:shadow-glow hover:-translate-y-0.5",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:shadow-glow hover:-translate-y-0.5",
        ghost:
          "hover:bg-accent hover:text-accent-foreground hover:shadow-glow hover:-translate-y-0.5",
        link: "text-primary underline-offset-4 hover:underline",
        gradient:
          "bg-gradient-primary text-primary-foreground hover:shadow-glow hover:-translate-y-0.5 font-semibold",
        icon: "bg-card text-card-foreground border border-border hover:bg-secondary hover:shadow-primary hover:-translate-y-0.5 hover:shadow-glow",
        header:
          "bg-transparent text-slate-800 hover:text-slate-900 border border-slate-300 hover:bg-slate-200/60 focus-visible:ring-2 focus-visible:ring-slate-500 hover:shadow-glow hover:-translate-y-0.5 " +
          "dark:text-slate-200 dark:hover:text-white dark:border-slate-600 dark:hover:bg-slate-700/60",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-lg px-4",
        lg: "h-13 rounded-xl px-8 text-base",
        icon: "h-11 w-11",
        hero: "h-14 px-10 text-lg font-semibold",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
