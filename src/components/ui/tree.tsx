import { useSettings } from "@/context/SettingsContext";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./collapsible"
import { SidebarMenuButton, SidebarMenuItem, SidebarMenuSub } from "./sidebar"
import { ChevronRight, File, Folder } from "lucide-react"

export function Tree({ item, path = "" }: { item: string | (string | (string | (string | string[])[])[])[]; path?: string }) {
    const [name, ...items] = Array.isArray(item) ? item : [item]
    const { setFolder } = useSettings()
  
    // Build the current path
    const currentPath = typeof path === "string" ? `${path}/${name}` : String(name)
  
    // If the item has no sub-items, it's a file, so render it
    if (!items.length) {
      return (
        <SidebarMenuButton
          isActive={name === "button.tsx"}
          className="data-[active=true]:bg-transparent"
          onClick={() => {
            setFolder(currentPath)
          }}
        >
          <File />
          {name}
        </SidebarMenuButton>
      )
    }
  
    // If the item has sub-items, it's a folder, so render a collapsible item
    return (
      <SidebarMenuItem>
        <Collapsible
          className="group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90"
        >
          <CollapsibleTrigger asChild>
            <SidebarMenuButton>
              <ChevronRight className="transition-transform" />
              <Folder />
              {name}
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {items.map((subItem, index) => (
                <Tree key={index} item={subItem} path={currentPath} />
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </Collapsible>
      </SidebarMenuItem>
    )
  }
