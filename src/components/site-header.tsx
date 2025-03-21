"use client"

import { useEffect, useState } from "react"

import { SidebarIcon } from "lucide-react"

import { SearchForm } from "@/components/search-form"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { ChevronDownIcon } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useSidebar } from "@/components/ui/sidebar"
import { getFolders } from "@/hooks/get-folders"
import { useSettings } from "@/context/SettingsContext"

export function SiteHeader() {
  const { toggleSidebar } = useSidebar()
  const { settings, setFolder } = useSettings()
  const [ folders, setFolders ] = useState<string[]>()

  useEffect(() => {
      async function fetchImages() {
        const folders = await getFolders(window.location.pathname || '');
        setFolders(folders);
        if(!folders.includes(settings.folder)) {
          setFolder(folders[0])
        }
      }
      fetchImages();
    }, [setFolder, settings.folder]);

  return (
    <header className="bg-background sticky top-0 z-50 flex w-full items-center border-b">
      <div className="flex h-(--header-height) w-full items-center gap-2 px-4">
        <Button
          className="h-8 w-8"
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
        >
          <SidebarIcon />
        </Button>
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb className="hidden sm:block">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">
                SN-GS UI helper
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1">
                  {settings.folder}
                  <ChevronDownIcon className="scale-75" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {
                    folders?.map((item, index) => (
                      <DropdownMenuItem key={index} onClick={() => setFolder(item)}>{item}</DropdownMenuItem>
                    ))
                  }
                </DropdownMenuContent>
              </DropdownMenu>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <SearchForm className="w-full sm:ml-auto sm:w-auto" />
      </div>
    </header>
  )
}
