"use client";
import { DataItem } from '@/context/DataContext';
import { useSettings } from '@/context/SettingsContext';
import { getPreviousElements } from '@/lib/utils';
import clsx from 'clsx';
import { JSX } from 'react';

interface TrackingLineDivsProps {
  boxes: DataItem[];
  containerSize: { width: number; height: number; };
  isSelected: (id: number) => boolean;
  isGT?: boolean;
  isMinimap?: boolean;
  // Only draw segments for boxes up to this index (if provided)
  currentIndex?: number;
}
// This component creates line segments (using divs) between consecutive bounding box centers.
export function TrackingLineDivs({ boxes, containerSize, isSelected, isGT, currentIndex, isMinimap }: TrackingLineDivsProps) {
  const { settings } = useSettings();

  // Group boxes by tracklet_id
  const grouped = boxes.reduce((acc, box) => {
    if (!acc[box.tracklet_id]) {
      acc[box.tracklet_id] = [];
    }
    acc[box.tracklet_id].push(box);
    return acc;
  }, {} as Record<number, DataItem[]>);

  // Function to compute a line segment style between two points.
  const computeLineStyle = (x1: number, y1: number, x2: number, y2: number, color: string) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    return {
      position: 'absolute' as const,
      left: `${x1}px`,
      top: `${y1}px`,
      width: `${length}px`,
      height: '2px',
      backgroundColor: color,
      transform: `rotate(${angle}deg)`,
      transformOrigin: '0 0',
      pointerEvents: 'none' as const,
    };
  };

  // Prepare line segments for each tracklet.
  const lineSegments: JSX.Element[] = [];
  Object.entries(grouped).forEach(([trackletId, trackBoxes]) => {
    // Optionally filter by currentIndex.
    const displayBoxes = currentIndex !== undefined
      ? getPreviousElements(trackBoxes.slice(0, currentIndex + 1), currentIndex, settings.frame)
      : trackBoxes;

    // Only create segments if there are at least 2 points.
    if (displayBoxes.length < 2) return;

    // Assume boxes are in chronological order.
    for (let i = 0; i < displayBoxes.length - 1; i++) {
      const boxA = displayBoxes[i];
      const boxB = displayBoxes[i + 1];

      // Calculate centers of each box (scaling relative to container dimensions).
      const pitchHeight = 68 + 2 * 5
      const pitchWidth = 105 + 2 * 10
      
      const centerAX = isMinimap 
        ? (isGT 
            ? ((boxA.x_pitch + pitchWidth / 2) / pitchWidth) * containerSize.width 
            : (boxA.x_pitch / 125) * containerSize.width)
        : (boxA.x / 1920) * containerSize.width
      const centerAY = isMinimap 
        ? (isGT 
            ? ((boxA.y_pitch + pitchHeight / 2) / pitchHeight) * containerSize.height 
            : (boxA.y_pitch / 78) * containerSize.height)
        : (boxA.y / 1080) * containerSize.height
      const centerBX = isMinimap 
        ? (isGT 
            ? ((boxB.x_pitch + pitchWidth / 2) / pitchWidth) * containerSize.width 
            : (boxB.x_pitch / 125) * containerSize.width)
        : (boxB.x / 1920) * containerSize.width;
      const centerBY = isMinimap 
      ? (isGT 
          ? ((boxB.y_pitch + pitchHeight / 2) / pitchHeight) * containerSize.height 
          : (boxB.y_pitch / 78) * containerSize.height)
      : (boxB.y / 1080) * containerSize.height

      // Set stroke color based on team (assuming the entire tracklet is the same team).
      let strokeColor = '';
      if (boxA.team === 1) strokeColor = 'red';
      else if (boxA.team === 0) strokeColor = 'blue';
      else if (boxA.team === -1) strokeColor = 'yellow';
      else strokeColor = 'white';

      lineSegments.push(
        <div
          key={`${trackletId}-${i}`}
          style={computeLineStyle(centerAX, centerAY, centerBX, centerBY, strokeColor)}
          className={clsx(
            { 'hidden': !isSelected(parseInt(trackletId)) || (isGT ? !settings.trackingLineGTTracklet : !settings.trackingLinePredictionTracklet) }
          )} />
      );
      if (i === displayBoxes.length - 2) {
        lineSegments.push(
          <span
            key={`${trackletId}-${displayBoxes.length - 1}`}
            className={clsx(
              'relative text-xs text-white px-1 whitespace-nowrap',
              { 'bg-red-500': (boxA.team == 1) },
              { 'bg-blue-500': (boxA.team == 0) },
              { 'bg-yellow-500': (boxA.team == -1) },
              { 'hidden': (!isSelected(parseInt(trackletId)) || (isGT ? !settings.trackingLineGTTracklet : !settings.trackingLinePredictionTracklet) || (isGT ? settings.groundTruthTracklet : settings.predictionTracklet)) }
            )}
            style={{
              top: `${centerBY}px`,
              left: `${centerBX}px`,
            }}
          >
            {isGT ? "GT" : ''} {boxA.tracklet_id} {boxA.role} - {boxA.jersey_number}
          </span>
        );
      }
    }
  });

  return (
    <>
      {lineSegments}
    </>
  );
}
