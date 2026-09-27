'use client'

import { Activity, AlertTriangle, ArrowDownRight, ArrowUpRight, Network, Timer } from 'lucide-react'
import { Area, AreaChart, YAxis } from 'recharts'
import { cn } from '@/lib/utils'
import { metrics, type Metric } from '@/lib/dashboard-data'
import { Badge } from '@/components/ui/badge'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, type ChartConfig } from '@/components/ui/chart'

const ICONS: Record<Metric['id'], typeof Activity> = {
  requests: Activity,
  latency: Timer,
  errors: AlertTriangle,
  endpoints: Network,
}

function MetricCard({ metric }: { metric: Metric }) {
  const Icon = ICONS[metric.id]
  const isGood = metric.lowerIsBetter ? metric.change < 0 : metric.change > 0
  const Arrow = metric.change >= 0 ? ArrowUpRight : ArrowDownRight
  const tone = isGood ? 'success' : 'destructive'
  const config = {
    value: { label: metric.label, color: isGood ? 'var(--success)' : 'var(--destructive)' },
  } satisfies ChartConfig
  const gradientId = `spark-${metric.id}`

  return (
    <Card size="sm" className="gap-3">
      <CardHeader>
        <CardDescription className="flex items-center gap-2">
          <Icon className="size-3.5" aria-hidden="true" />
          {metric.label}
        </CardDescription>
        <CardAction>
          <Badge
            variant="outline"
            className={cn(
              'font-mono tabular-nums',
              tone === 'success'
                ? 'border-success/25 bg-success/10 text-success'
                : 'border-destructive/25 bg-destructive/10 text-destructive',
            )}
          >
            <Arrow data-icon="inline-start" aria-hidden="true" />
            {metric.change > 0 ? '+' : ''}
            {metric.change.toFixed(1)}%
            <span className="sr-only">
              {' '}
              vs last week, {isGood ? 'improvement' : 'regression'}
            </span>
          </Badge>
        </CardAction>
        <CardTitle>
          <span className="font-mono text-2xl font-semibold tracking-tight tabular-nums">{metric.value}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-end justify-between gap-4">
        <p className="text-xs text-muted-foreground">
          {metric.description}
          <span className="block">vs last week</span>
        </p>
        <ChartContainer config={config} className="aspect-auto h-10 w-28 shrink-0" aria-hidden="true">
          <AreaChart data={metric.trend} margin={{ top: 2, right: 0, bottom: 2, left: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-value)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--color-value)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <YAxis hide domain={['dataMin', 'dataMax']} />
            <Area
              dataKey="value"
              type="monotone"
              stroke="var(--color-value)"
              strokeWidth={1.5}
              fill={`url(#${gradientId})`}
              isAnimationActive={false}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export function MetricCards() {
  return (
    <section aria-label="Key metrics" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <MetricCard key={metric.id} metric={metric} />
      ))}
    </section>
  )
}
