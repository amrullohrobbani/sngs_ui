"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@radix-ui/react-collapsible"
import { teamLabel } from "@/lib/utils"
import { Checkbox } from "./ui/checkbox"
import { useTrackletContext } from "@/context/TrackletContext"

export function DetailSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const {
    uniqueTrackletIds,
    toggleTracklet,
    toggleAll,
    isSelected,
    uniqueGroundTruthTrackletIds,
    toggleGroundTruthTracklet,
    toggleAllGroundTruth,
    isGroundTruthSelected,
  } = useTrackletContext()

  // Check if all unique tracklets are selected
  const allSelected =
    uniqueTrackletIds.length > 0 &&
    uniqueTrackletIds.every((item) => isSelected(item.tracklet_id))

  const allGroundTruthSelected =
    uniqueGroundTruthTrackletIds.length > 0 &&
    uniqueGroundTruthTrackletIds.every((item) => isGroundTruthSelected(item.tracklet_id))

  return (
    <Sidebar
      side="right"
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="tracklet-all"
                  checked={allSelected}
                  onClick={() => toggleAll(!allSelected)}
                />
                <label
                  htmlFor="tracklet-all"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Tracklet
                </label>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {
          // Group tracklets by team and list individual tracklets
          [...new Set(uniqueTrackletIds.map((item) => item.team))].map(
            (team, index) => (
              <Collapsible key={index} defaultOpen className="group/collapsible">
                <SidebarGroup>
                  <SidebarGroupLabel asChild>
                    <CollapsibleTrigger>
                      {teamLabel.find((o) => o.value === team)?.label}
                      <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                    </CollapsibleTrigger>
                  </SidebarGroupLabel>
                  <CollapsibleContent>
                    <SidebarGroupContent>
                      <SidebarMenu>
                        {uniqueTrackletIds
                          .filter((o) => o.team === team)
                          .map((item, index) => (
                            <SidebarMenuItem key={index}>
                              <SidebarMenuButton asChild>
                                <div className="flex gap-4">
                                  <div className="flex shrink">
                                    <Checkbox
                                      id={`tracklet-${item.tracklet_id}`}
                                      checked={isSelected(item.tracklet_id)}
                                      onClick={() =>
                                        toggleTracklet(item.tracklet_id)
                                      }
                                    />
                                  </div>
                                  <label htmlFor={`tracklet-${item.tracklet_id}`} className="flex-1 grow">
                                    Tracklet {item.tracklet_id}
                                  </label>
                                </div>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          ))}
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </CollapsibleContent>
                </SidebarGroup>
              </Collapsible>
            )
          )
        }
      </SidebarContent>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="tracklet-all-gt"
                  checked={allGroundTruthSelected}
                  onClick={() => toggleAllGroundTruth(!allGroundTruthSelected)}
                />
                <label
                  htmlFor="tracklet-all-gt"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Ground Truth Tracklet
                </label>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {
          // Group tracklets by team and list individual tracklets
          [...new Set(uniqueGroundTruthTrackletIds.map((item) => item.team))].map(
            (team, index) => (
              <Collapsible key={index} defaultOpen className="group/collapsible">
                <SidebarGroup>
                  <SidebarGroupLabel asChild>
                    <CollapsibleTrigger>
                      {teamLabel.find((o) => o.value === team)?.label}
                      <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                    </CollapsibleTrigger>
                  </SidebarGroupLabel>
                  <CollapsibleContent>
                    <SidebarGroupContent>
                      <SidebarMenu>
                        {uniqueGroundTruthTrackletIds
                          .filter((o) => o.team === team)
                          .map((item, index) => (
                            <SidebarMenuItem key={index}>
                              <SidebarMenuButton asChild>
                                <div className="flex gap-4">
                                  <div className="flex shrink">
                                    <Checkbox
                                      id={`tracklet-${item.tracklet_id}-gt`}
                                      checked={isGroundTruthSelected(item.tracklet_id)}
                                      onClick={() =>
                                        toggleGroundTruthTracklet(item.tracklet_id)
                                      }
                                    />
                                  </div>
                                  <label htmlFor={`tracklet-${item.tracklet_id}-gt`} className="flex-1 grow">
                                    Tracklet {item.tracklet_id}
                                  </label>
                                </div>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          ))}
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </CollapsibleContent>
                </SidebarGroup>
              </Collapsible>
            )
          )
        }
      </SidebarContent>
    </Sidebar>
  )
}
