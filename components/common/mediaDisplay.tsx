import Image from "next/image";
import React from "react";
interface MediaDisplayProps {
  image_url?: string | null;
  name: string;
  className?: string;
}

function optimizeCloudinaryUrl(url: string) {
  if (!url || !url.includes("cloudinary.com")) return url;
  return url.replace("/upload/", "/upload/w_800,q_auto,f_auto/");
}

function MediaDisplay({ image_url, name, className }: MediaDisplayProps) {
  return (
    <div className={`relative overflow-hidden rounded-full ${className ?? "h-full w-full"}`}>
      {image_url ? (
        <Image
          src={optimizeCloudinaryUrl(image_url)}
          alt={name || "User"}
          className={`object-cover rounded-full ${className ?? ''}`}
          width={80}
          height={80}
        />
      ) : (
        <span className="text-xs  rounded-full text-white font-bold h-full w-full object-cover flex items-center justify-center bg-gray-500">
          {name?.charAt(0).toUpperCase() ?? "U"}
        </span>
      )}
    </div>
  );
}

export default MediaDisplay;
