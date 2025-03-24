"use client";
import { DataItem } from '@/context/DataContext';
import { useSettings } from '@/context/SettingsContext';
import clsx from 'clsx';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { memo } from 'react';

type DimensionType = 'top' | 'left' | 'width' | 'height'

export const BoxVisualization = memo(function BoxVisualization({ box, index, containerSize, isSelected, isGT = false, isMinimap = false }: { box: DataItem; index: string; containerSize: { width: number; height: number; }; isSelected: (id: number) => boolean; isGT?: boolean; isMinimap?: boolean}) {
  const { settings } = useSettings();

  function getBoxDimension(
      type: DimensionType,
  ): string {
      const pitchHeight = 68 + 2 * 5
      const pitchWidth = 105 + 2 * 10
      
      const calculations: Record<DimensionType, string> = {
          top: isMinimap 
              ? (isGT 
                  ? `${((box.y_pitch + pitchHeight / 2) / pitchHeight) * containerSize.height}px` 
                  : `${(box.y_pitch / 78) * containerSize.height}px`)
              : `${(box.y / 1080) * containerSize.height}px`,
          left: isMinimap 
              ? (isGT 
                  ? `${((box.x_pitch + pitchWidth / 2) / pitchWidth) * containerSize.width}px` 
                  : `${(box.x_pitch / 125) * containerSize.width}px`)
              : `${(box.x / 1920) * containerSize.width}px`,
          width: isMinimap 
              ? (isGT 
                  ? `0px` 
                  : `0px`)
              : `${(box.w / 1920) * containerSize.width}px`,
          height: isMinimap 
              ? (isGT 
                  ? `0px` 
                  : `0px`)
              : `${(box.h / 1080) * containerSize.height}px`,
      };
      
      return calculations[type];
  }

  return (
    <div
      key={index}
      style={{
        position: 'absolute',
        top: getBoxDimension('top'),
        left: getBoxDimension('left'),
        width: getBoxDimension('width'),
        height: getBoxDimension('height'),
        opacity: isGT && settings.predictionTracklet? 0.5: 1,
      }}
      className={clsx(
        { 'border-2 border-red-500': (box.team == 1) },
        { 'border-2 border-blue-500': (box.team == 0) },
        { 'border-2 border-yellow-500': (box.team == -1) },
        { 'hidden': !isSelected(box.tracklet_id) || (isGT ? !settings.groundTruthTracklet : !settings.predictionTracklet) }
      )}
    >
      {
        isMinimap?
          <>
            {/* <div
              className={
                clsx(
                  'absolute h-0.5 bg-amber-400 origin-left',
                )
              }
              style={{
                width: `${(Math.sqrt((box.vx ?? 0) * (box.vx ?? 0) + (box.vy ?? 0) * (box.vy ?? 0)))*10}px`,
                transform: `rotate(${Math.atan2(box.vy ?? 0, box.vx ?? 0)}rad)`,
              }}
            /> */}
            <Avatar className={clsx(
              'absolute origin-top-left -top-1.5 -left-1.5 text-lg text-white px-1 whitespace-nowrap scale-45 border-white border',
              { 'bg-red-500': (box.team == 1) },
              { 'bg-blue-500': (box.team == 0) },
              { 'bg-yellow-500': (box.team == -1) },
            )}>
              <AvatarFallback className='bg-transparent'>
                {box.role.toLowerCase() == "player" && box.jersey_number !== 100? box.jersey_number.toString() : "  "}
              </AvatarFallback>
            </Avatar>
          </>
        :
        <span
          className={clsx(
            'relative left-[-2px] text-xs text-white px-1 whitespace-nowrap',
            { 'bg-red-500': (box.team == 1) },
            { 'bg-blue-500': (box.team == 0) },
            { 'bg-yellow-500': (box.team == -1) },
            isGT ? 'bottom-2' : 'bottom-5'
          )}>
          {isGT ? "GT" : ''} {box.tracklet_id} {box.role} - {box.jersey_number}
        </span>
      }
    </div>
  );
})
