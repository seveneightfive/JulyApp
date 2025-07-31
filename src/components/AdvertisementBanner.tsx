import React, { useState, useEffect } from 'react'
import { ExternalLink, Eye } from 'lucide-react'
import { supabase, type Advertisement } from '../lib/supabase'

export const AdvertisementBanner: React.FC = () => {
  const [advertisement, setAdvertisement] = useState<Advertisement | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchActiveAdvertisement()
  }, [])

  const fetchActiveAdvertisement = async () => {
    try {
      const { data } = await supabase
        .from('advertisements')
        .select('*')
        .lte('start_date', new Date().toISOString().split('T')[0])
        .gte('end_date', new Date().toISOString().split('T')[0])
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (data) {
        setAdvertisement(data)
        // Track view
        await supabase
          .from('advertisements')
          .update({ views: data.views + 1 })
          .eq('id', data.id)
      }
    } catch (error) {
      // No active ads or error - this is fine
      console.log('No active advertisements')
    } finally {
      setLoading(false)
    }
  }

  const handleClick = async () => {
    if (!advertisement) return

    // Track click
    await supabase
      .from('advertisements')
      .update({ clicks: advertisement.clicks + 1 })
      .eq('id', advertisement.id)

    // Open link
    window.open(advertisement.button_link, '_blank')
  }

  const trackView = async () => {
    if (!advertisement) return

    await supabase
      .from('advertisements')
      .update({ views: advertisement.views + 1 })
      .eq('id', advertisement.id)
  }

  if (loading || !advertisement) {
    return null
  }

  return (
    <section className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 lg:p-12 text-center text-white relative overflow-hidden">
      {advertisement.background_image && (
        <img
          src={advertisement.background_image}
          alt="Advertisement background"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
          onLoad={trackView}
        />
      )}
      
      <div className="relative z-10">
        <h2 className="text-2xl lg:text-3xl font-bold font-oswald mb-4">
          {advertisement.title}
        </h2>
        <p className="text-lg mb-8 opacity-90">
          {advertisement.content}
        </p>
        <button
          onClick={handleClick}
          className="bg-[#FFCE03] text-black px-8 py-3 rounded-xl font-medium hover:bg-yellow-400 transition-colors inline-flex items-center space-x-2"
        >
          <span>{advertisement.button_text}</span>
          <ExternalLink size={16} />
        </button>
      </div>

      {/* Sponsored indicator */}
      <div className="absolute top-4 right-4 bg-black/20 backdrop-blur-sm px-3 py-1 rounded-full">
        <span className="text-xs font-medium opacity-75">Sponsored</span>
      </div>
    </section>
  )
}