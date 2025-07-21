import React, { useState, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight, Megaphone } from 'lucide-react'
import { supabase, type Announcement } from '../lib/supabase'

export const AnnouncementBanner: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const [isAutoScrolling, setIsAutoScrolling] = useState(true)

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  useEffect(() => {
    if (announcements.length > 1 && isAutoScrolling) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % announcements.length)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [announcements.length, isAutoScrolling])

  const fetchAnnouncements = async () => {
    const { data } = await supabase
      .from('announcements')
      .select('*')
      .eq('active', true)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })

    if (data) {
      setAnnouncements(data)
    }
  }

  const nextAnnouncement = () => {
    setIsAutoScrolling(false)
    setCurrentIndex((prev) => (prev + 1) % announcements.length)
  }

  const prevAnnouncement = () => {
    setIsAutoScrolling(false)
    setCurrentIndex((prev) => (prev - 1 + announcements.length) % announcements.length)
  }

  if (!isVisible || announcements.length === 0) {
    return null
  }

  const currentAnnouncement = announcements[currentIndex]

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center space-x-3 flex-1">
            <div className="hidden sm:block">
              <Megaphone size={20} className="text-white/80" />
            </div>
            
            {announcements.length > 1 && (
              <button
                onClick={prevAnnouncement}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
                onMouseEnter={() => setIsAutoScrolling(false)}
                onMouseLeave={() => setIsAutoScrolling(true)}
              >
                <ChevronLeft size={16} />
              </button>
            )}
            
            <div className="flex-1 text-center min-w-0">
              <h3 className="font-semibold text-sm sm:text-base truncate">
                {currentAnnouncement.title}
              </h3>
              <p className="text-sm opacity-90 hidden sm:block line-clamp-1">
                {currentAnnouncement.content}
              </p>
            </div>

            {announcements.length > 1 && (
              <button
                onClick={nextAnnouncement}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
                onMouseEnter={() => setIsAutoScrolling(false)}
                onMouseLeave={() => setIsAutoScrolling(true)}
              >
                <ChevronRight size={16} />
              </button>
            )}
          </div>

          <button
            onClick={() => setIsVisible(false)}
            className="ml-4 p-1 hover:bg-white/20 rounded-full transition-colors flex-shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {announcements.length > 1 && (
          <div className="flex justify-center space-x-2 pb-2">
            {announcements.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index)
                  setIsAutoScrolling(false)
                }}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  index === currentIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}