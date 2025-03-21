import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Player, EventProvider } from "@/components/player-action-spotting"
import { ImagePlayer } from "@/components/ImagePlayerActionSpotting"
import { DataProvider } from "@/context/DataContext"
import { TrackletProvider } from "@/context/TrackletContext"
import { AnnotationProvider } from "@/context/AnnotationContext"
import { SettingsProvider } from "@/context/SettingsContext"

export default async function Page() {  
  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SettingsProvider>
        <EventProvider>
          <SidebarProvider className="flex flex-col">
            <SiteHeader />
            <div className="flex flex-1">
              <SidebarInset>
                <div className="flex flex-1 flex-col">
                  <div className="bg-black/10 min-h-min flex grow p-4">
                    <ImagePlayer />
                  </div>
                  <div className="bg-muted/50 min-h-min flex shrink rounded-xl px-4 py-2" >
                    <Player />
                  </div>
                </div>
              </SidebarInset>
            </div>
          </SidebarProvider>
        </EventProvider>
      </SettingsProvider>
    </div>
  )
}
