import { Download } from 'lucide-react'
import { LogsTable } from '@/components/dashboard/logs-table'
import { MetricCards } from '@/components/dashboard/metric-cards'
import { RequestVolumeChart } from '@/components/dashboard/request-volume-chart'
import { StatusBreakdown } from '@/components/dashboard/status-breakdown'
import { TopNav } from '@/components/dashboard/top-nav'
import { Button } from '@/components/ui/button'

export default function DashboardPage() {
  return (
    <div className="min-h-svh bg-background">
      <TopNav />
      <main className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 py-6 lg:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-semibold tracking-tight text-balance">API Overview</h1>
            <p className="text-sm text-muted-foreground">
              Production · <span className="font-mono">api.acme.dev</span> · Updated just now
            </p>
          </div>
          <Button variant="outline" size="sm">
            <Download data-icon="inline-start" />
            Export report
          </Button>
        </div>

        <MetricCards />

        <section aria-label="Traffic analytics" className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RequestVolumeChart />
          </div>
          <StatusBreakdown />
        </section>

        <LogsTable />
      </main>
    </div>
  )
}
