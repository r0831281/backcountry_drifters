import { useState, useRef, useCallback } from 'react';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../../lib/firebase';
import { Button } from './Button';

interface ImageUploadProps {
  /** Current image URL (if already uploaded) */
  value?: string;
  /** Callback when a new image is uploaded */
  onChange: (url: string | null) => void;
  /** Storage path (e.g., "trips", "testimonials", "guides") */
  storagePath: string;
  /** Label for the upload button */
  label?: string;
  /** Helper text shown below the upload area */
  helperText?: string;
  /** Error message */
  error?: string;
  /** Maximum file size in MB */
  maxSizeMB?: number;
  /** Allowed file types */
  accept?: string;
  /** Whether the field is required */
  required?: boolean;
}

/**
 * ImageUpload Component
 *
 * Handles direct upload to Firebase Storage with:
 * - Drag & drop support
 * - Image preview
 * - Upload progress
 * - File validation
 * - Delete functionality
 */
export function ImageUpload({
  value,
  onChange,
  storagePath,
  label = 'Photo',
  helperText,
  error,
  maxSizeMB = 5,
  accept = 'image/jpeg,image/jpg,image/png,image/webp',
  required = false,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadTaskRef = useRef<any>(null);

  // Handle file selection
  const handleFileSelect = useCallback(async (file: File) => {
    setUploadError(null);

    // Validate file type
    const validTypes = accept.split(',').map(t => t.trim());
    if (!validTypes.some(type => file.type === type)) {
      setUploadError(`Please upload a valid image file (${validTypes.join(', ')})`);
      return;
    }

    // Validate file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setUploadError(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    // Create local preview
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);

    // Upload to Firebase Storage
    setUploading(true);
    setUploadProgress(0);

    try {
      // Generate unique filename
      const timestamp = Date.now();
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${timestamp}-${cleanFileName}`;
      const storageRef = ref(storage, `${storagePath}/${fileName}`);

      // Start upload
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTaskRef.current = uploadTask;

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Track progress
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(Math.round(progress));
        },
        (error) => {
          // Handle upload error
          console.error('Upload error:', error);
          setUploadError('Failed to upload image. Please try again.');
          setUploading(false);
          URL.revokeObjectURL(localPreview);
          setPreviewUrl(value || null);
        },
        async () => {
          // Upload complete - get download URL
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            setPreviewUrl(downloadURL);
            onChange(downloadURL);
            setUploading(false);
            setUploadProgress(0);
            URL.revokeObjectURL(localPreview);
          } catch (err) {
            console.error('Error getting download URL:', err);
            setUploadError('Failed to get image URL. Please try again.');
            setUploading(false);
            URL.revokeObjectURL(localPreview);
            setPreviewUrl(value || null);
          }
        }
      );
    } catch (err) {
      console.error('Error starting upload:', err);
      setUploadError('Failed to start upload. Please try again.');
      setUploading(false);
      URL.revokeObjectURL(localPreview);
      setPreviewUrl(value || null);
    }
  }, [accept, maxSizeMB, storagePath, onChange, value]);

  // Handle file input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  // Handle drag events
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  // Handle drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  // Handle remove image
  const handleRemove = useCallback(async () => {
    if (previewUrl && previewUrl.includes('firebasestorage.googleapis.com')) {
      try {
        // Extract storage path from URL and delete
        const urlParts = previewUrl.split('/o/')[1];
        if (urlParts) {
          const filePath = decodeURIComponent(urlParts.split('?')[0]);
          const fileRef = ref(storage, filePath);
          await deleteObject(fileRef);
        }
      } catch (err) {
        console.error('Error deleting file:', err);
        // Continue even if delete fails
      }
    }

    setPreviewUrl(null);
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [previewUrl, onChange]);

  // Cancel upload
  const handleCancel = useCallback(() => {
    if (uploadTaskRef.current) {
      uploadTaskRef.current.cancel();
      uploadTaskRef.current = null;
    }
    setUploading(false);
    setUploadProgress(0);
    setPreviewUrl(value || null);
  }, [value]);

  return (
    <div className="w-full">
      {/* Label */}
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Upload Area */}
      <div className="space-y-3">
        {/* Preview or Upload Zone */}
        {previewUrl ? (
          <div className="relative group">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full max-w-xs h-48 object-cover rounded-lg border-2 border-gray-200"
            />
            {uploading && (
              <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="mb-2">
                    <svg className="animate-spin h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                  <p className="text-sm font-medium">{uploadProgress}%</p>
                </div>
              </div>
            )}
            {!uploading && (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 rounded-lg transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRemove}
                  className="bg-white hover:bg-red-50 text-red-600 border-red-300 hover:border-red-400"
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Remove
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
              ${dragActive
                ? 'border-forest-500 bg-forest-50'
                : 'border-gray-300 hover:border-forest-400 hover:bg-gray-50'
              }
              ${uploading ? 'pointer-events-none opacity-50' : ''}
            `}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-forest-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-forest-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">
                  {dragActive ? 'Drop image here' : 'Click to upload or drag and drop'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG, WebP up to {maxSizeMB}MB
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
          disabled={uploading}
        />

        {/* Upload actions */}
        {uploading && (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-forest-500 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="ml-3"
            >
              Cancel
            </Button>
          </div>
        )}

        {/* Helper text or error */}
        {!uploading && helperText && !error && !uploadError && (
          <p className="text-xs text-gray-500">{helperText}</p>
        )}

        {(error || uploadError) && (
          <p className="text-sm text-red-600 animate-fade-in-fast" role="alert">
            {error || uploadError}
          </p>
        )}
      </div>
    </div>
  );
}
