"use server"

import fs from 'fs'
import path from 'path'

export async function getFolders() {
  const targetFolder = path.join(process.cwd(), 'public/data');
  const items = fs.readdirSync(targetFolder);
  const folders = items.filter(item => fs.lstatSync(path.join(targetFolder, item)).isDirectory());
  return folders
}
