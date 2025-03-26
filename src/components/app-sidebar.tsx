"use client"

import * as React from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Checkbox } from "./ui/checkbox"
import { Input } from "./ui/input"
import { useSettings } from '@/context/SettingsContext'
import { Tree } from "./ui/tree"
import { getDataDirectories } from "@/hooks/get-folders"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  settings: [
    {
      id: 'predictionTracklet',
      label: 'Prediction Tracklet'
    },
    {
      id: 'groundTruthTracklet',
      label: 'Ground Truth Tracklet'
    },
    {
      id: 'trackingLinePredictionTracklet',
      label: 'Tracking Line Prediction Tracklet'
    },
    {
      id: 'trackingLineGTTracklet',
      label: 'Tracking Line Ground Truth Tracklet',
    },
    {
      id: 'minimap',
      label: 'Minimap',
    },
    {
      id: 'arrowVelocity',
      label: 'Velocity Arrow',
    }
  ]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { settings, toggleSetting, setFrame } = useSettings();
  const [ directories, setDirectories ] = React.useState<(string | (string | (string | string[])[])[])[]>([])
  
  React.useEffect(() => {
    async function fetchDirectories() {
      const directories = await getDataDirectories();
      setDirectories(directories as (string | (string | (string | string[])[])[])[]);
    }
    fetchDirectories();
  }, []);

  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Files</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.settings
                .map((item, index) => (
                  <SidebarMenuItem key={index}>
                    <SidebarMenuButton asChild>
                      <div className="flex gap-4">
                        <div className="flex shrink">
                          <Checkbox
                            id={`tracklet-${item.id}-gt`}
                            checked={Boolean(settings[`${item.id}`])}
                            onClick={() =>
                              toggleSetting(item.id)
                            }
                            className="bg-muted"
                          />
                        </div>
                        <label htmlFor={`tracklet-${item.id}-gt`} className="flex-1 grow">
                          {item.label}
                        </label>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
            <SidebarMenu>
              <div className="flex flex-col px-3">
                <label htmlFor="frame-number" className="text-sm">Frame Number</label>
                <Input id="frame-number" type="number" value={settings.frame} onChange={(val) => setFrame(Number(val.target.value))}/>
              </div>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Files</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {directories.map((item, index) => (
                <Tree key={index} item={item}/>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
