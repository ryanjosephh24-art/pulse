export type Timeframe = '24h' | '7d' | '30d'

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export type StatusClass = '2xx' | '3xx' | '4xx' | '5xx'

export interface RequestLog {
  id: string
  status: number
  method: HttpMethod
  endpoint: string
  region: string
  responseTimeMs: number
  timestamp: string
}

export interface VolumePoint {
  label: string
  requests: number
  previous: number
  errors: number
}

export interface Metric {
  id: 'requests' | 'latency' | 'errors' | 'endpoints'
  label: string
  value: string
  change: number
  lowerIsBetter: boolean
  description: string
  trend: { value: number }[]
}

const NOW = Date.UTC(2026, 8, 27, 14, 32, 0)

function mulberry32(seed: number) {
  let t = seed
  return () => {
    t |= 0
    t = (t + 0x6d2b79f5) | 0
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

function pad(n: number) {
  return n.toString().padStart(2, '0')
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function formatTimestamp(iso: string) {
  const d = new Date(iso)
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${pad(d.getUTCHours())}:${pad(
    d.getUTCMinutes(),
  )}:${pad(d.getUTCSeconds())} UTC`
}

export function formatCompact(n: number) {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

export function statusClassOf(status: number): StatusClass {
  if (status >= 500) return '5xx'
  if (status >= 400) return '4xx'
  if (status >= 300) return '3xx'
  return '2xx'
}

function buildVolume(timeframe: Timeframe): VolumePoint[] {
  const rand = mulberry32(timeframe === '24h' ? 11 : timeframe === '7d' ? 29 : 47)
  const count = timeframe === '24h' ? 24 : timeframe === '7d' ? 7 * 4 : 30
  const stepMs = timeframe === '24h' ? 3_600_000 : timeframe === '7d' ? 6 * 3_600_000 : 86_400_000
  const base = timeframe === '24h' ? 520_000 : timeframe === '7d' ? 3_100_000 : 12_400_000

  return Array.from({ length: count }, (_, i) => {
    const t = new Date(NOW - (count - 1 - i) * stepMs)
    const hour = t.getUTCHours()
    const dayCycle = timeframe === '30d' ? 1 : 0.65 + 0.35 * Math.sin(((hour - 8) / 24) * Math.PI * 2)
    const weekly = timeframe === '30d' ? 0.85 + 0.15 * Math.sin((i / 7) * Math.PI * 2) : 1
    const growth = 1 + i / (count * 6)
    const requests = Math.round(base * dayCycle * weekly * growth * (0.9 + rand() * 0.2))
    const previous = Math.round(requests * (0.82 + rand() * 0.12))
    const spike = rand() > 0.92 ? 3.5 : 1
    const errors = Math.round(requests * 0.0042 * spike * (0.7 + rand() * 0.6))

    const label =
      timeframe === '24h'
        ? `${pad(hour)}:00`
        : timeframe === '7d'
          ? `${MONTHS[t.getUTCMonth()]} ${t.getUTCDate()} ${pad(hour)}:00`
          : `${MONTHS[t.getUTCMonth()]} ${t.getUTCDate()}`

    return { label, requests, previous, errors }
  })
}

export const volumeByTimeframe: Record<Timeframe, VolumePoint[]> = {
  '24h': buildVolume('24h'),
  '7d': buildVolume('7d'),
  '30d': buildVolume('30d'),
}

function sparkline(seed: number, start: number, drift: number, noise: number) {
  const rand = mulberry32(seed)
  let v = start
  return Array.from({ length: 14 }, () => {
    v = Math.max(0, v + drift + (rand() - 0.5) * noise)
    return { value: Number(v.toFixed(3)) }
  })
}

export const metrics: Metric[] = [
  {
    id: 'requests',
    label: 'Total Requests',
    value: '84.2M',
    change: 12.4,
    lowerIsBetter: false,
    description: 'Last 7 days',
    trend: sparkline(3, 10, 0.35, 1.6),
  },
  {
    id: 'latency',
    label: 'Latency (p99)',
    value: '248ms',
    change: -8.1,
    lowerIsBetter: true,
    description: 'Across all regions',
    trend: sparkline(5, 280, -2.4, 26),
  },
  {
    id: 'errors',
    label: 'Error Rate',
    value: '0.42%',
    change: 3.2,
    lowerIsBetter: true,
    description: '4xx + 5xx responses',
    trend: sparkline(9, 0.38, 0.004, 0.08),
  },
  {
    id: 'endpoints',
    label: 'Active Endpoints',
    value: '1,284',
    change: 2.6,
    lowerIsBetter: false,
    description: '37 services monitored',
    trend: sparkline(13, 1240, 3.2, 12),
  },
]

export const statusBreakdown: {
  key: StatusClass
  label: string
  count: number
  codes: { code: number; count: number }[]
}[] = [
  {
    key: '2xx',
    label: 'Success',
    count: 81_046_300,
    codes: [
      { code: 200, count: 72_104_000 },
      { code: 201, count: 6_810_300 },
      { code: 204, count: 2_132_000 },
    ],
  },
  {
    key: '3xx',
    label: 'Redirect',
    count: 2_798_060,
    codes: [
      { code: 301, count: 402_000 },
      { code: 304, count: 2_396_060 },
    ],
  },
  {
    key: '4xx',
    label: 'Client error',
    count: 298_540,
    codes: [
      { code: 401, count: 121_400 },
      { code: 404, count: 98_300 },
      { code: 429, count: 78_840 },
    ],
  },
  {
    key: '5xx',
    label: 'Server error',
    count: 55_100,
    codes: [
      { code: 500, count: 31_200 },
      { code: 502, count: 14_600 },
      { code: 503, count: 9_300 },
    ],
  },
]

const ENDPOINTS: { method: HttpMethod; path: string }[] = [
  { method: 'GET', path: '/v1/users/:id' },
  { method: 'POST', path: '/v1/auth/token' },
  { method: 'GET', path: '/v1/orders' },
  { method: 'POST', path: '/v1/payments/charge' },
  { method: 'PATCH', path: '/v1/users/:id/settings' },
  { method: 'GET', path: '/v2/search' },
  { method: 'DELETE', path: '/v1/sessions/:id' },
  { method: 'PUT', path: '/v1/inventory/:sku' },
  { method: 'GET', path: '/v1/health' },
  { method: 'POST', path: '/v1/webhooks/stripe' },
  { method: 'GET', path: '/v2/analytics/events' },
  { method: 'POST', path: '/v1/uploads' },
]

const REGIONS = ['iad1', 'sfo1', 'fra1', 'hnd1', 'gru1', 'syd1']
const STATUS_POOL = [200, 200, 200, 201, 204, 304, 400, 401, 403, 404, 429, 500, 502, 503, 504]

function buildLogs(): RequestLog[] {
  const rand = mulberry32(2026)
  let t = NOW
  return Array.from({ length: 86 }, (_, i) => {
    const endpoint = ENDPOINTS[Math.floor(rand() * ENDPOINTS.length)]
    const status = STATUS_POOL[Math.floor(rand() * STATUS_POOL.length)]
    const slow = status >= 500 ? 900 + rand() * 2600 : status === 429 ? 20 + rand() * 40 : 30 + rand() * 420
    t -= Math.floor(8_000 + rand() * 95_000)
    return {
      id: `req_${(0x9f3a21 + i * 7919).toString(16)}${Math.floor(rand() * 1e6).toString(36)}`,
      status,
      method: endpoint.method,
      endpoint: endpoint.path,
      region: REGIONS[Math.floor(rand() * REGIONS.length)],
      responseTimeMs: Math.round(slow),
      timestamp: new Date(t).toISOString(),
    }
  })
}

export const requestLogs = buildLogs()

export const organizations = [
  { id: 'acme', name: 'Acme Inc.', plan: 'Enterprise' },
  { id: 'globex', name: 'Globex Labs', plan: 'Pro' },
  { id: 'initech', name: 'Initech', plan: 'Hobby' },
]
