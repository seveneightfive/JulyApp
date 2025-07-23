import React from 'react'
import { X, Phone, Mail } from 'lucide-react'

interface ContactModalProps {
  isOpen: boolean
  onClose: () => void
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Mail size={24} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Contact Us
          </h2>
        </div>

        <div className="space-y-4 mb-6">
          <p className="text-gray-600 text-center">
            We look forward to hearing from you. Please send us a text at{' '}
            <a 
              href="tel:785-249-3126" 
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              785-249-3126
            </a>
            {' '}or{' '}
            <a 
              href="mailto:seveneightfive@gmail.com"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              email
            </a>
            .
          </p>
          
          <div className="flex flex-col space-y-3 mt-6">
            <a
              href="tel:785-249-3126"
              className="flex items-center justify-center space-x-3 bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
            >
              <Phone size={20} className="text-gray-600" />
              <span className="font-medium text-gray-900">785-249-3126</span>
            </a>
            
            <a
              href="mailto:seveneightfive@gmail.com"
              className="flex items-center justify-center space-x-3 bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
            >
              <Mail size={20} className="text-gray-600" />
              <span className="font-medium text-gray-900">seveneightfive@gmail.com</span>
            </a>
          </div>
        </div>

        <div className="text-center">
          <p className="text-gray-600 font-medium">Cheers!</p>
        </div>
      </div>
    </div>
  )
}