'use client'

import { useState } from 'react'
import { ChevronsUpDown, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { organizations } from '@/lib/dashboard-data'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

function OrgAvatar({ name }: { name: string }) {
  return (
    <span
      aria-hidden="true"
      className="flex size-5 shrink-0 items-center justify-center rounded bg-info/20 text-[10px] font-semibold text-info"
    >
      {name.slice(0, 1)}
    </span>
  )
}

export function OrgSwitcher() {
  const [orgId, setOrgId] = useState(organizations[0].id)
  const current = organizations.find((o) => o.id === orgId) ?? organizations[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="sm" aria-label={`Switch organization, current: ${current.name}`} />}
      >
        <OrgAvatar name={current.name} />
        <span className="hidden max-w-32 truncate md:inline">{current.name}</span>
        <Badge variant="secondary" className="hidden lg:inline-flex">
          {current.plan}
        </Badge>
        <ChevronsUpDown data-icon="inline-end" className="text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-60">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Organizations</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={orgId}
            onValueChange={(value) => {
              setOrgId(value as string)
              const org = organizations.find((o) => o.id === value)
              if (org) toast.success(`Switched to ${org.name}`)
            }}
          >
            {organizations.map((org) => (
              <DropdownMenuRadioItem key={org.id} value={org.id}>
                <OrgAvatar name={org.name} />
                <span className="flex-1 truncate">{org.name}</span>
                <span className="text-xs text-muted-foreground">{org.plan}</span>
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => toast('Create organization flow coming soon')}>
            <Plus />
            Create organization
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
