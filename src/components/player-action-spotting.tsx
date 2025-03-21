"use client"

import React, { createContext, ReactNode, useContext, useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SkipBack, SkipForward } from "lucide-react"
import { useSettings } from "@/context/SettingsContext"
import { DataRow, processCSVFiles } from "@/hooks/get-action-spotting"

type EventContextType = {
  events: DataRow[];
  currentIndex: number;
  setCurrentIndex: (index: number | ((prevIndex: number) => number)) => void;
};

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider = ({ children }: { children: ReactNode }) => {
  const [events, setEvents] = useState<DataRow[]>([]);
  const { settings } = useSettings()

  useEffect(() => {
    async function fetchEvents() {
      const imgs = await processCSVFiles(`${settings.folder}/${settings.folder}`)
      setEvents(imgs || []); // Ensure imgs matches the updated type
    }
    fetchEvents();
  }, [settings.folder]);

  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <EventContext.Provider value={{ events, currentIndex, setCurrentIndex }}>
      {children}
    </EventContext.Provider>
  );
};

export const useEvent = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error("useEvent must be used within an EventProvider");
  }
  return context;
};

export function Player() {
  const { currentIndex, setCurrentIndex } = useEvent()

  return (
    <div className="flex w-full justify-center gap-4">
      <Button variant="ghost" size="icon" onClick={() => setCurrentIndex(currentIndex - 1)}>
        <SkipBack />
      </Button>
      <Input className="w-15 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"  value={currentIndex} onChange={(e) => setCurrentIndex(Number(e.target.value))} type="number"/>
      <Button variant="ghost" size="icon" onClick={() => setCurrentIndex(currentIndex + 1)}>
        <SkipForward />
      </Button>
    </div>
  )
}
