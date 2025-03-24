"use server"

import fs from 'fs'
import path from 'path'

export async function getFile(directory: string, searchType: 'court' | 'labels' | 'track'): Promise<string | null> {
  // Get all files inside the directory
  const entries = fs.readdirSync(directory)

  // Filter based on the search type
  let filteredFiles: string[]

  switch (searchType) {
    case 'court':
      filteredFiles = entries.filter(file => {
        const filePath = path.join(directory, file)
        return fs.statSync(filePath).isFile() && file.toLowerCase().includes('court')
      })
      break

    case 'labels':
      filteredFiles = entries.filter(file => {
        const filePath = path.join(directory, file)
        return fs.statSync(filePath).isFile() && file.toLowerCase().includes('labels')
      })
      break

    case 'track':
      filteredFiles = entries.filter(file => {
        const filePath = path.join(directory, file)
        return fs.statSync(filePath).isFile() &&
               !file.toLowerCase().includes('court') && 
               !file.toLowerCase().includes('labels')
      })
      break

    default:
      filteredFiles = []
      break
  }
  // Return the path of the first matching file or null if no file matches
  return filteredFiles.length > 0 
    ? path.join(directory, filteredFiles.find(file => file.endsWith('.json')) || filteredFiles[0]) 
    : null;
}
