"use server"

import fs from 'fs'
import path from 'path'

export async function getImages(folder:string) {
  const imagesDir = path.join(process.cwd(), `public/data/${folder}/original_frame`);
  // Read all files and filter for image extensions
  const imageFiles = fs.readdirSync(imagesDir).filter((file) =>
    ['.jpg', '.jpeg', '.png', '.gif'].includes(path.extname(file).toLowerCase())
  );
  // Return paths relative to the public folder (e.g., "/images/filename.jpg")
  return imageFiles.map((fileName) => `/data/${folder}/original_frame/${fileName}`);
}
