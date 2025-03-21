"use client"

import { DataContext, DataItem } from '@/context/DataContext';
import Image from 'next/image';
import { useRef, useEffect, useState, useContext } from 'react';
import { useTrackletContext } from "@/context/TrackletContext"
import { useSettings } from '@/context/SettingsContext'
import { AnnotationContext } from '@/context/AnnotationContext';
import { TrackingLineDivs } from './TrackingLineDivs';
import { BoxVisualization } from './BoxVisualization';
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
  } from "@/components/ui/resizable"
import clsx from 'clsx';

interface ImageWithBoundingBoxesProps {
  src: string;
  boxes: DataItem[];
  gtdata?: DataItem[];
  currentIndex?: number;
}

export function ImageWithBoundingBoxes({ src, boxes, gtdata, currentIndex }: ImageWithBoundingBoxesProps) {
    const imageRef = useRef<HTMLImageElement | null>(null);
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
    const {
        isSelected,
        isGroundTruthSelected
      } = useTrackletContext()

    const { data } = useContext(DataContext)
    const { annotations } = useContext(AnnotationContext)
    const { settings } = useSettings()

    // Update container dimensions after mount (or image load)
    useEffect(() => {
        const container = imageRef.current;
        if (!container) return;
    
        const resizeObserver = new ResizeObserver((entries) => {
          for (const entry of entries) {
            const { width, height } = entry.contentRect;
            setContainerSize({ width, height });
          }
        });
    
        resizeObserver.observe(container);
    
        return () => {
          resizeObserver.disconnect();
        };
      }, []);

    return (
      <div
          className='relative inline-block w-full h-full'
      >
        <Image
            ref={imageRef}
            src={src}
            alt="Image with bounding boxes"
            sizes="100vw"
            style={{
                width: '100%',
                height: 'auto',
            }}
            className='rounded-xl object-contain'
            quality={1}
            priority={true}
            width={1920} // base width for aspect ratio
            height={1080} // base height for aspect ratio
        />

        {(containerSize.width > 0 && settings.trackingLinePredictionTracklet) && (
            <div 
              style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: containerSize.width,
                  height: containerSize.height,
                  pointerEvents: 'none'
              }}
            >
                <TrackingLineDivs boxes={data} containerSize={containerSize} currentIndex={currentIndex} isSelected={isSelected} />
            </div>
        )}

        {containerSize.width > 0 && settings.trackingLineGTTracklet&& (
            <div 
              style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: containerSize.width,
                  height: containerSize.height,
                  pointerEvents: 'none'
              }}
            >
                <TrackingLineDivs boxes={annotations} containerSize={containerSize} currentIndex={currentIndex} isSelected={isGroundTruthSelected} isGT />
            </div>
        )}

        {settings.predictionTracklet && (boxes.map((box, index) => (
            <BoxVisualization key={index} box={box} index={index.toString()} containerSize={containerSize} isSelected={isSelected} />
        )))}
        {settings.groundTruthTracklet && (gtdata?.map((box, index) => (
            <BoxVisualization key={index} box={box} index={index.toString()} containerSize={containerSize} isSelected={isGroundTruthSelected} isGT />
        )))}
        {(containerSize.width > 0 && settings.minimap) && (
            <div 
              style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: containerSize.width,
                  height: containerSize.height,
                  pointerEvents: 'none'
              }}
            >
                <ResizablePanelGroup
                    direction="horizontal"
                    className="w-full rounded-lg"
                >
                    <ResizablePanel defaultSize={74} />
                    <ResizableHandle className='bg-transparent' />
                    <ResizablePanel defaultSize={26}>
                    <ResizablePanel defaultSize={100}>
                        <Minimap src={'/Radar.png'} boxes={boxes} gtdata={gtdata} currentIndex={currentIndex} className='opacity-80 hover:opacity-100 brightness-90' />
                    </ResizablePanel>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>
        )}

      </div>
    );
};

interface MinimapProps extends React.HTMLAttributes<HTMLDivElement> {
    src: string;
    boxes: DataItem[];
    gtdata?: DataItem[];
    currentIndex?: number;
}

export function Minimap({ src, boxes, gtdata, currentIndex, ...props }: MinimapProps) {
    const imageRef = useRef<HTMLImageElement | null>(null);
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
    const { isSelected, isGroundTruthSelected } = useTrackletContext();
    const { data } = useContext(DataContext);
    const { annotations } = useContext(AnnotationContext);
    const { settings } = useSettings();

    useEffect(() => {
        const container = imageRef.current;
        if (!container) return;
    
        const resizeObserver = new ResizeObserver((entries) => {
          for (const entry of entries) {
            const { width, height } = entry.contentRect;
            setContainerSize({ width, height });
          }
        });
    
        resizeObserver.observe(container);
    
        return () => {
          resizeObserver.disconnect();
        };
    }, []);

    return (
        <div className="relative inline-block w-full h-full">
            <Image
                ref={imageRef}
                src={src}
                alt="Minimap"
                sizes="100vw"
                style={{
                    width: '100%',
                    height: 'auto',
                }}
                className={
                    clsx(
                        "rounded-xl object-contain",
                        props.className
                    )
                }
                quality={1}
                priority={true}
                width={1920}
                height={1080}
            />

            {containerSize.width > 0 && settings.trackingLinePredictionTracklet && (
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: containerSize.width,
                        height: containerSize.height,
                        pointerEvents: 'none',
                    }}
                >
                    <TrackingLineDivs
                        boxes={data}
                        containerSize={containerSize}
                        currentIndex={currentIndex}
                        isSelected={isSelected}
                        isMinimap
                    />
                </div>
            )}

            {containerSize.width > 0 && settings.trackingLineGTTracklet && (
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: containerSize.width,
                        height: containerSize.height,
                        pointerEvents: 'none',
                        opacity: settings.predictionTracklet? 0.5: 1
                    }}
                >
                    <TrackingLineDivs
                        boxes={annotations}
                        containerSize={containerSize}
                        currentIndex={currentIndex}
                        isSelected={isGroundTruthSelected}
                        isGT
                        isMinimap
                    />
                </div>
            )}

            {settings.predictionTracklet &&
                boxes.map((box, index) => (
                    <BoxVisualization
                        key={`${index}-${containerSize.width}-${containerSize.height}`}
                        box={box}
                        index={index.toString()}
                        containerSize={containerSize}
                        isSelected={isSelected}
                        isMinimap
                    />
                ))}
            {settings.groundTruthTracklet &&
                gtdata?.map((box, index) => (
                    <BoxVisualization
                        key={`${index}-${containerSize.width}-${containerSize.height}`}
                        box={box}
                        index={index.toString()}
                        containerSize={containerSize}
                        isSelected={isGroundTruthSelected}
                        isGT
                        isMinimap
                    />
                ))}
        </div>
    );
}

export default ImageWithBoundingBoxes;
