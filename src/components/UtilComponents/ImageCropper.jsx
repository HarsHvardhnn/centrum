import React, { useState, useRef } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

export default function ImageCropper({ 
  imageSrc, 
  onCropComplete, 
  onCancel,
  aspect = 1 
}) {
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const imgRef = useRef(null);
  
  function onImageLoad(e) {
    const { naturalWidth: width, naturalHeight: height } = e.currentTarget;
    const initialCrop = centerAspectCrop(width, height, aspect);
    setCrop(initialCrop);
  }

  const getCroppedImg = () => {
    if (!completedCrop || !imgRef.current) return;

    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    // Set canvas size to the dimensions of the cropped image
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;

    // Draw the cropped image
    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY
    );

    // Get the data URL of the canvas
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          console.error('Canvas is empty');
          return;
        }
        blob.name = 'cropped.jpg';
        const croppedImageUrl = URL.createObjectURL(blob);
        resolve({ url: croppedImageUrl, blob });
      }, 'image/jpeg');
    });
  };

  const handleCropComplete = async () => {
    if (!completedCrop) return;
    
    try {
      const croppedImage = await getCroppedImg();
      if (croppedImage) {
        onCropComplete(croppedImage);
      }
    } catch (e) {
      console.error('Error during image cropping:', e);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
        <h3 className="text-xl font-medium text-gray-900 mb-4">Przytnij zdjęcie</h3>
        
        <div className="crop-container max-h-[60vh] overflow-auto mb-4">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={aspect}
            circularCrop={aspect === 1}
          >
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Crop me"
              onLoad={onImageLoad}
              className="max-w-full"
            />
          </ReactCrop>
        </div>
        
        <div className="flex justify-end gap-2 mt-4">
          <button 
            type="button" 
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Anuluj
          </button>
          <button 
            type="button" 
            onClick={handleCropComplete}
            className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600"
          >
            Zapisz zdjęcie
          </button>
        </div>
      </div>
    </div>
  );
} 