import { useState, useEffect, Fragment } from "react";
import { DataItem } from "@/context/DataContext";
import { useTrackletContext } from "@/context/TrackletContext";
import clsx from "clsx";
import { Progress } from "./ui/progress";
import { useSettings } from "@/context/SettingsContext";

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
    gtData?: DataItem[];
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
    gtData,
    attribute,
    activate750,
    useSettingTracklet,
  }) => {
    // When useSettingTracklet is false, we use a flat array
    const [croppedImages, setCroppedImages] = useState<CroppedImage[]>([]);
    // When useSettingTracklet is true, we store groups of images by tracklet id
    const [groupedCroppedImages, setGroupedCroppedImages] = useState<TrackletGroup[]>([]);
    const [groupedGTCroppedImages, setGroupedGTCroppedImages] = useState<TrackletGroup[]>([]);

    const { isSelected, isGroundTruthSelected } = useTrackletContext() 
    const { settings } = useSettings()
    const [progress, setProgress] = useState<number>(0)
  
    useEffect(() => {
      // Reset progress at start
      setProgress(0);
      let totalTasks = 0;
      let completedTasks = 0;
      const updateProgress = () => {
        completedTasks++;
        setProgress(Math.floor((completedTasks / totalTasks) * 100));
      };
  
      // Predefined Tailwind CSS 400 colors including teal-400
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
  
      // Helper: load and crop a single image with progress reporting.
      const loadAndCropWithProgress = (
        item: DataItem,
        majorityValue: string,
        overlayMapping: Record<string, string>
      ): Promise<CroppedImage> => {
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
            updateProgress();
            resolve({ src: canvas.toDataURL(), overlayColor, frame: item.frame });
          };
          img.onerror = (err) => {
            console.error('Error loading image for frame:', item.frame, err);
            updateProgress();
            reject(err);
          };
        });
      };
  
      // Process a single group (tracklet) with progress reporting.
      const processGroupWithProgress = (groupData: DataItem[]): Promise<TrackletGroup> => {
        // Compute majority value for the chosen attribute in this group.
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
        // Overlay mapping for wrong attribute values.
        const overlayMapping: Record<string, string> = {};
  
        if (activate750) {
          const sortedData = [...groupData].sort((a, b) => a.frame - b.frame);
          const minFrame = 1;
          const totalFrames = 750;
          const maxFrame = totalFrames;
          const promises: Promise<CroppedImage>[] = [];
          for (let f = minFrame; f <= maxFrame; f++) {
            const dataItem = sortedData.find(item => item.frame === f);
            if (dataItem) {
              promises.push(loadAndCropWithProgress(dataItem, majorityValue, overlayMapping));
            } else {
              // If missing, resolve a placeholder and update progress.
              promises.push(
                Promise.resolve({ placeholder: true, frame: f, src: '' }).then(result => {
                  updateProgress();
                  return result;
                })
              );
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
          const promises = groupData.map(item =>
            loadAndCropWithProgress(item, majorityValue, overlayMapping)
          );
          return Promise.all(promises).then(croppedImages => ({
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
        // Group the data by tracklet_id.
        const groups: Record<number, DataItem[]> = {};
        const groupsGT: Record<number, DataItem[]> = {};
        data.forEach(item => {
          if (!groups[item.tracklet_id]) {
            groups[item.tracklet_id] = [];
          }
          groups[item.tracklet_id].push(item);
        });
        if(settings.groundTruthTracklet) {
          gtData?.forEach(item => {
            if (!groupsGT[item.tracklet_id]) {
              groupsGT[item.tracklet_id] = [];
            }
            groupsGT[item.tracklet_id].push(item);
          });
        }
        // Calculate total tasks across all groups.
        Object.values(groups).forEach(groupData => {
          totalTasks += activate750 ? 750 : groupData.length;
        });
        if(settings.groundTruthTracklet) {
          Object.values(groupsGT).forEach(groupData => {
            totalTasks += activate750 ? 750 : groupData.length;
          });
        }
        const groupPromises = Object.values(groups).map(groupData =>
          processGroupWithProgress(groupData)
        );
        const groupGTPromises = Object.values(groupsGT).map(groupData =>
          processGroupWithProgress(groupData)
        );
        Promise.all(groupPromises)
          .then(results => setGroupedCroppedImages(results))
          .catch(err => console.error('Error processing tracklet groups:', err));
        Promise.all(groupGTPromises)
          .then(results => setGroupedGTCroppedImages(results))
          .catch(err => console.error('Error processing GT tracklet groups:', err));
      } else {
        // Non-grouped: process only the selected trackletId.
        const filteredData = data.filter(item => item.tracklet_id === trackletId);
        if (filteredData.length === 0) {
          setCroppedImages([]);
          return;
        }
        totalTasks = activate750 ? 750 : filteredData.length;
        // Compute majority value for this set.
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
        if (activate750) {
          const sortedData = [...filteredData].sort((a, b) => a.frame - b.frame);
          const minFrame = 1;
          const totalFrames = 750;
          const maxFrame = totalFrames;
          const promises: Promise<CroppedImage>[] = [];
          for (let f = minFrame; f <= maxFrame; f++) {
            const dataItem = sortedData.find(item => item.frame === f);
            if (dataItem) {
              promises.push(loadAndCropWithProgress(dataItem, majorityValue, overlayMapping));
            } else {
              promises.push(
                Promise.resolve({ src: "", placeholder: true, frame: f }).then(result => {
                  updateProgress();
                  return result;
                })
              );
            }
          }
          Promise.all(promises)
            .then(results => setCroppedImages(results))
            .catch(err => console.error('Error processing images:', err));
        } else {
          const promises = filteredData.map(item =>
            loadAndCropWithProgress(item, majorityValue, overlayMapping)
          );
          Promise.all(promises)
            .then(results => setCroppedImages(results))
            .catch(err => console.error('Error processing images:', err));
        }
      }
    }, [trackletId, imageUrlTemplate, data, attribute, activate750, useSettingTracklet]);
  
    
    return (
      <div className="flex flex-col w-full">
        { progress < 100 &&
          (
            <div className="w-full">
              <Progress value={progress}/>
            </div>
          )
        }
        {useSettingTracklet ? (
          // Display grids for all tracklets
          <div>
            {
              groupedCroppedImages.map((group) => (
                <div key={group.trackletId} className={
                  clsx(
                    "mb-2 flex flex-col",
                    { 'hidden': (!isSelected(group.trackletId)) }
                  )
                }>
                  <h3 className="font-semibold text-white">Tracklet {group.trackletId} • Team {group.team === 1 ? "Left" : group.team === 0 ? "Right" : "-"} • {group.role.charAt(0).toUpperCase() + group.role.slice(1)} • JN {group.jersey_number}</h3>
                  <div className="flex flex-nowrap gap-1 w-full">
                    {group.croppedImages.map((item, index) => (
                      <div key={index} className="relative flex w-8 min-w-8">
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
            {
              groupedGTCroppedImages.map((group) => (
                <div key={group.trackletId} className={
                  clsx(
                    "mb-2 flex flex-col",
                    { 'hidden': (!isGroundTruthSelected(group.trackletId)) }
                  )
                }>
                  <h3 className="font-semibold text-white">GT Tracklet {group.trackletId} • Team {group.team === 1 ? "Left" : group.team === 0 ? "Right" : "-"} • {group.role.charAt(0).toUpperCase() + group.role.slice(1)} • JN {group.jersey_number}</h3>
                  <div className="flex flex-nowrap gap-1 w-full">
                    {group.croppedImages.map((item, index) => (
                      <div key={index} className="relative flex w-8 min-w-8">
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
                          {index + 1}
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
          <>
            {(() => {
              const group = data?.find((obj) => obj.tracklet_id == trackletId);
              return (
                <h3 className="font-semibold text-white">Tracklet {group?.tracklet_id} • Team {group?.team === 1 ? "Left" : group?.team === 0 ? "Right" : "-"} • {group?.role ? group?.role?.charAt(0).toUpperCase() + group?.role?.slice(1) : ""} • JN {group?.jersey_number}</h3>
              );
            })()}
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
          </>
        )}
      </div>
    );
  };
  
  export default CroppedImagesGrid;