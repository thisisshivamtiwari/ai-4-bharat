export type TodaysOverview = {
  revenue: number
  revenueGrowthPercentage: number
  occupancy: number
  occupancyGrowthPercentage: number
  ADR: number
  ADRGrowthPercentage: number
  RevPAR: number
  RevPARGrowthPercentage: number
  roomNights: number
  roomNightsGrowthPercentage: number
  cancellation: number
  cancellationGrowthPercentage: number
}

type TodaysOverviewResponse = {
  success: boolean
  code: number
  message: string
  data: TodaysOverview
}

const API_BASE_URL = 'https://kmhserver.knowmyhotel.com/api'

export const fetchTodaysOverview = async (
  token: string,
  hotelId: string,
): Promise<TodaysOverview> => {
  const url = new URL(`${API_BASE_URL}/dashboard/todaysOverview`)
  url.searchParams.set('hId', hotelId)

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Authorization: token,
    },
  })

  if (!response.ok) {
    throw new Error('Unable to fetch today’s overview. Please try again.')
  }

  const responseBody = (await response.json()) as TodaysOverviewResponse

  if (!responseBody.success || !responseBody.data) {
    throw new Error(responseBody.message || 'Invalid dashboard response.')
  }

  return responseBody.data
}

export type RevenueOverviewPoint = {
  revenue: number
  date: string
  roomType: string
}

export type RevenueOverview = {
  thisYear: RevenueOverviewPoint[]
  lastYear: RevenueOverviewPoint[]
}

type RevenueOverviewResponse = {
  success: boolean
  code: number
  message: string
  data: RevenueOverview
}

export const fetchRevenueOverview = async (
  token: string,
  hotelId: string,
  timePeriod: string,
  type: string,
): Promise<RevenueOverview> => {
  const url = new URL(`${API_BASE_URL}/dashboard/revenueOverview`)
  url.searchParams.set('hId', hotelId)
  url.searchParams.set('timePeriod', timePeriod)
  url.searchParams.set('type', type)

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Authorization: token,
    },
  })

  if (!response.ok) {
    throw new Error('Unable to fetch revenue overview. Please try again.')
  }

  const responseBody = (await response.json()) as RevenueOverviewResponse

  if (!responseBody.success || !responseBody.data) {
    throw new Error(responseBody.message || 'Invalid revenue overview response.')
  }

  return responseBody.data
}

export type PickupTrendPoint = {
  date: string
  roomNights: number
  revenue: number
  ADR: number
}

export type PickupTrend = {
  thisYearResult: PickupTrendPoint[]
  lastYearResult: PickupTrendPoint[]
}

type PickupTrendResponse = {
  success: boolean
  code: number
  message: string
  data: PickupTrend
}

export const fetchPickupTrend = async (
  token: string,
  hotelId: string,
): Promise<PickupTrend> => {
  const url = new URL(`${API_BASE_URL}/dashboard/pickupTrend`)
  url.searchParams.set('hId', hotelId)

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Authorization: token,
    },
  })

  if (!response.ok) {
    throw new Error('Unable to fetch pickup trend. Please try again.')
  }

  const responseBody = (await response.json()) as PickupTrendResponse

  if (!responseBody.success || !responseBody.data) {
    throw new Error(responseBody.message || 'Invalid pickup trend response.')
  }

  return responseBody.data
}

export type RateSuggestionRoomRate = {
  checkIn: string
  roomName: string
  roomPlan: string
  price: number
}

export type RateSuggestionDay = {
  date: string
  occupiedRooms: number
  confidence: number
  suggestedRate: number
  explanation?: string
  cmpRate: number | null
  rates: RateSuggestionRoomRate[]
}

export type RateSuggestion = {
  suggestedRate: RateSuggestionDay[]
}

type RateSuggestionResponse = {
  success: boolean
  code: number
  message: string
  data: RateSuggestion
}

export const fetchRateSuggestion = async (
  token: string,
  hotelId: string,
): Promise<RateSuggestion> => {
  const url = `${API_BASE_URL}/dashboard/rateSuggestion/${hotelId}`

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: token,
    },
  })

  if (!response.ok) {
    throw new Error('Unable to fetch rate suggestion. Please try again.')
  }

  const responseBody = (await response.json()) as RateSuggestionResponse

  if (!responseBody.success || !responseBody.data) {
    throw new Error(responseBody.message || 'Invalid rate suggestion response.')
  }

  return responseBody.data
}
