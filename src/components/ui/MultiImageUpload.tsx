import { useState, useCallback } from 'react';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../../lib/firebase';
import { Button } from './Button';

interface MultiImageUploadProps {
  /** Array of current image URLs */
  value: string[];
  /** Callback when images change */
  onChange: (urls: string[]) => void;
  /** Storage path (e.g., "trips") */
  storagePath: string;
  /** Label for the upload section */
  label?: string;
  /** Helper text */
  helperText?: string;
  /** Error message */
  error?: string;
  /** Maximum number of images */
  maxImages?: number;
  /** Maximum file size in MB */
  maxSizeMB?: number;
  /** Allowed file types */
  accept?: string;
  /** Whether the field is required */
  required?: boolean;
}

interface UploadingFile {
  id: string;
  name: string;
  progress: number;
  url?: string;
}

/**
 * MultiImageUpload Component
 *
 * Handles uploading multiple images to Firebase Storage
 */
export function MultiImageUpload({
  value,
  onChange,
  storagePath,
  label = 'Photos',
  helperText,
  error,
  maxImages = 10,
  maxSizeMB = 5,
  accept = 'image/jpeg,image/jpg,image/png,image/webp',
  required = false,
}: MultiImageUploadProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Handle file selection
  const handleFileSelect = useCallback(async (files: FileList) => {
    setUploadError(null);

    const filesArray = Array.from(files);

    // Check max images limit
    if (value.length + filesArray.length + uploadingFiles.length > maxImages) {
      setUploadError(`Maximum ${maxImages} images allowed`);
      return;
    }

    const validTypes = accept.split(',').map(t => t.trim());
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    for (const file of filesArray) {
      // Validate file type
      if (!validTypes.some(type => file.type === type)) {
        setUploadError(`Invalid file type: ${file.name}`);
        continue;
      }

      // Validate file size
      if (file.size > maxSizeBytes) {
        setUploadError(`${file.name} is too large (max ${maxSizeMB}MB)`);
        continue;
      }

      const fileId = `${Date.now()}-${Math.random()}`;

      // Add to uploading list
      setUploadingFiles(prev => [...prev, {
        id: fileId,
        name: file.name,
        progress: 0,
      }]);

      try {
        // Generate unique filename
        const timestamp = Date.now();
        const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const fileName = `${timestamp}-${cleanFileName}`;
        const fullPath = `${storagePath}/${fileName}`;
        console.log('[MultiImageUpload] Starting upload:', fullPath);
        const storageRef = ref(storage, fullPath);

        // Start upload
        console.log('[MultiImageUpload] Created storage ref, starting upload task...');
        const uploadTask = uploadBytesResumable(storageRef, file);
        console.log('[MultiImageUpload] Upload task created');

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadingFiles(prev =>
              prev.map(f => f.id === fileId ? { ...f, progress: Math.round(progress) } : f)
            );
          },
          (error) => {
            console.error('Upload error:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            setUploadError(`Failed to upload ${file.name}: ${error.message}`);
            setUploadingFiles(prev => prev.filter(f => f.id !== fileId));
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              console.log('[MultiImageUpload] Upload complete! URL:', downloadURL);

              // Add to value array
              const newUrls = [...value, downloadURL];
              console.log('[MultiImageUpload] Calling onChange with:', newUrls);
              onChange(newUrls);

              // Remove from uploading list
              setUploadingFiles(prev => prev.filter(f => f.id !== fileId));
              console.log('[MultiImageUpload] Upload finished successfully');
            } catch (err) {
              console.error('Error getting download URL:', err);
              setUploadError(`Failed to get URL for ${file.name}`);
              setUploadingFiles(prev => prev.filter(f => f.id !== fileId));
            }
          }
        );
      } catch (err) {
        console.error('Error starting upload:', err);
        setUploadError(`Failed to upload ${file.name}`);
        setUploadingFiles(prev => prev.filter(f => f.id !== fileId));
      }
    }
  }, [accept, maxSizeMB, maxImages, storagePath, value, uploadingFiles.length, onChange]);

  // Handle file input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
    // Reset input
    e.target.value = '';
  }, [handleFileSelect]);

  // Handle remove image
  const handleRemove = useCallback(async (url: string) => {
    // Remove from value array
    onChange(value.filter(u => u !== url));

    // Try to delete from storage
    if (url.includes('firebasestorage.googleapis.com')) {
      try {
        const urlParts = url.split('/o/')[1];
        if (urlParts) {
          const filePath = decodeURIComponent(urlParts.split('?')[0]);
          const fileRef = ref(storage, filePath);
          await deleteObject(fileRef);
        }
      } catch (err) {
        console.error('Error deleting file:', err);
      }
    }
  }, [value, onChange]);

  // Handle reorder (move up)
  const handleMoveUp = useCallback((index: number) => {
    if (index === 0) return;
    const newValue = [...value];
    [newValue[index - 1], newValue[index]] = [newValue[index], newValue[index - 1]];
    onChange(newValue);
  }, [value, onChange]);

  // Handle reorder (move down)
  const handleMoveDown = useCallback((index: number) => {
    if (index === value.length - 1) return;
    const newValue = [...value];
    [newValue[index], newValue[index + 1]] = [newValue[index + 1], newValue[index]];
    onChange(newValue);
  }, [value, onChange]);

  const canAddMore = value.length + uploadingFiles.length < maxImages;

  return (
    <div className="w-full">
      {/* Label */}
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
        {value.length > 0 && (
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({value.length}/{maxImages})
          </span>
        )}
      </label>

      {/* Uploaded images grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-3">
          {value.map((url, index) => (
            <div key={url} className="relative group">
              <img
                src={url}
                alt={`Image ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 rounded-lg transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex gap-1">
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => handleMoveUp(index)}
                      className="p-1.5 bg-white rounded-md hover:bg-gray-100 transition-colors"
                      title="Move left"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                  )}
                  {index < value.length - 1 && (
                    <button
                      type="button"
                      onClick={() => handleMoveDown(index)}
                      className="p-1.5 bg-white rounded-md hover:bg-gray-100 transition-colors"
                      title="Move right"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemove(url)}
                    className="p-1.5 bg-white rounded-md hover:bg-red-50 text-red-600 transition-colors"
                    title="Remove"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Uploading files progress */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2 mb-3">
          {uploadingFiles.map(file => (
            <div key={file.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700 mb-1">{file.name}</p>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-forest-500 transition-all duration-300"
                    style={{ width: `${file.progress}%` }}
                  />
                </div>
              </div>
              <span className="text-xs text-gray-500">{file.progress}%</span>
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      {canAddMore && (
        <div>
          <input
            type="file"
            accept={accept}
            onChange={handleInputChange}
            className="hidden"
            id="multi-image-upload"
            multiple
            disabled={!canAddMore}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => document.getElementById('multi-image-upload')?.click()}
            disabled={!canAddMore}
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Images
          </Button>
        </div>
      )}

      {/* Helper text or error */}
      {helperText && !error && !uploadError && (
        <p className="text-xs text-gray-500 mt-2">{helperText}</p>
      )}

      {(error || uploadError) && (
        <p className="text-sm text-red-600 mt-2 animate-fade-in-fast" role="alert">
          {error || uploadError}
        </p>
      )}
    </div>
  );
}
