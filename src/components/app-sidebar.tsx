"use client"

import * as React from "react"
import {
  Command,
} from "lucide-react"

import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Checkbox } from "./ui/checkbox"
import { Input } from "./ui/input"
import { useSettings } from '@/context/SettingsContext'

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

  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">SN-GameState</span>
                  <span className="truncate text-xs">Enterprise</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
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
      </SidebarContent>
      <SidebarFooter>
        <div className="flex flex-col px-3">
          <label htmlFor="frame-number">Frame Number</label>
          <Input id="frame-number" type="number" value={settings.frame} onChange={(val) => setFrame(Number(val.target.value))}/>
        </div>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
