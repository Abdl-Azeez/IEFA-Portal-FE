import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  indicatorClassName?: string;
  indicatorStyle?: React.CSSProperties;
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, indicatorClassName, indicatorStyle, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn("h-full w-full flex-1 bg-slate-900 transition-all dark:bg-slate-50", indicatorClassName)}
      style={{ transform: `translateX(-${100 - (value || 0)}%)`, ...indicatorStyle }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

/**
 * Returns a CSS background style that transitions from red → orange → yellow → green
 * based on the progress percentage.
 */
function getProgressGradient(value: number): React.CSSProperties {
  if (value <= 25) {
    return { background: "linear-gradient(to right, #dc2626, #ea580c)" };
  }
  if (value <= 50) {
    return { background: "linear-gradient(to right, #ea580c, #f59e0b)" };
  }
  if (value <= 75) {
    return { background: "linear-gradient(to right, #f59e0b, #84cc16)" };
  }
  return { background: "linear-gradient(to right, #84cc16, #16a34a)" };
}

export { Progress, getProgressGradient }
