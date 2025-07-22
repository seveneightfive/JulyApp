import React, { useState } from 'react'
import { Search, Menu, X, User, Calendar, Music, MapPin, Home, Star, Plus, Bell, Heart, BarChart3 } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { AuthModal } from './AuthModal'

interface LayoutProps {
  children: React.ReactNode
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
  const { user, profile, signOut } = useAuth()

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { name: 'Events', href: '/events', icon: Calendar },
    { name: 'Artists', href: '/artists', icon: Music },
    { name: 'Venues', href: '/venues', icon: MapPin },
  ]

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Searching for:', searchQuery)
  }

  const openAuthModal = (mode: 'signin' | 'signup') => {
    setAuthMode(mode)
    setAuthModalOpen(true)
  }
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-white border-r border-gray-100">
          <div className="flex flex-1 flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-3">
              <a href="/" className="flex items-center">
                <img 
                  src="/785 Logo Valentine.png" 
                  alt="seveneightfive" 
                  className="h-8 w-auto"
                />
              </a>
            </div>
            
            {/* Navigation */}
            <nav className="mt-6 flex-1 px-3 space-y-1">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    window.location.pathname === item.href || 
                    (item.href !== '/' && window.location.pathname.startsWith(item.href))
                      ? 'bg-black text-[#FFCE03]'
                      : 'text-gray-700 hover:bg-black hover:text-white'
                  }`}
                >
                  <item.icon className={`mr-3 h-5 w-5 ${
                    window.location.pathname === item.href || 
                    (item.href !== '/' && window.location.pathname.startsWith(item.href))
                      ? 'text-[#FFCE03]'
                      : 'text-gray-400 group-hover:text-white'
                  }`} />
                  {item.name}
                </a>
              ))}
            </nav>

            {/* User Section */}
            <div className="flex-shrink-0 px-6 pb-4">
              {/* Tagline */}
              <div className="mb-4">
                <p className="text-sm font-oswald font-medium text-gray-700 text-center">
                  Local. Vocal. Since 2006.
                </p>
              </div>
              
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {profile?.username || user.email?.split('@')[0]}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <a
                      href="/profile"
                      className="block text-sm text-gray-600 hover:text-gray-900"
                    >
                      Edit Profile
                    </a>
                    <a
                      href="/dashboard"
                      className="block text-sm text-gray-600 hover:text-gray-900"
                    >
                      Dashboard
                    </a>
                  </div>
                  <button
                    onClick={signOut}
                    className="w-full text-left text-sm text-gray-500 hover:text-gray-700"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      openAuthModal('signin')
                    }}
                    className="block w-full text-center bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#FFCE03] hover:text-black transition-colors"
                  >
                    Sign In
                  </a>
                  <a
                    href="mailto:seveneightfive@gmail.com"
                    className="block w-full text-center bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
                  >
                    Contact Us
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:pl-64 pb-20 lg:pb-0">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 z-50 h-16">
        <div className="grid grid-cols-5 h-16">
          {/* Logo */}
          <a
            href="/"
            className="flex flex-col items-center justify-center space-y-1 text-white hover:text-[#FFCE03] transition-colors"
          >
            <img 
              src="https://assets.softr-files.com/applications/06852328-a343-4027-96ff-d4aff30169c8/assets/3bd00154-80ee-4525-8f04-dd8c544af6e7.png" 
              alt="EventHub" 
              className="h-6 w-auto"
            />
            <span className="text-xs font-medium">Home</span>
          </a>
          
          {navigation.filter(item => item.name !== 'Home' && item.name !== 'Dashboard').map((item) => {
            const isActive = window.location.pathname === item.href || 
              (item.href !== '/' && window.location.pathname.startsWith(item.href))
            return (
            <a
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
                isActive ? 'text-[#FFCE03]' : 'text-white hover:text-[#FFCE03]'
              }`}
            >
              <item.icon size={20} />
              <span className="text-xs font-medium">{item.name}</span>
            </a>
          )
          })}
          
          {/* Profile/Dashboard Button */}
          <button
            onClick={() => {
              if (user) {
                window.location.href = '/dashboard'
              } else {
                openAuthModal('signin')
              }
            }}
            className="flex flex-col items-center justify-center space-y-1 text-white hover:text-[#FFCE03] transition-colors"
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
              user ? 'bg-[#FFCE03]' : 'bg-gray-600'
            }`}>
              <User size={16} className={user ? 'text-black' : 'text-white'} />
            </div>
            <span className="text-xs font-medium">{user ? 'Dashboard' : 'Sign In'}</span>
          </button>
        </div>
      </nav>

      <AuthModal 
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        mode={authMode}
      />
    </div>
  )
}
