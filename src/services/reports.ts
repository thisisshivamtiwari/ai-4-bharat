const API_BASE_URL = 'https://kmhserver.knowmyhotel.com/api'

export type MonthEndStatistics = {
  ADR: number
  Revenue: number
  RoomNights: number
  Reservations: number
  Cancellations: number
  Occupancy: number
}

export type MonthEndSourceRow = {
  Source?: string
  sourceSegment?: string
  ADR?: number | string
  RevPAR?: number | string
  Revenue?: number
  'Average Lead'?: number | string
  'Room Nights'?: number
  Occupancy?: number | string
  Cancellations?: number
  Reservations?: number
}

export type MonthEndMomGrowthRow = {
  Source: string
  sourceSegment: string
  currentRevenue: number
  comparisonRevenue: number
  RevenueGrowthPercent: number
  currentADR: number
  comparisonADR: number
  ADRGrowthPercent: number
  currentRevPAR: number
  comparisonRevPAR: number
  RevPARGrowthPercent: number
  currentReservations: number
  comparisonReservations: number
  ReservationsGrowthPercent: number
  currentRoomNights: number
  comparisonRoomNights: number
  RoomNightsGrowthPercent: number
  currentCancellations: number
  comparisonCancellations: number
  CancellationsGrowthPercent: number
  [key: string]: unknown
}

export type MonthEndRoomRow = {
  RoomType: string
  Revenue: number
  Reservations: number
  ADR: number
  'Room Nights': number
  Occupancy: number
  'Average Lead': number
  Cancellations: number
  RevPAR: number
}

export type MonthEndReportData = {
  currencySymbol: string
  statistics: MonthEndStatistics[]
  sourceData: MonthEndSourceRow[]
  mOmSourceData?: MonthEndSourceRow[]
  mOmOTAGrowth?: MonthEndMomGrowthRow[]
  yOySourceData?: MonthEndSourceRow[]
  yOyOTAGrowth?: MonthEndMomGrowthRow[]
  roomData: MonthEndRoomRow[]
  nextMonth?: Array<{
    Revenue: number
    Reservations: number
    ADR: number
    'Room Nights': number
    Occupancy: number
    RevPAR: number
    'Average Lead': number
    Cancellations: number
  }>
  twoMonthLOS?: Array<{ 'Current Month': number; 'Next Month': number }>
  BOB?: Array<{
    averageLead: number
    roomNights: number
    cancellations: number
    occupancy: number
    revenue: number
    reservations: number
    ADR: number
    RevPAR: number
  }>
  reviews: unknown[]
  hotelName: string
  asOn: { startDate: string; endDate: string }
}

type MonthEndReportResponse = {
  status: boolean
  code: number
  message: string
  data: MonthEndReportData
}

export const fetchMonthEndReport = async (
  token: string,
  hotelId: string,
  startDate: string,
  endDate: string,
): Promise<MonthEndReportData> => {
  const url = new URL(`${API_BASE_URL}/report/monthEndReport`)
  url.searchParams.set('hId', hotelId)
  url.searchParams.set('startDate', startDate)
  url.searchParams.set('endDate', endDate)

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Authorization: token,
    },
  })

  if (!response.ok) {
    throw new Error('Unable to fetch month end report. Please try again.')
  }

  const body = (await response.json()) as MonthEndReportResponse

  if (!body.status || !body.data) {
    throw new Error(body.message || 'Invalid month end report response.')
  }

  return body.data
}
