import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const teamLabel = [
  {label:"Team Left", value: 1},
  {label:"Team Right", value: 0},
  {label:"Non - Player", value: -1} 
]