export type Property = {
  propertyLogo: string
  step: number
  hId: number
  propertyName: string
}

type PropertyListResponse = {
  success: boolean
  code: number
  message: string
  data: {
    properties: Property[]
  }
}

const API_BASE_URL = 'https://kmhserver.knowmyhotel.com/api'

export const fetchProperties = async (token: string): Promise<Property[]> => {
  const response = await fetch(`${API_BASE_URL}/property/propertyList`, {
    method: 'GET',
    headers: {
      Authorization: token,
    },
  })

  if (!response.ok) {
    throw new Error('Unable to fetch properties. Please try again.')
  }

  const responseBody = (await response.json()) as PropertyListResponse

  if (!responseBody.success || !responseBody.data?.properties) {
    throw new Error(responseBody.message || 'Invalid property list response.')
  }

  return responseBody.data.properties
}

