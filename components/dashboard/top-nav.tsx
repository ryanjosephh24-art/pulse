import { Activity } from 'lucide-react'
import { OrgSwitcher } from '@/components/dashboard/org-switcher'
import { SearchCommand } from '@/components/dashboard/search-command'
import { SystemStatus } from '@/components/dashboard/system-status'
import { UserMenu } from '@/components/dashboard/user-menu'
import { Separator } from '@/components/ui/separator'

const NAV_LINKS = [
  { label: 'Overview', href: '#', active: true },
  { label: 'Endpoints', href: '#' },
  { label: 'Alerts', href: '#' },
  { label: 'Traces', href: '#' },
  { label: 'Settings', href: '#' },
]

export function TopNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="flex h-14 items-center gap-3 px-4 lg:px-6">
        <a
          href="#"
          className="flex items-center gap-2 rounded-md font-semibold tracking-tight focus-visible:outline-2"
          aria-label="Pulse home"
        >
          <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Activity className="size-4" aria-hidden="true" />
          </span>
          <span className="hidden sm:inline">Pulse</span>
        </a>
        <Separator orientation="vertical" className="h-5!" />
        <OrgSwitcher />
        <div className="flex flex-1 items-center justify-center px-2">
          <SearchCommand />
        </div>
        <SystemStatus />
        <UserMenu />
      </div>
      <nav aria-label="Primary" className="flex h-10 items-end gap-1 overflow-x-auto px-2 lg:px-4">
        {NAV_LINKS.map((link) => (
          <a
            key={link.label}
            href={link.href}
            aria-current={link.active ? 'page' : undefined}
            className="relative rounded-md px-3 pt-1 pb-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 aria-[current=page]:text-foreground aria-[current=page]:after:absolute aria-[current=page]:after:inset-x-2 aria-[current=page]:after:-bottom-px aria-[current=page]:after:h-0.5 aria-[current=page]:after:rounded-full aria-[current=page]:after:bg-primary"
          >
            {link.label}
          </a>
        ))}
      </nav>
    </header>
  )
}
