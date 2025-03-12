"use client"

import React, { createContext, useState, ReactNode, useContext } from 'react'

export type SettingsItem = {
  predictionTracklet: boolean
  groundTruthTracklet: boolean
  trackingLinePredictionTracklet: boolean
  trackingLineGTTracklet: boolean
  minimap: boolean
  folder: string
  [key:string]: boolean | string
}

type SettingsContextType = {
  settings: SettingsItem
  toggleSetting: (key: keyof SettingsItem) => void
  setFolder: (foldername: string) => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

type SettingsProviderProps = {
  children: ReactNode
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<SettingsItem>({
    predictionTracklet: true,
    groundTruthTracklet: true,
    trackingLinePredictionTracklet: false,
    trackingLineGTTracklet: false,
    minimap: false,
    folder: 'Data-1'
  })

  const toggleSetting = (key: keyof SettingsItem) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      [key]: !prevSettings[key],
    }))
  }
  
  const setFolder = (foldername: string) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      folder: foldername,
    }))
  }

  return (
    <SettingsContext.Provider value={{ settings, toggleSetting, setFolder }}>
      {children}
    </SettingsContext.Provider>
  )
}

// Custom hook for easy consumption of the context
export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}
