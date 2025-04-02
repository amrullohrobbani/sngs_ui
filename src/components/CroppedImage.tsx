import { useState, useEffect } from "react";
import { DataItem } from "@/context/DataContext";

interface CroppedImage {
    src: string;
    overlayColor?: string;
    frame: number; // Add the frame property
  }
  
  interface CroppedImagesGridProps {
    trackletId: number;
    imageUrlTemplate: string; // e.g. "https://example.com/images/frame-{frame}.jpg"
    data: DataItem[];
    attribute: "role" | "color" | "jersey_number" | "team";
    activate750: boolean
  }
  
  const CroppedImagesGrid: React.FC<CroppedImagesGridProps> = ({
    trackletId,
    imageUrlTemplate,
    data,
    attribute,
    activate750
  }) => {
    const [croppedImages, setCroppedImages] = useState<CroppedImage[]>([]);
  
    useEffect(() => {
      // Filter data items for the specified trackletId
      const filteredData = data.filter(item => item.tracklet_id === trackletId);
      if (filteredData.length === 0) {
        setCroppedImages([]);
        return;
      }
  
      // Compute majority value for the specified attribute
      const frequency: Record<string, number> = {};
      filteredData.forEach(item => {
        const value = item[attribute]?.toString() ?? '';
        frequency[value] = (frequency[value] || 0) + 1;
      });
      let majorityValue = '';
      let maxCount = 0;
      for (const key in frequency) {
        if (frequency[key] > maxCount) {
          maxCount = frequency[key];
          majorityValue = key;
        }
      }
  
      // Mapping from wrong attribute value to overlay color
      const overlayMapping: Record<string, string> = {};
  
      const tailwindColors = [
        "#38bdf8", // sky-400
        "#60a5fa", // blue-400
        "#818cf8", // indigo-400
        "#f472b6", // fuchsia-400
        "#f87171", // red-400
        "#facc15", // yellow-400
        "#fb923c", // orange-400
        "#bef264", // lime-400
        "#4ade80", // green-400
        "#34d399", // emerald-400
        "#d48871"
      ];
  
      // Helper function to select a random color from the predefined list
      const getRandomColor = (): string => {
        const randomIndex = Math.floor(Math.random() * tailwindColors.length);
        return tailwindColors[randomIndex];
      };
  
      // Process all filtered data items concurrently
      const loadAndCropPromises = filteredData.map(item => {
        return new Promise<CroppedImage>((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'anonymous'; // Handle CORS if needed
  
          // Pad the frame number with leading zeros (6 digits)
          const paddedFrame = item.frame.toString().padStart(6, '0');
          const frameUrl = imageUrlTemplate.replace('{frame}', paddedFrame);
          img.src = frameUrl;
  
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = item.w;
            canvas.height = item.h;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              // Draw the cropped area from the loaded image
              ctx.drawImage(img, item.x, item.y, item.w, item.h, 0, 0, item.w, item.h);
            }
            // Check the value of the chosen attribute
            const itemValue = item[attribute]?.toString() ?? '';
            let overlayColor: string | undefined = undefined;
            if (itemValue !== majorityValue) {
              if (!overlayMapping[itemValue]) {
                overlayMapping[itemValue] = getRandomColor();
              }
              overlayColor = overlayMapping[itemValue];
            }
            resolve({ src: canvas.toDataURL(), overlayColor, frame: item.frame });
          };
  
          img.onerror = (err) => {
            console.error('Error loading image for frame:', item.frame, err);
            reject(err);
          };
        });
      });
  
      Promise.all(loadAndCropPromises)
        .then(results => setCroppedImages(results))
        .catch(err => console.error('Error processing images:', err));
    }, [trackletId, imageUrlTemplate, data, attribute]);
  
    return (
      <div className="grid grid-cols-40 gap-0.5">
        {Array.from({ length: 750 }, (_, index) => {
          const croppedImage = croppedImages.find((obj) => obj.frame == index + 1);
          if (!activate750 && !croppedImage) {
        return null; // Skip the div if activate750 is false and the object is undefined
          }
          return (
        <div
          key={index}
          className={`relative ${!croppedImage ? "bg-slate-500" : ""}`}
        >
          {croppedImage && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={croppedImage.src} alt={`Cropped image ${index}`} className="w-full h-20" />
              {croppedImage.overlayColor && (
                <div
                  className="absolute inset-0 top-0 left-0"
                  style={{
                backgroundColor: croppedImage.overlayColor,
                opacity: 0.4,
                  }}
              />
              )}
              <span className="text-white absolute font-semibold pl-0.5 text-xs left-0 bottom-0">
                {croppedImage.frame}
              </span>
            </>
          )}
          {!croppedImage && croppedImages.length > 0 && (
            <>
              <div className="h-20" />
              <span className="text-white absolute font-semibold pl-0.5 text-xs left-0 bottom-0">
                {index}
              </span>
            </>
          )}
        </div>
          );
        })}
      </div>
    );
  };
  
  export default CroppedImagesGrid;