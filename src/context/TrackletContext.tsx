"use client"

import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
} from "react"
import { DataContext, DataItem } from "@/context/DataContext"
import { AnnotationContext } from "./AnnotationContext"

interface TrackletContextType {
  // Original tracklet properties
  selectedIds: number[]
  uniqueTrackletIds: DataItem[]
  toggleTracklet: (id: number) => void
  toggleAll: (isChecked: boolean) => void
  isSelected: (id: number) => boolean

  // Ground truth tracklet properties
  selectedGroundTruthIds: number[]
  uniqueGroundTruthTrackletIds: DataItem[]
  toggleGroundTruthTracklet: (id: number) => void
  toggleAllGroundTruth: (isChecked: boolean) => void
  isGroundTruthSelected: (id: number) => boolean
}

const TrackletContext = createContext<TrackletContextType | undefined>(
  undefined
)

export const TrackletProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { data } = useContext(DataContext)
  const { annotations } = useContext(AnnotationContext)

  // Compute unique original tracklets based on tracklet_id
  const uniqueTrackletIds = useMemo(() => {
    return data.filter((item, index, self) =>
      index === self.findIndex((t) => t.tracklet_id === item.tracklet_id)
    )
  }, [data])

  // Compute unique ground truth tracklets based on groundTruthTrackletId
  const uniqueGroundTruthTrackletIds = useMemo(() => {
    return annotations.filter((item, index, self) =>
      index === self.findIndex(
        (t) => t.tracklet_id === item.tracklet_id
      )
    )
  }, [annotations])

  // State for original tracklets
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  // State for ground truth tracklets
  const [selectedGroundTruthIds, setSelectedGroundTruthIds] = useState<number[]>([])

  // Initialize original tracklets selection with all unique ids
  useEffect(() => {
    setSelectedIds(uniqueTrackletIds.map((item) => item.tracklet_id))
  }, [uniqueTrackletIds])

  // Toggle an original tracklet's selection
  const toggleTracklet = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  // Toggle all original tracklets on or off
  const toggleAll = (isChecked: boolean) => {
    if (isChecked) {
      setSelectedIds(uniqueTrackletIds.map((item) => item.tracklet_id))
    } else {
      setSelectedIds([])
    }
  }

  // Check if an original tracklet is selected
  const isSelected = (id: number) => selectedIds.includes(id)

  // Toggle a ground truth tracklet's selection
  const toggleGroundTruthTracklet = (id: number) => {
    setSelectedGroundTruthIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  // Toggle all ground truth tracklets on or off
  const toggleAllGroundTruth = (isChecked: boolean) => {
    if (isChecked) {
      setSelectedGroundTruthIds(
        uniqueGroundTruthTrackletIds.map((item) => item.tracklet_id)
      )
    } else {
      setSelectedGroundTruthIds([])
    }
  }

  // Check if a ground truth tracklet is selected
  const isGroundTruthSelected = (id: number) =>
    selectedGroundTruthIds.includes(id)

  return (
    <TrackletContext.Provider
      value={{
        selectedIds,
        uniqueTrackletIds,
        toggleTracklet,
        toggleAll,
        isSelected,
        selectedGroundTruthIds,
        uniqueGroundTruthTrackletIds,
        toggleGroundTruthTracklet,
        toggleAllGroundTruth,
        isGroundTruthSelected,
      }}
    >
      {children}
    </TrackletContext.Provider>
  )
}

export const useTrackletContext = () => {
  const context = useContext(TrackletContext)
  if (!context) {
    throw new Error(
      "useTrackletContext must be used within a TrackletProvider"
    )
  }
  return context
}
