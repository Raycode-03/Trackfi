"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MenuItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Upload } from "lucide-react";
import { toast } from "sonner";
interface Props {
  menuitem: MenuItem;
  open: boolean;
  onSubmit: (formData: FormData) => void; // ✅ Changed from onSuccess
  onCancel: () => void;
  isLoading: boolean; // ✅ Loading state from parent
}

export default function EditMenuCard({
  menuitem,
  open,
  onSubmit,
  onCancel,
  isLoading,
}: Props) {
  const [name, setName] = useState(menuitem.name);
  const [price, setPrice] = useState(menuitem.price);
  const [category, setCategory] = useState(menuitem.category);
  const [description, setDescription] = useState(menuitem.description ?? "");
  const [media, setMedia] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string>(
    menuitem.video_url || menuitem.image_url || ""
  );
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(
    menuitem.image_url ? 'image' : menuitem.video_url ? 'video' : null
  );

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    // minimum size for the  media types
    const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB
    const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

    if (!isImage && !isVideo) {
      toast.error('Please select an image or video file');
      return;
    }
    const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;

    if (file.size > maxSize) {
      toast.error(
        isVideo
          ? 'Video must be under 50MB'
          : 'Image must be under 2MB'
      );
      e.target.value = ''; // clear the input
      return;
    }

    setMedia(file);
    setMediaType(isImage ? 'image' : 'video');

    const reader = new FileReader();
    reader.onload = (e) => {
      setMediaPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const clearMedia = () => {
    setMedia(null);
    setMediaPreview(menuitem.video_url || menuitem.image_url || "");
    setMediaType(
      menuitem.image_url ? 'image' : menuitem.video_url ? 'video' : null
    );
  };

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const formData = new FormData();
    formData.append("id", menuitem._id); // ✅ Add ID
    formData.append("name", name);
    formData.append("price", String(price));
    formData.append("category", category);
    formData.append("description", description);

    if (media && mediaType) {
      formData.append("media", media);
      formData.append("mediaType", mediaType);
    }

    onSubmit(formData); // ✅ Call parent handler
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Menu Item</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Media Preview & Upload */}
          <div className="space-y-3">
            <Label>Current Media</Label>
            <div
              className="relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-gray-400 transition"
              onClick={() => !isLoading && document.getElementById('mediaFile')?.click()}
            >
              <Input
                id="mediaFile"
                type="file"
                accept="image/*,video/*"
                onChange={handleMediaChange}
                className="hidden"
                disabled={isLoading}
              />

              {mediaPreview ? (
                <div className="relative w-full">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearMedia();
                    }}
                    className="absolute -top-2 -right-2 z-10 h-6 w-6 p-0 rounded-full"
                    disabled={isLoading}
                  >
                    <X className="w-3 h-3" />
                  </Button>

                  <div className="relative w-full h-48 rounded-md overflow-hidden mb-3 bg-gray-100">
                    {mediaType === 'video' ? (
                      <video
                        src={mediaPreview}
                        controls
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <img
                        src={mediaPreview}
                        alt="Preview"
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>

                  <p className="text-sm text-blue-600">
                    {media
                      ? `New ${mediaType} selected - Click to change`
                      : `Current ${mediaType} - Click to change`}
                  </p>
                </div>
              ) : (
                <div className="py-8">
                  <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-sm font-medium text-gray-700">
                    Click to add image or video
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Images: PNG, JPG, GIF | Videos: MP4, WebM
                  </p>
                </div>
              )}
            </div>
          </div>

          <div>
            <Label>Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <Label>Price (₦)</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Appetizer">Appetizer</SelectItem>
                <SelectItem value="Main Course">Main Course</SelectItem>
                <SelectItem value="Dessert">Dessert</SelectItem>
                <SelectItem value="Beverages">Beverages</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Description</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}