'use client'

import { CreditCard, KeyRound, LogOut, Settings, User } from 'lucide-react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const ITEMS = [
  { label: 'Profile', icon: User, shortcut: '⇧⌘P' },
  { label: 'Billing', icon: CreditCard, shortcut: '⌘B' },
  { label: 'API keys', icon: KeyRound },
  { label: 'Settings', icon: Settings, shortcut: '⌘,' },
]

export function UserMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon" className="rounded-full" aria-label="Open user menu" />}
      >
        <Avatar className="size-8">
          <AvatarFallback className="bg-info/20 text-xs font-medium text-info">MR</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-foreground">Maya Rodriguez</span>
            <span className="text-xs font-normal text-muted-foreground">maya@acme.dev</span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {ITEMS.map((item) => (
            <DropdownMenuItem key={item.label} onClick={() => toast(`Opening ${item.label}`)}>
              <item.icon />
              {item.label}
              {item.shortcut && <DropdownMenuShortcut>{item.shortcut}</DropdownMenuShortcut>}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem variant="destructive" onClick={() => toast('Signed out')}>
            <LogOut />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
