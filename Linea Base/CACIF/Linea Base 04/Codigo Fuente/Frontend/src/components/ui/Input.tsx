import * as React from "react"
import { cn } from "../../lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, iconLeft, iconRight, ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        {iconLeft && (
          <div className="absolute left-3 flex items-center justify-center text-muted-foreground pointer-events-none">
            {iconLeft}
          </div>
        )}
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all",
            iconLeft && "pl-10",
            iconRight && "pr-10",
            className
          )}
          ref={ref}
          {...props}
        />
        {iconRight && (
          <div className="absolute right-3 flex items-center justify-center text-muted-foreground pointer-events-none">
            {iconRight}
          </div>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
