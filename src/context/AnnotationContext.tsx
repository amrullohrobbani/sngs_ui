"use client"

// context/AnnotationContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from 'react'
import { DataItem } from './DataContext'
import { useSettings } from './SettingsContext'

interface AnnotationContextType {
  annotations: DataItem[]
}

export const AnnotationContext = createContext<AnnotationContextType>({ annotations: [] })

interface AnnotationProviderProps {
  children: ReactNode
}

export const AnnotationProvider: React.FC<AnnotationProviderProps> = ({ children }) => {
  const [annotations, setAnnotations] = useState<DataItem[]>([])

  const { settings } = useSettings()

  useEffect(() => {
    const fetchAnnotations = async () => {

      try {
        // Fetch the JSON file from the public folder (e.g. /annotation.json)
        const response = await fetch(`/data/${settings.folder}/labels-gt.json`)
        const json = await response.json()

        // Extract the annotations array from the JSON object.
        // Here we assume the property is named "annotations" (plural)
        const rawAnnotations = json.annotations

        // Map each annotation item to a DataItem
        interface Annotation {
          image_id: string;
          track_id: string;
          supercategory: string;
          bbox_image: {
            x: number;
            y: number;
            w: number;
            h: number;
          };
          bbox_pitch: {
            x_bottom_middle: number;
            y_bottom_middle: number;
          }
          attributes: {
            role: string;
            jersey: string;
            team: string;
          };
        }

        const parsedAnnotations: DataItem[] = rawAnnotations.filter((ann: Annotation) => ann.supercategory === 'object').map((ann: Annotation) => ({
          // Using image_id as a proxy for frame (or set to 0 if unavailable)
          frame: parseInt(ann.image_id.substring(4), 10) || 0,
          tracklet_id: ann.track_id,
          x: ann.bbox_image?.x,
          y: ann.bbox_image?.y,
          x_pitch: ann.bbox_pitch?.x_bottom_middle,
          y_pitch: ann.bbox_pitch?.y_bottom_middle,
          w: ann.bbox_image?.w,
          h: ann.bbox_image?.h,
          score: 0, // No score provided in the JSON, so default to 0
          role: ann.attributes?.role,
          jersey_number: parseInt(ann.attributes?.jersey, 10),
          // Convert team string ("left" or "right") to a number (0 for left, 1 for right)
          team: ann.attributes?.team === 'left' ? 1 : ann.attributes?.team === 'right' ? 0 : -1,
        }))

        setAnnotations(parsedAnnotations)
      } catch (error) {
        console.error('Error fetching or parsing annotation JSON:', error)
      }
    }

    fetchAnnotations()
  }, [])

  return (
    <AnnotationContext.Provider value={{ annotations }}>
      {children}
    </AnnotationContext.Provider>
  )
}
