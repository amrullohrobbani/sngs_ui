import { useState, useEffect } from "react";
import { DataItem } from "@/context/DataContext";
import { useTrackletContext } from "@/context/TrackletContext";
import clsx from "clsx";
import Loading from "./loading";

interface CroppedImage {
    src: string;
    overlayColor?: string;
    placeholder?: boolean;
    frame: number; // Add the frame property
  }
  
  interface CroppedImagesGridProps {
    trackletId: number;
    imageUrlTemplate: string; // e.g. "https://example.com/images/frame-{frame}.jpg"
    data: DataItem[];
    attribute: "role" | "color" | "jersey_number" | "team";
    activate750: boolean
    useSettingTracklet: boolean;
  }

  interface TrackletGroup {
    trackletId: number;
    role: string
    color: string
    jersey_number: number
    team: number
    croppedImages: CroppedImage[];
  }

  const CroppedImagesGrid: React.FC<CroppedImagesGridProps> = ({
    trackletId,
    imageUrlTemplate,
    data,
    attribute,
    activate750,
    useSettingTracklet,
  }) => {
    // When useSettingTracklet is false, we use a flat array
    const [croppedImages, setCroppedImages] = useState<CroppedImage[]>([]);
    // When useSettingTracklet is true, we store groups of images by tracklet id
    const [groupedCroppedImages, setGroupedCroppedImages] = useState<TrackletGroup[]>([]);
    const [loading, setLoading] = useState<boolean>(false)

    const { isSelected } = useTrackletContext() 
  
    useEffect(() => {
      // Helper: Predefined Tailwind CSS 400 colors including teal-400
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
        "#2dd4bf", // teal-400
      ];
      const getRandomColor = (): string => {
        const randomIndex = Math.floor(Math.random() * tailwindColors.length);
        return tailwindColors[randomIndex];
      };
  
      // Function to process a single data group (for one tracklet)
      const processGroup = (groupData: DataItem[]): Promise<TrackletGroup> => {
        setLoading(true)
        // Compute majority value for the chosen attribute in this group
        const frequency: Record<string, number> = {};
        groupData.forEach(item => {
          const value = item[attribute]?.toString() ?? '';
          frequency[value] = (frequency[value] || 0) + 1;
        });
        let majorityValue = '';
        let maxCount = 0;
        for (const key in frequency) {
          if (frequency[key] > maxCount) {
            majorityValue = key;
            maxCount = frequency[key];
          }
        }
        // Mapping from wrong attribute value to overlay color for this group
        const overlayMapping: Record<string, string> = {};
  
        // Function to load an image and crop it based on a DataItem
        const loadAndCrop = (item: DataItem): Promise<CroppedImage> => {
          return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            const paddedFrame = item.frame.toString().padStart(6, '0');
            const frameUrl = imageUrlTemplate.replace('{frame}', paddedFrame);
            img.src = frameUrl;
            img.onload = () => {
              const canvas = document.createElement('canvas');
              canvas.width = item.w;
              canvas.height = item.h;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.drawImage(img, item.x, item.y, item.w, item.h, 0, 0, item.w, item.h);
              }
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
        };
  
        if (activate750) {
          const sortedData = [...groupData].sort((a, b) => a.frame - b.frame);
          const minFrame = 1;
          const maxFrame = 750; // Fixed maximum frame
          const promises: Promise<CroppedImage>[] = [];
          for (let f = minFrame; f <= maxFrame; f++) {
            const dataItem = sortedData.find(item => item.frame === f);
            if (dataItem) {
              promises.push(loadAndCrop(dataItem));
            } else {
              promises.push(Promise.resolve({ src: "", placeholder: true, frame: f }));
            }
          }
          return Promise.all(promises).then(croppedImages => ({
            trackletId: groupData[0].tracklet_id,
            role: groupData[0].role,
            color: groupData[0].color || "", // Ensure color is always a string
            jersey_number: groupData[0].jersey_number,
            team: groupData[0].team,
            croppedImages,
          }));
        } else {
          return Promise.all(groupData.map(item => loadAndCrop(item))).then(croppedImages => ({
            trackletId: groupData[0].tracklet_id,
            role: groupData[0].role,
            color: groupData[0].color || "", // Ensure color is always a string
            jersey_number: groupData[0].jersey_number,
            team: groupData[0].team,
            croppedImages,
          }));
        }
      };
  
      if (useSettingTracklet) {
        // Process all tracklets in the data
        // Group by tracklet_id
        const groups: Record<number, DataItem[]> = {};
        data.forEach(item => {
            if (!groups[item.tracklet_id]) {
              groups[item.tracklet_id] = [];
            }
            groups[item.tracklet_id].push(item);
        });
        const groupPromises = Object.values(groups).map(groupData => processGroup(groupData));
        Promise.all(groupPromises)
          .then(results => {
            setGroupedCroppedImages(results)
            setLoading(false)
          })
          .catch(err => console.error('Error processing tracklet groups:', err));
      } else {
        // Process only the selected trackletId
        const filteredData = data.filter(item => item.tracklet_id === trackletId);
        if (filteredData.length === 0) {
          setCroppedImages([]);
          return;
        }
        // Compute majority value for the chosen attribute in this group
        const frequency: Record<string, number> = {};
        filteredData.forEach(item => {
          const value = item[attribute]?.toString() ?? '';
          frequency[value] = (frequency[value] || 0) + 1;
        });
        let majorityValue = '';
        let maxCount = 0;
        for (const key in frequency) {
          if (frequency[key] > maxCount) {
            majorityValue = key;
            maxCount = frequency[key];
          }
        }
        const overlayMapping: Record<string, string> = {};
        const loadAndCrop = (item: DataItem): Promise<CroppedImage> => {
          return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            const paddedFrame = item.frame.toString().padStart(6, '0');
            const frameUrl = imageUrlTemplate.replace('{frame}', paddedFrame);
            img.src = frameUrl;
            img.onload = () => {
              const canvas = document.createElement('canvas');
              canvas.width = item.w;
              canvas.height = item.h;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.drawImage(img, item.x, item.y, item.w, item.h, 0, 0, item.w, item.h);
              }
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
        };
  
        if (activate750) {
          const sortedData = [...filteredData].sort((a, b) => a.frame - b.frame);
          const minFrame = sortedData[0].frame;
          const maxFrame = 740; // Fixed maximum frame
          const promises: Promise<CroppedImage>[] = [];
          for (let f = minFrame; f <= maxFrame; f++) {
            const dataItem = sortedData.find(item => item.frame === f);
            if (dataItem) {
              promises.push(loadAndCrop(dataItem));
            } else {
              promises.push(Promise.resolve({ src: "", placeholder: true, frame: f }));
            }
          }
          Promise.all(promises)
            .then(results => {
              setCroppedImages(results)
              setLoading(false)
            })
            .catch(err => console.error('Error processing images:', err));
        } else {
          Promise.all(filteredData.map(item => loadAndCrop(item)))
            .then(results => {
              setCroppedImages(results)
              setLoading(false)
            })
            .catch(err => console.error('Error processing images:', err));
        }
      }
    }, [trackletId, imageUrlTemplate, data, attribute, activate750, useSettingTracklet]);
  
    return (
      <>
        {loading ? (
          <div className="py-70 px-150 w-max h-max flex justify-center items-center">
            <Loading />
          </div>
        ): <div />}
        {useSettingTracklet ? (
          // Display grids for all tracklets
          <div>
            {
              groupedCroppedImages.map((group) => (
                <div key={group.trackletId} className={
                  clsx(
                    "mb-2",
                    { 'hidden': (!isSelected(group.trackletId)) }
                  )
                }>
                  <h3 className="font-semibold text-white">Tracklet {group.trackletId} • Team {group.team === 1 ? "Left" : group.team === 0 ? "Right" : "-"} • {group.role.charAt(0).toUpperCase() + group.role.slice(1)} • JN {group.jersey_number}</h3>
                  <div className="flex flex-nowrap gap-1">
                    {group.croppedImages.map((item, index) => (
                      <div key={index} className="relative w-8">
                        {item.placeholder ? (
                          <div className="bg-gray-400 w-full h-20 flex items-center justify-center text-white object-contain" />
                        ) : (
                          <>
                            <img src={item.src} alt={`Cropped image ${item.frame}`} className="w-full h-20 object-contain" />
                            {item.overlayColor && (
                              <div
                                className="absolute inset-0"
                                style={{ backgroundColor: item.overlayColor, opacity: 0.4 }}
                              />
                            )}
                          </>
                        )}
                        <span className="absolute text-xs bottom-0 left-0 text-white">
                          {item.frame}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            }
          </div>
        ) : (
          // Display grid for the single tracklet
          <div className="grid grid-cols-40 gap-1">
            {croppedImages.map((item, index) => (
              <div key={index} className="relative">
                {item.placeholder ? (
                  <div className="bg-gray-400 w-full h-20 flex items-center justify-center text-white" />
                ) : (
                  <>
                    <img src={item.src} alt={`Cropped image ${item.frame}`} className="w-full h-20" />
                    {item.overlayColor && (
                      <div
                        className="absolute inset-0"
                        style={{ backgroundColor: item.overlayColor, opacity: 0.4 }}
                      />
                    )}
                  </>
                )}
                <span className="absolute text-xs bottom-0 left-0 text-white">
                  {item.frame}
                </span>
              </div>
            ))}
          </div>
        )}
      </>
    );
  };
  
  export default CroppedImagesGrid;