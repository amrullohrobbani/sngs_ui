import { AppSidebar } from "@/components/app-sidebar"
import { DetailSidebar } from "@/components/detail-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Player, ImageProvider } from '@/components/player'
import { ImagePlayer } from "@/components/ImagePlayer"
import { DataProvider } from "@/context/DataContext"
import { TrackletProvider } from "@/context/TrackletContext"
import { AnnotationProvider } from "@/context/AnnotationContext"
import { SettingsProvider } from "@/context/SettingsContext"

export const iframeHeight = "800px"

export default async function Page() {  
  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SettingsProvider>
        <DataProvider>
          <AnnotationProvider>
            <TrackletProvider>
              <ImageProvider>
                <SidebarProvider className="flex flex-col">
                  <SiteHeader />
                  <div className="flex flex-1">
                    <AppSidebar />
                    <SidebarInset>
                      <div className="flex flex-1 flex-col min">
                        <div className="bg-black/10 min-h-min flex grow p-4">
                          <ImagePlayer />
                        </div>
                        <div className="bg-muted/50 min-h-min flex shrink rounded-xl px-4 py-2" >
                          <Player />
                        </div>
                      </div>
                    </SidebarInset>
                    <DetailSidebar />
                  </div>
                </SidebarProvider>
              </ImageProvider>
            </TrackletProvider>
          </AnnotationProvider>
        </DataProvider>
      </SettingsProvider>
    </div>
  )
}
