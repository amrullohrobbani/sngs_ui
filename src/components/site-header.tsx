"use client"

import { Fragment } from "react"

import { SidebarIcon } from "lucide-react"

import { SearchForm } from "@/components/search-form"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useSidebar } from "@/components/ui/sidebar"
import { useSettings } from "@/context/SettingsContext"

export function SiteHeader() {
  const { toggleSidebar } = useSidebar()
  const { settings } = useSettings()


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
              <BreadcrumbLink>
                SN-GS UI helper
              </BreadcrumbLink>
            </BreadcrumbItem>
            {settings.folder.split('/').map((part, index, array) => (
              <Fragment key={`${part}-${index}`}>
              <BreadcrumbItem>
                <BreadcrumbLink>
                {part}
                </BreadcrumbLink>
              </BreadcrumbItem>
              {index < array.length - 1 && <BreadcrumbSeparator />}
              </Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
        <SearchForm className="w-full sm:ml-auto sm:w-auto" />
      </div>
    </header>
  )
}
