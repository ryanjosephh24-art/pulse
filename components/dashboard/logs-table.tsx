'use client'

import { useMemo, useState } from 'react'
import {
  BellPlus,
  ChevronLeft,
  ChevronRight,
  Copy,
  Eye,
  MoreHorizontal,
  RotateCcw,
  Search,
  SearchX,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  formatTimestamp,
  requestLogs,
  statusClassOf,
  type HttpMethod,
  type StatusClass,
} from '@/lib/dashboard-data'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group'
import { Pagination, PaginationContent, PaginationItem } from '@/components/ui/pagination'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const PAGE_SIZE = 10

type StatusFilter = 'all' | StatusClass

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  { value: '2xx', label: '2xx Success' },
  { value: '3xx', label: '3xx Redirect' },
  { value: '4xx', label: '4xx Client error' },
  { value: '5xx', label: '5xx Server error' },
]

const STATUS_TONE: Record<StatusClass, string> = {
  '2xx': 'border-success/25 bg-success/10 text-success',
  '3xx': 'border-info/25 bg-info/10 text-info',
  '4xx': 'border-warning/25 bg-warning/10 text-warning',
  '5xx': 'border-destructive/25 bg-destructive/10 text-destructive',
}

const METHOD_TONE: Record<HttpMethod, string> = {
  GET: 'text-info',
  POST: 'text-success',
  PUT: 'text-warning',
  PATCH: 'text-warning',
  DELETE: 'text-destructive',
}

function latencyTone(ms: number) {
  if (ms >= 1000) return 'text-destructive'
  if (ms >= 400) return 'text-warning'
  return 'text-foreground'
}

function pageList(current: number, total: number): (number | 'gap')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = new Set([1, total, current - 1, current, current + 1])
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b)
  const out: (number | 'gap')[] = []
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push('gap')
    out.push(p)
  })
  return out
}

export function LogsTable() {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return requestLogs.filter((log) => {
      if (status !== 'all' && statusClassOf(log.status) !== status) return false
      if (!q) return true
      return (
        log.endpoint.toLowerCase().includes(q) ||
        log.method.toLowerCase().includes(q) ||
        log.id.toLowerCase().includes(q) ||
        log.region.includes(q) ||
        String(log.status).includes(q)
      )
    })
  }, [query, status])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const start = (currentPage - 1) * PAGE_SIZE
  const rows = filtered.slice(start, start + PAGE_SIZE)

  function resetFilters() {
    setQuery('')
    setStatus('all')
    setPage(1)
  }

  return (
    <Card className="gap-0 py-0">
      <CardHeader className="border-b border-border py-4">
        <CardTitle>Recent requests</CardTitle>
        <CardDescription>Live request log and incidents across all endpoints</CardDescription>
        <CardAction className="flex flex-col gap-2 sm:flex-row">
          <InputGroup className="w-full sm:w-64">
            <InputGroupAddon>
              <Search aria-hidden="true" />
            </InputGroupAddon>
            <InputGroupInput
              type="search"
              placeholder="Search path, method, ID..."
              aria-label="Search request logs"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setPage(1)
              }}
            />
            {query && (
              <InputGroupAddon align="inline-end">
                <InputGroupButton size="icon-xs" aria-label="Clear search" onClick={() => setQuery('')}>
                  <X />
                </InputGroupButton>
              </InputGroupAddon>
            )}
          </InputGroup>
          <Select
            items={STATUS_FILTERS}
            value={status}
            onValueChange={(value) => {
              setStatus((value as StatusFilter) ?? 'all')
              setPage(1)
            }}
          >
            <SelectTrigger className="w-full sm:w-44" aria-label="Filter by status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {STATUS_FILTERS.map((f) => (
                  <SelectItem key={f.value} value={f.value}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>

      {rows.length === 0 ? (
        <Empty className="py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SearchX />
            </EmptyMedia>
            <EmptyTitle>No matching requests</EmptyTitle>
            <EmptyDescription>Try a different search term or clear the status filter.</EmptyDescription>
          </EmptyHeader>
          <Button variant="outline" size="sm" onClick={resetFilters}>
            Reset filters
          </Button>
        </Empty>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-24 pl-4">Status</TableHead>
              <TableHead>Endpoint</TableHead>
              <TableHead className="hidden md:table-cell">Region</TableHead>
              <TableHead className="text-right">Response time</TableHead>
              <TableHead className="hidden sm:table-cell">Timestamp</TableHead>
              <TableHead className="w-12 pr-4">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((log) => {
              const cls = statusClassOf(log.status)
              return (
                <TableRow key={log.id}>
                  <TableCell className="pl-4">
                    <Badge variant="outline" className={cn('font-mono tabular-nums', STATUS_TONE[cls])}>
                      {log.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-72">
                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className={cn('w-12 shrink-0 font-semibold', METHOD_TONE[log.method])}>
                        {log.method}
                      </span>
                      <span className="truncate text-foreground">{log.endpoint}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden font-mono text-xs text-muted-foreground md:table-cell">
                    {log.region}
                  </TableCell>
                  <TableCell className={cn('text-right font-mono text-xs tabular-nums', latencyTone(log.responseTimeMs))}>
                    {log.responseTimeMs.toLocaleString('en-US')}ms
                  </TableCell>
                  <TableCell className="hidden font-mono text-xs text-muted-foreground sm:table-cell">
                    <time dateTime={log.timestamp}>{formatTimestamp(log.timestamp)}</time>
                  </TableCell>
                  <TableCell className="pr-4">
                    <RowActions id={log.id} endpoint={`${log.method} ${log.endpoint}`} />
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}

      <CardFooter className="flex flex-col gap-3 border-t border-border py-3 sm:flex-row sm:justify-between">
        <p className="text-xs text-muted-foreground" aria-live="polite">
          {filtered.length === 0
            ? 'No results'
            : `Showing ${start + 1}–${Math.min(start + PAGE_SIZE, filtered.length)} of ${filtered.length} requests`}
        </p>
        <Pagination className="mx-0 w-auto">
          <PaginationContent>
            <PaginationItem>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage(currentPage - 1)}
                disabled={currentPage <= 1}
                aria-label="Go to previous page"
              >
                <ChevronLeft data-icon="inline-start" />
                <span className="hidden sm:inline">Previous</span>
              </Button>
            </PaginationItem>
            {pageList(currentPage, pageCount).map((p, i) =>
              p === 'gap' ? (
                <PaginationItem key={`gap-${i}`} aria-hidden="true">
                  <span className="px-2 text-xs text-muted-foreground">…</span>
                </PaginationItem>
              ) : (
                <PaginationItem key={p}>
                  <Button
                    variant={p === currentPage ? 'outline' : 'ghost'}
                    size="icon-sm"
                    onClick={() => setPage(p)}
                    aria-label={`Go to page ${p}`}
                    aria-current={p === currentPage ? 'page' : undefined}
                    className="font-mono text-xs tabular-nums"
                  >
                    {p}
                  </Button>
                </PaginationItem>
              ),
            )}
            <PaginationItem>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage(currentPage + 1)}
                disabled={currentPage >= pageCount}
                aria-label="Go to next page"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight data-icon="inline-end" />
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </CardFooter>
    </Card>
  )
}

function RowActions({ id, endpoint }: { id: string; endpoint: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon-sm" aria-label={`Actions for ${endpoint} (${id})`} />}
      >
        <MoreHorizontal />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => toast(`Viewing trace for ${id}`)}>
            <Eye />
            View details
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              navigator.clipboard?.writeText(id).catch(() => {})
              toast.success('Request ID copied', { description: id })
            }}
          >
            <Copy />
            Copy request ID
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => toast(`Replaying ${endpoint}`)}>
            <RotateCcw />
            Replay request
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => toast.success(`Alert rule created for ${endpoint}`)}>
            <BellPlus />
            Create alert
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
