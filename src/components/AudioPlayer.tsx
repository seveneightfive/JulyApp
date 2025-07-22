import React, { useState, useRef, useEffect } from 'react'
import { Play, Pause, Volume2, ExternalLink, X } from 'lucide-react'

interface AudioPlayerProps {
  audioUrl: string
  title: string
  artistName: string
  purchaseLink?: string
  onClose: () => void
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioUrl,
  title,
  artistName,
  purchaseLink,
  onClose
}) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('ended', () => setIsPlaying(false))

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('ended', () => setIsPlaying(false))
    }
  }, [])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio) return

    const newTime = parseFloat(e.target.value)
    if (!isNaN(newTime) && isFinite(newTime)) {
      audio.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio) return

    const newVolume = parseFloat(e.target.value)
    if (!isNaN(newVolume) && isFinite(newVolume)) {
      audio.volume = newVolume
      setVolume(newVolume)
    }
  }

  const formatTime = (time: number) => {
    if (!time || isNaN(time) || !isFinite(time)) return '0:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 lg:left-64">
      <audio ref={audioRef} src={audioUrl} />
      
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Track Info */}
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <button
              onClick={togglePlay}
              className="bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 transition-colors flex-shrink-0"
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>
            
            <div className="min-w-0 flex-1">
              <h4 className="font-medium text-gray-900 truncate">{title}</h4>
              <p className="text-sm text-gray-600 truncate">{artistName}</p>
            </div>
          </div>

          {/* Progress Bar - Hidden on mobile */}
          <div className="hidden md:flex items-center space-x-3 flex-1 max-w-md mx-6">
            <span className="text-xs text-gray-500 w-10 text-right">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min="0"
              max={duration && isFinite(duration) ? duration : 0}
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              style={{
                background: duration > 0 ? `linear-gradient(to right, #9333ea 0%, #9333ea ${(currentTime / duration) * 100}%, #e5e7eb ${(currentTime / duration) * 100}%, #e5e7eb 100%)` : '#e5e7eb'
              }}
            />
            <span className="text-xs text-gray-500 w-10">
              {formatTime(duration)}
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            {/* Volume - Hidden on mobile */}
            <div className="hidden md:flex items-center space-x-2">
              <Volume2 size={16} className="text-gray-400" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {purchaseLink && (
              <a
                href={purchaseLink}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-yellow-400 text-black px-3 py-1 rounded-lg text-sm font-medium hover:bg-yellow-500 transition-colors flex items-center space-x-1"
              >
                <span className="hidden sm:inline">Buy</span>
                <ExternalLink size={14} />
              </a>
            )}

            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Mobile Progress Bar */}
        <div className="md:hidden mt-2 flex items-center space-x-2">
          <span className="text-xs text-gray-500">
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min="0"
            max={duration && isFinite(duration) ? duration : 0}
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            style={{
              background: duration > 0 ? `linear-gradient(to right, #9333ea 0%, #9333ea ${(currentTime / duration) * 100}%, #e5e7eb ${(currentTime / duration) * 100}%, #e5e7eb 100%)` : '#e5e7eb'
            }}
          />
          <span className="text-xs text-gray-500">
            {formatTime(duration)}
          </span>
        </div>
      </div>
    </div>
  )
}