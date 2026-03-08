import { useCallback, useEffect, useState } from 'react'
import type { MonthEndReportData } from '../services/reports'
import { fetchMonthEndReport } from '../services/reports'

const toNum = (v: number | string | undefined): number =>
  typeof v === 'number' ? v : typeof v === 'string' ? parseFloat(v) || 0 : 0

const formatNum = (v: number | string | undefined, symbol = ''): string => {
  const n = toNum(v)
  if (Number.isNaN(n)) return '—'
  return `${symbol}${n.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
}

const formatPct = (v: number): string => {
  if (Number.isNaN(v)) return '—'
  const sign = v >= 0 ? '+' : ''
  return `${sign}${v.toFixed(2)}%`
}

const getGrowthClass = (v: number): string => {
  if (v > 0) return 'text-emerald-300'
  if (v < 0) return 'text-red-300'
  return 'text-slate-400'
}

const getDefaultMonthRange = (): { start: string; end: string } => {
  const d = new Date()
  const y = d.getFullYear()
  const m = d.getMonth()
  const lastMonth = m === 0 ? 11 : m - 1
  const year = m === 0 ? y - 1 : y
  const start = `${year}-${String(lastMonth + 1).padStart(2, '0')}-01`
  const lastDay = new Date(year, lastMonth + 1, 0).getDate()
  const end = `${year}-${String(lastMonth + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
  return { start, end }
}

const MonthEndReport = (): JSX.Element => {
  const defaultRange = getDefaultMonthRange()
  const [startDate, setStartDate] = useState(defaultRange.start)
  const [endDate, setEndDate] = useState(defaultRange.end)
  const [report, setReport] = useState<MonthEndReportData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFetch = useCallback((): void => {
    const token = localStorage.getItem('authToken')
    const hotelId = localStorage.getItem('selectedHotelHId')
    if (!token || !hotelId) {
      setError('Select a hotel to see the month end report.')
      setReport(null)
      return
    }
    setLoading(true)
    setError(null)
    fetchMonthEndReport(token, hotelId, startDate, endDate)
      .then(setReport)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load report.')
        setReport(null)
      })
      .finally(() => setLoading(false))
  }, [startDate, endDate])

  useEffect(() => {
    handleFetch()
  }, [handleFetch])

  useEffect(() => {
    const onHotelChange = (): void => handleFetch()
    window.addEventListener('selectedHotelChanged', onHotelChange)
    return () => window.removeEventListener('selectedHotelChanged', onHotelChange)
  }, [handleFetch])

  const symbol = report?.currencySymbol ?? '₹'

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/40 bg-violet-950/40 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-violet-300">
            <i className="fa fa-line-chart text-xs" aria-hidden="true" />
            <span>Month End Report</span>
          </div>
          <h1 className="mt-3 text-2xl md:text-3xl font-semibold tracking-tight text-slate-50">
            {report?.hotelName ?? 'Month end report'}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Revenue, reservations and channel breakdown for the selected period.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex flex-col gap-1 text-[11px] text-slate-400">
            Start
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-800/80 px-2 py-1.5 text-slate-100"
            />
          </label>
          <label className="flex flex-col gap-1 text-[11px] text-slate-400">
            End
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-800/80 px-2 py-1.5 text-slate-100"
            />
          </label>
          <button
            type="button"
            onClick={handleFetch}
            disabled={loading}
            className="rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-50"
          >
            {loading ? 'Loading…' : 'Apply'}
          </button>
        </div>
      </header>

      {error && (
        <p className="rounded-xl border border-red-500/50 bg-red-950/40 px-4 py-3 text-xs text-red-100">
          {error}
        </p>
      )}

      {loading && !report && (
        <p className="text-sm text-slate-400">Loading report…</p>
      )}

      {report && report.statistics.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {report.statistics.map((stat, i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4"
            >
              <p className="text-[11px] font-medium uppercase text-slate-400 tracking-wide">
                Summary
              </p>
              <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
                <span className="text-slate-400">Revenue</span>
                <span className="text-right font-semibold text-emerald-300">
                  {formatNum(stat.Revenue, symbol)}
                </span>
                <span className="text-slate-400">Room nights</span>
                <span className="text-right text-slate-200">
                  {formatNum(stat.RoomNights)}
                </span>
                <span className="text-slate-400">Reservations</span>
                <span className="text-right text-slate-200">
                  {formatNum(stat.Reservations)}
                </span>
                <span className="text-slate-400">ADR</span>
                <span className="text-right text-slate-200">
                  {formatNum(stat.ADR, symbol)}
                </span>
                <span className="text-slate-400">Cancellations</span>
                <span className="text-right text-slate-200">
                  {formatNum(stat.Cancellations)}
                </span>
                <span className="text-slate-400">Occupancy</span>
                <span className="text-right text-slate-200">
                  {formatNum(stat.Occupancy)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {report && report.sourceData.length > 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 overflow-hidden">
          <h2 className="border-b border-slate-800 bg-slate-900/90 px-4 py-2 text-sm font-semibold text-slate-100">
            Revenue by source
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-800/80 text-left">
                  <th className="px-3 py-2 font-semibold text-slate-300">
                    Source
                  </th>
                  <th className="px-3 py-2 font-semibold text-slate-300 text-right">
                    Revenue
                  </th>
                  <th className="px-3 py-2 font-semibold text-slate-300 text-right">
                    Room nights
                  </th>
                  <th className="px-3 py-2 font-semibold text-slate-300 text-right">
                    Reservations
                  </th>
                  <th className="px-3 py-2 font-semibold text-slate-300 text-right">
                    ADR
                  </th>
                  <th className="px-3 py-2 font-semibold text-slate-300 text-right">
                    RevPAR
                  </th>
                  <th className="px-3 py-2 font-semibold text-slate-300 text-right">
                    Cancellations
                  </th>
                </tr>
              </thead>
              <tbody>
                {report.sourceData.map((row, i) => (
                  <tr
                    key={i}
                    className={`border-b border-slate-800/80 ${
                      row.Source === 'Total'
                        ? 'bg-slate-800/60 font-semibold text-slate-100'
                        : 'text-slate-300'
                    }`}
                  >
                    <td className="px-3 py-2">{row.Source ?? '—'}</td>
                    <td className="px-3 py-2 text-right text-emerald-300">
                      {formatNum(row.Revenue, symbol)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {formatNum(row['Room Nights'])}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {formatNum(row.Reservations)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {formatNum(row.ADR, symbol)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {formatNum(row.RevPAR, symbol)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {formatNum(row.Cancellations)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {report && report.roomData.length > 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 overflow-hidden">
          <h2 className="border-b border-slate-800 bg-slate-900/90 px-4 py-2 text-sm font-semibold text-slate-100">
            Revenue by room type
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-800/80 text-left">
                  <th className="px-3 py-2 font-semibold text-slate-300">
                    Room type
                  </th>
                  <th className="px-3 py-2 font-semibold text-slate-300 text-right">
                    Revenue
                  </th>
                  <th className="px-3 py-2 font-semibold text-slate-300 text-right">
                    Room nights
                  </th>
                  <th className="px-3 py-2 font-semibold text-slate-300 text-right">
                    Reservations
                  </th>
                  <th className="px-3 py-2 font-semibold text-slate-300 text-right">
                    ADR
                  </th>
                  <th className="px-3 py-2 font-semibold text-slate-300 text-right">
                    RevPAR
                  </th>
                  <th className="px-3 py-2 font-semibold text-slate-300 text-right">
                    Cancellations
                  </th>
                </tr>
              </thead>
              <tbody>
                {report.roomData.map((row, i) => (
                  <tr
                    key={i}
                    className="border-b border-slate-800/80 text-slate-300"
                  >
                    <td className="px-3 py-2">{row.RoomType}</td>
                    <td className="px-3 py-2 text-right text-emerald-300">
                      {formatNum(row.Revenue, symbol)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {formatNum(row['Room Nights'])}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {formatNum(row.Reservations)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {formatNum(row.ADR, symbol)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {formatNum(row.RevPAR, symbol)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {formatNum(row.Cancellations)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {report && report.mOmOTAGrowth && report.mOmOTAGrowth.length > 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 overflow-hidden">
          <h2 className="border-b border-slate-800 bg-slate-900/90 px-4 py-2 text-sm font-semibold text-slate-100">
            Month-over-month OTA growth
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-800/80 text-left">
                  <th className="px-3 py-2 font-semibold text-slate-300">
                    Source
                  </th>
                  <th className="px-3 py-2 font-semibold text-slate-300 text-right">
                    Revenue growth
                  </th>
                  <th className="px-3 py-2 font-semibold text-slate-300 text-right">
                    ADR growth
                  </th>
                  <th className="px-3 py-2 font-semibold text-slate-300 text-right">
                    Reservations growth
                  </th>
                  <th className="px-3 py-2 font-semibold text-slate-300 text-right">
                    Room nights growth
                  </th>
                  <th className="px-3 py-2 font-semibold text-slate-300 text-right">
                    Cancellations growth
                  </th>
                </tr>
              </thead>
              <tbody>
                {report.mOmOTAGrowth.map((row, i) => (
                  <tr
                    key={i}
                    className="border-b border-slate-800/80 text-slate-300"
                  >
                    <td className="px-3 py-2">{row.Source}</td>
                    <td
                      className={`px-3 py-2 text-right ${getGrowthClass(row.RevenueGrowthPercent)}`}
                    >
                      {formatPct(row.RevenueGrowthPercent)}
                    </td>
                    <td
                      className={`px-3 py-2 text-right ${getGrowthClass(row.ADRGrowthPercent)}`}
                    >
                      {formatPct(row.ADRGrowthPercent)}
                    </td>
                    <td
                      className={`px-3 py-2 text-right ${getGrowthClass(row.ReservationsGrowthPercent)}`}
                    >
                      {formatPct(row.ReservationsGrowthPercent)}
                    </td>
                    <td
                      className={`px-3 py-2 text-right ${getGrowthClass(row.RoomNightsGrowthPercent)}`}
                    >
                      {formatPct(row.RoomNightsGrowthPercent)}
                    </td>
                    <td
                      className={`px-3 py-2 text-right ${getGrowthClass(row.CancellationsGrowthPercent)}`}
                    >
                      {formatPct(row.CancellationsGrowthPercent)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {report?.asOn && (
        <p className="text-[11px] text-slate-500">
          Report period: {report.asOn.startDate.slice(0, 10)} to{' '}
          {report.asOn.endDate.slice(0, 10)}
        </p>
      )}
    </section>
  )
}

export default MonthEndReport
