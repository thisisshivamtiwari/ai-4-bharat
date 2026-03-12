import type { ChangeEvent, FormEvent, KeyboardEvent } from 'react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginUser } from '../services/auth'

type LoginFormValues = {
  email: string
  password: string
  rememberMe: boolean
}

const DEMO_EMAIL = 'demo.user@example.com'
const DEMO_PASSWORD = 'Demo@123'
const REAL_LOGIN_EMAIL = 'shivam.sharma@retvenstechnologies.com'
const REAL_LOGIN_PASSWORD = '12345'

const Login = () => {
  const navigate = useNavigate()
  const [formValues, setFormValues] = useState<LoginFormValues>({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    rememberMe: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement>,
  ): void => {
    const { name, value, type, checked } = event.target

    setFormValues((previousValues) => ({
      ...previousValues,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault()

    if (isSubmitting) {
      return
    }

    setErrorMessage(null)
    setSuccessMessage(null)
    setIsSubmitting(true)

    try {
      const loginResponseData = await loginUser({
        email: REAL_LOGIN_EMAIL,
        password: REAL_LOGIN_PASSWORD,
      })

      localStorage.setItem('authToken', loginResponseData.token)
      localStorage.setItem('authUser', JSON.stringify(loginResponseData))

      setFormValues((previousValues) => ({
        ...previousValues,
        password: '',
      }))

      setSuccessMessage('Login Successfully 😊')
      navigate('/dashboard', { replace: true })
    } catch (error) {
      const fallbackMessage = 'Login failed. Please check your details and try again.'

      if (error instanceof Error) {
        setErrorMessage(error.message || fallbackMessage)
      } else {
        setErrorMessage(fallbackMessage)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyDownOnLink = (
    event: KeyboardEvent<HTMLAnchorElement>,
  ): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.currentTarget.click()
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <main className="w-full max-w-md rounded-2xl bg-slate-900/80 border border-slate-800 shadow-2xl shadow-slate-950/50 p-6 sm:p-8">
        <header className="mb-6 space-y-2 text-center">
          <p className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-950/40 px-3 py-1 text-xs font-medium uppercase tracking-[0.25em] text-emerald-300">
            Sign in
          </p>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-50">
            Welcome back
          </h1>
          <p className="text-sm text-slate-400">
            Enter your credentials to access your account.
          </p>
        </header>

        {errorMessage && (
          <p className="mb-4 rounded-md border border-red-500/60 bg-red-950/40 px-3 py-2 text-xs text-red-100">
            {errorMessage}
          </p>
        )}

        {successMessage && (
          <p className="mb-4 rounded-md border border-emerald-500/60 bg-emerald-950/40 px-3 py-2 text-xs text-emerald-100">
            {successMessage}
          </p>
        )}

        <form className="space-y-5" onSubmit={handleSubmit} aria-label="Login form">
          <section
            className="rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-xs text-slate-300"
            aria-label="Dummy login credentials"
          >
            <p className="font-semibold text-slate-100">Demo credentials</p>
            <p className="mt-1">
              <span className="font-medium text-slate-200">Email:</span>{' '}
              <span className="font-mono text-emerald-300">{DEMO_EMAIL}</span>
            </p>
            <p className="mt-0.5">
              <span className="font-medium text-slate-200">Password:</span>{' '}
              <span className="font-mono text-emerald-300">{DEMO_PASSWORD}</span>
            </p>
          </section>
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-200"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formValues.email}
              onChange={handleInputChange}
              className="block w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 outline-none ring-emerald-500/70 transition focus:border-emerald-500/80 focus:ring-2"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-200"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={formValues.password}
              onChange={handleInputChange}
              className="block w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 outline-none ring-emerald-500/70 transition focus:border-emerald-500/80 focus:ring-2"
              placeholder="********"
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <label className="inline-flex items-center gap-2 text-xs text-slate-300">
              <input
                id="rememberMe"
                name="rememberMe"
                type="checkbox"
                checked={formValues.rememberMe}
                onChange={handleInputChange}
                className="h-4 w-4 rounded border-slate-700 bg-slate-900/70 text-emerald-500 outline-none ring-emerald-500/70 transition focus:ring-2"
              />
              <span>Remember me</span>
            </label>

            <button
              type="button"
              className="text-xs font-medium text-emerald-300 hover:text-emerald-200 underline-offset-2 hover:underline"
              aria-label="Reset your password"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Sign in to your account"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <footer className="mt-6 flex items-center justify-end text-xs text-slate-500">
          <Link
            to="/"
            tabIndex={0}
            aria-label="Go back to home page"
            onKeyDown={handleKeyDownOnLink}
            className="font-medium text-slate-400 hover:text-slate-200 underline-offset-2 hover:underline"
          >
            Back home
         </Link>
        </footer>
      </main>
    </div>
  )
}

export default Login

