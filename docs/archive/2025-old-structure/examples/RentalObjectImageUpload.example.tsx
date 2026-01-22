/**
 * Rental Object Image Upload Integration Example
 * Shows how to integrate file uploads into rental object CRUD operations
 */

import React, { useState } from 'react';
import { useUploadFile, useUploadMultipleFiles, useFileUrl } from '@digilist/client-sdk/hooks';
import { useCreateRentalObject, useUpdateRentalObject } from '@digilist/client-sdk/hooks';

/**
 * Example: Create Rental Object with Images
 */
export function CreateRentalObjectWithImages() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  
  const { mutate: uploadFiles, isPending: isUploading } = useUploadMultipleFiles();
  const { mutate: createRentalObject, isPending: isCreating } = useCreateRentalObject();

  const handleFilesSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFiles(Array.from(event.target.files));
    }
  };

  const handleCreate = () => {
    // Step 1: Upload images first
    uploadFiles(selectedFiles, {
      onSuccess: (response) => {
        const imageUrls = response.files.map(file => file.url);
        setUploadedImageUrls(imageUrls);
        
        // Step 2: Create rental object with uploaded image URLs
        createRentalObject({
          name: 'Fotballbane Skien',
          category_key: 'LOKALER_OG_BANER',
          images: imageUrls.map((url, index) => ({
            url,
            alt: `Image ${index + 1}`,
            thumbnail: url,
            is_primary: index === 0,
            sort_order: index + 1,
          })),
          // ... other rental object properties
        });
      },
    });
  };

  return (
    <div>
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleFilesSelected}
      />
      <button
        onClick={handleCreate}
        disabled={isUploading || isCreating || selectedFiles.length === 0}
      >
        {isUploading ? 'Uploading images...' : isCreating ? 'Creating...' : 'Create Rental Object'}
      </button>
    </div>
  );
}

/**
 * Example: Update Rental Object Images
 */
export function UpdateRentalObjectImages({ rentalObjectId }: { rentalObjectId: string }) {
  const { mutate: uploadFile } = useUploadFile();
  const { mutate: updateRentalObject } = useUpdateRentalObject();
  const getFileUrl = useFileUrl();

  const handleAddImage = (file: File) => {
    uploadFile(
      {
        file,
        category: 'rental-object-image',
        entityType: 'rental_object',
        entityId: rentalObjectId,
        altText: 'Rental object image',
      },
      {
        onSuccess: (uploadedFile) => {
          // Add new image to rental object
          updateRentalObject({
            id: rentalObjectId,
            // Append to existing images array
            images: [
              // ... existing images
              {
                url: uploadedFile.url,
                alt: uploadedFile.altText || '',
                thumbnail: uploadedFile.url,
                is_primary: false,
                sort_order: 999,
              },
            ],
          });
        },
      }
    );
  };

  return (
    <input
      type="file"
      accept="image/*"
      onChange={(e) => {
        if (e.target.files?.[0]) {
          handleAddImage(e.target.files[0]);
        }
      }}
    />
  );
}

/**
 * Example: Display Images with Correct URLs
 */
export function RentalObjectImageGallery({ images }: { images: Array<{ url: string; alt: string }> }) {
  const getFileUrl = useFileUrl();

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
      {images.map((image, index) => (
        <img
          key={index}
          src={getFileUrl(image.url)}
          alt={image.alt}
          style={{ width: '100%', height: '200px', objectFit: 'cover' }}
        />
      ))}
    </div>
  );
}

/**
 * Example: Drag-and-Drop Image Upload
 */
export function DragDropImageUpload({ rentalObjectId }: { rentalObjectId: string }) {
  const [isDragging, setIsDragging] = useState(false);
  const { mutate: uploadFiles, isPending } = useUploadMultipleFiles();

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);

    const files = Array.from(event.dataTransfer.files).filter(file =>
      file.type.startsWith('image/')
    );

    if (files.length > 0) {
      uploadFiles(files, {
        onSuccess: (response) => {
          console.log(`Uploaded ${response.totalUploaded} images`);
          if (response.errors && response.errors.length > 0) {
            console.error('Some files failed:', response.errors);
          }
        },
      });
    }
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      style={{
        border: isDragging ? '2px dashed blue' : '2px dashed gray',
        padding: '2rem',
        textAlign: 'center',
        backgroundColor: isDragging ? '#f0f0f0' : 'white',
      }}
    >
      {isPending ? (
        <p>Uploading...</p>
      ) : (
        <p>Drag and drop images here, or click to select</p>
      )}
    </div>
  );
}
