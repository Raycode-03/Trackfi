import React, { useRef } from 'react'
import { ImageOff } from 'lucide-react'

interface MediaDisplayProps {
  image_url?: string | null;
  video_url?: string | null;
  alt: string;
  className?: string;
}

function optimizeCloudinaryUrl(url: string, isVideo = false) {
  if (!url || !url.includes('cloudinary.com')) return url;
  if (isVideo) return url.replace('/upload/', '/upload/w_800,q_auto,vc_auto/');
  return url.replace('/upload/', '/upload/w_800,q_auto,f_auto/');
}

function MediaDisplay({ video_url, image_url, alt, className }: MediaDisplayProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  return (
    <div className={`relative overflow-hidden ${className ?? 'h-52 w-full'}`}>
      {video_url ? (
        <video
          ref={videoRef}
          src={optimizeCloudinaryUrl(video_url, true)}
          className="h-full w-full object-cover"
          loop
          muted
          playsInline
          onMouseEnter={() => videoRef.current?.play()}
          onMouseLeave={() => videoRef.current?.pause()}
        />
      ) : image_url ? (
        <img
          src={optimizeCloudinaryUrl(image_url)}
          alt={alt}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full flex-col items-center justify-center bg-gray-100">
          <ImageOff className="h-10 w-10 text-gray-400 mb-2" />
          <p className="text-sm text-gray-600 font-medium">No Media</p>
        </div>
      )}
    </div>
  )
}

export default MediaDisplay