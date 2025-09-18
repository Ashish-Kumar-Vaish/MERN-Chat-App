import { cn } from "../../lib/utils";
import { cva } from "class-variance-authority";

const buttonVariants = cva(
  "min-w-14 md:min-w-16 lg:min-w-20 xl:min-w-24 w-fit inline-flex items-center justify-center rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
  {
    variants: {
      variant: {
        action:
          "bg-[var(--action-button-bg)] text-[var(--action-button-text)] enabled:hover:bg-[var(--action-button-hover-bg)] enabled:hover:text-[var(--action-button-hover-text)]",
        danger:
          "bg-[var(--danger-button-bg)] text-[var(--danger-button-text)] enabled:hover:bg-[var(--danger-button-hover-bg)] enabled:hover:text-[var(--action-button-hover-text)]",
        primary:
          "bg-[var(--primary-button-bg)] text-[var(--primary-button-text)] enabled:hover:bg-[var(--primary-button-hover-bg)] enabled:hover:text-[var(--action-button-hover-text)]",
        ghost:
          "bg-transparent text-[var(--secondary-text)] enabled:hover:bg-[var(--sidebar-panel-bg)]",
        nav: "h-16 md:h-18 w-[80%] bg-[var(--nav-button-bg)] text-[var(--nav-button-text)] enabled:hover:bg-[var(--nav-button-hover-bg)] enabled:hover:text-[var(--nav-button-hover-text)]",
      },
      size: {
        sm: "px-2 py-1 text-xs md:text-sm",
        md: "px-3 py-2 text-sm md:text-base",
        lg: "px-4 py-3 text-base lg:text-lg",
        xl: "px-5 py-4 text-lg lg:text-xl",
      },
    },
    defaultVariants: {
      variant: "action",
      size: "md",
    },
  }
);

export default function Button({
  variant,
  size,
  type = "button",
  className,
  children,
  ...props
}) {
  return (
    <button
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {children}
    </button>
  );
}
