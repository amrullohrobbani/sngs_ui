"use client"
// context/DataContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from 'react'
import { useSettings } from './SettingsContext'

export interface DataItem {
  frame: number         // consider keeping it as a string if leading zeros matter
  tracklet_id: number
  x: number
  y: number
  w: number
  h: number
  x_pitch: number,
  y_pitch: number,
  score: number
  role: string
  jersey_number: number
  team: number
}

interface DataContextProps {
  data: DataItem[]
}

export const DataContext = createContext<DataContextProps>({ data: [] })

interface DataProviderProps {
  children: ReactNode
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [data, setData] = useState<DataItem[]>([])
  const { settings } = useSettings()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch the text file from the public folder (e.g. /data.txt)
        const response = await fetch(`/data/${settings.folder}/track-data.txt`)
        const text = await response.text()

        // Split the text by newlines and filter out empty rows
        const rows = text.split('\n').filter(row => row.trim() !== '')

        const response_court = await fetch(`/data/${settings.folder}/court-track-data.txt`)
        const text_court = await response_court.text()

        // Split the text by newlines and filter out empty rows
        const rows_court = text_court.split('\n').filter(row => row.trim() !== '')
        // Map each row into a DataItem using the provided format:
        // frame, tracklet_id, x, y, w, h, score, role, jersey_number, team
        const parsedData_court: DataItem[] = rows_court.map(row => {
          const [
            frame,
            tracklet_id,
            x,
            y,
            role,
            jersey_number,
            team,
          ] = row.split(',')

          return {
            frame: parseInt(frame, 10), // or use frame as string if needed
            tracklet_id: parseInt(tracklet_id, 10),
            x: parseFloat(x),
            y: parseFloat(y),
            w: 0, // default value
            h: 0, // default value
            x_pitch: 0, // default value
            y_pitch: 0, // default value
            score: 0, // default value
            role: role,
            jersey_number: parseInt(jersey_number, 10),
            team: parseInt(team, 10),
          }
        })

        // Map each row into a DataItem using the provided format:
        // frame, tracklet_id, x, y, w, h, score, role, jersey_number, team
        const parsedData: DataItem[] = rows.map(row => {
          const rowData = row.split(',');
      
          if (rowData.length === 10) {
              const [frame, tracklet_id, x, y, w, h, score, role, jersey_number, team] = rowData;
              return {
                  frame: parseInt(frame, 10),
                  tracklet_id: parseInt(tracklet_id, 10),
                  x: parseFloat(x),
                  y: parseFloat(y),
                  w: parseFloat(w),
                  h: parseFloat(h),
                  x_pitch: parseFloat((parsedData_court.find(item => 
                      item.frame === parseInt(frame, 10) && item.tracklet_id === parseInt(tracklet_id, 10)
                  )?.x || '0').toString()),
                  y_pitch: parseFloat((parsedData_court.find(item => 
                      item.frame === parseInt(frame, 10) && item.tracklet_id === parseInt(tracklet_id, 10)
                  )?.y || '0').toString()),
                  score: parseFloat(score),
                  role: role,
                  jersey_number: parseInt(jersey_number, 10),
                  team: parseInt(team, 10),
              };
          } else if (rowData.length === 11) {
              const [frame, tracklet_id, x, y, w, h, score, role, jersey_number, jersey_color, team] = rowData;
              return {
                  frame: parseInt(frame, 10),
                  tracklet_id: parseInt(tracklet_id, 10),
                  x: parseFloat(x),
                  y: parseFloat(y),
                  w: parseFloat(w),
                  h: parseFloat(h),
                  x_pitch: parseFloat((parsedData_court.find(item => 
                      item.frame === parseInt(frame, 10) && item.tracklet_id === parseInt(tracklet_id, 10)
                  )?.x || '0').toString()),
                  y_pitch: parseFloat((parsedData_court.find(item => 
                      item.frame === parseInt(frame, 10) && item.tracklet_id === parseInt(tracklet_id, 10)
                  )?.y || '0').toString()),
                  score: parseFloat(score),
                  role: role,
                  jersey_number: parseInt(jersey_number, 10),
                  jersey_color: jersey_color, // New field added
                  team: parseInt(team, 10),
              };
          } else {
              console.warn("Unexpected row format:", row);
              return null; // Handle unexpected row format
          }
        }).filter(item => item !== null); // Remove any null values
      
        setData(parsedData)
      } catch (error) {
        console.error('Error fetching or parsing data:', error)
      }
    }

    fetchData()
  }, [settings.folder])

  return (
    <DataContext.Provider value={{ data }}>
      {children}
    </DataContext.Provider>
  )
}
