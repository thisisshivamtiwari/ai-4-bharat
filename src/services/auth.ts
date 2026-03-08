export type LoginCredentials = {
  email: string
  password: string
}

export type LoginResponseData = {
  userId: string
  name: string
  phoneNumber: string
  email: string
  properties: unknown[]
  step: number
  token: string
}

export type LoginResponse = {
  success: boolean
  code: number
  message: string
  data: LoginResponseData
}

const API_BASE_URL = 'https://kmhserver.knowmyhotel.com/api'

export const loginUser = async (
  credentials: LoginCredentials,
): Promise<LoginResponseData> => {
  const response = await fetch(`${API_BASE_URL}/user/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  })

  if (!response.ok) {
    throw new Error('Unable to login. Please try again.')
  }

  const responseBody = (await response.json()) as LoginResponse

  if (!responseBody.success || !responseBody.data) {
    throw new Error(responseBody.message || 'Invalid login response.')
  }

  return responseBody.data
}

