"use client"

import React, { useEffect, useState, useRef } from 'react'
import { useEvent } from './player-action-spotting'
import Image from 'next/image' // Importing Image from next/image
import { useSettings } from '@/context/SettingsContext'


export const ImagePlayer: React.FC = () => {
    const { events, currentIndex } = useEvent()
    const imageRef = useRef<HTMLImageElement | null>(null);
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
    const [originalSrc, setOriginalSrc] = useState<string>('/data/Data-1/original_frame/000001.jpg')
    const [src, setSrc] = useState<string>('/data/Data-1/original_frame/000001.jpg')

    const { settings } = useSettings()

    useEffect(() => {
        if (events && events[currentIndex]) {
            const getImagePath = (frame: number) => {
                const folderIndex = Math.floor((frame - 1) / 1000);
                const folderName = `s1_rally_${String(folderIndex).padStart(3, '0')}`;
                const fileName = `img_${String((frame - 1) % 1000 + 1).padStart(6, '0')}.jpg`;
                return `/action-spotting/${settings.folder}/${folderName}/${fileName}`;
            };

            const originalFramePath = getImagePath(events[currentIndex].OriginalFrame);
            const framePath = getImagePath(events[currentIndex].Frame);
            
            setOriginalSrc(originalFramePath);
            setSrc(framePath);
        }
    }, [events, currentIndex, setOriginalSrc, setSrc, settings.folder]);

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
        <div className='w-full grid grid-cols-2 items-center gap-10 p-5'>
            <div
                className='relative inline-block w-full h-fit'
            >
                {originalSrc?
                    <Image
                        src={originalSrc}
                        alt="Image with bounding boxes"
                        sizes="100vw"
                        style={{
                            width: '100%',
                            height: 'auto',
                        }}
                        className='rounded-xl object-contain'
                        quality={100}
                        priority={true}
                        width={1920} // base width for aspect ratio
                        height={1080} // base height for aspect ratio
                    />
                :
                    <div/>
                }
                <div className="absolute top-0 left-0 text-white p-3 font-semibold bg-blue-400 rounded-lg opacity-80 ">
                    Original { events? events[currentIndex]?.OriginalFrame: "" }
                </div>
            </div>
          
            <div
                className='relative inline-block w-full h-fit'
            >
                {src?
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
                        quality={100}
                        priority={true}
                        width={1920} // base width for aspect ratio
                        height={1080} // base height for aspect ratio
                    />
                :
                    <div/>
                }
                <div className="absolute top-0 left-0 text-white p-3 font-semibold bg-blue-400 rounded-lg opacity-80 ">
                    <p>Corrected { events? events[currentIndex]?.Frame : "" }</p>
                    <p>FrameDiff: { events? events[currentIndex]?.FrameDifference : "" } </p>
                </div>
                {containerSize.width > 0 && (
                    <div 
                        className="absolute bg-transparent origin-top-left"
                        style={{
                            top: events? `${(events[currentIndex]?.y  / 720) * containerSize.height}px`: 0,
                            left: events? `${(events[currentIndex]?.x  / 1280) * containerSize.width}px`: 0,
                        }}
                    >
                        <div className="rounded-full p-1 bg-[#a6793d] -left-0.5 -top-0.5 absolute"></div>
                        <div className="origin-top-left absolute top-0.25 left-0.5 w-15 h-0.5 bg-[#a6793d] rotate-60"></div>
                        <div className="origin-top-left absolute top-13 left-7.75 w-10 h-0.5 bg-[#a6793d]"></div>
                        <div className="bg-gradient-to-r from-stone-700 from-10% via-stone-800 to-stone-700 to-90% py-0.25 px-3 text-sm text-white skew-x-30 absolute font-bold top-7 left-6.5 whitespace-nowrap">
                            <div className="-skew-x-30">
                                { String(events[currentIndex]?.Event) }
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
