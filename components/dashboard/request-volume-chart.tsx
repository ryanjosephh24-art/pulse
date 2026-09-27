'use client'

import { useMemo, useState } from 'react'
import { Area, AreaChart, CartesianGrid, Line, XAxis, YAxis } from 'recharts'
import { formatCompact, volumeByTimeframe, type Timeframe } from '@/lib/dashboard-data'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { Separator } from '@/components/ui/separator'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

const chartConfig = {
  requests: { label: 'Requests', color: 'var(--chart-1)' },
  previous: { label: 'Previous period', color: 'var(--chart-2)' },
} satisfies ChartConfig

const TIMEFRAMES: { value: Timeframe; label: string; full: string }[] = [
  { value: '24h', label: '24h', full: 'last 24 hours' },
  { value: '7d', label: '7d', full: 'last 7 days' },
  { value: '30d', label: '30d', full: 'last 30 days' },
]

export function RequestVolumeChart() {
  const [timeframe, setTimeframe] = useState<Timeframe>('24h')
  const data = volumeByTimeframe[timeframe]

  const stats = useMemo(() => {
    const total = data.reduce((s, d) => s + d.requests, 0)
    const prev = data.reduce((s, d) => s + d.previous, 0)
    const peak = Math.max(...data.map((d) => d.requests))
    const errors = data.reduce((s, d) => s + d.errors, 0)
    return { total, change: ((total - prev) / prev) * 100, peak, errorRate: (errors / total) * 100 }
  }, [data])

  const active = TIMEFRAMES.find((t) => t.value === timeframe)!

  return (
    <Card className="h-full min-w-0">
      <CardHeader>
        <CardTitle>Request volume</CardTitle>
        <CardDescription>Requests across all endpoints, {active.full}</CardDescription>
        <CardAction>
          <ToggleGroup
            variant="outline"
            size="sm"
            spacing={0}
            value={[timeframe]}
            onValueChange={(value) => {
              const next = value[0] as Timeframe | undefined
              if (next) setTimeframe(next)
            }}
            aria-label="Select timeframe"
          >
            {TIMEFRAMES.map((t) => (
              <ToggleGroupItem key={t.value} value={t.value} aria-label={t.full} className="px-3 font-mono text-xs">
                {t.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <dl className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <div className="flex flex-col gap-0.5">
            <dt className="text-xs text-muted-foreground">Total</dt>
            <dd className="font-mono text-lg font-semibold tabular-nums">{formatCompact(stats.total)}</dd>
          </div>
          <Separator orientation="vertical" className="h-8!" />
          <div className="flex flex-col gap-0.5">
            <dt className="text-xs text-muted-foreground">vs previous</dt>
            <dd className="font-mono text-lg font-semibold text-success tabular-nums">
              +{stats.change.toFixed(1)}%
            </dd>
          </div>
          <Separator orientation="vertical" className="h-8!" />
          <div className="flex flex-col gap-0.5">
            <dt className="text-xs text-muted-foreground">Peak</dt>
            <dd className="font-mono text-lg font-semibold tabular-nums">{formatCompact(stats.peak)}</dd>
          </div>
          <Separator orientation="vertical" className="h-8!" />
          <div className="flex flex-col gap-0.5">
            <dt className="text-xs text-muted-foreground">Error rate</dt>
            <dd className="font-mono text-lg font-semibold tabular-nums">{stats.errorRate.toFixed(2)}%</dd>
          </div>
        </dl>
        <ChartContainer
          config={chartConfig}
          className="aspect-auto min-h-72 w-full flex-1"
          role="img"
          aria-label={`Area chart of request volume for the ${active.full}. Total ${formatCompact(stats.total)} requests, peak ${formatCompact(stats.peak)}.`}
        >
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="fill-requests" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-requests)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="var(--color-requests)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(v: string) => (timeframe === '7d' ? v.split(' ').slice(0, 2).join(' ') : v)}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={52}
              tickMargin={4}
              tickFormatter={(v: number) => formatCompact(v)}
            />
            <ChartTooltip
              cursor={{ strokeDasharray: '3 3' }}
              content={
                <ChartTooltipContent
                  indicator="line"
                  formatter={(value, name) => (
                    <div className="flex w-full items-center justify-between gap-4">
                      <span className="text-muted-foreground">
                        {chartConfig[name as keyof typeof chartConfig]?.label ?? name}
                      </span>
                      <span className="font-mono font-medium text-foreground tabular-nums">
                        {Number(value).toLocaleString('en-US')}
                      </span>
                    </div>
                  )}
                />
              }
            />
            <Line
              dataKey="previous"
              type="monotone"
              stroke="var(--color-previous)"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
            />
            <Area
              dataKey="requests"
              type="monotone"
              stroke="var(--color-requests)"
              strokeWidth={2}
              fill="url(#fill-requests)"
              activeDot={{ r: 4 }}
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
