'use client'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { WifiOff, Wifi } from 'lucide-react'

export default function NetworkStatus() {
  useEffect(() => {
    // Check if already offline when component mounts
    if (!navigator.onLine) {
      toast.error('You are offline', {
        id: 'network-status',
        description: 'Orders will sync once connection is restored.',
        duration: Infinity,
        icon: <WifiOff className="w-4 h-4" />,
      })
    }

    const goOnline = () => {
      toast.success('Back online!', {
        id: 'network-status',
        icon: <Wifi className="w-4 h-4" />,
      })
    }

    const goOffline = () => {
      toast.error('You are offline', {
        id: 'network-status',
        description: 'Orders will sync once connection is restored.',
        duration: Infinity,
        icon: <WifiOff className="w-4 h-4" />,
      })
    }

    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)

    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  return null
}