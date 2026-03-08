import type { ReactElement, ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import AssessmentIcon from '@mui/icons-material/Assessment'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import DashboardIcon from '@mui/icons-material/Dashboard'
import type { Property } from '../services/properties'
import { fetchProperties } from '../services/properties'

type BottomNavItem = {
  label: string
  path: string
  icon: ReactElement
}

const bottomNavItems: BottomNavItem[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: <DashboardIcon fontSize="small" />,
  },
  {
    label: 'Pricing Calendar',
    path: '/pricing-calendar',
    icon: <CalendarMonthIcon fontSize="small" />,
  },
  {
    label: 'Month End Report',
    path: '/month-end-report',
    icon: <AssessmentIcon fontSize="small" />,
  },
]

type DashboardLayoutProps = {
  children?: ReactNode
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [propertyMenuAnchorElement, setPropertyMenuAnchorElement] =
    useState<null | HTMLElement>(null)
  const [properties, setProperties] = useState<Property[]>([])
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [isLoadingProperties, setIsLoadingProperties] = useState(false)
  const [propertyErrorMessage, setPropertyErrorMessage] = useState<
    string | null
  >(null)

  const handleLogout = (): void => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('authUser')
    navigate('/login', { replace: true })
  }

  const handleNavigate = (path: string): void => {
    navigate(path)
  }

  const handleKeyDownOnBottomNavItem = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    path: string,
  ): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleNavigate(path)
    }
  }

  const handleOpenPropertyMenu = (
    event: React.MouseEvent<HTMLButtonElement>,
  ): void => {
    setPropertyMenuAnchorElement(event.currentTarget)
  }

  const handleClosePropertyMenu = (): void => {
    setPropertyMenuAnchorElement(null)
  }

  const handleSelectProperty = (property: Property): void => {
    setSelectedProperty(property)
    localStorage.setItem('selectedHotelHId', String(property.hId))
    localStorage.setItem('selectedHotelName', property.propertyName)
    setPropertyMenuAnchorElement(null)
    window.dispatchEvent(new CustomEvent('selectedHotelChanged'))
  }

  useEffect(() => {
    const token = localStorage.getItem('authToken')
    if (!token) {
      return
    }

    const selectedHotelHId = localStorage.getItem('selectedHotelHId')

    queueMicrotask(() => {
      setIsLoadingProperties(true)
      setPropertyErrorMessage(null)
    })

    fetchProperties(token)
      .then((fetchedProperties) => {
        setProperties(fetchedProperties)

        if (!fetchedProperties.length) {
          return
        }

        if (selectedHotelHId) {
          const existingSelectedProperty = fetchedProperties.find(
            (propertyItem) => String(propertyItem.hId) === selectedHotelHId,
          )

          if (existingSelectedProperty) {
            setSelectedProperty(existingSelectedProperty)
            return
          }
        }

        const firstProperty = fetchedProperties[0]
        setSelectedProperty(firstProperty)
        localStorage.setItem('selectedHotelHId', String(firstProperty.hId))
        localStorage.setItem('selectedHotelName', firstProperty.propertyName)
        window.dispatchEvent(new CustomEvent('selectedHotelChanged'))
      })
      .catch((error: unknown) => {
        const fallbackMessage =
          'Unable to fetch your hotels. Please refresh the page.'

        if (error instanceof Error) {
          setPropertyErrorMessage(error.message || fallbackMessage)
        } else {
          setPropertyErrorMessage(fallbackMessage)
        }
      })
      .finally(() => {
        setIsLoadingProperties(false)
      })
  }, [])

  const resolvedChildren = children ?? <Outlet />

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      <AppBar
        position="sticky"
        elevation={0}
        className="bg-transparent shadow-none"
      >
        <div className="border-b border-slate-800/70 bg-slate-900/40 backdrop-blur-2xl">
          <Toolbar className="mx-auto flex max-w-5xl items-center justify-between px-4 py-2">
            <div className="flex items-center gap-3">
              <div
                className="flex h-9 min-w-9 items-center justify-center rounded-xl border border-emerald-500/50 bg-slate-900/70 px-2 text-[10px] font-medium leading-tight text-emerald-300 shadow-md shadow-slate-950/40"
                aria-label=""
              >
                BharatDemadAi
              </div>
              <div className="flex flex-col">
                <div
                  className="flex items-baseline gap-1 font-bold tracking-tight text-slate-50"
                  aria-label="Bharat Demand AI"
                >
                  <Box component="span" className="text-base">
                    Bharat
                  </Box>
                  <Box
                    component="span"
                    className="bg-linear-to-r from-emerald-400 to-teal-400 bg-clip-text text-base text-transparent"
                  >
                    Demand
                  </Box>
                  <Box component="span" className="text-base">
                    AI
                  </Box>
                </div>
                <Typography
                  variant="body2"
                  className="text-[11px] font-normal text-slate-400"
                >
                  Revenue Management Console
                </Typography>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type={'button' as const}
                onClick={handleOpenPropertyMenu}
                disabled={isLoadingProperties}
                className="group flex max-w-xs items-center gap-2 rounded-xl border border-slate-700/80 bg-slate-900/70 px-3 py-1.5 text-[11px] text-slate-100 outline-none transition hover:border-emerald-400/70 hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="Change selected hotel"
              >
                <i
                  className="fa fa-bed text-[13px] text-emerald-300"
                  aria-hidden={true}
                />
                <Box component="span" className="truncate text-left">
                  {selectedProperty
                    ? selectedProperty.propertyName
                    : isLoadingProperties
                      ? 'Loading hotels...'
                      : 'Select hotel'}
                </Box>
                <i
                  className="fa fa-chevron-down text-[9px] text-slate-500 group-hover:text-emerald-300"
                  aria-hidden={true}
                />
              </button>

              <IconButton
                size="small"
                className="text-slate-300 hover:text-emerald-300"
                aria-label="View notifications"
              >
                <i className="fa fa-bell-o text-lg" aria-hidden={true} />
              </IconButton>

              <button
                type={'button' as const}
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-xl border border-slate-700/80 bg-slate-800/80 px-3 py-1.5 text-sm font-medium text-slate-100 outline-none transition hover:border-red-500/60 hover:bg-red-950/40 hover:text-red-200 focus-visible:ring-2 focus-visible:ring-red-500/50"
                aria-label="Logout"
              >
                <i className="fa fa-sign-out text-sm" aria-hidden={true} />
                <Box component="span" className="hidden sm:inline">
                  Logout
                </Box>
              </button>
            </div>
          </Toolbar>
        </div>
      </AppBar>

      <Menu
        anchorEl={propertyMenuAnchorElement}
        open={Boolean(propertyMenuAnchorElement)}
        onClose={handleClosePropertyMenu}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        {isLoadingProperties && (
          <MenuItem disabled className="text-xs text-slate-500">
            Loading hotels...
          </MenuItem>
        )}

        {!isLoadingProperties &&
          properties.map((propertyItem) => (
            <MenuItem
              key={propertyItem.hId}
              selected={selectedProperty?.hId === propertyItem.hId}
              onClick={() => handleSelectProperty(propertyItem)}
            >
              <Box component="span" className="text-sm text-slate-900">
                {propertyItem.propertyName}
              </Box>
            </MenuItem>
          ))}

        {!isLoadingProperties &&
          !properties.length &&
          !propertyErrorMessage && (
            <MenuItem disabled className="text-xs text-slate-500">
              No hotels found for this account.
            </MenuItem>
          )}

        {propertyErrorMessage && (
          <MenuItem disabled className="max-w-xs whitespace-normal text-xs text-red-600">
            {propertyErrorMessage}
          </MenuItem>
        )}
      </Menu>

      <Box
        component="main"
        className="flex-1 pb-20 px-4 pt-4 max-w-5xl w-full mx-auto"
      >
        {resolvedChildren}
      </Box>

      <Box
        component="nav"
        aria-label="Bottom navigation"
        className="fixed bottom-0 inset-x-0 bg-slate-950/95 border-t border-slate-800/80 backdrop-blur-xl"
      >
        <div className="mx-auto flex max-w-md items-center justify-between px-3 py-2">
          {bottomNavItems.map((item) => {
            const isActive = location.pathname === item.path

            return (
              <button
                key={item.path}
                type={'button' as const}
                className={`group relative flex flex-1 flex-col items-center gap-0.5 rounded-2xl px-2 py-1.5 text-[11px] outline-none transition ${
                  isActive
                    ? 'text-slate-950'
                    : 'text-slate-400 hover:text-slate-100'
                }`}
                aria-label={item.label}
                onClick={() => handleNavigate(item.path)}
                onKeyDown={(event: React.KeyboardEvent<HTMLButtonElement>) =>
                  handleKeyDownOnBottomNavItem(event, item.path)
                }
              >
                <div
                  className={`mb-0.5 flex h-8 w-10 items-center justify-center rounded-xl text-xs transition ${
                    isActive
                      ? 'bg-slate-50 text-emerald-500 shadow-md shadow-emerald-500/40'
                      : 'bg-transparent text-slate-400 group-hover:bg-slate-800/80 group-hover:text-slate-100'
                  }`}
                >
                  {item.icon}
                </div>
                <Box
                  component="span"
                  className={`transition ${
                    isActive ? 'text-emerald-300' : 'text-slate-400'
                  }`}
                >
                  {item.label}
                </Box>
              </button>
            )
          })}
        </div>
      </Box>
    </div>
  )
}

export default DashboardLayout

