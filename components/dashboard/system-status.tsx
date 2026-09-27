import { cn } from '@/lib/utils'
import { badgeVariants } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

export function SystemStatus() {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <a
            href="#status"
            className={cn(
              badgeVariants({ variant: 'outline' }),
              'h-7 gap-2 border-success/25 bg-success/10 px-2.5 text-success',
            )}
          />
        }
      >
        <span className="relative flex size-2" aria-hidden="true">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60" />
          <span className="relative inline-flex size-2 rounded-full bg-success" />
        </span>
        <span className="sr-only md:not-sr-only">All Systems Operational</span>
      </TooltipTrigger>
      <TooltipContent>99.98% uptime over the last 90 days</TooltipContent>
    </Tooltip>
  )
}
