"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface PageLoaderProps {
  className?: string
  delay?: number
}

/**
 * Page loader component with fade-in animation
 * Shows after a small delay to prevent flash on fast loads
 */
export function PageLoader({ className, delay = 200 }: PageLoaderProps) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  if (!show) return null

  return (
    <div 
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-background animate-in fade-in duration-300",
        className
      )}
    >
      <div className="flex flex-col items-center justify-center gap-4">
        {/* Animated spinner */}
        <div className="relative">
          {/* Outer ring */}
          <div className="h-16 w-16 rounded-full border-4 border-muted animate-pulse" />
          
          {/* Inner spinning ring */}
          <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          
          {/* Center dot */}
          <div className="absolute inset-0 m-auto h-2 w-2 rounded-full bg-primary animate-pulse" />
        </div>

        {/* Loading text with animation */}
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
