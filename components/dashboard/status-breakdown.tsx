'use client'

import { PolarAngleAxis, RadialBar, RadialBarChart } from 'recharts'
import { cn } from '@/lib/utils'
import { formatCompact, statusBreakdown, type StatusClass } from '@/lib/dashboard-data'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, type ChartConfig } from '@/components/ui/chart'
import { Progress, ProgressLabel, ProgressValue } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'

const TONE: Record<StatusClass, { dot: string; indicator: string }> = {
  '2xx': { dot: 'bg-success', indicator: '[&_[data-slot=progress-indicator]]:bg-success' },
  '3xx': { dot: 'bg-info', indicator: '[&_[data-slot=progress-indicator]]:bg-info' },
  '4xx': { dot: 'bg-warning', indicator: '[&_[data-slot=progress-indicator]]:bg-warning' },
  '5xx': { dot: 'bg-destructive', indicator: '[&_[data-slot=progress-indicator]]:bg-destructive' },
}

const radialConfig = { success: { label: 'Success rate', color: 'var(--success)' } } satisfies ChartConfig

export function StatusBreakdown() {
  const total = statusBreakdown.reduce((s, b) => s + b.count, 0)
  const ok = statusBreakdown.filter((b) => b.key === '2xx' || b.key === '3xx').reduce((s, b) => s + b.count, 0)
  const successRate = (ok / total) * 100
  const topErrors = statusBreakdown
    .filter((b) => b.key === '4xx' || b.key === '5xx')
    .flatMap((b) => b.codes.map((c) => ({ ...c, key: b.key })))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4)

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>Status breakdown</CardTitle>
        <CardDescription>Response classes, last 7 days</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="flex items-center gap-4">
          <ChartContainer config={radialConfig} className="aspect-square h-28 shrink-0" aria-hidden="true">
            <RadialBarChart
              data={[{ name: 'success', value: successRate, fill: 'var(--color-success)' }]}
              startAngle={90}
              endAngle={-270}
              innerRadius="78%"
              outerRadius="100%"
            >
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} axisLine={false} />
              <RadialBar dataKey="value" background cornerRadius={8} />
            </RadialBarChart>
          </ChartContainer>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Success rate</span>
            <span className="font-mono text-2xl font-semibold tabular-nums">{successRate.toFixed(2)}%</span>
            <span className="text-xs text-muted-foreground">
              {formatCompact(total)} total responses
            </span>
          </div>
        </div>

        <ul className="flex flex-col gap-4" aria-label="Responses by status class">
          {statusBreakdown.map((b) => {
            const pct = (b.count / total) * 100
            return (
              <li key={b.key}>
                <Progress value={pct} className={cn('gap-2', TONE[b.key].indicator)}>
                  <ProgressLabel className="flex items-center gap-2 text-xs font-medium">
                    <span className={cn('size-2 rounded-full', TONE[b.key].dot)} aria-hidden="true" />
                    <span className="font-mono">{b.key}</span>
                    <span className="font-normal text-muted-foreground">{b.label}</span>
                  </ProgressLabel>
                  <ProgressValue className="ml-auto font-mono text-xs text-muted-foreground tabular-nums">
                    {() => `${formatCompact(b.count)} · ${pct < 1 ? pct.toFixed(2) : pct.toFixed(1)}%`}
                  </ProgressValue>
                </Progress>
              </li>
            )
          })}
        </ul>
      </CardContent>
      <Separator />
      <CardFooter className="flex-col items-stretch gap-2">
        <span className="text-xs font-medium text-muted-foreground">Top error codes</span>
        <ul className="grid grid-cols-2 gap-2">
          {topErrors.map((e) => (
            <li
              key={e.code}
              className="flex items-center justify-between rounded-md border border-border bg-muted/40 px-2.5 py-1.5"
            >
              <span className="flex items-center gap-1.5 font-mono text-xs">
                <span className={cn('size-1.5 rounded-full', TONE[e.key].dot)} aria-hidden="true" />
                {e.code}
              </span>
              <span className="font-mono text-xs text-muted-foreground tabular-nums">{formatCompact(e.count)}</span>
            </li>
          ))}
        </ul>
      </CardFooter>
    </Card>
  )
}
