"use client";

import { useState } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";

interface ImageUploadFieldProps {
  onImagesChange: (urls: string[]) => void;
  images: string[];
  maxImages?: number;
}

export default function ImageUploadField({
  onImagesChange,
  images,
  maxImages = 5,
}: ImageUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>(images || []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Check max images limit
    if (uploadedUrls.length + files.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    setUploading(true);
    const newUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Validate file type
        if (!file.type.startsWith("image/")) {
          toast.error(`File ${file.name} is not an image`);
          continue;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`File ${file.name} is too large (max 5MB)`);
          continue;
        }

        // Create FormData for upload
        const formData = new FormData();
        formData.append("file", file);

        try {
          // Get auth token from localStorage
          const token = localStorage.getItem("token");
          if (!token) {
            toast.error("Please login to upload images");
            continue;
          }

          // Upload to backend API
          const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
          const response = await fetch(`${backendUrl}/upload/image`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            toast.error(errorData.message || `Failed to upload ${file.name}`);
            continue;
          }

          const data = await response.json();
          if (data.url) {
            newUrls.push(data.url);
          }
        } catch (error) {
          console.error('Upload error:', error);
          toast.error(`Failed to upload ${file.name}`);
        }
      }

      if (newUrls.length > 0) {
        const updatedUrls = [...uploadedUrls, ...newUrls];
        setUploadedUrls(updatedUrls);
        onImagesChange(updatedUrls);
        toast.success(`${newUrls.length} image(s) uploaded successfully`);
      }
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = "";
    }
  };

  const removeImage = (index: number) => {
    const newUrls = uploadedUrls.filter((_, i) => i !== index);
    setUploadedUrls(newUrls);
    onImagesChange(newUrls);
  };

  const addImageUrl = (url: string) => {
    if (!url.trim()) return;

    if (uploadedUrls.includes(url)) {
      toast.error("This URL is already added");
      return;
    }

    if (uploadedUrls.length >= maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    const newUrls = [...uploadedUrls, url];
    setUploadedUrls(newUrls);
    onImagesChange(newUrls);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
        <label className="cursor-pointer">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            disabled={uploading || uploadedUrls.length >= maxImages}
            className="hidden"
          />
          <div className="space-y-2">
            <Upload className="w-8 h-8 mx-auto text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-700">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG, GIF up to 5MB ({uploadedUrls.length}/{maxImages})
              </p>
            </div>
          </div>
        </label>
      </div>

      {/* Image URL Input */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">Or paste image URL</p>
        <div className="flex gap-2">
          <input
            type="url"
            placeholder="https://example.com/image.jpg"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const input = e.currentTarget;
                addImageUrl(input.value);
                input.value = "";
              }
            }}
            className="input flex-1"
          />
          <button
            type="button"
            onClick={(e) => {
              const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
              addImageUrl(input.value);
              input.value = "";
            }}
            className="btn-primary"
          >
            Add
          </button>
        </div>
      </div>

      {/* Uploaded Images Preview */}
      {uploadedUrls.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">
            Uploaded Images ({uploadedUrls.length}/{maxImages})
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {uploadedUrls.map((url, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={url}
                    alt={`Product ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder.jpg";
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
                {index === 0 && (
                  <div className="absolute top-1 left-1 bg-primary-500 text-white text-xs px-2 py-1 rounded">
                    Primary
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {uploading && (
        <div className="flex items-center justify-center gap-2 p-4 bg-blue-50 rounded-lg">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-blue-600">Uploading images...</p>
        </div>
      )}
    </div>
  );
}
