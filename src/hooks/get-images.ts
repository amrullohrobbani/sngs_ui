"use server";

import fs from 'fs';
import path from 'path';

export async function getImages(folder: string) {
  // Define the base directory based on the folder parameter
  const baseDir = path.join(process.cwd(), `public/data/${folder}`);

  // Find all items in the base directory and filter for directories
  const subFolders = fs.readdirSync(baseDir).filter((item) => {
    return fs.statSync(path.join(baseDir, item)).isDirectory();
  });

  // Check if any subfolder exists; if not, throw an error or handle it accordingly
  if (subFolders.length === 0) {
    throw new Error(`No subfolder found inside public/data/${folder}`);
  }

  // Use the first subfolder found (assumes only one subfolder is present)
  const randomFolder = subFolders[0];
  const imagesDir = path.join(baseDir, randomFolder);

  // Read all files in the randomFolder and filter by image extensions
  const imageFiles = fs.readdirSync(imagesDir).filter((file) =>
    ['.jpg', '.jpeg', '.png', '.gif'].includes(path.extname(file).toLowerCase())
  );

  // Return the paths relative to the public folder
  return imageFiles.map((fileName) => `/data/${folder}/${randomFolder}/${fileName}`);
}
