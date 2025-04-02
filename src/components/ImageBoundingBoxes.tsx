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
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import clsx from 'clsx';
import { assignTeamPlots, computeTeamAccuracy } from '@/lib/utils';
import CroppedImagesGrid from './CroppedImage';
import { Checkbox } from './ui/checkbox';

interface ImageWithBoundingBoxesProps {
  src: string;
  boxes: DataItem[];
  gtdata?: DataItem[];
  currentIndex?: number;
}

export function ImageWithBoundingBoxes({ src, boxes, gtdata, currentIndex }: ImageWithBoundingBoxesProps) {
    const imageRef = useRef<HTMLImageElement | null>(null);
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
    const [attributes, setAttributes] = useState<"role" | "color" | "jersey_number" | "team">("role")
    const [tracklet, setTracklet] = useState(0)
    const [open, setOpen] = useState(false)
    const [activate750, setActivate750] = useState(false)
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
        {(containerSize.width > 0 && settings.idSwitching) && (
            <div className="absolute w-full h-full overflow-scroll bg-slate-900/80 top-0 left-0 rounded-lg">
                <div className="flex p-5 gap-5 fixed z-1 bg-slate-900/80 w-[71%]">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">{attributes.charAt(0).toUpperCase() + attributes.slice(1)}</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56">
                            <DropdownMenuLabel>Attributes</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuRadioGroup value={attributes} onValueChange={(value) => setAttributes(value as "role" | "color" | "jersey_number" | "team")}>
                                <DropdownMenuRadioItem value="role">Role</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="jersey_number">Jersey Number</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="color">Jersey Color</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="team">Team</DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className="w-[200px] justify-between"
                            >
                            {tracklet
                                ? [...new Set(data.map(item => item.tracklet_id))].find((tracklet_id) => tracklet_id === Number(tracklet))
                                : "Select tracklet_id..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-0">
                            <Command>
                            <CommandInput placeholder="Search tracklet_id..." />
                            <CommandList>
                                <CommandEmpty>No tracklet_id found.</CommandEmpty>
                                <CommandGroup>
                                {[...new Set(data.map(item => item.tracklet_id))].map((tracklet_id) => (
                                    <CommandItem
                                        key={tracklet_id}
                                        value={tracklet_id.toString()}
                                        onSelect={(currentValue) => {
                                            setTracklet(Number(currentValue) === tracklet ? 0 : Number(currentValue))
                                            setOpen(false)
                                        }}
                                    >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            tracklet === tracklet_id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {tracklet_id}
                                    </CommandItem>
                                ))}
                                </CommandGroup>
                            </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="terms"
                            checked={Boolean(activate750)}
                            onClick={() => setActivate750(!activate750)}
                        />
                        <label
                            htmlFor="terms"
                            className="text-white text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            Activate Gap Frame
                        </label>
                    </div>
                </div>
                <div className='w-full p-5 pt-20 flex'>
                    <CroppedImagesGrid 
                        key={tracklet + "-" + attributes + "-" + activate750}
                        trackletId={tracklet}
                        imageUrlTemplate={"/data" + settings.folder + "/img1/{frame}.jpg"}
                        data={data} 
                        attribute={attributes}
                        activate750={activate750}
                    />
                </div>
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
                ))
            }

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
                ))
            }
            
            <div className="absolute bottom-0 w-full justify-center bg-blue-900 opacity-70 text-sm hidden">
                {(() => {
                    const accuracy = computeTeamAccuracy(annotations || [], data || [])
                    const teamAssigment = assignTeamPlots(data)
                    return (
                        <div className='grid grid-cols-2 text-white w-full px-16'>
                            <p>Team Assignment (Left):<br /> {teamAssigment.leftPlotTitle}</p>
                            <p>Team Assignment (Right):<br /> {teamAssigment.rightPlotTitle}</p>
                            <p>Matching Accuracy: {(accuracy.matchingMetrics && Object.values(accuracy.matchingMetrics).reduce((sum, value) => sum + value.accuracy, 0) / Object.values(accuracy.matchingMetrics).length).toFixed(2)}%</p>
                        </div>
                    );
                })()}
            </div>
        </div>
    );
}

export default ImageWithBoundingBoxes;
