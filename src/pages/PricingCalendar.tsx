import type { ReactElement } from 'react'
import { useCallback, useEffect, useState } from 'react'
import type { RateSuggestion, RateSuggestionDay } from '../services/dashboard'
import { fetchRateSuggestion } from '../services/dashboard'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const formatCurrency = (value: number): string => {
  return value.toLocaleString('en-IN', { maximumFractionDigits: 0 })
}

const getDaysInMonth = (year: number, month: number): Date[] => {
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)
  const days: Date[] = []
  for (let d = new Date(first); d <= last; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d))
  }
  return days
}

const toDateKey = (date: Date): string => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const formatDisplayDate = (dateStr: string): string => {
  const d = new Date(dateStr + 'Z')
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

type PricingCalendarProps = {
  rateSuggestion: RateSuggestion
  selectedDay: RateSuggestionDay | null
  onSelectDay: (day: RateSuggestionDay | null) => void
}

const CalendarGrid = ({
  rateSuggestion,
  selectedDay,
  onSelectDay,
}: PricingCalendarProps): ReactElement => {
  const firstDateInData =
    rateSuggestion.suggestedRate.length > 0
      ? rateSuggestion.suggestedRate[0].date
      : null
  const [viewDate, setViewDate] = useState(() => {
    if (firstDateInData != null) {
      const [y, m] = firstDateInData.split('-').map(Number)
      return new Date(y, m - 1)
    }
    return new Date()
  })
  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  const dateMap = useCallback(() => {
    const map = new Map<string, RateSuggestionDay>()
    rateSuggestion.suggestedRate.forEach((day) => {
      map.set(day.date, day)
    })
    return map
  }, [rateSuggestion.suggestedRate])

  const map = dateMap()
  const days = getDaysInMonth(year, month)
  const firstDay = new Date(year, month, 1).getDay()
  const padding = firstDay

  const handlePrevMonth = (): void => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1))
  }

  const handleNextMonth = (): void => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1))
  }

  const monthLabel = viewDate.toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  })

  const getDemandStyles = (
    day: RateSuggestionDay,
  ): { border: string; bg: string; rate: string } => {
    if (day.occupiedRooms >= 18) {
      return {
        border: 'border-emerald-500/40',
        bg: 'bg-linear-to-br from-emerald-500/15 to-emerald-600/5',
        rate: 'text-emerald-300',
      }
    }
    if (day.occupiedRooms >= 10) {
      return {
        border: 'border-amber-500/40',
        bg: 'bg-linear-to-br from-amber-500/15 to-amber-600/5',
        rate: 'text-amber-300',
      }
    }
    return {
      border: 'border-slate-600/60',
      bg: 'bg-slate-800/50',
      rate: 'text-sky-300',
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900/50 shadow-xl shadow-slate-950/50 backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-slate-700/80 bg-slate-800/40 px-4 py-3">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-600/80 bg-slate-800/80 text-slate-300 transition hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:text-emerald-300"
          aria-label="Previous month"
        >
          <i className="fa fa-chevron-left text-sm" aria-hidden="true" />
        </button>
        <span className="text-base font-semibold tracking-tight text-slate-100">
          {monthLabel}
        </span>
        <button
          type="button"
          onClick={handleNextMonth}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-600/80 bg-slate-800/80 text-slate-300 transition hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:text-emerald-300"
          aria-label="Next month"
        >
          <i className="fa fa-chevron-right text-sm" aria-hidden="true" />
        </button>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          {WEEKDAYS.map((w) => (
            <div key={w}>{w}</div>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-7 gap-2">
          {Array.from({ length: padding }, (_, i) => (
            <div key={`pad-${i}`} className="aspect-square min-h-18" />
          ))}
          {days.map((date) => {
            const key = toDateKey(date)
            const dayData = map.get(key)
            const isSelected = selectedDay?.date === key
            const styles = dayData ? getDemandStyles(dayData) : null

            return (
              <button
                key={key}
                type="button"
                onClick={() => onSelectDay(dayData ?? null)}
                className={`flex min-h-18 flex-col items-center justify-center rounded-xl border text-[11px] transition-all duration-200 ${
                  styles
                    ? `${styles.border} ${styles.bg} shadow-md hover:scale-[1.02] hover:shadow-lg`
                    : 'border-slate-800/50 bg-slate-900/30 opacity-60'
                } ${isSelected ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-slate-900 shadow-lg shadow-emerald-500/20' : ''}`}
                aria-label={
                  dayData
                    ? `Rate for ${key}: ₹${formatCurrency(dayData.suggestedRate)}`
                    : `No data for ${key}`
                }
              >
                <span
                  className={
                    dayData
                      ? 'text-sm font-medium text-slate-200'
                      : 'text-slate-500'
                  }
                >
                  {date.getDate()}
                </span>
                {dayData && (
                  <>
                    <span
                      className={`mt-1 font-bold ${styles?.rate ?? 'text-emerald-300'}`}
                    >
                      ₹{formatCurrency(dayData.suggestedRate)}
                    </span>
                    <span className="mt-0.5 rounded-full bg-slate-900/50 px-1.5 py-0.5 text-[9px] font-medium text-slate-400">
                      {dayData.confidence}%
                    </span>
                  </>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

type DayDetailPanelProps = {
  day: RateSuggestionDay
  onClose: () => void
}

const DayDetailPanel = ({ day, onClose }: DayDetailPanelProps): ReactElement => {
  return (
    <div className="rounded-2xl border border-slate-700/80 bg-slate-900/60 shadow-xl shadow-slate-950/50 backdrop-blur-sm overflow-hidden">
      <div className="border-b border-slate-700/80 bg-slate-800/40 px-4 py-3 flex items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold tracking-tight text-slate-50">
            {formatDisplayDate(day.date)}
          </h3>
          <p className="mt-0.5 text-[11px] text-slate-400">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-emerald-300">
              {day.confidence}% confidence
            </span>
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-700/80 hover:text-slate-200"
          aria-label="Close"
        >
          <i className="fa fa-times text-sm" aria-hidden="true" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-3">
            <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
              Suggested rate
            </span>
            <p className="mt-1 text-lg font-bold text-emerald-300">
              ₹{formatCurrency(day.suggestedRate)}
            </p>
          </div>
          {day.cmpRate != null && (
            <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 px-3 py-3">
              <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                Competitor
              </span>
              <p className="mt-1 text-lg font-bold text-sky-300">
                ₹{formatCurrency(day.cmpRate)}
              </p>
            </div>
          )}
          <div className="rounded-xl border border-slate-600/60 bg-slate-800/50 px-3 py-3 col-span-2">
            <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
              Occupied rooms
            </span>
            <p className="mt-1 text-xl font-semibold text-slate-200">
              {day.occupiedRooms}
            </p>
          </div>
        </div>

        {day.explanation && (
          <div className="rounded-xl border border-slate-700/80 bg-slate-800/50 px-4 py-3">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Explanation
            </span>
            <p className="mt-2 text-xs text-slate-300 leading-relaxed">
              {day.explanation}
            </p>
          </div>
        )}

        {day.rates.length > 0 && (
          <div>
            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Room rates
            </h4>
            <div className="overflow-x-auto rounded-xl border border-slate-700/80">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="border-b border-slate-700 bg-slate-800/80 text-left">
                    <th className="px-3 py-2.5 font-semibold text-slate-300">
                      Room
                    </th>
                    <th className="px-3 py-2.5 font-semibold text-slate-300">
                      Plan
                    </th>
                    <th className="px-3 py-2.5 font-semibold text-slate-300 text-right">
                      Price (₹)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {day.rates.map((rate, idx) => (
                    <tr
                      key={`${rate.roomName}-${rate.roomPlan}-${idx}`}
                      className="border-b border-slate-800/80 last:border-0 hover:bg-slate-800/50 transition"
                    >
                      <td className="px-3 py-2.5 text-slate-200">
                        {rate.roomName}
                      </td>
                      <td className="px-3 py-2.5 text-slate-400">
                        {rate.roomPlan}
                      </td>
                      <td className="px-3 py-2.5 text-right font-semibold text-emerald-300">
                        {formatCurrency(rate.price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const PricingCalendar = (): ReactElement => {
  const [rateSuggestion, setRateSuggestion] = useState<RateSuggestion | null>(
    null,
  )
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [selectedDay, setSelectedDay] = useState<RateSuggestionDay | null>(null)

  const handleFetch = useCallback((): void => {
    const token = localStorage.getItem('authToken')
    const hotelId = localStorage.getItem('selectedHotelHId')

    if (!token || !hotelId) {
      setErrorMessage('Select a hotel to see the pricing calendar.')
      setRateSuggestion(null)
      return
    }

    setIsLoading(true)
    setErrorMessage(null)

    fetchRateSuggestion(token, hotelId)
      .then((data) => {
        setRateSuggestion(data)
        setSelectedDay(null)
      })
      .catch((err: unknown) => {
        setErrorMessage(
          err instanceof Error ? err.message : 'Failed to load rate suggestions.',
        )
        setRateSuggestion(null)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  useEffect(() => {
    handleFetch()
    const handleHotelChanged = (): void => handleFetch()
    window.addEventListener('selectedHotelChanged', handleHotelChanged)
    return () => window.removeEventListener('selectedHotelChanged', handleHotelChanged)
  }, [handleFetch])

  return (
    <section className="space-y-6">
      <header>
        <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/40 bg-sky-950/40 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-sky-300">
          <i className="fa fa-calendar-check-o text-xs" aria-hidden="true" />
          <span>Pricing Calendar</span>
        </div>
        <h1 className="mt-3 text-2xl md:text-3xl font-semibold tracking-tight text-slate-50">
          Rate suggestions by day
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Suggested rates, occupancy and room-wise prices. Click a day for
          details.
        </p>
      </header>

      {errorMessage && (
        <p className="rounded-xl border border-red-500/50 bg-red-950/40 px-4 py-3 text-xs text-red-100">
          {errorMessage}
        </p>
      )}

      {isLoading && (
        <p className="text-xs text-slate-400">Loading pricing calendar…</p>
      )}

      {!isLoading && rateSuggestion && (
        <div className="grid gap-6 lg:grid-cols-[1fr,320px]">
          <CalendarGrid
            rateSuggestion={rateSuggestion}
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
          />
          <div className="lg:sticky lg:top-24 lg:self-start">
            {selectedDay ? (
              <DayDetailPanel
                day={selectedDay}
                onClose={() => setSelectedDay(null)}
              />
            ) : (
              <div className="rounded-2xl border border-slate-700/80 border-dashed bg-slate-900/40 p-8 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800/80 text-slate-500">
                  <i className="fa fa-calendar-check-o text-2xl" aria-hidden="true" />
                </div>
                <p className="text-sm font-medium text-slate-300">
                  Select a day
                </p>
                <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">
                  Click any date on the calendar to see the suggested rate,
                  explanation and room-wise prices.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {!isLoading && rateSuggestion && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-800/80 bg-slate-900/50 px-4 py-3">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Demand
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-[11px] font-medium text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            High (18+ rooms)
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-[11px] font-medium text-amber-300">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            Medium (10+)
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-600/50 bg-slate-800/50 px-3 py-1.5 text-[11px] font-medium text-slate-400">
            <span className="h-2 w-2 rounded-full bg-sky-400" />
            Normal
          </span>
        </div>
      )}
    </section>
  )
}

export default PricingCalendar
