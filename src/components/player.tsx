"use client"

import React, { createContext, ReactNode, useContext, useState, useEffect } from "react"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Play, Pause } from "lucide-react"
import { getImages } from "@/hooks/get-images"
import { useSettings } from "@/context/SettingsContext"

type ImageContextType = {
  images: string[];
  currentIndex: number;
  setCurrentIndex: (index: number | ((prevIndex: number) => number)) => void;
};

const ImageContext = createContext<ImageContextType | undefined>(undefined);

export const ImageProvider = ({ children }: { children: ReactNode }) => {
  const [images, setImages] = useState<string[]>([]);
  const { settings } = useSettings()

  useEffect(() => {
    async function fetchImages() {
      const imgs = await getImages(settings.folder);
      setImages(imgs);
    }
    fetchImages();
  }, [settings.folder]);

  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <ImageContext.Provider value={{ images, currentIndex, setCurrentIndex }}>
      {children}
    </ImageContext.Provider>
  );
};

export const useImage = () => {
  const context = useContext(ImageContext);
  if (!context) {
    throw new Error("useImage must be used within an ImageProvider");
  }
  return context;
};

export function Player() {
  const { images, currentIndex, setCurrentIndex } = useImage()

  const handleSliderChange = (values: number[]) => {
    const newIndex = values[0];
    // Ensure the new index is within the valid range of images
    if (newIndex >= 0 && newIndex < images.length) {
      setCurrentIndex(newIndex);
    }
  };

  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentIndex((prevIndex: number) => (prevIndex + 1) % images.length);
      }, 500);
    } else if (!isPlaying && interval) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPlaying, images.length, setCurrentIndex]);

  return (
    <div className="flex w-full gap-4">
      <Input className="w-15 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" value={currentIndex} onChange={(e) => setCurrentIndex(Number(e.target.value))} type="number"/>
      <Button variant="ghost" size="icon" onClick={() => setIsPlaying(!isPlaying)}>
        {isPlaying ? <Pause /> : <Play />}
      </Button>
      <Slider
        key={currentIndex}
        defaultValue={[currentIndex]}
        max={images.length - 1}
        step={1}
        onValueChange={handleSliderChange}
      />
    </div>
  )
}
