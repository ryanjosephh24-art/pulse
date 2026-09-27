'use client'

import { useEffect, useState } from 'react'
import { Bell, FileText, Gauge, Key, Route, Search, Settings, Webhook } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command'
import { Kbd, KbdGroup } from '@/components/ui/kbd'

const ENDPOINT_RESULTS = [
  { label: 'GET /v1/users/:id', icon: Route },
  { label: 'POST /v1/auth/token', icon: Key },
  { label: 'POST /v1/payments/charge', icon: Route },
  { label: 'POST /v1/webhooks/stripe', icon: Webhook },
]

const NAV_RESULTS = [
  { label: 'Performance overview', icon: Gauge, shortcut: 'G O' },
  { label: 'Alert rules', icon: Bell, shortcut: 'G A' },
  { label: 'Request logs', icon: FileText, shortcut: 'G L' },
  { label: 'Project settings', icon: Settings, shortcut: 'G S' },
]

export function SearchCommand() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  function run(label: string) {
    setOpen(false)
    toast(`Opening ${label}`)
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="w-full max-w-md justify-start text-muted-foreground"
        aria-label="Search endpoints, logs and settings"
        aria-keyshortcuts="Meta+K Control+K"
      >
        <Search data-icon="inline-start" />
        <span className="hidden flex-1 truncate text-left sm:inline">Search endpoints, logs, settings...</span>
        <KbdGroup className="ml-auto hidden sm:inline-flex">
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      </Button>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Search"
        description="Search endpoints, logs and settings"
      >
        <Command>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Endpoints">
            {ENDPOINT_RESULTS.map((item) => (
              <CommandItem key={item.label} onSelect={() => run(item.label)}>
                <item.icon />
                <span className="font-mono text-xs">{item.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Navigation">
            {NAV_RESULTS.map((item) => (
              <CommandItem key={item.label} onSelect={() => run(item.label)}>
                <item.icon />
                <span>{item.label}</span>
                <CommandShortcut>{item.shortcut}</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}
