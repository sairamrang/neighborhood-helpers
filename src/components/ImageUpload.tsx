import { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';

interface ImageUploadProps {
  bucket: 'profile-avatars' | 'service-images' | 'booking-attachments';
  path: string; // e.g., "user_id/avatar.jpg" or "provider_id/service_id/image-1.jpg"
  currentImageUrl?: string;
  onUploadComplete: (url: string) => void;
  onUploadError?: (error: string) => void;
  maxSizeMB?: number;
  aspectRatio?: 'square' | 'landscape' | 'portrait' | 'any';
  showPreview?: boolean;
  buttonText?: string;
  acceptedFormats?: string[];
}

export const ImageUpload = ({
  bucket,
  path,
  currentImageUrl,
  onUploadComplete,
  onUploadError,
  maxSizeMB = 5,
  aspectRatio = 'any',
  showPreview = true,
  buttonText = 'Upload Image',
  acceptedFormats = ['image/jpeg', 'image/png', 'image/webp'],
}: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!acceptedFormats.includes(file.type)) {
      return `Invalid file type. Accepted: ${acceptedFormats.join(', ')}`;
    }

    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `File too large. Maximum size: ${maxSizeMB}MB`;
    }

    return null;
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      if (onUploadError) onUploadError(validationError);
      return;
    }

    setError('');
    setUploading(true);

    try {
      // Create preview
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: true, // Replace existing file
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);

      const publicUrl = publicUrlData.publicUrl;

      // Add timestamp to bust cache
      const urlWithTimestamp = `${publicUrl}?t=${Date.now()}`;

      onUploadComplete(urlWithTimestamp);
      setPreviewUrl(urlWithTimestamp);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to upload image';
      setError(errorMessage);
      if (onUploadError) onUploadError(errorMessage);
      setPreviewUrl(currentImageUrl || null);
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = async () => {
    if (!currentImageUrl) return;

    setUploading(true);
    try {
      const { error: deleteError } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (deleteError) throw deleteError;

      setPreviewUrl(null);
      onUploadComplete('');
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to remove image';
      setError(errorMessage);
      if (onUploadError) onUploadError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'square':
        return 'aspect-square';
      case 'landscape':
        return 'aspect-video';
      case 'portrait':
        return 'aspect-[3/4]';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-3">
      {/* Preview */}
      {showPreview && previewUrl && (
        <div className={`relative rounded-lg overflow-hidden bg-gray-100 ${getAspectRatioClass()}`}>
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          {!uploading && (
            <button
              onClick={handleRemove}
              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-all shadow-lg"
              title="Remove image"
            >
              ✕
            </button>
          )}
        </div>
      )}

      {/* Upload button */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFormats.join(',')}
          onChange={handleFileSelect}
          disabled={uploading}
          className="hidden"
          id={`image-upload-${bucket}-${path.replace(/\//g, '-')}`}
        />
        <label
          htmlFor={`image-upload-${bucket}-${path.replace(/\//g, '-')}`}
          className={`
            block w-full px-4 py-3 border-2 border-dashed rounded-lg text-center cursor-pointer transition-all
            ${uploading
              ? 'border-gray-300 bg-gray-100 cursor-not-allowed'
              : 'border-primary-300 hover:border-primary-500 hover:bg-primary-50'
            }
          `}
        >
          {uploading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
              <span className="text-gray-600">Uploading...</span>
            </div>
          ) : (
            <div>
              <div className="text-3xl mb-2">📸</div>
              <div className="font-semibold text-gray-700">{buttonText}</div>
              <div className="text-xs text-gray-500 mt-1">
                {acceptedFormats.map(f => f.split('/')[1]).join(', ').toUpperCase()} • Max {maxSizeMB}MB
              </div>
            </div>
          )}
        </label>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}
    </div>
  );
};
