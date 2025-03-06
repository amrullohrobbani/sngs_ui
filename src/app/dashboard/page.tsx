import { AppSidebar } from "@/components/app-sidebar"
import { DetailSidebar } from "@/components/detail-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

export const iframeHeight = "800px"

export const description = "A sidebar with a header and a search form."

export default function Page() {
  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset>
            <div className="flex flex-1 flex-col gap-4 p-4">
              <div className="bg-black min-h-min flex grow rounded-xl" />
              <div className="bg-muted/50 min-h-min flex shrink rounded-xl p-4" >
                Check
              </div>
            </div>
          </SidebarInset>
          <DetailSidebar />
        </div>
      </SidebarProvider>
    </div>
  )
}
