import { useState } from 'react';
import { Upload, Loader2, X, AlertCircle } from 'lucide-react';

interface ImageUploaderProps {
  currentImage?: string;
  onImageUploaded?: (url: string) => void;
  currentImages?: string[];
  onImagesUploaded?: (urls: string[]) => void;
  maxImages?: number;
  folder?: string;
  label?: string;
}

export default function ImageUploader({
  currentImage,
  onImageUploaded,
  currentImages,
  onImagesUploaded,
  maxImages = 1,
  folder = 'uploads',
  label = 'Upload Image'
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const isMulti = !!onImagesUploaded;
  const images = isMulti ? (currentImages || []) : (currentImage ? [currentImage] : []);
  const canUpload = isMulti ? images.length < maxImages : true;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    // Check for Cloudinary Config
    let cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    let uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      const configStr = localStorage.getItem('cloudinary_config');
      if (configStr) {
        const config = JSON.parse(configStr);
        cloudName = cloudName || config.cloudName;
        uploadPreset = uploadPreset || config.uploadPreset;
      }
    }

    if (!cloudName || !uploadPreset) {
      setError('Cloudinary settings missing. Configure in .env or Admin Dashboard.');
      return;
    }

    try {
      setUploading(true);
      setError('');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      if (folder) {
        formData.append('folder', folder);
      }

      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error?.message || 'Upload failed');
      }

      const data = await response.json();
      const newUrl = data.secure_url;

      if (isMulti && onImagesUploaded) {
        onImagesUploaded([...images, newUrl]);
      } else if (onImageUploaded) {
        onImageUploaded(newUrl);
      }

    } catch (err: any) {
      console.error("Upload failed:", err);
      setError(err.message || 'Failed to upload image.');
    } finally {
      setUploading(false);
      // Reset input value to allow re-uploading same file if needed (though tricky with React)
      e.target.value = '';
    }
  };

  const removeImage = (indexToRemove: number) => {
    if (isMulti && onImagesUploaded) {
      onImagesUploaded(images.filter((_, i) => i !== indexToRemove));
    } else if (onImageUploaded) {
      onImageUploaded('');
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
          {label} {isMulti && maxImages > 1 && <span className="text-slate-600">({images.length}/{maxImages})</span>}
        </label>
      </div>

      <div className="flex flex-wrap items-start gap-4">
        {images.map((img, idx) => (
          <div key={idx} className="relative group w-20 h-20 rounded-lg overflow-hidden border border-white/10 shrink-0 bg-black/40">
            <img src={img} alt="Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                onClick={() => removeImage(idx)}
                className="p-1 bg-red-500/80 rounded-full text-white hover:bg-red-500"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {canUpload ? (
          <div className="flex-1 min-w-[200px]">
            <label className={`
              flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed transition-all cursor-pointer h-20
              ${uploading ? 'bg-emerald-500/10 border-emerald-500/50 cursor-wait' : 'bg-black/40 border-white/20 hover:border-emerald-500 hover:bg-black/60'}
              ${error ? 'border-red-500/50 bg-red-500/5' : ''}
            `}>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploading}
                className="hidden"
              />

              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
                  <span className="text-sm text-emerald-500 font-medium">Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5 text-slate-400" />
                  <span className="text-sm text-slate-300">Add Image</span>
                </>
              )}
            </label>

            {error && (
              <div className="flex items-center gap-1 mt-2 text-xs text-red-400">
                <AlertCircle className="w-3 h-3" />
                <span>{error}</span>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
