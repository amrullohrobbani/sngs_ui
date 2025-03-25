"use client"

// context/DataContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from 'react'
import { useSettings } from './SettingsContext'
import { getFile } from '@/hooks/get-file'
import { Annotation } from './AnnotationContext'
import { calcPlayerVelocities } from '@/hooks/get-velocity'
import { getFolders } from '@/hooks/get-folders'

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
  team: number,
  vx?: number; // Velocity in x direction
  vy?: number; // Velocity in y direction
  speed?: number; // Total speed
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
        const folders = await getFolders();
        if (!folders.includes(settings.folder)) {
          return
        }
        // Fetch the text file from the public folder (e.g. /data.txt)
        const track_file_data = await getFile(`public/data/${settings.folder}`, 'track')
        const fileExtension = track_file_data ? track_file_data.split('.').pop()?.toLowerCase() : null;
        const response = await fetch((track_file_data || '').split('/').slice(1).join('/'))
        let text = null
        if (fileExtension === 'txt') {
          text = await response.text()
        } else if (fileExtension === 'json') {
            const jsonData = await response.json()
            text = jsonData?.predictions.map((ann: Annotation) => 
            `${ann.image_id.substring(5)},${ann.track_id},${ann.bbox_image?.x},${ann.bbox_image?.y},${ann.bbox_image?.w},${ann.bbox_image?.h},0,${ann.attributes?.role},${ann.attributes?.jersey},${ann.attributes?.team === 'left' ? 1 : ann.attributes?.team === 'right' ? 0 : -1}`
            ).join('\n')
          // Handle JSON data if needed
        } else {
          throw new Error('Unsupported file format. Only .txt and .json are allowed.')
        }

        // Split the text by newlines and filter out empty rows
        const rows = text.split('\n').filter((row: string) => row.trim() !== '')
        const court_file_data = await getFile(`public/data/${settings.folder}`, fileExtension === 'txt'? 'court': 'track')
        const fileExtensionCourt = court_file_data ? court_file_data.split('.').pop()?.toLowerCase() : null;
        const response_court = await fetch((court_file_data || '').split('/').slice(1).join('/'))
        
        let parsedData_court: DataItem[] = [];
        if (fileExtensionCourt === 'txt') {
          const text_court = await response_court.text()

          // Split the text by newlines and filter out empty rows
          const rows_court = text_court.split('\n').filter(row => row.trim() !== '')
          parsedData_court = rows_court.map(row => {
            const [
              frame,
              tracklet_id,
              x,
              y,
              role,
              jersey_number,
              team,
            ] = row.split(',');

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
            };
          });
        } else if (fileExtensionCourt === 'json') {
          const pitchHeight = 68 + 2 * 5
          const pitchWidth = 105 + 2 * 10
          const jsonDataCourt = await response_court.json()
          parsedData_court = jsonDataCourt.predictions.map((ann: Annotation) => ({
            frame: parseInt(ann.image_id.substring(4), 10) || 0,
            tracklet_id: ann.track_id,
            x: ((ann.bbox_pitch?.x_bottom_middle + pitchWidth / 2) / pitchWidth) * pitchWidth,
            y: ((ann.bbox_pitch?.y_bottom_middle + pitchHeight / 2) / pitchHeight) * pitchHeight,
            w: 0,
            h: 0,
            score: 0, // No score provided in the JSON, so default to 0
            role: ann.attributes?.role,
            jersey_number: parseInt(ann.attributes?.jersey, 10),
            // Convert team string ("left" or "right") to a number (0 for left, 1 for right)
            team: ann.attributes?.team === 'left' ? 1 : ann.attributes?.team === 'right' ? 0 : -1,
          }));
        } else {
          throw new Error('Unsupported court file format. Only .txt and .json are allowed.');
        }

        // Map each row into a DataItem using the provided format:
        // frame, tracklet_id, x, y, w, h, score, role, jersey_number, team
        const parsedData: DataItem[] = rows.map((row: string) => {
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
        }).filter((item: null) => item !== null); // Remove any null values
        
        const finalData =  await calcPlayerVelocities(parsedData, true, 'moving average', 12)
        setData(finalData)
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
