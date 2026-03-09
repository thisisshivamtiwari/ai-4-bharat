import type { ReactElement } from 'react'
import { useEffect, useState } from 'react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type {
  PickupTrend,
  RevenueOverview,
  TodaysOverview,
} from '../services/dashboard'
import {
  fetchPickupTrend,
  fetchRevenueOverview,
  fetchTodaysOverview,
} from '../services/dashboard'

const formatCurrency = (value: number | null): string => {
  if (value === null) {
    return '—'
  }

  return value.toLocaleString('en-IN', {
    maximumFractionDigits: 0,
  })
}

const formatPercentage = (value: number | null): string => {
  if (value === null) {
    return '—'
  }

  return `${value.toFixed(2)}%`
}

const getGrowthBadgeClasses = (value: number | null): string => {
  if (value === null || value === 0) {
    return 'bg-slate-800/80 text-slate-300'
  }

  if (value > 0) {
    return 'bg-emerald-500/10 text-emerald-300'
  }

  return 'bg-red-500/10 text-red-300'
}

const getGrowthIconClassName = (value: number | null): string => {
  if (value === null || value === 0) {
    return 'fa fa-minus text-[9px]'
  }

  if (value > 0) {
    return 'fa fa-arrow-up text-[9px]'
  }

  return 'fa fa-arrow-down text-[9px]'
}

type RevenueOverviewChartProps = {
  revenueOverview: RevenueOverview
}

type RevenueOverviewChartPoint = {
  month: string
  thisYear: number
  lastYear: number
}

const monthLabels: string[] = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

/** Returns date string for same month in previous year (e.g. "2026-01" -> "2025-01"). */
const getLastYearDate = (date: string): string => {
  const [yearString, monthString] = date.split('-')
  const year = Number(yearString)
  return `${year - 1}-${monthString}`
}

const buildRevenueChartData = (
  revenueOverview: RevenueOverview,
): RevenueOverviewChartPoint[] => {
  const thisYearByDate = new Map<string, number>()
  const lastYearByDate = new Map<string, number>()

  revenueOverview.thisYear.forEach((entry) => {
    const previous = thisYearByDate.get(entry.date) ?? 0
    thisYearByDate.set(entry.date, previous + entry.revenue)
  })

  revenueOverview.lastYear.forEach((entry) => {
    const previous = lastYearByDate.get(entry.date) ?? 0
    lastYearByDate.set(entry.date, previous + entry.revenue)
  })

  const thisYearDatesSorted = Array.from(thisYearByDate.keys()).sort(
    (a, b) => a.localeCompare(b),
  )

  return thisYearDatesSorted.map((date) => {
    const [yearString, monthString] = date.split('-')
    const monthIndex = Number(monthString) - 1
    const labelMonth = monthLabels[monthIndex] ?? monthString
    const labelYear = yearString.slice(2)
    const lastYearDate = getLastYearDate(date)

    return {
      month: `${labelMonth} '${labelYear}`,
      thisYear: thisYearByDate.get(date) ?? 0,
      lastYear: lastYearByDate.get(lastYearDate) ?? 0,
    }
  })
}

const RevenueOverviewChart = ({
  revenueOverview,
}: RevenueOverviewChartProps): ReactElement => {
  const data = buildRevenueChartData(revenueOverview)

  if (!data.length) {
    return (
      <div className="px-4 py-3 text-[11px] text-slate-400">
        No revenue data available for this selection.
      </div>
    )
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 8,
            right: 16,
            left: -16,
            bottom: 8,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis
            dataKey="month"
            stroke="#94a3b8"
            tickLine={false}
            tickMargin={8}
            fontSize={11}
          />
          <YAxis
            stroke="#94a3b8"
            tickLine={false}
            tickMargin={8}
            fontSize={11}
            tickFormatter={(value: number) => formatCurrency(Math.round(value))}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#020617',
              borderColor: '#1e293b',
              borderRadius: 8,
              fontSize: 11,
            }}
            labelStyle={{ color: '#e5e7eb', marginBottom: 4 }}
            formatter={(value: unknown, name: unknown) => {
              const numericValue =
                typeof value === 'number'
                  ? value
                  : Number(value as string) || 0
              const label =
                name === 'thisYear'
                  ? 'This year'
                  : name === 'lastYear'
                    ? 'Last year'
                    : String(name)

              return [`₹${formatCurrency(numericValue)}`, label]
            }}
          />
          <Legend
            verticalAlign="top"
            height={24}
            formatter={(value: unknown) => {
              if (value === 'thisYear') {
                return 'This year'
              }

              if (value === 'lastYear') {
                return 'Last year'
              }

              return String(value)
            }}
          />
          <Line
            type="monotone"
            dataKey="lastYear"
            stroke="#64748b"
            strokeWidth={2}
            dot={{ r: 2 }}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="thisYear"
            stroke="#22c55e"
            strokeWidth={2}
            dot={{ r: 2 }}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

type PickupTrendChartProps = {
  pickupTrend: PickupTrend
}

type PickupTrendChartPoint = {
  dateLabel: string
  thisYearRevenue: number
  lastYearRevenue: number
  thisYearRoomNights: number
  lastYearRoomNights: number
}

/** Returns date string for same day in previous year (e.g. "2026-02-07" -> "2025-02-07"). */
const getLastYearFullDate = (date: string): string => {
  const [yearString, monthString, dayString] = date.split('-')
  const year = Number(yearString)
  return `${year - 1}-${monthString}-${dayString}`
}

const buildPickupTrendChartData = (
  pickupTrend: PickupTrend,
): PickupTrendChartPoint[] => {
  const thisYearByDate = new Map<
    string,
    { revenue: number; roomNights: number }
  >()
  const lastYearByDate = new Map<
    string,
    { revenue: number; roomNights: number }
  >()

  pickupTrend.thisYearResult.forEach((entry) => {
    thisYearByDate.set(entry.date, {
      revenue: entry.revenue,
      roomNights: entry.roomNights,
    })
  })

  pickupTrend.lastYearResult.forEach((entry) => {
    lastYearByDate.set(entry.date, {
      revenue: entry.revenue,
      roomNights: entry.roomNights,
    })
  })

  const thisYearDatesSorted = Array.from(thisYearByDate.keys()).sort(
    (a, b) => a.localeCompare(b),
  )

  return thisYearDatesSorted.map((date) => {
    const [, monthString, dayString] = date.split('-')
    const monthIndex = Number(monthString) - 1
    const labelMonth = monthLabels[monthIndex] ?? monthString
    const lastYearDate = getLastYearFullDate(date)
    const thisData = thisYearByDate.get(date)
    const lastData = lastYearByDate.get(lastYearDate)

    return {
      dateLabel: `${dayString} ${labelMonth}`,
      thisYearRevenue: thisData?.revenue ?? 0,
      lastYearRevenue: lastData?.revenue ?? 0,
      thisYearRoomNights: thisData?.roomNights ?? 0,
      lastYearRoomNights: lastData?.roomNights ?? 0,
    }
  })
}

const PickupTrendChart = ({
  pickupTrend,
}: PickupTrendChartProps): ReactElement => {
  const data = buildPickupTrendChartData(pickupTrend)

  if (!data.length) {
    return (
      <div className="px-4 py-3 text-[11px] text-slate-400">
        No pickup trend data available for this selection.
      </div>
    )
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 8,
            right: 16,
            left: -16,
            bottom: 8,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis
            dataKey="dateLabel"
            stroke="#94a3b8"
            tickLine={false}
            tickMargin={8}
            fontSize={11}
          />
          <YAxis
            stroke="#94a3b8"
            tickLine={false}
            tickMargin={8}
            fontSize={11}
            tickFormatter={(value: number) => formatCurrency(Math.round(value))}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#020617',
              borderColor: '#1e293b',
              borderRadius: 8,
              fontSize: 11,
            }}
            labelStyle={{ color: '#e5e7eb', marginBottom: 4 }}
            formatter={(value: unknown, name: unknown) => {
              const numericValue =
                typeof value === 'number'
                  ? value
                  : Number(value as string) || 0
              const label =
                name === 'thisYearRevenue'
                  ? 'This year (₹)'
                  : name === 'lastYearRevenue'
                    ? 'Last year (₹)'
                    : String(name)

              return [`₹${formatCurrency(numericValue)}`, label]
            }}
          />
          <Legend
            verticalAlign="top"
            height={24}
            formatter={(value: unknown) => {
              if (value === 'thisYearRevenue') return 'This year'
              if (value === 'lastYearRevenue') return 'Last year'
              return String(value)
            }}
          />
          <Line
            type="monotone"
            dataKey="lastYearRevenue"
            stroke="#64748b"
            strokeWidth={2}
            dot={{ r: 2 }}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="thisYearRevenue"
            stroke="#22c55e"
            strokeWidth={2}
            dot={{ r: 2 }}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

const Dashboard = () => {
  const [overview, setOverview] = useState<TodaysOverview | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [selectedHotelName, setSelectedHotelName] = useState<string | null>(
    null,
  )
  const [revenueOverview, setRevenueOverview] =
    useState<RevenueOverview | null>(null)
  const [isLoadingRevenue, setIsLoadingRevenue] = useState(false)
  const [revenueErrorMessage, setRevenueErrorMessage] = useState<string | null>(
    null,
  )
  const [pickupTrend, setPickupTrend] = useState<PickupTrend | null>(null)
  const [isLoadingPickup, setIsLoadingPickup] = useState(false)
  const [pickupErrorMessage, setPickupErrorMessage] = useState<string | null>(
    null,
  )

  const handleFetchForSelectedHotel = (): void => {
    const token = localStorage.getItem('authToken')
    const selectedHotelHId = localStorage.getItem('selectedHotelHId')
    const storedHotelName = localStorage.getItem('selectedHotelName')

    if (storedHotelName) {
      setSelectedHotelName(storedHotelName)
    }

    if (!token || !selectedHotelHId) {
      setErrorMessage('Select a hotel to see today’s overview.')
      setOverview(null)
      setRevenueOverview(null)
      setRevenueErrorMessage('Select a hotel to see revenue overview.')
      setPickupTrend(null)
      setPickupErrorMessage('Select a hotel to see pickup trend.')
      return
    }

    // Today’s overview
    setIsLoading(true)
    setErrorMessage(null)

    fetchTodaysOverview(token, selectedHotelHId)
      .then((todaysOverview) => {
        setOverview(todaysOverview)
      })
      .catch((error: unknown) => {
        const fallbackMessage =
          'Unable to load today’s overview. Please try again.'

        if (error instanceof Error) {
          setErrorMessage(error.message || fallbackMessage)
        } else {
          setErrorMessage(fallbackMessage)
        }
      })
      .finally(() => {
        setIsLoading(false)
      })

    // Revenue overview (YOY by room type)
    setIsLoadingRevenue(true)
    setRevenueErrorMessage(null)

    fetchRevenueOverview(token, selectedHotelHId, 'YOY', 'room')
      .then((overviewResponse) => {
        setRevenueOverview(overviewResponse)
      })
      .catch((error: unknown) => {
        const fallbackMessage =
          'Unable to load revenue overview. Please try again.'

        if (error instanceof Error) {
          setRevenueErrorMessage(error.message || fallbackMessage)
        } else {
          setRevenueErrorMessage(fallbackMessage)
        }
      })
      .finally(() => {
        setIsLoadingRevenue(false)
      })

    // Pickup trend
    setIsLoadingPickup(true)
    setPickupErrorMessage(null)

    fetchPickupTrend(token, selectedHotelHId)
      .then((trendResponse) => {
        setPickupTrend(trendResponse)
      })
      .catch((error: unknown) => {
        const fallbackMessage =
          'Unable to load pickup trend. Please try again.'

        if (error instanceof Error) {
          setPickupErrorMessage(error.message || fallbackMessage)
        } else {
          setPickupErrorMessage(fallbackMessage)
        }
      })
      .finally(() => {
        setIsLoadingPickup(false)
      })
  }

  useEffect(() => {
    handleFetchForSelectedHotel()

    const handleHotelChanged = (): void => {
      handleFetchForSelectedHotel()
    }

    window.addEventListener('selectedHotelChanged', handleHotelChanged)

    return () => {
      window.removeEventListener('selectedHotelChanged', handleHotelChanged)
    }
  }, [])

  return (
    <section className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-emerald-300">
            <i className="fa fa-tachometer text-xs" aria-hidden="true" />
            <span>Today&apos;s Overview</span>
          </div>
          <h1 className="mt-3 text-2xl md:text-3xl font-semibold tracking-tight text-slate-50">
            {selectedHotelName ?? 'Select a hotel'}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Live performance snapshot with revenue, occupancy and rate metrics
            for today.
          </p>
        </div>
      </header>

      {errorMessage && (
        <p className="rounded-xl border border-red-500/50 bg-red-950/40 px-4 py-3 text-xs text-red-100">
          {errorMessage}
        </p>
      )}

      {isLoading && (
        <p className="text-xs text-slate-400">Loading today&apos;s overview…</p>
      )}

      {!isLoading && overview && (
        <div className="grid gap-4 md:grid-cols-3">
          {/* Revenue */}
          <article className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-linear-to-br from-emerald-500/10 via-slate-900 to-slate-950 px-4 py-4">
            <div className="absolute right-3 top-3 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
              Revenue
            </div>
            <p className="text-xs font-medium text-slate-300">Revenue (₹)</p>
            <p className="mt-2 text-3xl font-semibold text-emerald-300">
              ₹{formatCurrency(overview.revenue)}
            </p>
            <p
              className={`mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${getGrowthBadgeClasses(
                overview.revenueGrowthPercentage,
              )}`}
            >
              <i
                className={getGrowthIconClassName(
                  overview.revenueGrowthPercentage,
                )}
                aria-hidden="true"
              />
              <span>{formatPercentage(overview.revenueGrowthPercentage)}</span>
              <span className="text-[9px] opacity-80">vs yesterday</span>
            </p>
          </article>

          {/* ADR */}
          <article className="relative overflow-hidden rounded-2xl border border-sky-500/30 bg-linear-to-br from-sky-500/10 via-slate-900 to-slate-950 px-4 py-4">
            <div className="absolute right-3 top-3 rounded-full bg-sky-500/10 px-2 py-0.5 text-[10px] font-medium text-sky-300">
              Rate
            </div>
            <p className="text-xs font-medium text-slate-300">ADR</p>
            <p className="mt-2 text-3xl font-semibold text-sky-300">
              ₹{formatCurrency(overview.ADR)}
            </p>
            <p
              className={`mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${getGrowthBadgeClasses(
                overview.ADRGrowthPercentage,
              )}`}
            >
              <i
                className={getGrowthIconClassName(overview.ADRGrowthPercentage)}
                aria-hidden="true"
              />
              <span>{formatPercentage(overview.ADRGrowthPercentage)}</span>
              <span className="text-[9px] opacity-80">vs yesterday</span>
            </p>
          </article>

          {/* RevPAR */}
          <article className="relative overflow-hidden rounded-2xl border border-violet-500/30 bg-linear-to-br from-violet-500/10 via-slate-900 to-slate-950 px-4 py-4">
            <div className="absolute right-3 top-3 rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-medium text-violet-300">
              Rate & Rooms
            </div>
            <p className="text-xs font-medium text-slate-300">RevPAR</p>
            <p className="mt-2 text-3xl font-semibold text-violet-300">
              ₹{formatCurrency(overview.RevPAR)}
            </p>
            <p
              className={`mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${getGrowthBadgeClasses(
                overview.RevPARGrowthPercentage,
              )}`}
            >
              <i
                className={getGrowthIconClassName(
                  overview.RevPARGrowthPercentage,
                )}
                aria-hidden="true"
              />
              <span>{formatPercentage(overview.RevPARGrowthPercentage)}</span>
              <span className="text-[9px] opacity-80">vs yesterday</span>
            </p>
          </article>

          {/* Room Nights */}
          <article className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-linear-to-br from-amber-500/10 via-slate-900 to-slate-950 px-4 py-4">
            <div className="absolute right-3 top-3 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-300">
              Volume
            </div>
            <p className="text-xs font-medium text-slate-300">Room nights</p>
            <p className="mt-2 text-3xl font-semibold text-amber-300">
              {overview.roomNights}
            </p>
            <p
              className={`mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${getGrowthBadgeClasses(
                overview.roomNightsGrowthPercentage,
              )}`}
            >
              <i
                className={getGrowthIconClassName(
                  overview.roomNightsGrowthPercentage,
                )}
                aria-hidden="true"
              />
              <span>
                {formatPercentage(overview.roomNightsGrowthPercentage)}
              </span>
              <span className="text-[9px] opacity-80">vs yesterday</span>
            </p>
          </article>

          {/* Cancellations */}
          <article className="relative overflow-hidden rounded-2xl border border-red-500/40 bg-linear-to-br from-red-500/15 via-slate-900 to-slate-950 px-4 py-4">
            <div className="absolute right-3 top-3 rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-medium text-red-200">
              Risk
            </div>
            <p className="text-xs font-medium text-slate-300">Cancellations</p>
            <p className="mt-2 text-3xl font-semibold text-red-200">
              {overview.cancellation}
            </p>
            <p
              className={`mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${getGrowthBadgeClasses(
                overview.cancellationGrowthPercentage,
              )}`}
            >
              <i
                className={getGrowthIconClassName(
                  overview.cancellationGrowthPercentage,
                )}
                aria-hidden="true"
              />
              <span>
                {formatPercentage(overview.cancellationGrowthPercentage)}
              </span>
              <span className="text-[9px] opacity-80">vs yesterday</span>
            </p>
          </article>
        </div>
      )}

      {/* Revenue overview (YOY graph) */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between gap-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/70 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-slate-200">
            <i className="fa fa-bar-chart text-[11px]" aria-hidden="true" />
            <span>Revenue overview • YOY</span>
          </div>
        </div>

        {revenueErrorMessage && (
          <p className="rounded-xl border border-red-500/50 bg-red-950/40 px-4 py-3 text-xs text-red-100">
            {revenueErrorMessage}
          </p>
        )}

        {isLoadingRevenue && (
          <p className="text-xs text-slate-400">Loading revenue overview…</p>
        )}

        {!isLoadingRevenue && revenueOverview && (
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 px-2 pb-3 pt-2">
            <RevenueOverviewChart revenueOverview={revenueOverview} />
          </div>
        )}
      </div>

      {/* Pickup trend */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between gap-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/70 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-slate-200">
            <i className="fa fa-line-chart text-[11px]" aria-hidden="true" />
            <span>Pickup trend • daily revenue</span>
          </div>
        </div>

        {pickupErrorMessage && (
          <p className="rounded-xl border border-red-500/50 bg-red-950/40 px-4 py-3 text-xs text-red-100">
            {pickupErrorMessage}
          </p>
        )}

        {isLoadingPickup && (
          <p className="text-xs text-slate-400">Loading pickup trend…</p>
        )}

        {!isLoadingPickup && pickupTrend && (
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 px-2 pb-3 pt-2">
            <PickupTrendChart pickupTrend={pickupTrend} />
          </div>
        )}
      </div>
    </section>
  )
}

export default Dashboard

