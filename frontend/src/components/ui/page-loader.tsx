import { cn } from "@/lib/utils"

interface PageLoaderProps {
  className?: string
}

export function PageLoader({ className }: PageLoaderProps) {
  return (
    <div
      className={cn(
        "flex flex-1 min-h-[50vh] items-center justify-center",
        className
      )}
    >
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-muted animate-pulse" />
          <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <div className="absolute inset-0 m-auto h-2 w-2 rounded-full bg-primary animate-pulse" />
        </div>
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium text-foreground">Loading</span>
          <span className="flex gap-0.5">
            <span className="animate-bounce [animation-delay:-0.3s]">.</span>
            <span className="animate-bounce [animation-delay:-0.15s]">.</span>
            <span className="animate-bounce">.</span>
          </span>
        </div>
      </div>
    </div>
  )
}
